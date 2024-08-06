import type { Editor } from '@tiptap/core'
import { combineTransactionSteps, getChangedRanges, type Range } from '@tiptap/core'
import { undoDepth } from 'prosemirror-history'
import type { Attrs, MarkType, Node, NodeType } from 'prosemirror-model'
import { Plugin, PluginKey, type EditorState, type Transaction } from 'prosemirror-state'
import type { MatchLinks } from '../helpers/findLinks'
import { findLinks } from '../helpers/findLinks'
import type { MatchTag } from '../helpers/findTags'
import { findTags } from '../helpers/findTags'
import type { IMetaTags } from '../helpers/nip92.imeta'
import type { GetMarkRange, NodeWithPosition } from '../helpers/types'
import { isValidTLD } from '../helpers/utils'

export type Matches = MatchLinks | MatchTag

export class AutoLinkPlugin {
  plugin: Plugin

  constructor(editor: Editor) {
    this.plugin = new Plugin({
      key: new PluginKey('autolink'),

      appendTransaction: (transactions, oldState, newState) => {
        const isUndo = undoDepth(oldState) - undoDepth(newState) === 1
        const markLink = newState.schema.marks.link

        if (isUndo) {
          return
        }

        const docChanges = transactions.some((transaction) => transaction.docChanged)

        if (!docChanges) {
          return
        }

        const imeta = editor.storage.nostr?.imeta

        const transform = combineTransactionSteps(oldState.doc, [...transactions])
        const changes = getChangedRanges(transform)

        const { tr, doc } = newState
        const { mapping } = transform

        changes.forEach(({ oldRange, newRange }) => {
          const { from, to } = newRange
          const isNodeSeparated = to - from === 2

          const prevMarks = this.getLinkMarksInRange(oldState.doc, oldRange.from, oldRange.to, markLink).map(
            (mark) => ({
              mappedFrom: mapping.map(mark.from),
              mappedTo: mapping.map(mark.to),
              text: mark.text,
              from: mark.from,
              to: mark.to,
            }),
          )

          prevMarks.forEach(({ mappedFrom: newFrom, mappedTo: newTo, from: prevMarkFrom, to: prevMarkTo }, i) => {
            this.getLinkMarksInRange(doc, newFrom, newTo, markLink).forEach((newMark) => {
              const prevLinkText = oldState.doc.textBetween(prevMarkFrom, prevMarkTo, undefined, ' ')
              const newLinkText = doc.textBetween(newMark.from, newMark.to + 1, undefined, ' ').trim()

              const wasLink = isValidTLD(prevLinkText)
              const isLink = isValidTLD(newLinkText)

              if (isLink) {
                return
              }

              if (wasLink) {
                tr.removeMark(newMark.from, newMark.to, newState.schema.marks.link)
                prevMarks.splice(i, 1)
              }

              if (isNodeSeparated) {
                return
              }

              // Check newLinkText for a remaining valid link
              if (from === to) {
                this.findMatches(newLinkText, newFrom, imeta).forEach((match) => {
                  this.replaceNodes(tr, newState, match)
                })
              }
            })
          })

          const replacements = this.findTextBlocksInRange(doc, { from, to }, newState.schema.marks.link).flatMap(
            ({ text, positionStart }) => {
              return this.findMatches(text, positionStart + 1, imeta)
                .filter((range) => {
                  const fromIsInRange = range.from >= from && range.from <= to
                  const toIsInRange = range.to >= from && range.to <= to
                  return fromIsInRange || toIsInRange || isNodeSeparated
                })
                .filter(({ from, text }) => !prevMarks.some((prev) => prev.mappedFrom === from && prev.text === text))
            },
          )
          // Replace the nodes in reverse order not maintain the ranges correctly
          replacements.sort((a, b) => (a.to > b.to ? -1 : 1)).forEach((link) => this.replaceNodes(tr, newState, link))
        })

        if (tr.steps.length === 0) {
          return
        }

        return tr
      },
    })
  }

  private replaceNodes(tr: Transaction, state: EditorState, match: Matches) {
    const { kind, from, to } = match
    const { nodes, marks } = state.schema
    switch (kind) {
      case 'text': {
        this.addMark(tr, from, to, marks.link, { href: match.href })
        break
      }
      case 'image': {
        this.replaceWith(tr, from, to, nodes.image, { src: match.href })
        break
      }
      case 'youtube': {
        this.replaceWith(tr, from, to, nodes.youtube, { src: match.href })
        break
      }
      case 'tweet': {
        this.replaceWith(tr, from, to, nodes.tweet, { src: match.href })
        break
      }
      case 'video': {
        this.replaceWith(tr, from, to, nodes.video, { src: match.href })
        break
      }
      case 'tag': {
        this.addMark(tr, from, to, marks.tag, { tag: match.text })
        break
      }
      default: {
        break
      }
    }
  }

  private addMark(tr: Transaction, from: number, to: number, mark: MarkType | undefined, attrs: Attrs) {
    if (mark) {
      tr.addMark(from, to, mark.create(attrs))
    }
  }

  private replaceWith(tr: Transaction, from: number, to: number, node: NodeType | undefined, attrs: Attrs) {
    if (node) {
      tr.replaceWith(from, to, node.create(attrs))
    }
  }

  private findTextBlocksInRange(
    node: Node,
    range: Range,
    markLink: MarkType,
  ): Array<{ text: string; positionStart: number }> {
    const nodesWithPos: NodeWithPosition[] = []

    // define a placeholder for leaf nodes to calculate link position
    node.nodesBetween(range.from, range.to, (node, pos) => {
      if (!node.isTextblock || !node.type.allowsMarkType(markLink)) {
        return
      }

      nodesWithPos.push({ node, pos })
    })

    return nodesWithPos.map((textBlock) => ({
      text: node.textBetween(textBlock.pos, textBlock.pos + textBlock.node.nodeSize, undefined, ' '),
      positionStart: textBlock.pos,
    }))
  }

  private findMatches(text: string, positionStart: number, imeta?: IMetaTags): Matches[] {
    const links = findLinks(text, imeta)
    const tags = findTags(text)
    const res = [...links, ...tags].map((match) => ({
      ...match,
      from: positionStart + match.from,
      to: positionStart + match.to,
    }))
    return res
  }

  private getLinkMarksInRange(doc: EditorState['doc'], from: number, to: number, markLink: MarkType) {
    const linkMarks: GetMarkRange[] = []

    doc.nodesBetween(from, to, (node, pos) => {
      const marks = node.marks ?? []
      const mark = marks.find((mark) => mark.type === markLink)

      if (mark) {
        linkMarks.push({
          from: pos,
          to: pos + node.nodeSize,
          text: node.textContent,
        })
      }
    })
    return linkMarks
  }
}

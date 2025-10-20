import { Mark, markPasteRule, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface TagAttributes {
  tag: string
}

const REGEX_TAG = /(?<![\w./:?=])#[\p{L}\p{N}_]+/gu

export const TagExtension = Mark.create({
  name: 'tag',

  inline: true,

  selectable: true,

  inclusive: true,

  group: 'inline',

  priority: 100,

  addStorage() {
    return {
      markdown: {
        serialize: {
          open: '',
          close: '',
          mixable: false,
          expelEnclosingWhitespace: true,
        },
        parse: {},
      },
    }
  },

  renderHTML(params) {
    return ['a', mergeAttributes(params.HTMLAttributes, { 'data-type': this.name })]
  },

  parseHTML() {
    return [{ tag: `a[data-type="${this.name}"]` }]
  },

  addAttributes() {
    return {
      tag: { default: null },
    }
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: REGEX_TAG,
        getAttributes: (match) => ({ tag: match[0] }),
        type: this.type,
      }),
    ]
  },

  addProseMirrorPlugins() {
    const markType = this.type

    return [
      new Plugin({
        key: new PluginKey('tagExtension'),
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((t) => t.docChanged)) return null

          const { $from } = newState.selection
          if (!$from.parent.isTextblock) return null

          const after = $from.parent.childAfter(Math.max(0, $from.parentOffset - 1))
          if (!after.node?.isText) return null

          const nodeStart = $from.start() + after.offset
          const text = after.node.text || ''
          const matches = Array.from(text.matchAll(REGEX_TAG))

          const tr = newState.tr
          tr.removeMark(nodeStart, nodeStart + text.length, markType)

          for (const match of matches) {
            const from = nodeStart + (match.index || 0)
            const to = from + match[0].length
            tr.addMark(from, to, markType.create({ tag: match[0] }))
          }

          return tr.steps.length ? tr : null
        },
      }),
    ]
  },
})

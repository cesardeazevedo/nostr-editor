import { Extension } from '@tiptap/core';
import { type NostrEvent } from 'nostr-tools';
import type { Attrs, MarkType, NodeType } from 'prosemirror-model';
import type { Transaction } from 'prosemirror-state';
import { findLinks } from '../plugins/NostrMatcherPlugin/matchers/findLinks';
import { findNostrRefs } from '../plugins/NostrMatcherPlugin/matchers/findNostrRefs';
import { findTags } from '../plugins/NostrMatcherPlugin/matchers/findTags';
import { parseReferences, type NostrReference } from '../plugins/NostrMatcherPlugin/nip27.references';
import { parseImeta, type IMetaTags } from '../plugins/NostrMatcherPlugin/nip92.imeta';
import type { Matches } from '../plugins/NostrMatcherPlugin/NostrMatcherPlugin';
import { removeIntersectingNodes } from '../plugins/NostrMatcherPlugin/utils';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nostrparser: {
      parseNote: (event: NostrEvent) => ReturnType
    }
  }
}

export const NostrParserExtension = Extension.create({
  name: 'nostrparser',
  priority: 100,
  addCommands() {
    return {
      parseNote: (event: NostrEvent, imeta?: IMetaTags, references?: NostrReference[]) => (props) => {
        function addMark(tr: Transaction, from: number, to: number, mark: MarkType | undefined, attrs: Attrs) {
          if (mark) {
            tr.addMark(from, to, mark.create(attrs))
          }
        }
        function replaceWith(
          tr: Transaction,
          from: number,
          to: number,
          node: NodeType | undefined,
          attrs: Attrs,
          content?: string,
        ) {
          if (node) {
            tr.replaceWith(from, to, node.create(attrs, content ? node.schema.text(content) : null))
          }
        }

        props.commands.setContent(event.content)

        const content = event.kind === 1 ? event.content : props.tr.doc.textContent

        const tr = props.state.tr

        const refs = findNostrRefs(content, references || parseReferences({ content }))
        const links = findLinks(content, imeta || parseImeta(event.tags))
        const tags = findTags(content)
        const replacements = [...links, ...tags, ...refs].map((match) => ({
          ...match,
          from: match.from + 1,
          to: match.to + 1,
        }))
        replacements
          // All the replacements should be done in reverse order so we maintain the correct ranges
          .sort((a, b) => (a.to > b.to ? -1 : 1))
          .reduce(removeIntersectingNodes, [] as Matches[])
          .forEach((match) => {
            const { kind, text, from, to } = match
            const { nodes, marks } = this.editor.state.schema
            switch (kind) {
              case 'text': {
                addMark(tr, from, to, marks.link, { href: match.href })
                break
              }
              case 'image': {
                replaceWith(tr, from, to, nodes.image, { src: match.href }, text)
                break
              }
              case 'youtube': {
                replaceWith(tr, from, to, nodes.youtube, { src: match.href }, text)
                break
              }
              case 'tweet': {
                replaceWith(tr, from, to, nodes.tweet, { src: match.href }, text)
                break
              }
              case 'video': {
                replaceWith(tr, from, to, nodes.video, { src: match.href }, text)
                break
              }
              case 'tag': {
                addMark(tr, from, to, marks.tag, { tag: match.text })
                break
              }
              case 'nostr': {
                const { ref } = match
                switch (ref.prefix) {
                  case 'npub':
                  case 'nprofile': {
                    replaceWith(tr, from, to, nodes.nprofile, ref.profile, text)
                    break
                  }
                  case 'note':
                  case 'nevent': {
                    replaceWith(tr, from, to, nodes.nevent, ref.event, text)
                    break
                  }
                  case 'naddr': {
                    replaceWith(tr, from, to, nodes.naddr, ref.address, text)
                    break
                  }
                  default: {
                    break
                  }
                }
                break
              }
              default: {
                break
              }
            }
          })
        return true
      },
    }
  },
})

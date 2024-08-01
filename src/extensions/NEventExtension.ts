import { nip19 } from 'nostr-tools'
import type { EventPointer } from 'nostr-tools/nip19'
import { Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'

export const NEVENT_REGEX = /(nostr:)?(nevent1[0-9a-z]+)/g

export const NEventExtension = Node.create({
  name: 'nevent',

  group: 'block',

  atom: true,

  selectable: true,

  content: 'text*',

  addAttributes() {
    return {
      id: { default: null },
      kind: { default: null },
      author: { default: null },
      relays: { default: null },
    }
  },

  renderHTML() {
    return ['div', {}, 0]
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write(node.textContent)
        },
        parse: {},
      },
    }
  },

  addPasteRules() {
    return [
      nodePasteRule({
        type: this.type,
        getAttributes: match => match.data,
        find: text => {
          const matches = []

          for (const match of text.matchAll(NEVENT_REGEX)) {
            try {
              const data = nip19.decode(match[2]).data as EventPointer

              matches.push({
                index: match.index,
                replaceWith: match[2],
                text: match[0],
                match,
                data,
              })
            } catch (e) {
              continue
            }
          }

          return matches
        },
      }),
    ]
  },
})

import { nip19 } from 'nostr-tools'
import type { AddressPointer } from 'nostr-tools/nip19'
import { Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'

export const NADDR_REGEX = /(nostr:)?(naddr1[0-9a-z]+)/g

export const NAddrExtension = Node.create({
  name: 'naddr',

  group: 'block',

  atom: true,

  selectable: true,

  content: 'text*',

  addAttributes() {
    return {
      identifier: { default: null },
      pubkey: { default: null },
      kind: { default: null },
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

          for (const match of text.matchAll(NADDR_REGEX)) {
            try {
              const data = nip19.decode(match[2]).data as AddressPointer

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

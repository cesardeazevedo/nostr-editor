import { nip19 } from 'nostr-tools'
import type { AddressPointer } from 'nostr-tools/nip19'
import { Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch } from './util'

export const NADDR_REGEX = /(nostr:)?(naddr1[0-9a-z]+)/g

export const NAddrExtension = Node.create({
  name: 'naddr',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      naddr: { default: null },
      identifier: { default: null },
      pubkey: { default: null },
      kind: { default: null },
      relays: { default: [] },
    }
  },

  renderHTML() {
    return ['div', {}]
  },

  renderText(props) {
    return props.node.attrs.naddr
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write(node.attrs.naddr)
        },
        parse: {},
      },
    }
  },

  addPasteRules() {
    return [
      nodePasteRule({
        type: this.type,
        getAttributes: (match) => match.data,
        find: (text) => {
          const matches = []

          for (const match of text.matchAll(NADDR_REGEX)) {
            try {
              const naddr = match[0]
              const data = nip19.decode(match[2]).data as AddressPointer

              matches.push(createPasteRuleMatch(match, { ...data, naddr }))
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

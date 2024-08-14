import { Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { nip19 } from 'nostr-tools'
import type { AddressPointer } from 'nostr-tools/nip19'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch } from '../helpers/utils'

export const NADDR_REGEX = /(nostr:)?(naddr1[0-9a-z]+)/g

export interface NAddrAttributes {
  naddr: string
  kind: number
  pubkey: string
  relays?: string[]
  identifier: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    naddr: {
      insertNAddr: (options: { naddr: string }) => ReturnType
    }
  }
}

export const NAddrExtension = Node.create({
  name: 'naddr',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  priority: 1000,

  addAttributes() {
    return {
      naddr: { default: null },
      identifier: { default: null },
      pubkey: { default: null },
      kind: { default: null },
      relays: { default: [] },
    }
  },

  renderHTML(props) {
    return ['div', { 'data-naddr': props.node.attrs.naddr }]
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

  addCommands() {
    return {
      insertNAddr:
        ({ naddr }) =>
        ({ commands }) => {
          const parts = naddr.split(':')
          const attrs = nip19.decode(parts[parts.length - 1])?.data as AddressPointer
          return commands.insertContent({ type: this.name, attrs: { ...attrs, naddr } })
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

import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { nip19 } from 'nostr-tools'
import type { AddressPointer } from 'nostr-tools/nip19'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'

const decodeNAddr = (naddr: string) => {
  const {type, data} = nip19.decode(naddr.replace(/^nostr:/, ''))

  if (type !== 'naddr') {
    throw new Error(`Invalid naddr ${naddr}`)
  }

  return data as AddressPointer
}

export const NADDR_REGEX = /(?<![\w./:?=])(nostr:)?(naddr1[0-9a-z]+)/g

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
      relays: { default: [], parseHTML: parseRelayAttribute },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': this.name })]
  },

  renderText(props) {
    return 'nostr:' + props.node.attrs.naddr
  },

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }]
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write('nostr:' + node.attrs.naddr)
        },
        parse: {},
      },
    }
  },

  addCommands() {
    return {
      insertNAddr:
        ({ naddr }) =>
        ({ chain }) =>
          chain()
            .insertContent({type: this.name, attrs: {naddr, ...decodeNAddr(naddr)}})
            .insertContent(' ')
            .run(),
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
              const naddr = match[2]
              const data = decodeNAddr(naddr)

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

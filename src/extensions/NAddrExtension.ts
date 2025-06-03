import { decode } from 'nostr-tools/nip19'
import type { DecodedResult } from 'nostr-tools/nip19'
import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'
import { getNip19Relays } from '../helpers/nostr'
import type { Nip19Options } from '../helpers/nostr'

export type NAddrAttributes = {
  type: 'naddr'
  bech32: string
  identifier: string
  pubkey: string
  kind: number
  relays: string[]
}

export const makeNAddrAttrs = (input: string, options?: Nip19Options): NAddrAttributes => {
  const bech32 = input.replace(/^nostr:/, '')
  const { type, data } = decode(bech32)
  const relays = getNip19Relays({ type, data } as unknown as DecodedResult, options)

  switch (type) {
    case 'naddr':
      return { type, bech32, relays, identifier: data.identifier, pubkey: data.pubkey, kind: data.kind }
    default:
      throw new Error(`Invalid nostr entity type for this context: ${type}`)
  }
}

export const makeNAddrNode = (bech32: string, options?: Nip19Options) => ({
  type: 'naddr',
  attrs: makeNAddrAttrs(bech32, options),
})

export const NADDR_REGEX = /(?<![\w./:?=])(nostr:)?(naddr1[0-9a-z]+)/g

export type NAddrOptions = Nip19Options

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    naddr: {
      insertNAddr: (options: { bech32: string }) => ReturnType
    }
  }
}

export const NAddrExtension = Node.create<NAddrOptions>({
  name: 'naddr',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  priority: 1000,

  addOptions() {
    return {
      getRelayHints: () => [],
    }
  },

  addAttributes() {
    return {
      type: { default: null },
      bech32: { default: null },
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
    return 'nostr:' + props.node.attrs.bech32
  },

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }]
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write('nostr:' + node.attrs.bech32)
        },
        parse: {},
      },
    }
  },

  addCommands() {
    return {
      insertNAddr:
        ({ bech32 }) =>
        ({ commands }) =>
          commands.insertContent(makeNAddrNode(bech32, this.options), { updateSelection: false }),
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
              matches.push(createPasteRuleMatch(match, makeNAddrAttrs(match[2], this.options)))
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

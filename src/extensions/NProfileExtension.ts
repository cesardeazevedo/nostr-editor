import { decode } from 'nostr-tools/nip19'
import type { DecodeResult } from 'nostr-tools/nip19'
import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'
import { getNip19Relays } from '../helpers/nostr'
import type { Nip19Options } from '../helpers/nostr'

export type NProfileAttributes = {
  type: 'nprofile' | 'npub'
  bech32: string
  pubkey: string
  relays: string[]
}

export const makeNProfileAttrs = (input: string, options?: Nip19Options): NProfileAttributes => {
  const bech32 = input.replace(/^nostr:/, '')
  const { type, data } = decode(bech32)
  const relays = getNip19Relays({ type, data } as unknown as DecodeResult, options)

  switch (type) {
    case 'npub':
      return { type, bech32, relays, pubkey: data }
    case 'nprofile':
      return { type, bech32, relays, pubkey: data.pubkey }
    default:
      throw new Error(`Invalid nostr entity type for this context: ${type}`)
  }
}

export const makeNProfileNode = (bech32: string, options?: Nip19Options) => ({
  type: 'nprofile',
  attrs: makeNProfileAttrs(bech32, options),
})

export const PROFILE_REGEX = /(?<![\w./:?=])(nostr:)?(np(ub|rofile)1[0-9a-z]+)/g

export type NProfileOptions = Nip19Options

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nprofile: {
      insertNProfile: (options: { bech32: string }) => ReturnType
    }
  }
}

export const NProfileExtension = Node.create<NProfileOptions>({
  name: 'nprofile',
  atom: true,
  inline: true,
  group: 'inline',
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
      pubkey: { default: null },
      relays: { default: [], parseHTML: parseRelayAttribute },
    }
  },

  parseHTML() {
    return [{ tag: `span[data-type="${this.name}"]` }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': this.name }), '@']
  },

  renderText(props) {
    return 'nostr:' + props.node.attrs.bech32
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
      insertNProfile:
        ({ bech32 }) =>
        ({ commands }) =>
          commands.insertContent(makeNProfileNode(bech32, this.options), { updateSelection: false }),
    }
  },

  addPasteRules() {
    return [
      nodePasteRule({
        type: this.type,
        getAttributes: (match) => match.data,
        find: (text) => {
          const matches = []

          for (const match of text.matchAll(PROFILE_REGEX)) {
            try {
              matches.push(createPasteRuleMatch(match, makeNProfileAttrs(match[2], this.options)))
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

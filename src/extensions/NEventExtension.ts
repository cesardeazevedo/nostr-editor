import { decode } from 'nostr-tools/nip19'
import type { DecodeResult } from 'nostr-tools/nip19'
import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'
import { getNip19Relays } from '../helpers/nostr'
import type { Nip19Options } from '../helpers/nostr'

export type NEventAttributes = {
  type: 'nevent' | 'note'
  bech32: string
  relays: string[]
  id: string
  kind?: number
  author?: string
}

export const makeNEventAttrs = (bech32: string, options?: Nip19Options): NEventAttributes => {
  const { type, data } = decode(bech32.replace(/^nostr:/, ''))
  const relays = getNip19Relays({ type, data } as unknown as DecodeResult, options)

  switch (type) {
    case 'note':
      return { type, bech32, relays, id: data }
    case 'nevent':
      return { type, bech32, relays, id: data.id, kind: data.kind, author: data.author }
    default:
      throw new Error(`Invalid nostr entity type for this context: ${type}`)
  }
}

export const makeNEventNode = (bech32: string, options?: Nip19Options) => ({
  type: 'nevent',
  attrs: makeNEventAttrs(bech32, options),
})

export const EVENT_REGEX = /(?<![\w./:?=])(nostr:)?(n(ote|event)1[0-9a-z]+)/g

export type NEventOptions = Nip19Options

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nevent: {
      insertNEvent: (options: { bech32: string }) => ReturnType
    }
  }
}

export const NEventExtension = Node.create<NEventOptions>({
  name: 'nevent',

  group: 'block',

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
      id: { default: null },
      kind: { default: null },
      author: { default: null },
      bech32: { default: null },
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
      insertNEvent:
        ({ bech32 }) =>
        ({ commands }) =>
          commands.insertContent(makeNEventNode(bech32, this.options), { updateSelection: false }),
    }
  },

  addPasteRules() {
    return [
      nodePasteRule({
        type: this.type,
        getAttributes: (match) => match.data,
        find: (text) => {
          const matches = []

          for (const match of text.matchAll(EVENT_REGEX)) {
            try {
              matches.push(createPasteRuleMatch(match, makeNEventAttrs(match[2], this.options)))
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

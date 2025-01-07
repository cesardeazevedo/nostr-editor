import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'
import type { AddressPointer, PointerOptions } from '../helpers/nostr'
import { entityToPointer } from '../helpers/nostr'

export const NADDR_REGEX = /(?<![\w./:?=])(nostr:)?(naddr1[0-9a-z]+)/g

export type NAddrAttributes = AddressPointer

export type NAddrOptions = PointerOptions<AddressPointer>

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    naddr: {
      insertNAddr: (options: { entity: string }) => ReturnType
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

  addAttributes() {
    return {
      type: { default: null },
      entity: { default: null },
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
    return props.node.attrs.entity
  },

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }]
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write(node.attrs.entity)
        },
        parse: {},
      },
    }
  },

  addCommands() {
    return {
      insertNAddr:
        ({ entity }) =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: entityToPointer(entity, this.options) })
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
              matches.push(createPasteRuleMatch(match, entityToPointer(match[2], this.options)))
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

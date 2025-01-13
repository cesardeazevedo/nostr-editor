import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'
import type { EventPointer, PointerOptions } from '../helpers/nostr'
import { entityToPointer } from '../helpers/nostr'

export const EVENT_REGEX = /(?<![\w./:?=])(nostr:)?(n(ote|event)1[0-9a-z]+)/g

export type NEventAttributes = EventPointer

export type NEventOptions = PointerOptions<EventPointer>

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
      allowedTypes: ["nevent", "note"],
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
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: entityToPointer(bech32, this.options) })
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

          for (const match of text.matchAll(EVENT_REGEX)) {
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

import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { nip19 } from 'nostr-tools'
import type { EventPointer } from 'nostr-tools/nip19'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'

const decodeNEvent = (nevent: string) => {
  const {type, data} = nip19.decode(nevent.replace(/^nostr:/, ''))

  if (type === 'note') {
    console.warn("Passing note1 entities to nevent extension is deprecated")
    return {id: data}
  } else if (type !== 'nevent') {
    throw new Error(`Invalid nevent ${nevent}`)
  }

  return data as EventPointer
}

export const NEVENT_REGEX = /(?<![\w./:?=])(nostr:)?(n(ote|event)1[0-9a-z]+)/g

export interface NEventAttributes {
  nevent: string
  id: string
  kind: number
  author: string
  relays: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nevent: {
      insertNEvent: (options: { nevent: string }) => ReturnType
    }
  }
}

export const NEventExtension = Node.create({
  name: 'nevent',

  group: 'block',

  selectable: true,

  draggable: true,

  priority: 1000,

  addAttributes() {
    return {
      id: { default: null },
      kind: { default: null },
      author: { default: null },
      nevent: { default: null },
      relays: { default: [], parseHTML: parseRelayAttribute },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': this.name })]
  },

  renderText(props) {
    return 'nostr:' + props.node.attrs.nevent
  },

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }]
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write('nostr:' + node.attrs.nevent)
        },
        parse: {},
      },
    }
  },

  addCommands() {
    return {
      insertNEvent:
        ({ nevent }) =>
        ({ chain }) =>
          chain()
            .insertContent({type: this.name, attrs: {nevent, ...decodeNEvent(nevent)}})
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

          for (const match of text.matchAll(NEVENT_REGEX)) {
            try {
              const nevent = match[2]
              const data = decodeNEvent(nevent)

              matches.push(createPasteRuleMatch(match, { ...data, nevent }))
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

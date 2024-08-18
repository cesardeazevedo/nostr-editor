import { Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { nip19 } from 'nostr-tools'
import type { EventPointer } from 'nostr-tools/nip19'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch } from '../helpers/utils'

export const NOTE_REGEX = /(nostr:)?(note1[0-9a-z]+)/g

export const NEVENT_REGEX = /(nostr:)?(nevent1[0-9a-z]+)/g

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
      relays: { default: [] },
      nevent: { default: null },
    }
  },

  renderHTML(props) {
    return ['div', { 'data-nevent': props.node.attrs.nevent }]
  },

  renderText(props) {
    return props.node.attrs.nevent
  },

  parseHTML() {
    return [{ tag: 'div[data-nevent]' }]
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write(node.attrs.nevent)
        },
        parse: {},
      },
    }
  },

  addCommands() {
    return {
      insertNEvent:
        ({ nevent }) =>
        ({ commands }) => {
          const parts = nevent.split(':')
          const attrs = nip19.decode(parts[parts.length - 1])?.data as EventPointer
          return commands.insertContent(
            { type: this.name, attrs: { ...attrs, nevent } },
            {
              updateSelection: false,
            },
          )
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

          for (const match of text.matchAll(NOTE_REGEX)) {
            try {
              const id = nip19.decode(match[2]).data as string
              const nevent = match[0]

              matches.push(createPasteRuleMatch(match, { id, nevent }))
            } catch (e) {
              continue
            }
          }

          for (const match of text.matchAll(NEVENT_REGEX)) {
            try {
              const data = nip19.decode(match[2]).data as EventPointer
              const nevent = match[0]

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

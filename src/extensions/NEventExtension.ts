import { nip19 } from 'nostr-tools'
import type { EventPointer } from 'nostr-tools/nip19'
import { Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import {createPasteRuleMatch} from './util'

export const NOTE_REGEX = /(nostr:)?(note1[0-9a-z]+)/g

export const NEVENT_REGEX = /(nostr:)?(nevent1[0-9a-z]+)/g

export const NEventExtension = Node.create({
  name: 'nevent',

  group: 'block',

  atom: true,

  selectable: true,

  content: 'text*',

  addAttributes() {
    return {
      id: { default: null },
      kind: { default: null },
      author: { default: null },
      relays: { default: [] },
    }
  },

  renderHTML() {
    return ['div', {}, 0]
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write(node.textContent)
        },
        parse: {},
      },
    }
  },

  addPasteRules() {
    return [
      nodePasteRule({
        type: this.type,
        getAttributes: match => match.data,
        find: text => {
          const matches = []

          for (const match of text.matchAll(NOTE_REGEX)) {
            try {
              const id = nip19.decode(match[2]).data as string

              matches.push(createPasteRuleMatch(match, {id}))
            } catch (e) {
              continue
            }
          }

          for (const match of text.matchAll(NEVENT_REGEX)) {
            try {
              const data = nip19.decode(match[2]).data as EventPointer

              matches.push(createPasteRuleMatch(match, data))
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

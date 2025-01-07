import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'
import type { ProfilePointer, PointerOptions } from '../helpers/nostr'
import { entityToPointer } from '../helpers/nostr'

export const PROFILE_REGEX = /(?<![\w./:?=])(nostr:)?(np(ub|rofile)1[0-9a-z]+)/g

export type NProfileAttributes = ProfilePointer

export type NProfileOptions = PointerOptions<ProfilePointer>

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nprofile: {
      insertNProfile: (options: { entity: string }) => ReturnType
    }
  }
}

export const NProfileExtension = Node.create<NProfileOptions>({
  name: 'nprofile',
  atom: true,
  inline: true,
  group: 'inline',
  priority: 1000,

  addAttributes() {
    return {
      type: { default: null },
      entity: { default: null },
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
    return props.node.attrs.entity
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
      insertNProfile:
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

          for (const match of text.matchAll(PROFILE_REGEX)) {
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

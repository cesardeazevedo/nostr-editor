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
      allowedTypes: ["nprofile", "npub"],
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
          commands.insertContent(
            { type: this.name, attrs: entityToPointer(bech32, this.options) },
            { updateSelection: false }
          ),
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

import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { nip19 } from 'nostr-tools'
import type { ProfilePointer } from 'nostr-tools/nip19'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'

export const NPUB_REGEX = /(?<![\w./:?=])(nostr:)?(npub1[0-9a-z]+)/g

export const NPROFILE_REGEX = /(?<![\w./:?=])(nostr:)?(nprofile1[0-9a-z]+)/g

export type NProfileAttributes = {
  nprofile: string
  pubkey: string
  relays: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nprofile: {
      insertNProfile: (options: { nprofile: string }) => ReturnType
    }
  }
}

export const NProfileExtension = Node.create({
  name: 'nprofile',
  inline: true,
  group: 'inline',
  atom: true,
  priority: 1000,

  addAttributes() {
    return {
      nprofile: { default: null },
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
    return props.node.attrs.nprofile
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write(node.attrs.nprofile)
        },
        parse: {},
      },
    }
  },

  addCommands() {
    return {
      insertNProfile:
        ({ nprofile }) =>
        ({ chain }) => {
          const parts = nprofile.split(':')
          const attrs = nip19.decode(parts[parts.length - 1])?.data as ProfilePointer
          return chain()
            .insertContent({ type: this.name, attrs: { ...attrs, nprofile } })
            .insertContent(' ')
            .run()
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

          for (const match of text.matchAll(NPUB_REGEX)) {
            try {
              const nprofile = match[0]
              const pubkey = nip19.decode(match[2]).data as string

              matches.push(createPasteRuleMatch(match, { pubkey, nprofile }))
            } catch (e) {
              continue
            }
          }

          for (const match of text.matchAll(NPROFILE_REGEX)) {
            try {
              const nprofile = match[0]
              const data = nip19.decode(match[2]).data as ProfilePointer

              matches.push(createPasteRuleMatch(match, { ...data, nprofile }))
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

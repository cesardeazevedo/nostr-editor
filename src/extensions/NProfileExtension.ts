import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { nip19 } from 'nostr-tools'
import type { ProfilePointer } from 'nostr-tools/nip19'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch, parseRelayAttribute } from '../helpers/utils'

const decodeNProfile = (nprofile: string) => {
  const {type, data} = nip19.decode(nprofile.replace(/^nostr:/, ''))

  if (type === 'npub') {
    return {pubkey: data}
  } else if (type !== 'nprofile') {
    throw new Error(`Invalid nprofile ${nprofile}`)
  }

  return data as ProfilePointer
}

export const NPROFILE_REGEX = /(?<![\w./:?=])(nostr:)?(np(ub|rofile)1[0-9a-z]+)/g

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
    return 'nostr:' + props.node.attrs.nprofile
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write('nostr:' + node.attrs.nprofile)
        },
        parse: {},
      },
    }
  },

  addCommands() {
    return {
      insertNProfile:
        ({ nprofile }) =>
        ({ chain }) =>
          chain()
            .insertContent({type: this.name, attrs: {nprofile, ...decodeNProfile(nprofile)}})
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

          for (const match of text.matchAll(NPROFILE_REGEX)) {
            try {
              const nprofile = match[2]
              const data = decodeNProfile(nprofile)

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

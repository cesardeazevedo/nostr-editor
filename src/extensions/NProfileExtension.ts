import { nip19 } from 'nostr-tools'
import type { ProfilePointer } from 'nostr-tools/nip19'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import {nodePasteRule, Node} from '@tiptap/core'
import {createPasteRuleMatch} from './util'

export const NPUB_REGEX = /(nostr:)?(npub1[0-9a-z]+)/g

export const NPROFILE_REGEX = /(nostr:)?(nprofile1[0-9a-z]+)/g

export const NProfileExtension = Node.create({
  name: 'nprofile',
  inline: true,
  inclusive: true,
  group: 'inline',
  content: 'text?',
  addAttributes() {
    return {
      pubkey: { default: null, },
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

          for (const match of text.matchAll(NPUB_REGEX)) {
            try {
              const pubkey = nip19.decode(match[2]).data as string

              matches.push(createPasteRuleMatch(match, {pubkey}))
            } catch (e) {
              continue
            }
          }

          for (const match of text.matchAll(NPROFILE_REGEX)) {
            try {
              const data = nip19.decode(match[2]).data as ProfilePointer

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


import { Node } from '@tiptap/core'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'

export const NAddrExtension = Node.create({
  name: 'naddr',

  group: 'block',

  atom: true,

  isolating: true,

  content: 'text*',

  addAttributes() {
    return {
      kind: { default: null },
      pubkey: { default: null },
      relays: { default: null },
      identifier: { default: null },
    }
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

  renderHTML() {
    return ['div', {}, 0]
  },
})

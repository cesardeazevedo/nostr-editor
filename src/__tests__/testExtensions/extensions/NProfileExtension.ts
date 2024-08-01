import { Node } from '@tiptap/core'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'

export const NProfileExtension = Node.create({
  name: 'nprofile',

  inline: true,

  inclusive: true,

  group: 'inline',

  content: 'text?',

  addAttributes() {
    return {
      pubkey: { default: null },
      relays: { default: null },
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

  renderText(p) {
    return p.node.textContent
  },

  renderHTML(p) {
    return ['span', { ...p.node.attrs }, '@']
  },
})

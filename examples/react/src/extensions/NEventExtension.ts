import { Node } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'

export const NEventExtension = Node.create({
  name: 'nevent',

  group: 'block',

  atom: true,

  isolating: true,

  selectable: true,

  content: 'text?',

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

  addAttributes() {
    return {
      id: { default: null },
      kind: { default: null },
      author: { default: null },
      relays: { default: null },
    }
  },

  renderHTML() {
    return ['div', {}, 0]
  },
})

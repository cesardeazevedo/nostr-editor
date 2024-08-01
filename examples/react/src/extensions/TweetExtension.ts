import { Node } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'

export const TweetExtension = Node.create({
  name: 'tweet',

  group: 'block',

  atom: true,

  isolating: true,

  selectable: true,

  content: 'text*',

  addAttributes() {
    return {
      src: { default: null },
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

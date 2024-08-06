import { Node } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import type { MarkdownSerializerState } from 'prosemirror-markdown'

export type TweetAttributes = {
  src: string
}

export const TweetExtension = Node.create({
  name: 'tweet',

  group: 'block',

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write(node.attrs.src)
        },
        parse: {},
      },
    }
  },

  renderText(props) {
    return props.node.attrs.src
  },

  renderHTML() {
    return ['div', {}]
  },
})

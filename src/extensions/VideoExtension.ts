import { Node } from '@tiptap/core'

export const VideoExtension = Node.create({
  name: 'video',

  inline: false,

  inclusive: false,

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  renderText(props) {
    return props.node.attrs.src
  },

  renderHTML() {
    return ['a', {}]
  },
})

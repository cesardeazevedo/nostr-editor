import { Node } from '@tiptap/core'

export const VideoExtension = Node.create({
  name: 'video',

  inline: false,

  inclusive: false,

  group: 'block',

  atom: true,

  content: 'text*',

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  renderHTML() {
    return ['a', {}, 0]
  },
})

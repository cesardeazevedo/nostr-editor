import { mergeAttributes, Node } from '@tiptap/core'

export interface ImageOptions {}

export const ImageExtension = Node.create<ImageOptions>({
  name: 'image',

  inline: false,

  group: 'block',

  draggable: false,

  content: 'text*',

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },
})

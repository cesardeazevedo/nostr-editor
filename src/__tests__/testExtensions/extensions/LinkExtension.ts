import { Mark } from '@tiptap/core'

export const LinkExtension = Mark.create({
  name: 'link' as const,

  inclusive: false,

  excludes: '_',

  addAttributes() {
    return {
      href: { default: null },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', HTMLAttributes, 0]
  },
})

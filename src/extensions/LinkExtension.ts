import { Mark } from '@tiptap/core'
import { defaultMarkdownSerializer } from 'prosemirror-markdown'

export type LinkAttributes = {
  href: string
}

export const LinkExtension = Mark.create({
  name: 'link' as const,

  inclusive: false,

  excludes: '_',

  parseHTML() {
    return [{ tag: 'a' }]
  },

  addAttributes() {
    return {
      href: { default: null },
    }
  },

  addStorage() {
    return {
      markdown: {
        serialize: defaultMarkdownSerializer.marks.link,
        parse: {},
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['a', HTMLAttributes, 0]
  },
})

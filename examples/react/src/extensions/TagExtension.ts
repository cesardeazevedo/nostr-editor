import { Mark } from '@tiptap/core'

export interface TagAttributes {
  tag: string
}

export const TagExtension = Mark.create({
  name: 'tag',

  inline: true,

  selectable: true,

  inclusive: false,

  group: 'inline',

  renderHTML(p) {
    return ['a', { ...p.mark.attrs }, 0]
  },

  addAttributes() {
    return {
      tag: { default: null },
    }
  },
})

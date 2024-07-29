import { Mark } from '@tiptap/core'

export const TagExtension = Mark.create({
  name: 'tag',

  inline: true,

  selectable: true,

  inclusive: false,

  group: 'inline',

  renderHTML(p) {
    return ['span', p.mark.attrs, 0]
  },

  addAttributes() {
    return {
      tag: { default: null },
    }
  },
})

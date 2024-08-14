import { Mark, markPasteRule } from '@tiptap/core'

export interface TagAttributes {
  tag: string
}

const REGEX_TAG_PASTE = /(#[^\s]+)/g
const REGEX_TAG_INPUT = /(#[^\s]+)$/g

export const TagExtension = Mark.create({
  name: 'tag',

  inline: true,

  selectable: true,

  inclusive: false,

  group: 'inline',

  priority: 100,

  addStorage() {
    return {
      markdown: {
        serialize: {
          open: '',
          close: '',
          mixable: false,
          expelEnclosingWhitespace: true,
        },
        parse: {},
      },
    }
  },

  renderHTML(p) {
    return ['a', { ...p.mark.attrs }, 0]
  },

  addAttributes() {
    return {
      tag: { default: null },
    }
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: REGEX_TAG_PASTE,
        getAttributes: (match) => ({ tag: match[0] }),
        type: this.type,
      }),
    ]
  },

  addInputRules() {
    return [
      {
        find: REGEX_TAG_INPUT,
        handler: ({ state, range, match }) => {
          state.tr
            .delete(range.from, range.to)
            .insertText(match[0])
            .addMark(range.from, range.to + 1, this.type.create({ tag: match[0] }))
        },
      },
    ]
  },
})

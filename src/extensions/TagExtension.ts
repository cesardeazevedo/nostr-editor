import type { InputRuleMatch } from '@tiptap/core'
import { Mark, markPasteRule, mergeAttributes } from '@tiptap/core'

export interface TagAttributes {
  tag: string
}

const REGEX_TAG_PASTE = /(?<![\w./:?=])(#[^\W]+)/g
const REGEX_TAG_INPUT = /(?<![\w./:?=])(#[^\W]+)$/g

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
    return ['a', mergeAttributes(p.HTMLAttributes, { 'data-type': this.name })]
  },

  parseHTML() {
    return [{ tag: `a[data-type="${this.name}"]` }]
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
        find: (text) => {
          const match = text.match(REGEX_TAG_INPUT)
          if (match) {
            return {
              index: match.index,
              text: match[0],
              replaceWith: text,
              data: { tag: text },
              match,
            } as InputRuleMatch
          }
          return null
        },
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

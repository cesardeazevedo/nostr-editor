import type { PasteRuleMatch } from '@tiptap/core'
import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { decode } from 'light-bolt11-decoder'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch } from '../helpers/utils'

const LNBC_REGEX = /(?<![\w./:?=])(lnbc[0-9a-z]{10,})/g

export const makeBolt11Attrs = (lnbc: string) => ({ bolt11: decode(lnbc), lnbc })

export const makeBolt11Node = (lnbc: string) => ({ type: 'bolt11', attrs: makeBolt11Attrs(lnbc) })

export interface Bolt11Attributes {
  lnbc: string
  bolt11: ReturnType<typeof decode>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bolt11: {
      insertBolt11: (options: { lnbc: string }) => ReturnType
    }
  }
}

export const Bolt11Extension = Node.create({
  name: 'bolt11',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      lnbc: { default: null },
      bolt11: {
        default: null,
        renderHTML(attrs) {
          return { bolt11: JSON.stringify(attrs.bolt11 || {}) }
        },
        parseHTML(element) {
          const bolt11 = element.getAttribute('bolt11')
          return typeof bolt11 === 'string' ? JSON.parse(bolt11 || '{}') : bolt11
        },
      },
    }
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: ProsemirrorNode) {
          state.write(node.attrs.lnbc)
        },
        parse: {},
      },
    }
  },

  addCommands() {
    return {
      insertBolt11:
        ({ lnbc }) =>
        ({ commands }) =>
          commands.insertContent(makeBolt11Node(lnbc), { updateSelection: false }),
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': this.name })]
  },

  renderText(props) {
    return props.node.attrs.lnbc
  },

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }]
  },

  addPasteRules() {
    return [
      nodePasteRule({
        type: this.type,
        getAttributes: (match) => match.data,
        find: (text) => {
          const matches = [] as PasteRuleMatch[]

          for (const match of text.matchAll(LNBC_REGEX)) {
            matches.push(createPasteRuleMatch(match, makeBolt11Attrs(match[0])))
          }

          return matches
        },
      }),
    ]
  },
})

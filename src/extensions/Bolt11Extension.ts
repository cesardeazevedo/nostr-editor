import type { PasteRuleMatch } from '@tiptap/core'
import { Node, nodePasteRule } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { decode } from 'light-bolt11-decoder'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import { createPasteRuleMatch } from '../helpers/utils'

const LNBC_REGEX = /(lnbc[0-9a-z]{10,})/g

export const Bolt11Extension = Node.create({
  name: 'bolt11',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      lnbc: { default: null },
      bolt11: { default: null },
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

  renderHTML() {
    return ['div', {}]
  },

  renderText(props) {
    return props.node.attrs.lnbc
  },

  addPasteRules() {
    return [
      nodePasteRule({
        type: this.type,
        getAttributes: (match) => match.data,
        find: (text) => {
          const matches = [] as PasteRuleMatch[]
          for (const match of text.matchAll(LNBC_REGEX)) {
            const bolt11 = decode(match[0])
            matches.push(createPasteRuleMatch(match, { bolt11, lnbc: match[0] }))
          }
          return matches
        },
      }),
    ]
  },
})

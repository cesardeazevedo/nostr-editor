import type { PasteRuleMatch } from '@tiptap/core'
import { Mark } from '@tiptap/core'
import * as linkifyjs from 'linkifyjs'
import { defaultMarkdownSerializer } from 'prosemirror-markdown'
import { getLinkKind, isValidTLD } from '../helpers/utils'

export type LinkAttributes = {
  href: string
}

export const LinkExtension = Mark.create({
  name: 'link' as const,

  inclusive: false,

  excludes: '_',

  priority: 100,

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

  addPasteRules() {
    return [
      {
        find: (text) => {
          const matches = [] as PasteRuleMatch[]
          for (const { start, value, href } of linkifyjs.find(text.replace(/\ufffc/g, ' ')) || []) {
            if (!isValidTLD(href) && !href.startsWith('tel:')) {
              continue
            }
            matches.push({
              index: start,
              text: value,
              data: { href },
            })
          }
          return matches
        },
        handler: (props) => {
          const { range, state, match } = props
          const { from, to } = range
          const { nodes, marks } = state.schema
          const imeta = this.editor.storage.nostr.imeta
          const url = match.data?.href
          const kind = getLinkKind(url, url, imeta)
          if (kind !== 'text' && nodes[kind]) {
            state.tr.replaceWith(from, to, nodes[kind].create({ src: url }))
            return
          }
          state.tr.addMark(from, to, marks.link.create({ href: url }))
        },
      },
    ]
  },
})

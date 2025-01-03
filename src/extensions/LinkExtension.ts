import type { PasteRuleMatch } from '@tiptap/core'
import { Link, type LinkOptions } from '@tiptap/extension-link'
import * as linkifyjs from 'linkifyjs'
import { getLinkKind } from '../helpers/utils'

export { LinkOptions }

export type LinkAttributes = {
  href: string
}

linkifyjs.registerCustomProtocol('wss')

export const LinkExtension = Link.configure({ autolink: false }).extend({
  addPasteRules() {
    return [
      {
        find: (text) => {
          const matches = [] as PasteRuleMatch[]
          for (const { start, value, href } of linkifyjs.find(text.replace(/\ufffc/g, ' '))) {
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
          const kind = getLinkKind(url, imeta)
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

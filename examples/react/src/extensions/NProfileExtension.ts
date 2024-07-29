import { Node } from '@tiptap/core'

export const NProfileExtension = Node.create({
  name: 'nprofile',

  inline: true,

  inclusive: true,

  group: 'inline',

  renderText(p) {
    return p.node.textContent
  },

  renderHTML(p) {
    return ['span', { ...p.node.attrs }, 'mention']
  },

  addAttributes() {
    return {
      pubkey: { default: null },
      relays: { default: null },
    }
  },
})

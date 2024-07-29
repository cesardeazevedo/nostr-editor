import { Node } from '@tiptap/core'

export const NProfileExtension = Node.create({
  name: 'nprofile',

  inline: true,

  inclusive: true,

  group: 'inline',

  content: 'text*',

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

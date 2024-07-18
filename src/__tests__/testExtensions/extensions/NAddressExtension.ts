import { Node } from '@tiptap/core'

export const NAddrExtension = Node.create({
  name: 'naddr',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      kind: { default: null },
      pubkey: { default: null },
      relays: { default: null },
      identifier: { default: null },
    }
  },

  renderHTML() {
    return ['div', {}, 0]
  },
})

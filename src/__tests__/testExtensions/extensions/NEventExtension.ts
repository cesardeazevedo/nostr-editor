import { Node } from '@tiptap/core'

export const NEventExtension = Node.create({
  name: 'nevent',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      kind: { default: null },
      author: { default: null },
      relays: { default: null },
    }
  },

  renderHTML() {
    return ['div', {}, 0]
  },
})

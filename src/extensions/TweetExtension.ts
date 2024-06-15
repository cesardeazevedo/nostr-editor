import { Node } from '@tiptap/core'

export const TweetExtension = Node.create({
  name: 'tweet',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  renderHTML() {
    return ['div', {}, 0]
  },
})

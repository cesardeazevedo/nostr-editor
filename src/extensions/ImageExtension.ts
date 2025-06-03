import { Image } from '@tiptap/extension-image'
import { defaultMarkdownSerializer } from 'prosemirror-markdown'
import type { NostrEvent } from 'nostr-tools'

export interface ImageOptions {
  inline: boolean
}

export interface ImageAttributes {
  src: string
  alt: string
  title: string
  file: File
  tags: NostrEvent['tags']
  sha256: string
  uploading: boolean
  error: string
}

export const ImageExtension = Image.extend<ImageOptions>({
  draggable: true,

  addOptions() {
    return {
      inline: false,
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  addStorage() {
    return {
      markdown: {
        serialize: defaultMarkdownSerializer.nodes.image,
        parse: {},
      },
    }
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      file: { default: null },
      tags: { default: null },
      sha256: { default: null },
      uploading: { default: false },
      error: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderText(props) {
    return props.node.attrs.src
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]
  },
})

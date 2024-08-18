import { Node } from '@tiptap/core'
import type { UploadParams } from '../types'
import { defaultMarkdownSerializer } from 'prosemirror-markdown'

export interface ImageOptions {
  inline: boolean
  defaultUploadType: UploadParams['type']
  defaultUploadUrl: string
}

export interface ImageAttributes {
  src: string
  alt: string
  title: string
  hash: string
  file: File
  sha256: string
  uploading: boolean
  uploadError: string
  uploadType: UploadParams['type']
  uploadUrl: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType
    }
  }
}

export const ImageExtension = Node.create<ImageOptions>({
  name: 'image',

  draggable: true,

  addOptions() {
    return {
      inline: false,
      defaultUploadUrl: 'https://nostr.build',
      defaultUploadType: 'nip96',
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
      hash: { default: null },
      file: { default: null },
      sha256: { default: null },
      uploading: { default: false },
      uploadError: { default: null },
      uploadType: { default: this.options.defaultUploadType },
      uploadUrl: { default: this.options.defaultUploadUrl },
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

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})

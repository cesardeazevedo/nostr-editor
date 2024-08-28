import { Image } from '@tiptap/extension-image'
import { defaultMarkdownSerializer } from 'prosemirror-markdown'
import type { UploadParams } from '../uploaders/types'

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

export const ImageExtension = Image.extend<ImageOptions>({
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
})

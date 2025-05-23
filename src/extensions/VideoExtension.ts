import { mergeAttributes, Node } from '@tiptap/core'
import type { NostrEvent } from 'nostr-tools'
import { defaultMarkdownSerializer } from 'prosemirror-markdown'
import type { UploadParams } from '../uploaders/types'

export interface VideoAttributes {
  src: string
  alt: string
  sha256: string
  file: File
  tags: NostrEvent['tags']
  uploading: boolean
  uploadError: string
  uploadType: UploadParams['type']
  uploadUrl: UploadParams['url']
}

export const VideoExtension = Node.create({
  name: 'video',

  inline: false,

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addOptions() {
    return {
      defaultUploadUrl: 'https://nostr.build',
      defaultUploadType: 'nip96',
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
      uploadError: { default: null },
      uploadType: { default: this.options.defaultUploadType },
      uploadUrl: { default: this.options.defaultUploadUrl },
    }
  },

  renderText(props) {
    return props.node.attrs.src
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { 'data-type': this.name })]
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  addStorage() {
    return {
      markdown: {
        serialize: defaultMarkdownSerializer.nodes.image,
        parse: {},
      },
    }
  },
})

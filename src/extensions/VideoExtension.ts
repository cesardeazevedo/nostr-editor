import { Node } from '@tiptap/core'
import type { UploadParams } from '../types'

export interface VideoAttributes {
  src: string
  alt: string
  sha256: string
  file: File
  uploading: boolean
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

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      file: { default: null },
      sha256: { default: null },
      uploading: { default: false },
      uploadType: { default: 'nip96' },
      uploadUrl: { default: 'https://nostr.build' },
    }
  },

  renderText(props) {
    return props.node.attrs.src
  },

  renderHTML() {
    return ['video', {}]
  },
})

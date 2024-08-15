import { Extension } from '@tiptap/core'
import type { EventTemplate, NostrEvent } from 'nostr-tools/core'
import { Fragment, Slice } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import { uploadBlossom } from '../uploaders/blossom'
import { uploadNIP96 } from '../uploaders/nip96'
import type { ImageAttributes } from './ImageExtension'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileUpload: {
      selectFile: () => ReturnType
      uploadFiles: () => ReturnType
    }
  }
}

export interface FileUploadOptions {
  allowedMimeTypes: string[]
  expiration: number
  hash: (file: File) => Promise<string>
  sign?: (event: EventTemplate) => Promise<NostrEvent> | NostrEvent
  upload?: (file: File) => Promise<unknown>
}

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const FileUploadExtension = Extension.create<FileUploadOptions>({
  name: 'fileUpload',

  addOptions() {
    return {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'video/webm'],
      expiration: 60000,
      async hash(file: File) {
        return bufferToHex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))
      },
    }
  },

  addCommands() {
    return {
      selectFile: () => (props) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = this.options.allowedMimeTypes.join(',')
        input.onchange = (event) => {
          const files = (event.target as HTMLInputElement).files
          if (files) {
            ;[...files].forEach((file) => {
              if (file) {
                const [mimetype] = file.type.split('/')
                const { view } = this.editor
                const pos = view.state.selection.from
                const node = view.state.schema.nodes[mimetype].create({
                  file,
                  src: URL.createObjectURL(file),
                  alt: '',
                })
                props.state.tr.insert(pos, node)
              }
            })
            props.view.dispatch?.(props.tr)
            return true
          }
        }
        input.click()
        return true
      },
      uploadFiles: () => (props) => {
        const tasks: Promise<unknown>[] = []

        const { expiration, hash, sign } = this.options

        if (!sign) {
          return false
        }

        this.editor.setEditable(false)

        // Iterate on all images and videos
        props.tr.doc.descendants((node, pos) => {
          if (node.type.name === 'image' || node.type.name === 'video') {
            const { file, alt, uploadType, uploadUrl: serverUrl } = node.attrs as ImageAttributes
            props.tr.setNodeAttribute(pos, 'uploading', true)
            if (uploadType === 'nip96') {
              tasks.push(
                uploadNIP96({ file, alt, sign, serverUrl }).then((res) => {
                  const { tr } = props.view.state
                  const url = res?.nip94_event?.tags.find((x) => x[0] === 'url')?.[1]
                  const sha256 = res?.nip94_event?.tags.find((x) => x[0] === 'x')?.[1]
                  tr.setNodeAttribute(pos, 'src', url)
                  tr.setNodeAttribute(pos, 'sha256', sha256)
                  tr.setNodeAttribute(pos, 'uploading', false)
                  props.view.dispatch(tr)
                }),
              )
            } else if (uploadType === 'blossom') {
              tasks.push(
                uploadBlossom({ file, serverUrl, hash, sign, expiration }).then((res) => {
                  const { tr } = props.view.state
                  tr.setNodeAttribute(pos, 'src', res.url)
                  tr.setNodeAttribute(pos, 'sha256', res.sha256)
                  tr.setNodeAttribute(pos, 'uploading', false)
                  props.view.dispatch(tr)
                }),
              )
            }
          }
        })

        Promise.allSettled(tasks)
          .then(() => {
            this.editor.setEditable(true)
          })
          .catch((error) => {
            console.log('Upload error', error)
          })
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('filePlugin'),
        props: {
          handleDrop: (view, event) => {
            event.preventDefault()

            const { state } = view
            const { tr } = state
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos

            if (pos === undefined) return false

            if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
              const file = event.dataTransfer.files[0]
              const [mimetype] = file.type.split('/')
              if (this.options.allowedMimeTypes.includes(file.type)) {
                const node = view.state.schema.nodes[mimetype].create({
                  file,
                  src: URL.createObjectURL(file),
                  alt: '',
                })
                const slice = new Slice(Fragment.from(node), 0, 0)
                tr.replaceRange(pos, pos, slice)
                view.dispatch(tr)
                return true
              }
            }
            return false
          },
        },
      }),
    ]
  },
})

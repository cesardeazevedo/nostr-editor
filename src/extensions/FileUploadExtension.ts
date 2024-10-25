import type { CommandProps, Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { EventTemplate, NostrEvent } from 'nostr-tools/core'
import type { Node } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import { uploadBlossom } from '../uploaders/blossom'
import { uploadNIP96 } from '../uploaders/nip96'
import type { ImageAttributes } from './ImageExtension'
import type { VideoAttributes } from './VideoExtension'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileUpload: {
      addFile: (file: File, pos: number) => ReturnType
      selectFiles: () => ReturnType
      uploadFiles: () => ReturnType
    }
  }
}

export interface FileUploadOptions {
  allowedMimeTypes: string[]
  expiration: number
  immediateUpload: boolean
  hash: (file: File) => Promise<string>
  sign?: (event: EventTemplate) => Promise<NostrEvent> | NostrEvent
  onDrop: (currentEditor: Editor, file: File, pos: number) => void
  onStart: (currentEditor: Editor) => void
  onUpload: (currentEditor: Editor, file: UploadTask) => void
  onUploadError: (currentEditor: Editor, file: UploadTask) => void
  onComplete: (currentEditor: Editor, files: UploadTask[]) => void
}

interface UploadTask {
  url?: string
  sha256?: string
  tags?: NostrEvent['tags']
  error?: string
}

export function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const FileUploadExtension = Extension.create<FileUploadOptions>({
  name: 'fileUpload',

  addOptions() {
    return {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'video/webm'],
      immediateUpload: false,
      expiration: 60000,
      async hash(file: File) {
        return bufferToHex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))
      },
      onDrop() {},
      onStart() {},
      onUpload() {},
      onUploadError() {},
      onComplete() {},
    }
  },

  addCommands() {
    return {
      addFile: (file: File, pos: number) => (props) => {
        props.tr.setMeta('addFile', [file, pos])
        return true
      },
      selectFiles: () => (props) => {
        props.tr.setMeta('selectFiles', true)
        return true
      },
      uploadFiles: () => (props: CommandProps) => {
        props.tr.setMeta('uploadFiles', true)
        return true
      },
    }
  },

  addStorage() {
    return {
      files: [],
    }
  },

  addProseMirrorPlugins() {
    const uploader = new Uploader(this.editor, this.options)
    return [
      new Plugin({
        key: new PluginKey('fileUploadPlugin'),
        state: {
          init() {
            return {}
          },
          apply: (tr) => {
            setTimeout(async () => {
              if (tr.getMeta('addFile')) {
                const [file, pos] = tr.getMeta('addFile')
                uploader.addFile(file, pos)
              } else if (tr.getMeta('selectFiles')) {
                uploader.selectFiles()
                tr.setMeta('selectFiles', null)
              } else if (tr.getMeta('uploadFiles')) {
                let hasErrors = false
                this.storage.files = []
                this.options.onStart(this.editor)
                for await (const file of uploader.uploadFiles()) {
                  this.storage.files.push(file)
                  if ('error' in file) {
                    hasErrors = true
                    this.options.onUploadError(this.editor, file)
                  } else {
                    this.options.onUpload(this.editor, file)
                  }
                }
                if (!hasErrors) {
                  this.options.onComplete(this.editor, this.storage.files)
                }
                tr.setMeta('uploadFiles', null)
              }
            })
            return {}
          },
        },
        props: {
          handleDrop: (_, event) => {
            return uploader.handleDrop(event)
          },
        },
      }),
    ]
  },
})

class Uploader {
  constructor(
    public editor: Editor,
    private options: FileUploadOptions,
  ) {}

  get view() {
    return this.editor.view
  }

  addFile(file: File, pos: number) {
    if (!this.options.allowedMimeTypes.includes(file.type)) {
      return false
    }
    const { tr } = this.view.state
    const [mimetype] = file.type.split('/')
    const node = this.view.state.schema.nodes[mimetype].create({
      file,
      src: URL.createObjectURL(file),
      alt: '',
    })
    tr.insert(pos, node)
    this.view.dispatch(tr)

    if (this.options.immediateUpload) {
      this.upload(node, pos)
    }
    this.options.onDrop(this.editor, file, pos)
    return true
  }

  findNodes(uploading: boolean) {
    const nodes = [] as [Node, number][]
    this.view.state.doc.descendants((node, pos) => {
      if (!(node.type.name === 'image' || node.type.name === 'video')) {
        return
      }
      if (node.attrs.sha256) {
        return
      }
      if ((node.attrs.uploading || false) !== uploading) {
        return
      }
      nodes.push([node, pos])
    })
    return nodes
  }

  updateNodeAttributes(pos: number, attrs: Record<string, unknown>) {
    const { tr } = this.view.state
    Object.entries(attrs).forEach(([key, value]) => value !== undefined && tr.setNodeAttribute(pos, key, value))
    this.view.dispatch(tr)
  }

  onUploadDone(nodeRef: Node, response: UploadTask) {
    this.findNodes(true).forEach(([node, pos]) => {
      if (node.attrs.src === nodeRef.attrs.src) {
        this.updateNodeAttributes(pos, {
          uploading: false,
          src: response.url,
          sha256: response.sha256,
          uploadError: response.error,
        })
      }
    })
  }

  async upload(node: Node, pos: number) {
    const { sign, hash, expiration } = this.options
    const { file, alt, uploadType, uploadUrl: serverUrl } = node.attrs as ImageAttributes | VideoAttributes

    this.updateNodeAttributes(pos, { uploading: true, uploadError: null })

    try {
      let res
      if (uploadType === 'nip96') {
        res = await uploadNIP96({ file, alt, sign, serverUrl })
      } else {
        res = await uploadBlossom({ file, serverUrl, hash, sign, expiration })
      }
      this.onUploadDone(node, res)
      return res
    } catch (error) {
      const msg = error as string
      this.onUploadDone(node, { error: msg })
      return { error: msg }
    }
  }

  async *uploadFiles() {
    const tasks = this.findNodes(false).map(([node, pos]) => {
      return this.upload(node, pos)
    })
    for await (const res of tasks) {
      yield res
    }
  }

  selectFiles() {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = this.options.allowedMimeTypes.join(',')
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files
      if (files) {
        Array.from(files).forEach((file) => {
          if (file) {
            const pos = this.view.state.selection.from + 1
            this.addFile(file, pos)
          }
        })
      }
    }
    input.click()
  }

  handleDrop(event: DragEvent) {
    event.preventDefault()

    const pos = this.view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos

    if (pos === undefined) return false

    const file = event.dataTransfer?.files?.[0]
    if (file) {
      this.addFile(file, pos)
    }
  }
}

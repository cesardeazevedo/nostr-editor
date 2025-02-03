import type { Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { EventTemplate, NostrEvent } from 'nostr-tools/core'
import type { Node } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import { uploadBlossom } from '../uploaders/blossom'
import { uploadNIP96 } from '../uploaders/nip96'
import type { UploadTask } from '../uploaders/types'
import type { ImageAttributes } from './ImageExtension'
import type { VideoAttributes } from './VideoExtension'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileUpload: {
      addFile: (file: File, pos: number) => ReturnType
      selectFiles: () => ReturnType
      uploadFiles: () => ReturnType
      removeBlobs: () => ReturnType
    }
  }
}

type FileAttributes = ImageAttributes | VideoAttributes

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
  onComplete: (currentEditor: Editor, files: FileAttributes[]) => void
}

export interface FileUploadStorage {
  uploader: Uploader | null
  getFiles: () => FileAttributes[]
}

export function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const FileUploadExtension = Extension.create<FileUploadOptions, FileUploadStorage>({
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
      uploadFiles: () => (props) => {
        props.tr.setMeta('uploadFiles', true)
        return true
      },
      removeBlobs: () => (props) => {
        props.state.doc.descendants((node, pos) => {
          if (!(node.type.name === 'image' || node.type.name === 'video')) {
            return
          }
          if (node.attrs.src.startsWith('blob:')) {
            props.state.tr.delete(pos, pos + node.nodeSize)
          }
        })
        return true
      },
    }
  },

  addStorage() {
    return {
      uploader: null,
      getFiles: () => [],
    }
  },

  onBeforeCreate() {
    const uploader = new Uploader(this.editor, this.options)
    this.storage.uploader = uploader
    this.storage.getFiles = () => uploader.getFiles()
  },

  addProseMirrorPlugins() {
    const uploader = this.storage.uploader!
    return [
      new Plugin({
        key: new PluginKey('fileUploadPlugin'),
        state: {
          init: () => {},
          apply: (tr) => {
            setTimeout(async () => {
              if (tr.getMeta('addFile')) {
                const [file, pos] = tr.getMeta('addFile')
                uploader.addFile(file, pos)
                tr.setMeta('addFile', null)
                if (this.options.immediateUpload) {
                  uploader.start()
                }
              } else if (tr.getMeta('selectFiles')) {
                await uploader.selectFiles()
                tr.setMeta('selectFiles', null)
                if (this.options.immediateUpload) {
                  uploader.start()
                }
              } else if (tr.getMeta('uploadFiles')) {
                uploader.start()
                tr.setMeta('uploadFiles', null)
              }
            })
            return tr
          },
        },
        props: {
          handleDrop: (_, event) => {
            uploader.handleDrop(event)
            if (this.options.immediateUpload) {
              uploader.start()
            }
          },
          handlePaste(_, event) {
            return uploader.handlePaste(event)
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

    this.options.onDrop(this.editor, file, pos)

    return true
  }

  getFiles() {
    return this.findNodes().map(([node]) => node.attrs as FileAttributes)
  }

  private findNodes(uploaded?: boolean) {
    const nodes = [] as [Node, number][]
    this.view.state.doc.descendants((node, pos) => {
      if (!(node.type.name === 'image' || node.type.name === 'video')) {
        return
      }
      if (uploaded !== undefined) {
        const isUploaded = !node.attrs.src.startsWith('blob:')
        if (isUploaded !== uploaded) {
          return
        }
      }
      nodes.push([node, pos])
    })
    return nodes
  }

  private updateNodeAttributes(pos: number, attrs: Record<string, unknown>) {
    const { tr } = this.view.state
    Object.entries(attrs).forEach(([key, value]) => value !== undefined && tr.setNodeAttribute(pos, key, value))
    this.view.dispatch(tr)
  }

  private onUploadDone(nodeRef: Node, response: UploadTask) {
    this.findNodes(false).forEach(([node, pos]) => {
      if (node.attrs.src === nodeRef.attrs.src) {
        this.updateNodeAttributes(pos, {
          ...response,
          src: response.url,
          uploading: false,
        })
      }
    })
  }

  private async upload(node: Node, pos: number) {
    const { sign, hash, expiration } = this.options
    const { file, alt, uploadType, uploadUrl: serverUrl } = node.attrs as ImageAttributes | VideoAttributes

    this.updateNodeAttributes(pos, { uploading: true, uploadError: null })

    let res
    try {
      res =
        uploadType === 'nip96'
          ? await uploadNIP96({ file, alt, sign, serverUrl })
          : await uploadBlossom({ file, serverUrl, hash, sign, expiration })
    } catch (error) {
      const msg = error?.toString() as string
      res = { uploadError: msg } as UploadTask
    }

    this.onUploadDone(node, res)
    return res
  }

  async start() {
    this.options.onStart(this.editor)

    const tasks = this.findNodes(false).map(([node, pos]) => {
      return this.upload(node, pos)
    })

    const errors = []

    for await (const res of tasks) {
      if ('uploadError' in res) {
        errors.push(res.uploadError)
        this.options.onUploadError(this.editor, res)
      } else {
        this.options.onUpload(this.editor, res)
      }
    }
    if (errors.length === 0) {
      const files = this.getFiles()
      this.options.onComplete(this.editor, files)
      return files
    }

    throw new Error(errors.join(','))
  }

  selectFiles() {
    return new Promise((resolve) => {
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
        resolve(files)
      }
      input.click()
    })
  }

  handleDrop(event: DragEvent) {
    event.preventDefault()

    const pos = this.view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos

    if (!pos) return
    if (!event.dataTransfer) return

    for (const file of event.dataTransfer.files) {
      this.addFile(file, pos)
    }
  }

  handlePaste(event: ClipboardEvent) {
    const data = event.clipboardData

    if (data) {
      const items = data.items

      let handled = false
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        if (item.kind === 'file' && this.options.allowedMimeTypes.includes(item.type)) {
          const file = item.getAsFile()

          if (file) {
            this.addFile(file, this.view.state.selection.from + 1)
            handled = true
          }
        }
      }

      return handled
    }
  }
}

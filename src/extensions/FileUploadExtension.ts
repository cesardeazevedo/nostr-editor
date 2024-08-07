import { Extension } from '@tiptap/core'
import { Fragment, Slice } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileUpload: {
      selectFile: () => ReturnType
      uploadFile: () => ReturnType
    }
  }
}

export const FileUploadExtension = Extension.create({
  name: 'fileUpload',

  addOptions() {
    return {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'video/webm'],
      endpoint: 'https://nostr.build/api/v2/upload/files',
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
                  src: URL.createObjectURL(file),
                  alt: file.name,
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
      uploadFile: () => () => {
        // TODO
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
                  src: URL.createObjectURL(file),
                  alt: file.name,
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

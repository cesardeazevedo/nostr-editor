import { Extension } from '@tiptap/core'
import { AutoLinkPlugin } from '../plugins/AutoLinkPlugin'

export const AutoLinkExtension = Extension.create({
  name: 'autolink',

  addProseMirrorPlugins() {
    return [new AutoLinkPlugin().plugin]
  },
})

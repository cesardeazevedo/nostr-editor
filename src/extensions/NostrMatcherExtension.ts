import { Extension } from '@tiptap/core'
import { AutoMatcherPlugin } from '../plugins/NostrMatcherPlugin/NostrMatcherPlugin'
import type { IMetaFields } from '../plugins/NostrMatcherPlugin/nip92.imeta'

type Storage = {
  imeta?: IMetaFields
}

export const NostrMatcherExtension = Extension.create<unknown, Storage>({
  name: 'autoMatcher',

  addProseMirrorPlugins() {
    const { imeta, references } = this.editor.storage
    return [new AutoMatcherPlugin(imeta, references).plugin]
  },
})

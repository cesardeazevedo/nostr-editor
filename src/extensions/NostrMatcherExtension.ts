import { Extension } from '@tiptap/core'
import { NostrMatcherPlugin } from '../plugins/NostrMatcherPlugin/NostrMatcherPlugin'
import type { IMetaFields } from '../plugins/NostrMatcherPlugin/nip92.imeta'

type Storage = {
  imeta?: IMetaFields
}

export const NostrMatcherExtension = Extension.create<unknown, Storage>({
  name: 'nostrMatcher',

  addProseMirrorPlugins() {
    const { imeta, references } = this.editor.storage
    return [new NostrMatcherPlugin(imeta, references).plugin]
  },
})

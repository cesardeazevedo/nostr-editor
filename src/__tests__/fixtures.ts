/* eslint-disable no-empty-pattern, */
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { readFile } from 'fs/promises'
import { join } from 'node:path'
import type { NostrEvent } from 'nostr-tools'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { Mock } from 'vitest'
import { test as base } from 'vitest'
import type { FileUploadExtension } from '../extensions/FileUploadExtension'
import { NostrExtension } from '../extensions/NostrExtension'

const extensions = [
  StarterKit.configure({ history: false }),
  NostrExtension.configure({
    fileUpload: {
      async sign(event) {
        return Promise.resolve(event as NostrEvent)
      },
    },
    image: {
      defaultUploadType: 'blossom',
      defaultUploadUrl: 'https://localhost:3000',
    },
  }),
]

type Fixtures = {
  editor: Editor
  editorMarkdown: Editor
  editorUserAbout: Editor
  getFile: (filaneme: string) => Promise<File>
  fileUploadExtension: (editor: Editor) => typeof FileUploadExtension
  fileUploadSpies: (editor: Editor) => {
    spySign: Mock
    spyHash: Mock
    spyDrop: Mock
    spyStart: Mock
    spyUpload: Mock
    spyUploadError: Mock
    spyComplete: Mock
  }
}

// We ideally want to have a single editor instance to parse markdown and user abouts,
// But currently no ideal way to dynamically load extensions
export const test = base.extend<Fixtures>({
  editor: ({}, use) => {
    return use(new Editor({ extensions }))
  },
  editorMarkdown: ({}, use) => {
    return use(
      new Editor({
        extensions: [
          StarterKit.configure({ history: false }),
          NostrExtension,
          MarkdownExtension.configure({ breaks: true }),
        ],
      }),
    )
  },
  editorUserAbout: ({}, use) => {
    return use(
      new Editor({
        extensions: [
          StarterKit.configure({ history: false }),
          NostrExtension.configure({ image: false, video: false }),
        ],
      }),
    )
  },
  getFile: ({}, use) => {
    return use(async (filename: string) => {
      const buffer = await readFile(join(__dirname, filename))
      return new File([buffer], filename, { type: 'image/png' })
    })
  },
  fileUploadExtension: ({}, use) => {
    return use((editor: Editor) => {
      return editor.extensionManager.extensions.find((x) => x.name === 'fileUpload') as typeof FileUploadExtension
    })
  },
  fileUploadSpies: ({ fileUploadExtension }, use) => {
    return use((editor: Editor) => {
      const fileUpload = fileUploadExtension(editor)

      const spySign = vitest.fn()
      const spyHash = vitest.fn()
      const spyDrop = vitest.fn()
      const spyStart = vitest.fn()
      const spyUpload = vitest.fn()
      const spyUploadError = vitest.fn()
      const spyComplete = vitest.fn()

      fileUpload.options.sign = spySign
      fileUpload.options.hash = spyHash
      fileUpload.options.onDrop = spyDrop
      fileUpload.options.onStart = spyStart
      fileUpload.options.onUpload = spyUpload
      fileUpload.options.onUploadError = spyUploadError
      fileUpload.options.onComplete = spyComplete

      return {
        spySign,
        spyHash,
        spyDrop,
        spyStart,
        spyUpload,
        spyUploadError,
        spyComplete,
      }
    })
  },
})

/* eslint-disable no-empty-pattern, */
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { readFile } from 'fs/promises'
import { join } from 'node:path'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { Mock } from 'vitest'
import { test as base } from 'vitest'
import type { FileUploadExtension } from '../extensions/FileUploadExtension'
import { NostrExtension } from '../extensions/NostrExtension'
import { getFakeTask } from './testUtils'

const extensions = [
  StarterKit.configure({ history: false }),
  NostrExtension.configure({
    fileUpload: {
      async upload(attrs) {
        return getFakeTask(attrs.file)
      },
    },
  }),
]

type TEST_FILE_NAMES = 'test_upload.png' | 'test_upload2.png' | 'test_upload_error.png'

type Fixtures = {
  editor: Editor
  editorMarkdown: Editor
  editorUserAbout: Editor
  getFile: (filaneme: TEST_FILE_NAMES) => Promise<File>
  fileUploadExtension: (editor: Editor) => typeof FileUploadExtension
  fileUploadSpies: (editor: Editor) => {
    spyOnDrop: Mock
    spyOnStart: Mock
    spyOnUpload: Mock
    spyOnUploadError: Mock
    spyOnComplete: Mock
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
    return use(async (filename: TEST_FILE_NAMES) => {
      const buffer = await readFile(join(__dirname, 'test_files', filename))
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

      const spyOnDrop = vitest.fn()
      const spyOnStart = vitest.fn()
      const spyOnUpload = vitest.fn()
      const spyOnUploadError = vitest.fn()
      const spyOnComplete = vitest.fn()

      fileUpload.options.onDrop = spyOnDrop
      fileUpload.options.onStart = spyOnStart
      fileUpload.options.onUpload = spyOnUpload
      fileUpload.options.onUploadError = spyOnUploadError
      fileUpload.options.onComplete = spyOnComplete

      return {
        spyOnDrop,
        spyOnStart,
        spyOnUpload,
        spyOnUploadError,
        spyOnComplete,
      }
    })
  },
})

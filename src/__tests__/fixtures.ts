/* eslint-disable no-empty-pattern, */
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { readFile } from 'fs/promises'
import { join } from 'node:path'
import type { NostrEvent } from 'nostr-tools'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { test as base } from 'vitest'
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

const editor = new Editor({ extensions })

type Fixtures = {
  editor: typeof editor
  editorMarkdown: Editor
  editorUserAbout: Editor
  getFile: (filaneme: string) => Promise<File>
}

// We ideally want to have a single editor instance to parse markdown and user abouts,
// But currently no ideal way to dynamically load extensions
export const test = base.extend<Fixtures>({
  editor: ({}, use) => {
    return use(editor)
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
      return new File([buffer], 'image.jpg', { type: 'image/jpeg' })
    })
  },
})

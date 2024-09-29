/* eslint-disable no-empty-pattern, */
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { test as base } from 'vitest'
import { NostrExtension } from '../extensions/NostrExtension'

const extensions = [StarterKit.configure({ history: false }), NostrExtension]

const editor = new Editor({ extensions })

type Fixtures = {
  editor: typeof editor
  editorMarkdown: Editor
  editorUserAbout: Editor
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
})

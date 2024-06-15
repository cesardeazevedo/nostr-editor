import { getSchema, type Extensions } from '@tiptap/core'
import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import { DOMParser } from '@tiptap/pm/model'
import StarterKit from '@tiptap/starter-kit'
import markdownIt from 'markdown-it'
import type { NostrEvent } from 'nostr-tools'
import { EditorState } from 'prosemirror-state'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import {
  AutoMatcherExtension,
  LinkExtension,
  MentionExtension,
  NoteExtension,
  TagExtension,
  TweetExtension,
  VideoExtension,
} from '.'
import { AutoMatcherPlugin } from './plugins/NostrMatcherPlugin/NostrMatcherPlugin'
import { parseReferences, type NostrReference } from './plugins/NostrMatcherPlugin/nip27.references'
import { IMetaTags, parseImeta } from './plugins/NostrMatcherPlugin/nip92.imeta'
import type { ContentSchema } from './types'

const extensions: Extensions = [
  StarterKit.configure({ history: false }),
  TagExtension,
  LinkExtension,
  NoteExtension,
  ImageExtension,
  VideoExtension,
  TweetExtension,
  YoutubeExtension,
  MentionExtension,
  AutoMatcherExtension,
]

const schema = getSchema(extensions)
const schemaMarkdown = getSchema([...extensions, MarkdownExtension])
const domParser = DOMParser.fromSchema(schemaMarkdown)
const plugins = [new AutoMatcherPlugin().plugin]

const editor = EditorState.create({ schema, plugins })
const editorMarkdown = EditorState.create({ schema: schemaMarkdown, plugins })

const md = markdownIt()

export function parseNoteContent(event: NostrEvent, references?: NostrReference[], imeta?: IMetaTags) {
  return event.kind === 30023
    ? parseMarkdownContent(event, references, imeta)
    : parseTextContent(event, references, imeta)
}

export function parseTextContent(event: NostrEvent, references?: NostrReference[], imeta?: IMetaTags) {
  const { tr } = editor
  const newState = tr
    .insertText(event.content.replace(/\n+/g, '<br />'))
    .setMeta('imeta', imeta || parseImeta(event.tags))
    .setMeta('references', references || parseReferences(event))
  return editor.apply(newState).toJSON().doc as ContentSchema
}

export function parseMarkdownContent(event: NostrEvent, references?: NostrReference[], imeta?: IMetaTags) {
  const html = md.render(event.content)
  // const node = new JSDOM(html)
  const node = new window.DOMParser().parseFromString(html, 'text/html')
  const result = domParser.parse(node)

  const { tr } = editorMarkdown

  const newState = tr
    .replaceWith(0, tr.doc.content.size, result)
    .setMeta('imeta', imeta || parseImeta(event.tags))
    .setMeta('references', references || parseReferences(event))

  return editorMarkdown.apply(newState).toJSON().doc as ContentSchema
}

export function parseUserAbout(about: string) {
  const tr = editor.tr.insertText(about)
  tr.setMeta('imeta', null)
  tr.setMeta('references', null)
  return editor.apply(tr).toJSON().doc as ContentSchema
}

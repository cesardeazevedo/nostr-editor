import markdownIt from 'markdown-it'
import { type NostrEvent } from 'nostr-tools'
import { DOMParser } from 'prosemirror-model'
import type { EditorState } from 'prosemirror-state'
import { parseReferences, type NostrReference } from './plugins/NostrMatcherPlugin/nip27.references'
import type { IMetaTags } from './plugins/NostrMatcherPlugin/nip92.imeta'
import { parseImeta } from './plugins/NostrMatcherPlugin/nip92.imeta'

const md = markdownIt()

export function parseNoteContent(
  editor: EditorState,
  event: NostrEvent,
  references?: NostrReference[],
  imeta?: IMetaTags,
) {
  return event.kind === 30023
    ? parseMarkdownContent(editor, event, references, imeta)
    : parseTextContent(editor, event, references, imeta)
}

export function parseTextContent(
  editor: EditorState,
  event: NostrEvent,
  references?: NostrReference[],
  imeta?: IMetaTags,
) {
  const { tr } = editor
  const changes = tr
    .insertText(event.content.replace(/\n+/g, '<br />'))
    .setMeta('imeta', imeta || parseImeta(event.tags))
    .setMeta('references', references || parseReferences(event))
  return editor.apply(changes)
}

export function parseMarkdownContent(
  editor: EditorState,
  event: NostrEvent,
  references?: NostrReference[],
  imeta?: IMetaTags,
) {
  const html = md.render(event.content)
  const node = new window.DOMParser().parseFromString(html, 'text/html')
  const domParser = DOMParser.fromSchema(editor.schema)
  const result = domParser.parse(node)

  const { tr } = editor

  const newState = tr
    .replaceWith(0, tr.doc.content.size, result)
    .setMeta('imeta', imeta || parseImeta(event.tags))
    .setMeta('references', references || parseReferences(event))

  return editor.apply(newState)
}

export function parseUserAbout(editor: EditorState, about: string) {
  const tr = editor.tr.insertText(about)
  tr.setMeta('imeta', null)
  tr.setMeta('references', null)
  return editor.apply(tr)
}

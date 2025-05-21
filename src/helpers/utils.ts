import type { EditorView } from 'prosemirror-view'
import type { Slice } from 'prosemirror-model'
import type { PasteRuleMatch } from '@tiptap/core'
import type { IMetaTags } from './nip92.imeta'

export const createPasteRuleMatch = <T extends Record<string, unknown>>(
  match: RegExpMatchArray,
  data: T,
): PasteRuleMatch => ({ index: match.index!, replaceWith: match[2], text: match[0], match, data })

export function parseRelayAttribute(element: HTMLElement) {
  const relays = element.getAttribute('relays') || []
  return typeof relays === 'string' ? relays.split(',') : relays
}

export type LinkKinds = 'text' | 'image' | 'video' | 'tweet' | 'youtube'

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|gif|png|bmp|svg|webp)$/
const VIDEO_EXTENSIONS = /\.(webm|mp4|ogg|mov)$/
const YOUTUBE_EMBED =
  /^(?:(?:https?:)?\/\/)?(?:(?:(?:www|m(?:usic)?)\.)?youtu(?:\.be|be\.com)\/(?:shorts\/|live\/|v\/|e(?:mbed)?\/|watch(?:\/|\?(?:\S+=\S+&)*v=)|oembed\?url=https?%3A\/\/(?:www|m(?:usic)?)\.youtube\.com\/watch\?(?:\S+=\S+&)*v%3D|attribution_link\?(?:\S+=\S+&)*u=(?:\/|%2F)watch(?:\?|%3F)v(?:=|%3D))?|www\.youtube-nocookie\.com\/embed\/)([\w-]{1})[?&#]?\S*$/
const TWITTER_EMBED = /^https?:\/\/(twitter|x)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/

export function getLinkKind(url: string, imeta?: IMetaTags): LinkKinds {
  const mimetype = imeta?.[url]?.m?.split?.('/')?.[0]
  if (mimetype === 'image') {
    return 'image'
  } else if (mimetype === 'video') {
    return 'video'
  } else if (YOUTUBE_EMBED.test(url)) {
    return 'youtube'
  } else if (TWITTER_EMBED.test(url)) {
    return 'tweet'
  } else {
    try {
      const { pathname } = new URL(url)
      return IMAGE_EXTENSIONS.test(pathname) ? 'image' : VIDEO_EXTENSIONS.test(pathname) ? 'video' : 'text'
    } catch (error) {
      console.log('url parser error', error)
      return 'text'
    }
  }
}

export function replaceTextContent(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(\n|\r)+/g, '<br />')
}

/**
 * Override default paste behavior to avoid stripping new lines
 * From: https://stackoverflow.com/q/79019919/1467342
 */
function handlePaste(view: EditorView, event: ClipboardEvent) {
  // Prevent the default paste behavior
  event.preventDefault()

  // Get plain text from clipboard
  const text = event.clipboardData?.getData('text/plain')

  if (text) {
    // Split text by newlines
    const lines = text.split(/\n/)

    // Insert each line with proper paragraph formatting
    const tr = view.state.tr

    lines.forEach((line, index) => {
      // Insert line
      tr.insertText(line)

      // Add newline between paragraphs (except for last line)
      if (index < lines.length - 1) {
        tr.split(tr.selection.from)
      }
    })

    view.dispatch(tr.scrollIntoView().setMeta('paste', true).setMeta('uiEvent', 'paste'))
  }

  return true
}

/**
 * Override default clipboard serialization behavior to avoid doubling new lines
 */
function clipboardTextSerializer(slice: Slice) {
  let result = ''
  slice.content.descendants((node, _pos, parent) => {
    result += node.type.spec.toText?.({ node, parent }) || node.text || ''

    if (node.type.name === 'paragraph') {
      result += '\n'
    }
  })

  return result.trim()
}

export const editorProps = {
  handlePaste,
  clipboardTextSerializer,
}

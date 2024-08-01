import YoutubeExtension from '@tiptap/extension-youtube'
import StarterKit from '@tiptap/starter-kit'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { ImageExtension } from './ImageExtension'
import { LinkExtension } from './LinkExtension'
import { NAddrExtension } from './NAddressExtension'
import { NEventExtension } from './NEventExtension'
import { NProfileExtension } from './NProfileExtension'
import { TagExtension } from './TagExtension'
import { TweetExtension } from './TweetExtension'
import { VideoExtension } from './VideoExtension'
import { NostrParserExtension } from '../../../extensions/NostrParserExtension'

export function getExtensions() {
  return [
    StarterKit.configure({ history: false }),
    NostrParserExtension,
    TagExtension,
    LinkExtension,
    NEventExtension,
    NAddrExtension,
    NProfileExtension,
    TweetExtension,
    ImageExtension,
    VideoExtension.extend({ renderText: (p) => p.node.attrs.src }),
    YoutubeExtension.extend({ renderText: (p) => p.node.attrs.src }),
  ]
}

export function getExtensionsMarkdown() {
  return [...getExtensions(), MarkdownExtension]
}

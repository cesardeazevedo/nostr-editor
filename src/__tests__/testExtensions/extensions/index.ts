import YoutubeExtension from '@tiptap/extension-youtube'
import StarterKit from '@tiptap/starter-kit'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { NostrMatcherExtension } from '../../../extensions/NostrMatcherExtension'
import { ImageExtension } from './ImageExtension'
import { LinkExtension } from './LinkExtension'
import { NAddrExtension } from './NAddressExtension'
import { NEventExtension } from './NEventExtension'
import { NProfileExtension } from './NProfileExtension'
import { TagExtension } from './TagExtension'
import { TweetExtension } from './TweetExtension'
import { VideoExtension } from './VideoExtension'

export function getExtensions() {
  return [
    StarterKit.configure({ history: false }),
    NostrMatcherExtension,
    TagExtension,
    LinkExtension,
    NEventExtension,
    NAddrExtension,
    TweetExtension,
    ImageExtension,
    VideoExtension.extend({ renderText: (p) => p.node.attrs.src }),
    YoutubeExtension.extend({ renderText: (p) => p.node.attrs.src }),
    NProfileExtension,
  ]
}

export function getExtensionsMarkdown() {
  return [...getExtensions(), MarkdownExtension]
}

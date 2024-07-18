import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import StarterKit from '@tiptap/starter-kit'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'

import { NostrMatcherExtension } from '../../../extensions/NostrMatcherExtension'
import { LinkExtension } from './LinkExtension'
import { NEventExtension } from './NEventExtension'
import { NProfileExtension } from './NProfileExtension'
import { TagExtension } from './TagExtension'
import { TweetExtension } from './TweetExtension'
import { VideoExtension } from './VideoExtension'
import { NAddrExtension } from './NAddressExtension'

export function getExtensions() {
  return [
    StarterKit.configure({ history: false }),
    NostrMatcherExtension,
    TagExtension,
    LinkExtension,
    NEventExtension,
    NAddrExtension,
    ImageExtension,
    VideoExtension,
    TweetExtension,
    YoutubeExtension,
    NProfileExtension,
  ]
}

export function getExtensionsMarkdown() {
  return [...getExtensions(), MarkdownExtension]
}

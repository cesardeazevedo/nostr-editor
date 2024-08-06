import type { ImageOptions } from '@tiptap/extension-image'
import type { StarterKitOptions } from '@tiptap/starter-kit'
import type { LinkAttributes } from './extensions/LinkExtension'
import type { NAddrAttributes } from './extensions/NAddrExtension'
import type { NEventAttributes } from './extensions/NEventExtension'
import type { NProfileAttributes } from './extensions/NProfileExtension'
import type { TagAttributes } from './extensions/TagExtension'
import type { TweetAttributes } from './extensions/TweetExtension'
import type { VideoAttributes } from './extensions/VideoExtension'

type Extensions<T extends keyof StarterKitOptions> = T

export type ParagraphNode = {
  type: Extensions<'paragraph'>
  content?: Node[]
}

export type TextNode = {
  type: Extensions<'text'>
  marks?: Mark[]
  text: string
}

type HardBreak = {
  type: Extensions<'hardBreak'>
}

type HorizontalRule = {
  type: Extensions<'horizontalRule'>
}

type TagMark = {
  type: 'tag'
  attrs: TagAttributes
}

type LinkMark = {
  type: 'link'
  attrs: LinkAttributes
}

type CodeMark = {
  type: 'code'
}

type ItalicMark = {
  type: 'italic'
}

type BoldMark = {
  type: 'bold'
}

type StrikeMark = {
  type: 'strike'
}

type NProfileNode = {
  type: 'nprofile'
  attrs: NProfileAttributes
}

type NEventNode = {
  type: 'nevent'
  attrs: NEventAttributes
}

type NAddrNode = {
  type: 'naddr'
  attrs: NAddrAttributes
}

type ImageNode = {
  type: 'image'
  attrs: ImageOptions['HTMLAttributes']
}

type VideoNode = {
  type: 'video'
  attrs: VideoAttributes
}

export type HeadingNode = {
  type: Extensions<'heading'>
  content: Node[]
  attrs: {
    level: number
  }
}

type ListItemNode = {
  type: Extensions<'listItem'>
  content: Node[]
  attrs: {
    closed: boolean
    nested: boolean
  }
}

export type BulletListNode = {
  type: Extensions<'bulletList'>
  content: ListItemNode[]
}

export type OrderedListNode = {
  type: Extensions<'orderedList'>
  content: ListItemNode[]
}

export type CodeBlockNode = {
  type: Extensions<'codeBlock'>
  content: Node[]
  attrs: {
    language: string
  }
}

export type BlockQuoteNode = {
  type: Extensions<'blockquote'>
  content: Node[]
}

type TweetNode = {
  type: 'tweet'
  attrs: TweetAttributes
}

type YoutubeNode = {
  type: 'youtube'
  attrs: {
    src: string
    width?: number
    height?: number
    start?: number
  }
}

export type Mark = TagMark | LinkMark | CodeMark | ItalicMark | BoldMark | StrikeMark

export type Node =
  | ParagraphNode
  | TextNode
  | HardBreak
  | HorizontalRule
  | NProfileNode
  | NEventNode
  | NAddrNode
  | ImageNode
  | VideoNode
  | HeadingNode
  | CodeBlockNode
  | BulletListNode
  | OrderedListNode
  | BlockQuoteNode
  | TweetNode
  | YoutubeNode

export type ContentSchema = {
  type: 'doc'
  content: Node[]
}

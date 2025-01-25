import type { ImageOptions } from '@tiptap/extension-image'
import type { StarterKitOptions } from '@tiptap/starter-kit'
import type { Bolt11Attributes } from './extensions/Bolt11Extension'
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

export const isParagraphNode = (node: Node): node is ParagraphNode => node.type === 'paragraph'

export type TextNode = {
  type: Extensions<'text'>
  marks?: Mark[]
  text: string
}

export const isTextNode = (node: Node): node is TextNode => node.type === 'text'

export type HardBreak = {
  type: Extensions<'hardBreak'>
}

export const isHardBreak = (node: Node): node is HardBreak => node.type === 'hardBreak'

export type HorizontalRule = {
  type: Extensions<'horizontalRule'>
}

export const isHorizontalRule = (node: Node): node is HorizontalRule => node.type === 'horizontalRule'

export type TagMark = {
  type: 'tag'
  attrs: TagAttributes
}

export const isTagMark = (mark: Mark): mark is TagMark => mark.type === 'tag'

export type LinkMark = {
  type: 'link'
  attrs: LinkAttributes
}

export const isLinkMark = (mark: Mark): mark is LinkMark => mark.type === 'link'

export type CodeMark = {
  type: 'code'
}

export const isCodeMark = (mark: Mark): mark is CodeMark => mark.type === 'code'

export type ItalicMark = {
  type: 'italic'
}

export const isItalicMark = (mark: Mark): mark is ItalicMark => mark.type === 'italic'

export type BoldMark = {
  type: 'bold'
}

export const isBoldMark = (mark: Mark): mark is BoldMark => mark.type === 'bold'

export type StrikeMark = {
  type: 'strike'
}

export const isStrikeMark = (mark: Mark): mark is StrikeMark => mark.type === 'strike'

export type NProfileNode = {
  type: 'nprofile'
  attrs: NProfileAttributes
}

export const isNProfileNode = (node: Node): node is NProfileNode => node.type === 'nprofile'

export type NEventNode = {
  type: 'nevent'
  attrs: NEventAttributes
}

export const isNEventNode = (node: Node): node is NEventNode => node.type === 'nevent'

export type NAddrNode = {
  type: 'naddr'
  attrs: NAddrAttributes
}

export const isNAddrNode = (node: Node): node is NAddrNode => node.type === 'naddr'

export type ImageNode = {
  type: 'image'
  attrs: ImageOptions['HTMLAttributes']
}

export const isImageNode = (node: Node): node is ImageNode => node.type === 'image'

export type VideoNode = {
  type: 'video'
  attrs: VideoAttributes
}

export const isVideoNode = (node: Node): node is VideoNode => node.type === 'video'

export type Bolt11Node = {
  type: 'bolt11'
  attrs: Bolt11Attributes
}

export const isBolt11Node = (node: Node): node is Bolt11Node => node.type === 'bolt11'

export type HeadingNode = {
  type: Extensions<'heading'>
  content: Node[]
  attrs: {
    level: number
  }
}

export const isHeadingNode = (node: Node): node is HeadingNode => node.type === 'heading'

export type ListItemNode = {
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

export const isBulletListNode = (node: Node): node is BulletListNode => node.type === 'bulletList'

export type OrderedListNode = {
  type: Extensions<'orderedList'>
  content: ListItemNode[]
}

export const isOrderedListNode = (node: Node): node is OrderedListNode => node.type === 'orderedList'

export type CodeBlockNode = {
  type: Extensions<'codeBlock'>
  content: Node[]
  attrs: {
    language: string
  }
}

export const isCodeBlockNode = (node: Node): node is CodeBlockNode => node.type === 'codeBlock'

export type BlockQuoteNode = {
  type: Extensions<'blockquote'>
  content: Node[]
}

export const isBlockQuoteNode = (node: Node): node is BlockQuoteNode => node.type === 'blockquote'

type TweetNode = {
  type: 'tweet'
  attrs: TweetAttributes
}

export const isTweetNode = (node: Node): node is TweetNode => node.type === 'tweet'

type YoutubeNode = {
  type: 'youtube'
  attrs: {
    src: string
    width?: number
    height?: number
    start?: number
  }
}

export const isYoutubeNode = (node: Node): node is YoutubeNode => node.type === 'youtube'

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
  | Bolt11Node

export type ContentSchema = {
  type: 'doc'
  content: Node[]
}

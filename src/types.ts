import type { ImageOptions } from '@tiptap/extension-image'
import type { StarterKitOptions } from '@tiptap/starter-kit'

// Attributes
export type LinkAttributes = {
  href: string
}

export type NProfileExtensionAttributes = {
  id: string
  pubkey: string
}

export interface NEventExtensionAttributes {
  id: string
  kind: number
  author: string
  relays: string[]
}

export interface TagAttributes {
  tag: string
}

export interface VideoExtensionAttributes {
  src: string
}

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
  attrs: NProfileExtensionAttributes
}

type NEventNode = {
  type: 'nevent'
  attrs: NEventExtensionAttributes
}

type ImageNode = {
  type: 'image'
  attrs: ImageOptions['HTMLAttributes']
}

type VideoNode = {
  type: 'video'
  attrs: VideoExtensionAttributes
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
  attrs: {
    src: string
  }
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
  | NProfileNode
  | NEventNode
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

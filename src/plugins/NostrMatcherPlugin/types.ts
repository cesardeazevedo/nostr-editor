import type { Range } from '@tiptap/core'
import type { Node } from 'prosemirror-model'

export interface MatchBase extends Range {
  text: string
}

export interface GetMarkRange {
  from: number
  to: number
  text: string
}

export interface NodeWithPosition {
  node: Node
  pos: number
}

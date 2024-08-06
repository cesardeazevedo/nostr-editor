import type { NodeViewRendererProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { Tweet } from './Tweet'

export function TweetEditor(props: NodeViewRendererProps) {
  const { src } = props.node.attrs
  return (
    <NodeViewWrapper data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <Tweet src={src} />
    </NodeViewWrapper>
  )
}

import type { NodeViewRendererProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { Tweet as ReactTweet } from 'react-tweet'

export function Tweet(props: NodeViewRendererProps) {
  const { src } = props.node.attrs
  const id = src.slice(src.lastIndexOf('/') + 1)
  return (
    <NodeViewWrapper data-drag-handle="" draggable={props.node.type.spec.draggable}>
      <ReactTweet id={id} />
    </NodeViewWrapper>
  )
}

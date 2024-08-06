import type { NodeViewRendererProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { Video } from './Video'

export function VideoEditor(props: NodeViewRendererProps) {
  return (
    <NodeViewWrapper data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <Video src={props.node.attrs.src} />
    </NodeViewWrapper>
  )
}

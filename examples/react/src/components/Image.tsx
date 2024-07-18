import type { NodeViewRendererProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'

export function Image(props: NodeViewRendererProps) {
  const { src } = props.node.attrs
  return (
    <>
      <NodeViewWrapper>
        <img src={src} />
      </NodeViewWrapper>
    </>
  )
}

import type { NodeViewRendererProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { useMemo } from 'react'

export function Video(props: NodeViewRendererProps) {
  const { src } = props.node.attrs
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  return (
    <>
      <NodeViewWrapper>
        <video src={src} controls style={{ maxHeight: 400 }}>
          <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
        </video>
      </NodeViewWrapper>
    </>
  )
}

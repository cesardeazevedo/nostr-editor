import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NAddrAttributes } from 'nostr-editor'
import { NAddr } from './NAddr'

export function NAddrEditor(props: NodeViewProps) {
  return (
    <NodeViewWrapper data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <div className={`select-none rounded-md ${props.selected ? 'bg-blue-100' : ''}`}>
        <NAddr {...(props.node.attrs as NAddrAttributes)} />
      </div>
    </NodeViewWrapper>
  )
}

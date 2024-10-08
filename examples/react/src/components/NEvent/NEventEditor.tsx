import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import type { NEventAttributes } from 'nostr-editor'
import { NEvent } from './Nevent'
import { DeleteButton } from '../DeleteButton'

export function NEventEditor(props: NodeViewProps) {
  const args = props.node.attrs as NEventAttributes

  return (
    <NodeViewWrapper as='div' data-nevent={args.nevent} data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <div className={`relative select-none w-10/12 rounded-xl ${props.selected ? 'bg-blue-100' : ''}`}>
        <NEvent {...args} />
        <DeleteButton onClick={() => props.deleteNode()} />
      </div>
    </NodeViewWrapper>
  )
}

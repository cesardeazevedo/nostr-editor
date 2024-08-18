import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { DeleteButton } from '../DeleteButton'
import { Youtube } from './Youtube'

export function YoutubeEditor(props: NodeViewProps) {
  const args = props.node.attrs as { src: string }

  return (
    <NodeViewWrapper as='div' data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <div className={`relative select-none w-10/12 rounded-xl ${props.selected ? 'bg-blue-100' : ''}`}>
        <DeleteButton onClick={() => props.deleteNode()} />
        <Youtube {...args} />
      </div>
    </NodeViewWrapper>
  )
}

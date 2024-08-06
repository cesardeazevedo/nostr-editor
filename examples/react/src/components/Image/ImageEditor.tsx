import { IconX } from '@tabler/icons-react'
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { Image } from './Image'

export function ImageEditor(props: NodeViewProps) {
  const { src } = props.node.attrs
  return (
    <NodeViewWrapper
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      className={`relative ${props.selected ? 'opacity-80' : ''}`}>
      {props.selected && (
        <button
          className='absolute right-2 top-2 rounded-full border border-solid border-gray-900'
          onClick={() => props.deleteNode()}>
          <IconX strokeWidth='1.5' />
        </button>
      )}
      <Image src={src} />
    </NodeViewWrapper>
  )
}

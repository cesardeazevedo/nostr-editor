import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import type { NEventAttributes } from 'nostr-editor'
import { NEvent } from './Nevent'
import { IconX } from '@tabler/icons-react'

export function NEventEditor(props: NodeViewProps) {
  const args = props.node.attrs as NEventAttributes

  return (
    <NodeViewWrapper as='div' data-nevent={args.nevent} data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <div className={`relative select-none w-10/12 rounded-xl ${props.selected ? 'bg-blue-100' : ''}`}>
        <NEvent {...args} />
        <div className='absolute right-2 top-2 opacity-40 text-xs'>
          {props.selected && <div className='absolute right-10 top-1 opacity-40 text-xs'>selected</div>}
          <button className='rounded-full z-10 border border-solid border-gray-900' onClick={() => props.deleteNode()}>
            <IconX strokeWidth='1.5' />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

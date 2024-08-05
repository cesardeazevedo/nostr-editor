import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { useMention, useProfileParsed } from '../hooks/useMention'

export function NAddr(props: NodeViewProps) {
  const { pubkey, identifier } = props.node.attrs
  const mention = useMention(pubkey)
  const profile = useProfileParsed(mention)
  return (
    <NodeViewWrapper data-drag-handle="" draggable={props.node.type.spec.draggable}>
      <div className={`select-none border rounded-md p-2 pt-4 my-2 ${props.selected ? 'bg-blue-100' : ''}`}>
        <div className='flex flex-row'>
          <img src={profile?.picture} className='size-8 rounded-full' />
          <span className='ml-4'>{profile?.display_name || profile?.name}</span>
        </div>
        <div className='border rounded-md p-2 mt-2'>
          <h6>{identifier}</h6>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

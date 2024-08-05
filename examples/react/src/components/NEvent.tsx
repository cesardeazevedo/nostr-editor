import { IconX } from '@tabler/icons-react'
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { DateTime } from 'luxon'
import type { NostrEvent } from 'nostr-tools/core'
import { useEffect, useMemo, useState } from 'react'
import { useMention, useProfileParsed } from '../hooks/useMention'
import { pool } from '../nostr'

export function NEvent(props: NodeViewProps) {
  const { id, relays, author, nevent } = props.node.attrs
  const [event, setEvent] = useState<NostrEvent>()

  const user = useMention(author, relays)
  const profile = useProfileParsed(user)

  useEffect(() => {
    const subscription = pool.subscribeMany(relays, [{ ids: [id] }], {
      onevent(event) {
        setEvent(event)
      },
    })
    return () => subscription.close()
  }, [id, author, relays])

  const name = profile?.display_name || profile?.name || ''
  const picture = profile?.picture

  const shortDate = useMemo(() => {
    return user ? DateTime.fromSeconds(user.created_at).toRelative({ style: 'narrow' })?.replace('ago', '') : null
  }, [user])

  return (
    <NodeViewWrapper as='div' data-nevent={nevent} data-drag-handle="" draggable={props.node.type.spec.draggable}>
      <div
        className={`select-none relative px-6 py-4 my-2 border rounded-xl w-10/12 ${props.selected ? 'bg-blue-100' : ''}`}>
        <div className='absolute right-2 opacity-40 text-xs'>
          {props.selected && <div className='absolute right-10 top-1 opacity-40 text-xs'>selected</div>}
          <button className='rounded-full border border-solid border-gray-900' onClick={() => props.deleteNode()}>
            <IconX strokeWidth='1.5' />
          </button>
        </div>
        {!event && 'Loading'}
        {event && (
          <>
            <div className='flex flex-row items-center py-2'>
              <img className='w-8 rounded-full mr-4' src={picture} />
              <div>{name}</div>
              <div className='text-xs text-gray-500 ml-2'>{shortDate}</div>
            </div>
            {event?.content}
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}

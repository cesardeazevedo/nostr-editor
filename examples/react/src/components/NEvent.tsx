import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { DateTime } from 'luxon'
import type { NostrEvent } from 'nostr-tools/core'
import { useEffect, useMemo, useState } from 'react'
import { useMention, useProfileParsed } from '../hooks/useMention'
import { pool } from '../nostr'

export function NEvent(props: NodeViewProps) {
  const { id, relays, author } = props.node.attrs
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
    <NodeViewWrapper>
      <div className='px-6 py-4 my-2 border rounded-xl w-2/4'>
        {!(event && user) && 'Loading'}
        {event && user && (
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

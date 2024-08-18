import { Editor } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import { DateTime } from 'luxon'
import type { ContentSchema } from 'nostr-editor'
import { NostrExtension, type NEventAttributes } from 'nostr-editor'
import type { NostrEvent } from 'nostr-tools'
import { useEffect, useMemo, useState } from 'react'
import { Markdown } from 'tiptap-markdown'
import { useMention, useProfileParsed } from '../../hooks/useMention'
import { pool } from '../../nostr'
import { Content } from '../Content'

type Props = NEventAttributes

export function NEvent(props: Props) {
  const { id, relays, author } = props
  const [event, setEvent] = useState<NostrEvent>()

  const user = useMention(author, relays)
  const profile = useProfileParsed(user)

  useEffect(() => {
    const subscription = pool.subscribeMany([...relays, 'wss://relay.damus.io'], [{ ids: [id] }], {
      onevent(event) {
        setEvent(event)
      },
    })
    return () => subscription.close()
  }, [id, author, relays])

  const parsed = useMemo(() => {
    if (event?.content) {
      const extensions =
        event.kind === 30023
          ? [StarterKit, Markdown, NostrExtension]
          : [Document, Paragraph, Text, HardBreak, NostrExtension]
      const editor = new Editor({ extensions })
      editor.commands.setEventContent(event)
      return editor.getJSON() as ContentSchema
    }
  }, [event?.content])

  const name = profile?.display_name || profile?.name || ''
  const picture = profile?.picture

  const shortDate = useMemo(() => {
    return user ? DateTime.fromSeconds(user.created_at).toRelative({ style: 'narrow' })?.replace('ago', '') : null
  }, [user])

  return (
    <div className='relative px-4 py-4 my-2 border rounded-xl w-full l'>
      {!event && 'Loading'}
      {event && (
        <>
          <div className='flex flex-row items-center py-2'>
            <img className='w-8 rounded-full mr-4' src={picture} />
            <div>{name}</div>
            <div className='text-xs text-gray-500 ml-2'>{shortDate}</div>
          </div>
          {parsed && <Content schema={parsed} />}
        </>
      )}
    </div>
  )
}

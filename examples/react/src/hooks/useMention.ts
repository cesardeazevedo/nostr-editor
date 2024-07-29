import type { NostrEvent } from 'nostr-tools/core'
import { useEffect, useMemo, useState } from 'react'
import { pool } from '../nostr'

export function useMention(pubkey: string, relays: string[] = []) {
  const [user, setUser] = useState<NostrEvent>()

  const createdAt = user?.created_at || 0

  useEffect(() => {
    if (pubkey) {
      const subscription = pool.subscribeMany([...relays, 'wss://purplepag.es'], [{ kinds: [0], authors: [pubkey] }], {
        onevent(event) {
          if (event.created_at >= createdAt) {
            setUser(event)
          }
        },
      })
      return () => subscription.close()
    }
  }, [pubkey, relays, createdAt])

  return user
}

type ProfileParsed = {
  display_name?: string
  name?: string
  picture?: string
}

export function useProfileParsed(event?: NostrEvent): ProfileParsed | undefined {
  return useMemo(() => {
    if (event) {
      return JSON.parse(event.content || '{}') || {}
    }
  }, [event])
}

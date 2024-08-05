import { useEffect, useState } from 'react'
import { useThrottle } from '@uidotdev/usehooks'
import type { NostrEvent } from 'nostr-tools'
import { pool } from '../nostr'

export function useSearch(search: string) {
  const [items, setItems] = useState<NostrEvent[]>([])
  const value = useThrottle(search, 500)

  useEffect(() => {
    if (value) {
      setItems([])
      const sub = pool.subscribeMany(['wss://relay.nostr.band'], [{ kinds: [0], search: value }], {
        onevent: (event: NostrEvent) => {
          setItems((prev) => [...prev, event])
        },
      })
      return () => sub.close()
    }
  }, [value])

  return items
}

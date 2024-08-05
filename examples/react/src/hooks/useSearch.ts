import { useEffect, useState } from 'react'
import { pool } from '../nostr'
import type { NostrEvent } from 'nostr-tools'

export function useSearch(search: string) {
  const [items, setItems] = useState<NostrEvent[]>([])

  useEffect(() => {
    if (search) {
      setItems([])
      const sub = pool.subscribeMany(['wss://relay.nostr.band'], [{ kinds: [0], search }], {
        onevent: (event: NostrEvent) => {
          setItems((prev) => [...prev, event])
        },
      })
      return () => sub.close()
    }
  }, [search])

  return items
}

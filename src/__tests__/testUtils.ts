import type { NostrEvent } from 'nostr-tools'
import { finalizeEvent, generateSecretKey } from 'nostr-tools'

export function fakeNote(data?: Partial<NostrEvent>): NostrEvent {
  return finalizeEvent(
    {
      kind: data?.kind ?? 1,
      content: data?.content || 'Hello World',
      created_at: Date.now() / 1000 - 1000,
      tags: data?.tags || [],
    },
    generateSecretKey(),
  )
}

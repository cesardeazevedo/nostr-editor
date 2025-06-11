import type { NostrEvent } from 'nostr-tools'
import { finalizeEvent, generateSecretKey } from 'nostr-tools'

export function fakeEvent(data?: Partial<NostrEvent>): NostrEvent {
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

export const getFakeHash = (file: File) => `${file.name}-hash`

export const getFakeUrl = (file: File) => `https://example.com/${file.name}`

export function getFakeTask(file: File) {
  if (file.name.includes('error')) {
    return {
      error: "Invalid file"
    }
  }

  return {
    result: {
      url: getFakeUrl(file),
      sha256: getFakeHash(file),
      tags: [["alt", file.name]],
    }
  }
}


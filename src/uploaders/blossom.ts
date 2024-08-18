import type { EventTemplate, NostrEvent } from 'nostr-tools/core'

export interface BlossomOptions {
  file: File
  serverUrl: string
  expiration?: number
  hash?: (file: File) => Promise<string>
  sign?: (event: EventTemplate) => Promise<NostrEvent> | NostrEvent
}

export interface BlossomResponse {
  sha256: string
  size: number
  type: string
  uploaded: number
  url: string
}

export interface BlossomResponseError {
  message: string
}

export async function uploadBlossom(options: BlossomOptions) {
  if (!options.hash) {
    throw new Error('No hash function provided')
  }
  if (!options.sign) {
    throw new Error('No signer provided')
  }
  const now = Date.now() / 1000
  const hash = await options.hash(options.file)
  const event = await options.sign({
    kind: 24242,
    content: `Upload ${options.file.name}`,
    created_at: now,
    tags: [
      ['t', 'upload'],
      ['x', hash],
      ['expiration', (now + (options.expiration || 60000)).toString()],
    ],
  })
  await new Promise<void>((r) => setTimeout(() => r(), 1000))
  const data = JSON.stringify(event)
  const base64 = btoa(data)
  const authorization = `Nostr ${base64}`
  const res = await fetch(options.serverUrl + '/upload', {
    method: 'PUT',
    body: options.file,
    headers: {
      authorization,
    },
  })
  const json = await res.json()
  if (res.status === 200) {
    return json as BlossomResponse
  }
  throw new Error((json as BlossomResponseError).message)
}

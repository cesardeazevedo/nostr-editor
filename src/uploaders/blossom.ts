import type { EventTemplate, NostrEvent } from 'nostr-tools/core'
import type { UploadTask } from './types'

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
  nip94: Record<string, string>
  uploaded: number
  url: string
}

export interface BlossomResponseError {
  message: string
}

export async function uploadBlossom(options: BlossomOptions): Promise<UploadTask> {
  if (!options.hash) {
    throw new Error('No hash function provided')
  }
  if (!options.sign) {
    throw new Error('No signer provided')
  }
  const now = Math.floor(Date.now() / 1000)
  const hash = await options.hash(options.file)
  const event = await options.sign({
    kind: 24242,
    content: `Upload ${options.file.name}`,
    created_at: now,
    tags: [
      ['u', options.serverUrl],
      ['method', 'PUT'],
      ['t', 'upload'],
      ['x', hash],
      ['expiration', Math.floor(now + (options.expiration || 60000)).toString()],
    ],
  })
  const base64 = btoa(JSON.stringify(event))
  const authorization = `Nostr ${base64}`
  const res = await fetch(options.serverUrl + '/upload', {
    method: 'PUT',
    body: options.file,
    headers: {
      authorization,
    },
  })
  const data = await res.json()
  if (res.status !== 200) {
    throw new Error((data as BlossomResponseError).message)
  }
  const json = data as BlossomResponse
  return {
    ...json,
    tags: Array.from(Object.entries(json.nip94 || [])),
  }
}

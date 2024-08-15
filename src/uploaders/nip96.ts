import type { EventTemplate, NostrEvent } from 'nostr-tools/core'
import { readServerConfig, uploadFile } from 'nostr-tools/nip96'
import { getToken } from 'nostr-tools/nip98'

export interface NIP96Options {
  file: File
  alt?: string
  serverUrl: string
  expiration?: number
  sign?: (event: EventTemplate) => Promise<NostrEvent> | NostrEvent
}

export async function uploadNIP96(options: NIP96Options) {
  if (!options.sign) {
    return Promise.reject('No signer found')
  }
  try {
    const server = await readServerConfig(options.serverUrl)
    const authorization = await getToken(server.api_url, 'POST', options.sign, true)
    const res = await uploadFile(options.file, server.api_url, authorization, {
      alt: options.alt || '',
      expiration: options.expiration?.toString() || '',
      content_type: options.file.type,
    })
    return res
  } catch (error) {
    console.log('Error upload', error)
  }
}

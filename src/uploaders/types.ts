import type { NostrEvent } from 'nostr-tools'

export type UploadParams = {
  type: 'nip96' | 'blossom'
  url: string
}

export interface UploadTask {
  url?: string
  sha256?: string
  tags?: NostrEvent['tags']
  uploadError?: string
}

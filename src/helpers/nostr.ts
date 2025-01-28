import type { DecodeResult } from 'nostr-tools/nip19'

export type Nip19Options = {
  getRelayHints?: (pointer: DecodeResult) => string[]
}

export const getNip19Relays = (pointer: DecodeResult, options?: Nip19Options) => {
  let relays = (pointer.data as { relays?: string[] }).relays || []

  if (options?.getRelayHints) {
    relays = Array.from(new Set([...relays, ...options.getRelayHints(pointer)]))
  }

  return relays
}

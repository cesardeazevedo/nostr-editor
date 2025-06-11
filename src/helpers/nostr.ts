import type { DecodedResult } from 'nostr-tools/nip19'

export type Nip19Options = {
  getRelayHints?: (pointer: DecodedResult) => string[]
}

export const getNip19Relays = (pointer: DecodedResult, options?: Nip19Options) => {
  let relays = (pointer.data as { relays?: string[] }).relays || []

  if (options?.getRelayHints) {
    relays = Array.from(new Set([...relays, ...options.getRelayHints(pointer)]))
  }

  return relays
}

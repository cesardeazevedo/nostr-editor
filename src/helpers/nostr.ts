/* eslint @typescript-eslint/no-explicit-any: 0 */
import { decode } from 'nostr-tools/nip19'

export type BasePointer = {
  bech32: string
  relays: string[]
}

export type ProfilePointer = BasePointer & {
  type: "nprofile" | "npub"
  pubkey: string
}

export type EventPointer = BasePointer & {
  type: "nevent" | "note"
  id: string
  kind?: number
  author?: string
}

export type AddressPointer = BasePointer & {
  type: "naddr"
  identifier: string
  pubkey: string
  kind: number
}

export type NostrEntityPointer = ProfilePointer | EventPointer | AddressPointer

export const translateEntityData = (type: string, data: any) => {
  switch (type) {
    case 'note': return {id: data}
    case 'npub': return {pubkey: data}
    case 'nprofile': return {pubkey: data.pubkey}
    case 'nevent': return {id: data.id, kind: data.kind, author: data.author}
    case 'naddr': return {identifier: data.identifier, kind: data.kind, pubkey: data.pubkey}
    default:
      throw new Error(`Invalid nostr entity type: ${type}`)
  }
}

export type PointerOptions<T extends NostrEntityPointer> = {
  allowedTypes: string[]
  getRelayHints?: (pointer: T) => string[]
}

export const entityToPointer = <T extends NostrEntityPointer>(bech32: string, options: PointerOptions<T>): T => {
  const {type, data} = (decode as any)(bech32.replace(/^nostr:/, ''))

  if (!options.allowedTypes.includes(type)) {
    throw new Error(`Invalid nostr entity type for this context: ${type}`)
  }

  const relays = data.relays?.length > 0 ? data.relays : []
  const attrs = translateEntityData(type, data)
  const pointer = { type, bech32, relays, ...attrs } as T

  if (options.getRelayHints) {
    pointer.relays = Array.from(new Set([...relays, ...options.getRelayHints(pointer)]))
  }

  return pointer
}

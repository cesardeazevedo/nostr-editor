import { decode } from 'nostr-tools/nip19'

export type BasePointer = {
  entity: string
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

export const entityToPointer = (entity: string): NostrEntityPointer => {
  const {type, data} = (decode as any)(entity.split(':').slice(-1))
  const relays = data.relays?.length > 0 ? data.relays : []
  const attrs = translateEntityData(type, data)

  return { type, entity, relays, ...attrs }
}

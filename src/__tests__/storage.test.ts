import { nip19 } from 'nostr-tools'
import type { NostrStorage } from '../extensions/NostrExtension'
import { test } from './fixtures'
import { fakeEvent } from './testUtils'

describe('Storage', () => {
  test('assert getTags()', ({ editor }) => {
    const event = fakeEvent({ content: `text #123 #456 text #123 text #abc` })
    editor.commands.setEventContent(event)
    const storage = editor.storage.nostr as NostrStorage
    expect(storage.getTags()).toEqual([{ tag: '#123' }, { tag: '#456' }, { tag: '#123' }, { tag: '#abc' }])
  })

  test('assert getNprofiles()', ({ editor }) => {
    const ref = fakeEvent()
    const decoded = { relays: [], pubkey: ref.pubkey }
    const nprofile = nip19.nprofileEncode(decoded)
    const event = fakeEvent({ content: `${nprofile}` })
    editor.commands.setEventContent(event)
    const storage = editor.storage.nostr as NostrStorage
    expect(storage.getNprofiles()).toEqual([{ ...decoded, nprofile }])
  })

  test('assert getNevents()', ({ editor }) => {
    const ref = fakeEvent()
    const decoded = { kind: 1, id: ref.id, relays: [], author: ref.pubkey }
    const nevent = nip19.neventEncode(decoded)
    const event = fakeEvent({ content: `${nevent}` })
    editor.commands.setEventContent(event)
    const storage = editor.storage.nostr as NostrStorage
    expect(storage.getNevents()).toEqual([{ ...decoded, nevent }])
  })

  test('assert getNAddress()', ({ editor }) => {
    const ref = fakeEvent()
    const decoded = { kind: 1, identifier: ref.id, relays: [], pubkey: ref.pubkey }
    const naddr = nip19.naddrEncode(decoded)
    const event = fakeEvent({ content: `${naddr}` })
    editor.commands.setEventContent(event)
    const storage = editor.storage.nostr as NostrStorage
    expect(storage.getNaddress()).toEqual([{ ...decoded, naddr }])
  })
})

import { nip19 } from 'nostr-tools'
import type { NostrStorage } from '../extensions/NostrExtension'
import { test } from './fixtures'
import { fakeEvent } from './testUtils'
import type { FileUploadStorage } from '../extensions/FileUploadExtension'
import { mockBlossomServer, hash1, hash2 } from './mockBlossom'

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
    expect(storage.getNprofiles()).toEqual([{ ...decoded, bech32: nprofile, type: 'nprofile' }])
  })

  test('assert getNevents()', ({ editor }) => {
    const ref = fakeEvent()
    const decoded = { kind: 1, id: ref.id, relays: [], author: ref.pubkey }
    const nevent = nip19.neventEncode(decoded)
    const event = fakeEvent({ content: `${nevent}` })
    editor.commands.setEventContent(event)
    const storage = editor.storage.nostr as NostrStorage
    expect(storage.getNevents()).toEqual([{ ...decoded, bech32: nevent, type: 'nevent' }])
  })

  test('assert getNAddress()', ({ editor }) => {
    const ref = fakeEvent()
    const decoded = { kind: 1, identifier: ref.id, relays: [], pubkey: ref.pubkey }
    const naddr = nip19.naddrEncode(decoded)
    const event = fakeEvent({ content: `${naddr}` })
    editor.commands.setEventContent(event)
    const storage = editor.storage.nostr as NostrStorage
    expect(storage.getNaddrs()).toEqual([{ ...decoded, bech32: naddr, type: 'naddr' }])
  })

  describe('with upload', () => {
    beforeAll(() => {
      mockBlossomServer.listen()
    })

    afterAll(() => {
      mockBlossomServer.close()
    })

    afterEach(() => {
      mockBlossomServer.resetHandlers()
    })

    test('assert getEditorTags()', async ({ editor, getFile }) => {
      const nostr = editor.storage.nostr as NostrStorage
      const fileUpload = editor.storage.fileUpload as FileUploadStorage
      const ref = fakeEvent()
      const file = await getFile('test_upload.png')
      const file2 = await getFile('test_upload2.png')
      const nprofile = nip19.nprofileEncode({ pubkey: ref.pubkey, relays: ['relay1'] })
      const nevent = nip19.neventEncode({ id: ref.id, author: ref.pubkey, kind: ref.kind, relays: ['relay1'] })
      const naddr = nip19.naddrEncode({
        kind: ref.kind,
        identifier: 'identifier',
        relays: ['relay1'],
        pubkey: ref.pubkey,
      })
      const event = fakeEvent({ content: `GM! ${nprofile} ${naddr} ${nevent} #asknostr #Photography` })

      editor.commands.setEventContent(event)
      fileUpload.uploader?.addFile(file, editor.$doc.size - 2)
      fileUpload.uploader?.addFile(file2, editor.$doc.size - 2)

      await fileUpload.uploader?.start()

      expect(editor.getText({ blockSeparator: ' ' })).toStrictEqual(
        `GM! nostr:${nprofile}  nostr:${naddr}   nostr:${nevent}  #asknostr #Photography https://localhost:3000/6c36995913e97b73d5365f93a7b524a9e45edc68e4f11b78060154987c53602c.png https://localhost:3000/008a2224c4d2a513ab2a4add09a2ac20c2d9cec1144b5111bc1317edb2366eac.png`,
      )
      expect(nostr.getEditorTags()).toStrictEqual([
        ['p', ref.pubkey, 'relay1'],
        ['q', ref.id, 'relay1', ref.pubkey],
        ['a', `1:${ref.pubkey}:identifier`, 'relay1'],
        ['imeta', 'dim 500x500', 'm image/png', 'size 21792', `url https://localhost:3000/${hash1}.png`, `x ${hash1}`],
        ['imeta', 'dim 500x500', 'm image/png', 'size 16630', `url https://localhost:3000/${hash2}.png`, `x ${hash2}`],
        ['t', 'asknostr'],
        ['t', 'photography'],
      ])

      // assert without relay hints
      expect(nostr.getEditorTags(false)).toStrictEqual([
        ['p', ref.pubkey],
        ['q', ref.id],
        ['a', `1:${ref.pubkey}:identifier`],
        ['imeta', 'dim 500x500', 'm image/png', 'size 21792', `url https://localhost:3000/${hash1}.png`, `x ${hash1}`],
        ['imeta', 'dim 500x500', 'm image/png', 'size 16630', `url https://localhost:3000/${hash2}.png`, `x ${hash2}`],
        ['t', 'asknostr'],
        ['t', 'photography'],
      ])
    })
  })
})

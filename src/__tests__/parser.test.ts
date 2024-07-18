import { Editor } from '@tiptap/core'
import { nip19 } from 'nostr-tools'
import { parseNoteContent } from '../parser'
import { getExtensions, getExtensionsMarkdown } from './testExtensions/extensions'
import { fakeNote } from './testUtils'

const editor = new Editor({ extensions: getExtensions() })
const editorMarkdown = new Editor({ extensions: getExtensionsMarkdown() })

describe('parseNoteContent', () => {
  test('Should assert simple text', () => {
    const note = fakeNote({
      content: 'Hello nostr-editor! https://github.com/cesardeazevedo/nostr-editor',
    })
    expect(parseNoteContent(editor.state, note)).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "content": [
              {
                "text": "Hello nostr-editor! ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "attrs": {
                      "href": "https://github.com/cesardeazevedo/nostr-editor",
                    },
                    "type": "link",
                  },
                ],
                "text": "https://github.com/cesardeazevedo/nostr-editor",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "doc",
      }
    `)
  })

  test('Should assert content with a image url with imeta', () => {
    const note = fakeNote({
      content: 'http://host.com/image http://host.com/video https://simplelink.com',
      tags: [
        ['imeta', 'url http://host.com/image', 'm image/jpg'],
        ['imeta', 'url http://host.com/video', 'm video/mp4'],
      ],
    })
    expect(parseNoteContent(editor.state, note)).toMatchInlineSnapshot(`
       {
         "content": [
           {
             "type": "paragraph",
           },
           {
             "attrs": {
               "alt": null,
               "src": "http://host.com/image",
               "title": null,
             },
             "type": "image",
           },
           {
             "content": [
               {
                 "text": " ",
                 "type": "text",
               },
             ],
             "type": "paragraph",
           },
           {
             "attrs": {
               "src": "http://host.com/video",
             },
             "type": "video",
           },
           {
             "content": [
               {
                 "text": " ",
                 "type": "text",
               },
               {
                 "marks": [
                   {
                     "attrs": {
                       "href": "https://simplelink.com",
                     },
                     "type": "link",
                   },
                 ],
                 "text": "https://simplelink.com",
                 "type": "text",
               },
             ],
             "type": "paragraph",
           },
         ],
         "type": "doc",
       }
     `)
  })

  test('Should assert content with multiple nodes', () => {
    const ref = fakeNote({
      content: 'related',
      created_at: 1,
      pubkey: '1',
    })
    const nevent = nip19.neventEncode({ id: ref.id, relays: [], author: ref.pubkey })
    const note = fakeNote({
      content: `Hi! https://google.com #tag nostr:${nevent} Hi nostr:nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj check this out https://nostr.com/img.jpg https://v.nostr.build/g6BQ.mp4`,
    })
    expect(parseNoteContent(editor.state, note)).toMatchInlineSnapshot(`
       {
         "content": [
           {
             "content": [
               {
                 "text": "Hi! ",
                 "type": "text",
               },
               {
                 "marks": [
                   {
                     "attrs": {
                       "href": "https://google.com",
                     },
                     "type": "link",
                   },
                 ],
                 "text": "https://google.com",
                 "type": "text",
               },
               {
                 "text": " ",
                 "type": "text",
               },
               {
                 "marks": [
                   {
                     "attrs": {
                       "tag": "#tag",
                     },
                     "type": "tag",
                   },
                 ],
                 "text": "#tag",
                 "type": "text",
               },
               {
                 "text": " ",
                 "type": "text",
               },
             ],
             "type": "paragraph",
           },
           {
             "attrs": {
               "author": "${ref.pubkey}",
               "id": "${ref.id}",
               "kind": null,
               "relays": [],
             },
             "type": "nevent",
           },
           {
             "content": [
               {
                 "text": " Hi ",
                 "type": "text",
               },
               {
                 "attrs": {
                   "pubkey": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
                   "relays": [
                     "wss://relay.damus.io",
                   ],
                   "text": "nostr:nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj",
                 },
                 "type": "nprofile",
               },
               {
                 "text": " check this out ",
                 "type": "text",
               },
             ],
             "type": "paragraph",
           },
           {
             "attrs": {
               "alt": null,
               "src": "https://nostr.com/img.jpg",
               "title": null,
             },
             "type": "image",
           },
           {
             "content": [
               {
                 "text": " ",
                 "type": "text",
               },
             ],
             "type": "paragraph",
           },
           {
             "attrs": {
               "src": "https://v.nostr.build/g6BQ.mp4",
             },
             "type": "video",
           },
         ],
         "type": "doc",
       }
     `)
  })

  test('Should assert markdown content', () => {
    const note = fakeNote({
      kind: 30023,
      content: `
 # Title

 * list 1
 * list 2
 * list 3

 text **bold** *italic* [link](https://google.com)
 `,
    })
    expect(parseNoteContent(editorMarkdown.state, note)).toMatchInlineSnapshot(`
       {
         "content": [
           {
             "attrs": {
               "level": 1,
             },
             "content": [
               {
                 "text": "Title",
                 "type": "text",
               },
             ],
             "type": "heading",
           },
           {
             "attrs": {
               "tight": true,
             },
             "content": [
               {
                 "content": [
                   {
                     "content": [
                       {
                         "text": "list 1",
                         "type": "text",
                       },
                     ],
                     "type": "paragraph",
                   },
                 ],
                 "type": "listItem",
               },
               {
                 "content": [
                   {
                     "content": [
                       {
                         "text": "list 2",
                         "type": "text",
                       },
                     ],
                     "type": "paragraph",
                   },
                 ],
                 "type": "listItem",
               },
               {
                 "content": [
                   {
                     "content": [
                       {
                         "text": "list 3",
                         "type": "text",
                       },
                     ],
                     "type": "paragraph",
                   },
                 ],
                 "type": "listItem",
               },
             ],
             "type": "bulletList",
           },
           {
             "content": [
               {
                 "text": "text ",
                 "type": "text",
               },
               {
                 "marks": [
                   {
                     "type": "bold",
                   },
                 ],
                 "text": "bold",
                 "type": "text",
               },
               {
                 "text": " ",
                 "type": "text",
               },
               {
                 "marks": [
                   {
                     "type": "italic",
                   },
                 ],
                 "text": "italic",
                 "type": "text",
               },
               {
                 "text": " link",
                 "type": "text",
               },
             ],
             "type": "paragraph",
           },
         ],
         "type": "doc",
       }
     `)
  })

  test('Should assert image links with line breaks', () => {
    const note = fakeNote({
      kind: 30023,
      content: `
 https://host.com/1.jpeg

 https://host.com/2.jpeg
 `,
    })
    expect(parseNoteContent(editor.state, note)).toMatchInlineSnapshot(`
       {
         "content": [
           {
             "type": "paragraph",
           },
           {
             "attrs": {
               "alt": null,
               "src": "https://host.com/1.jpeg",
               "title": null,
             },
             "type": "image",
           },
           {
             "type": "paragraph",
           },
           {
             "attrs": {
               "alt": null,
               "src": "https://host.com/2.jpeg",
               "title": null,
             },
             "type": "image",
           },
         ],
         "type": "doc",
       }
     `)
  })

  test('Should assert an intersecting node', () => {
    const note = fakeNote({
      content:
        'Test: https://github.com/nostr:npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c/wrong/link/ text',
    })
    expect(parseNoteContent(editor.state, note)).toMatchInlineSnapshot(`
         {
           "content": [
             {
               "content": [
                 {
                   "text": "Test: ",
                   "type": "text",
                 },
                 {
                   "marks": [
                     {
                       "attrs": {
                         "href": "https://github.com/nostr:npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c/wrong/link/",
                       },
                       "type": "link",
                     },
                   ],
                   "text": "https://github.com/nostr:npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c/wrong/link/",
                   "type": "text",
                 },
                 {
                   "text": " text",
                   "type": "text",
                 },
               ],
               "type": "paragraph",
             },
           ],
           "type": "doc",
         }
      `)
  })

  test('Should assert an intersecting node', () => {
    const note = fakeNote({
      content:
        'Test addr nostr:naddr1qqwysetjv5syxmmdv4ejqsnfw33k76twyp38jgznwp5hyctvqgsph3c2q9yt8uckmgelu0yf7glruudvfluesqn7cuftjpwdynm2gygrqsqqqa2w4ua43m',
    })
    expect(parseNoteContent(editor.state, note)).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "content": [
              {
                "text": "Test addr ",
                "type": "text",
              },
            ],
            "type": "paragraph",
          },
          {
            "attrs": {
              "identifier": "Here Comes Bitcoin by Spiral",
              "kind": 30030,
              "pubkey": "1bc70a0148b3f316da33fe3c89f23e3e71ac4ff998027ec712b905cd24f6a411",
              "relays": [],
            },
            "type": "naddr",
          },
        ],
        "type": "doc",
      }
    `)
  })
})

// @vitest-environment happy-dom
import { nip19 } from 'nostr-tools'
import { fakeEvent } from './testUtils'
import { test } from './fixtures'

describe('parseNote()', () => {
  test('Should assert simple text', ({ editor }) => {
    const event = fakeEvent({
      content: 'Hello nostr-editor! https://github.com/cesardeazevedo/nostr-editor',
    })
    editor.commands.setEventContent(event)
    expect(editor.getJSON()).toMatchInlineSnapshot(`
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
                      "class": null,
                      "href": "https://github.com/cesardeazevedo/nostr-editor",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
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

  test('Should assert content with a image url with imeta', ({ editor }) => {
    const event = fakeEvent({
      content: 'http://host.com/image http://host.com/video https://simplelink.com',
      tags: [
        ['imeta', 'url http://host.com/image', 'm image/jpg'],
        ['imeta', 'url http://host.com/video', 'm video/mp4'],
      ],
    })
    editor.commands.setEventContent(event)
    expect(editor.getText({ blockSeparator: '' })).toStrictEqual(
      'http://host.com/image http://host.com/video https://simplelink.com',
    )
    expect(editor.getJSON()).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "type": "paragraph",
          },
          {
            "attrs": {
              "alt": null,
              "file": null,
              "hash": null,
              "sha256": null,
              "src": "http://host.com/image",
              "tags": null,
              "uploadError": null,
              "uploadType": "blossom",
              "uploadUrl": "https://localhost:3000",
              "uploading": false,
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
              "alt": null,
              "file": null,
              "sha256": null,
              "src": "http://host.com/video",
              "tags": null,
              "uploadError": null,
              "uploadType": "nip96",
              "uploadUrl": "https://nostr.build",
              "uploading": false,
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
                      "class": null,
                      "href": "https://simplelink.com",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
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

  test('Should assert content with multiple nodes', ({ editor }) => {
    const ref = {
      kind: 1,
      content: 'related',
      created_at: 1722797852.844,
      tags: [],
      pubkey: '0a5a87baeead12b08c0c026caa46c009bb533aae1bd1681f52d609dd2b6fd8bc',
      id: '2ceb90d42ab5a19b76dddfbda45687bc8011917a41286783edd14ca690fd86ee',
      sig: 'be275b494d07d7dc793bb82b475c1e4f697013a644542aabf5a701a83e26e495af7d53897d8c713d235d779c0d5613dcf5caf26c79db3468b04027dd0069a71e',
    }
    const nevent = nip19.neventEncode({ id: ref.id, relays: [], author: ref.pubkey })
    const nprofile = nip19.nprofileEncode({ pubkey: ref.pubkey, relays: ['wss://relay.damus.io'] })
    const event = fakeEvent({
      content: `Hi! https://nostr.com #tag nostr:${nevent} Hi nostr:${nprofile} check this out https://nostr.com/img.jpg https://v.nostr.build/g6BQ.mp4`,
    })
    editor.commands.setEventContent(event)
    expect(editor.getText({ blockSeparator: '' })).toStrictEqual(event.content)
    expect(editor.getJSON()).toMatchInlineSnapshot(`
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
                      "class": null,
                      "href": "https://nostr.com",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
                    },
                    "type": "link",
                  },
                ],
                "text": "https://nostr.com",
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
              "author": "0a5a87baeead12b08c0c026caa46c009bb533aae1bd1681f52d609dd2b6fd8bc",
              "id": "2ceb90d42ab5a19b76dddfbda45687bc8011917a41286783edd14ca690fd86ee",
              "kind": null,
              "nevent": "nostr:nevent1qgsq5k58hth26y4s3sxqym92gmqqnw6n82hph5tgrafdvzwa9dha30qqyqkwhyx59266rxmkmh0mmfzks77gqyv30fqjseurahg5ef5slkrwuzwpwzp",
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
                  "nprofile": "nostr:nprofile1qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqgq2t2rm4m4dz2cgcrqzdj4ydsqfhdfn4tsm695p75kkp8wjkm7chsuhqyfh",
                  "pubkey": "0a5a87baeead12b08c0c026caa46c009bb533aae1bd1681f52d609dd2b6fd8bc",
                  "relays": [
                    "wss://relay.damus.io",
                  ],
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
              "file": null,
              "hash": null,
              "sha256": null,
              "src": "https://nostr.com/img.jpg",
              "tags": null,
              "uploadError": null,
              "uploadType": "blossom",
              "uploadUrl": "https://localhost:3000",
              "uploading": false,
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
              "alt": null,
              "file": null,
              "sha256": null,
              "src": "https://v.nostr.build/g6BQ.mp4",
              "tags": null,
              "uploadError": null,
              "uploadType": "nip96",
              "uploadUrl": "https://nostr.build",
              "uploading": false,
            },
            "type": "video",
          },
        ],
        "type": "doc",
      }
    `)
  })

  test('Should assert markdown content', ({ editorMarkdown }) => {
    const event = fakeEvent({
      kind: 30023,
      content: `
 # Title

 * list 1
 * list 2
 * list 3

 text **bold** *italic* [link](https://nostr.com)
 `,
    })
    editorMarkdown.commands.setEventContent(event)
    expect(editorMarkdown.storage.markdown.getMarkdown()).toStrictEqual(`# Title

- list 1
- list 2
- list 3

text **bold** *italic* [link](https://nostr.com)`)
    expect(editorMarkdown.getJSON()).toMatchInlineSnapshot(`
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
                "text": " ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "attrs": {
                      "class": null,
                      "href": "https://nostr.com",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
                    },
                    "type": "link",
                  },
                ],
                "text": "link",
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

  test('Should assert a nostr links inside markdown', ({ editorMarkdown }) => {
    const event = fakeEvent({
      kind: 30023,
      content: `### Test nostr:nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj`,
    })
    editorMarkdown.commands.setEventContent(event)
    expect(editorMarkdown.storage.markdown.getMarkdown()).toStrictEqual(event.content)
    expect(editorMarkdown.getText({ blockSeparator: '' })).toStrictEqual(
      'Test nostr:nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj',
    )
    expect(editorMarkdown.getJSON()).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "attrs": {
              "level": 3,
            },
            "content": [
              {
                "text": "Test ",
                "type": "text",
              },
              {
                "attrs": {
                  "nprofile": "nostr:nprofile1qqsvvcpmpuwvlmrztkwq3d6nunmhf6hh688jw6fzxyjmtl2d5u5qr8spz3mhxue69uhhyetvv9ujuerpd46hxtnfdufzkeuj",
                  "pubkey": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
                  "relays": [
                    "wss://relay.damus.io",
                  ],
                },
                "type": "nprofile",
              },
            ],
            "type": "heading",
          },
        ],
        "type": "doc",
      }
    `)
  })

  test('Should assert image links with line breaks', ({ editor }) => {
    const event = fakeEvent({
      kind: 1,
      content: `
https://host.com/1.jpeg


https://host.com/2.jpeg
 `,
    })
    editor.commands.setEventContent(event)
    expect(editor.getText({ blockSeparator: '' })).toStrictEqual(`
https://host.com/1.jpeg
https://host.com/2.jpeg
`)
    //console.dir(editor.getJSON(), { depth: null })
    expect(editor.getJSON()).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "content": [
              {
                "type": "hardBreak",
              },
            ],
            "type": "paragraph",
          },
          {
            "attrs": {
              "alt": null,
              "file": null,
              "hash": null,
              "sha256": null,
              "src": "https://host.com/1.jpeg",
              "tags": null,
              "uploadError": null,
              "uploadType": "blossom",
              "uploadUrl": "https://localhost:3000",
              "uploading": false,
            },
            "type": "image",
          },
          {
            "content": [
              {
                "type": "hardBreak",
              },
            ],
            "type": "paragraph",
          },
          {
            "attrs": {
              "alt": null,
              "file": null,
              "hash": null,
              "sha256": null,
              "src": "https://host.com/2.jpeg",
              "tags": null,
              "uploadError": null,
              "uploadType": "blossom",
              "uploadUrl": "https://localhost:3000",
              "uploading": false,
            },
            "type": "image",
          },
          {
            "content": [
              {
                "type": "hardBreak",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "doc",
      }
    `)
  })

  // This actually might be incorrect, but we need to track scenarios like this
  test('Should assert an intersecting node', ({ editor }) => {
    const event = fakeEvent({
      content:
        'Test: https://github.com/nostr:npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c/wrong/link/ text https://github.com/nostr:nevent1qgsq5k58hth26y4s3sxqym92gmqqnw6n82hph5tgrafdvzwa9dha30qqyqkwhyx59266rxmkmh0mmfzks77gqyv30fqjseurahg5ef5slkrwuzwpwzp/error link',
    })
    editor.commands.setEventContent(event)
    expect(editor.getText({ blockSeparator: '' })).toStrictEqual(event.content)
    expect(editor.getJSON()).toMatchInlineSnapshot(`
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
                      "class": null,
                      "href": "https://github.com/nostr:npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c/wrong/link/",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
                    },
                    "type": "link",
                  },
                ],
                "text": "https://github.com/nostr:npub1cesrkrcuelkxyhvupzm48e8hwn4005w0ya5jyvf9kh75mfegqx0q4kt37c/wrong/link/",
                "type": "text",
              },
              {
                "text": " text ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "attrs": {
                      "class": null,
                      "href": "https://github.com/nostr:nevent1qgsq5k58hth26y4s3sxqym92gmqqnw6n82hph5tgrafdvzwa9dha30qqyqkwhyx59266rxmkmh0mmfzks77gqyv30fqjseurahg5ef5slkrwuzwpwzp/error",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
                    },
                    "type": "link",
                  },
                ],
                "text": "https://github.com/nostr:nevent1qgsq5k58hth26y4s3sxqym92gmqqnw6n82hph5tgrafdvzwa9dha30qqyqkwhyx59266rxmkmh0mmfzks77gqyv30fqjseurahg5ef5slkrwuzwpwzp/error",
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

  test('Should assert a nostr:naddr1', ({ editor }) => {
    const event = fakeEvent({
      content:
        'Test addr nostr:naddr1qqwysetjv5syxmmdv4ejqsnfw33k76twyp38jgznwp5hyctvqgsph3c2q9yt8uckmgelu0yf7glruudvfluesqn7cuftjpwdynm2gygrqsqqqa2w4ua43m',
    })
    editor.commands.setEventContent(event)
    expect(editor.getText({ blockSeparator: '' })).toStrictEqual(event.content)
    expect(editor.getJSON()).toMatchInlineSnapshot(`
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
              "naddr": "nostr:naddr1qqwysetjv5syxmmdv4ejqsnfw33k76twyp38jgznwp5hyctvqgsph3c2q9yt8uckmgelu0yf7glruudvfluesqn7cuftjpwdynm2gygrqsqqqa2w4ua43m",
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

  test('Should assert setEventContentKind0', ({ editorUserAbout }) => {
    const content = {
      display_name: 'name',
      about:
        'Building nostr.com #nostr nostr:nprofile1qy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcprfmhxue69uhhyetvv9ujuem9w3skccne9e3k7mf0wccsqgxxvqas78x0a339m8qgkaf7fam5atmarne8dy3rzfd4l4x6w2qpncmfs8zh https://image.nostr.build/87dbc55a6391d15bddda206561d53867a5679dd95e84fe8ed62bfe2e3adcadf3.jpg',
    }
    const event = fakeEvent({
      kind: 0,
      content: JSON.stringify(content),
    })
    editorUserAbout.commands.setEventContentKind0(event)
    expect(editorUserAbout.getText()).toStrictEqual(content.about)
    expect(editorUserAbout.getJSON()).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "content": [
              {
                "text": "Building ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "attrs": {
                      "class": null,
                      "href": "http://nostr.com",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
                    },
                    "type": "link",
                  },
                ],
                "text": "nostr.com",
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
                      "tag": "#nostr",
                    },
                    "type": "tag",
                  },
                ],
                "text": "#nostr",
                "type": "text",
              },
              {
                "text": " ",
                "type": "text",
              },
              {
                "attrs": {
                  "nprofile": "nostr:nprofile1qy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcprfmhxue69uhhyetvv9ujuem9w3skccne9e3k7mf0wccsqgxxvqas78x0a339m8qgkaf7fam5atmarne8dy3rzfd4l4x6w2qpncmfs8zh",
                  "pubkey": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
                  "relays": [
                    "wss://nos.lol/",
                    "wss://relay.damus.io/",
                    "wss://relay.getalby.com/v1",
                  ],
                },
                "type": "nprofile",
              },
              {
                "text": " ",
                "type": "text",
              },
              {
                "marks": [
                  {
                    "attrs": {
                      "class": null,
                      "href": "https://image.nostr.build/87dbc55a6391d15bddda206561d53867a5679dd95e84fe8ed62bfe2e3adcadf3.jpg",
                      "rel": "noopener noreferrer nofollow",
                      "target": "_blank",
                    },
                    "type": "link",
                  },
                ],
                "text": "https://image.nostr.build/87dbc55a6391d15bddda206561d53867a5679dd95e84fe8ed62bfe2e3adcadf3.jpg",
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

  test('hashtag before a breakline', ({ editor }) => {
    const event = fakeEvent({
      content: 'Lorem Ipsum #tag.\n\nNew Line ipsum',
    })
    editor.commands.setEventContent(event)
    expect(editor.getJSON()).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "content": [
              {
                "text": "Lorem Ipsum ",
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
                "text": ".",
                "type": "text",
              },
              {
                "type": "hardBreak",
              },
              {
                "text": "New Line ipsum",
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
})

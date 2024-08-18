# nostr-editor

`nostr-editor` is a collection of [Tiptap](https://tiptap.dev/) extensions designed to enhance the user experience when creating and editing nostr notes. It also provides tools for parsing existing notes into a structured content schema.


#### What is tiptap?

Tiptap is a headless wrapper around ProseMirror, offering a more developer-friendly API for building rich text editors. nostr-editor uses Tiptap to simplify integration with frameworks like React and Svelte, making it easy to create customized nostr-compatible editors.


#### What is prosemirror?

ProseMirror is the underlying core framework that powers Tiptap and other WYSIWYG (what-you-see-is-what-you-get) editors.


## Features

- Fully customizable extensions
- Parse existing nostr events, including `imeta` tags ([NIP-94](https://github.com/nostr-protocol/nips/blob/master/94.md))
- Automatically convert nostr links to their appropriate nodes during paste operations (`nostr:nevent1`, `nostr:nprofile1`, `nostr:naddr`, `nostr:npub`, `nostr:note1`)
- Handle file uploads to a [NIP-96](https://github.com/nostr-protocol/nips/blob/master/96.md) or [blossom](https://github.com/hzrd149/blossom-server) compatible server
- Supports markdown long-form content
- Supports bolt11 invoices
- Supports youtube and tweet links
- Automatically rejects and alerts if the user mistakenly pastes an `nsec1` key.

## Demo

https://cesardeazevedo.github.io/nostr-editor/

- React: [source-code](./examples/react)
- Svelte (WIP): [source-code](./examples/svelte)

## Installing


To use nostr-editor, you'll need to install a few dependencies:

```shell
pnpm add nostr-editor @tiptap/starter-kit @tiptap/core tiptap-markdown
```

react dependencies

```shell
pnpm add @tiptap/react
```

svelte dependencies

```shell
pnpm add svelte-tiptap
```

## Usage

### React

Here's a basic setup example using React:

```ts
import { Editor } from '@tiptap/core'
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

function MyEditor() {
  const editor = useEditor({
    autofocus: true,
    extensions: [
      StarterKit,
      NostrExtension.configure({
        extend: {
          nprofile: { addNodeView: () => ReactNodeViewRenderer(MyReactMentionComponent) },
          nevent: { addNodeView: () => ReactNodeViewRenderer(MyReactNEventComponent) },
          naddr: { addNodeView: () => ReactNodeViewRenderer(MyReactNaddrComponent) },
          image: { addNodeView: () => ReactNodeViewRenderer(MyReactImageComponent) },
          video: { addNodeView: () => ReactNodeViewRenderer(MyReactVideoComponent) },
          tweet: { addNodeView: () => ReactNodeViewRenderer(MyReactTweetComponent) },
        },
        link: { autolink: true }
      }),
    ],
    onUpdate: () => {
      const contentSchema = editor.getJSON()
      const contentText = editor.getText()
    },
  })

  return (
    <EditorContent editor={editor} />
  )
}
```

### svelte

```svelte
<script>
  import { Editor, type JSONContent } from '@tiptap/core'
  let editor: Editor
  let contentText: string = ''
  let contentSchema: JSONContent

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        StarterKit,
        NostrExtension.configure({
          extend: {
            nprofile: { addNodeView: () => SvelteNodeViewRenderer(MySvelteMentionComponent) },
            nevent: { addNodeView: () => SvelteNodeViewRenderer(MySvelteNEventComponent) },
            naddr: { addNodeView: () =>  SvelteNodeViewRenderer(MySvelteNaddrComponent) },
            image: { addNodeView: () => SvelteNodeViewRenderer(MySvelteImageComponent) },
            video: { addNodeView: () => SvelteNodeViewRenderer(MySvelteVideoComponent) },
            tweet: { addNodeView: () => SvelteNodeViewRenderer(MySvelteTweetComponent) },
          },
        }),
      ],
      content: '',
      onUpdate: () => {
        contentSchema = editor.getJSON()
        contentText = editor.getText()
      },
      onTransaction: () => {
        editor = editor
      },
    })
  })

  onDestroy(() => {
    if (editor) {
      editor.destroy()
    }
  })
</script>

<main>
  <div bind:this={element} />
</main>
```

## Rendering node views

nostr-editor is framework-agnostic and **does not** ship with pre-built components (yet). You should provide your own React or Svelte components for each extension.


```ts
NostrExtension.configure({
  extend: {
    nprofile: { addNodeView: () => ReactNodeViewRenderer(MyReactMentionComponent) },
    ...
  },
}),
```

```ts
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'

export function MyReactMentionComponent(props: NodeViewProps) {
  const { pubkey, relays } = props.node.attrs
  const { getProfile } = useNDK() // nostr-tools or other nostr client library
  return (
    <NodeViewWrapper as='span'>
      @{getProfile(pubkey).display_name}
    </NodeViewWrapper>
  )
}
```

## Image Upload

To handle image uploads with nostr-editor, you can configure the extension as follows:

```ts
NostrExtension.configure({
  image: {
    defaultUploadUrl: 'https://nostr.build',
    defaultUploadType: 'nip96', // or blossom
  },
  video: {
    defaultUploadUrl: 'https://nostr.build',
    defaultUploadType: 'nip96', // or blossom
  },
  fileUpload: {
    immediateUpload: true, // It will automatically upload when a file is added to the editor, if false, call `editor.commands.uploadFiles()` manually
    sign: async (event) => {
      if ('nostr' in window) {
        const nostr = window.nostr as NostrExtension
        return await nostr.signEvent(event)
      }
    },
    onDrop() {
      // File added to the editor
    },
    onComplete() {
      // All files were successfully uploaded
    },
  },
}),
```

Trigger a input type='file' popup

## Parsing existing notes

You can set the editor an existing nostr event in order to parse it's contents

```ts

const event = {
  kind: 1,
  content: 'Hello nostr:nprofile1qy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcprfmhxue69uhhyetvv9ujuem9w3skccne9e3k7mf0wccsqgxxvqas78x0a339m8qgkaf7fam5atmarne8dy3rzfd4l4x6w2qpncmfs8zh'
  ...
}

editor.commands.setEventContent(event)
editor.getJSON()
```

Response

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Hello " },
        {
          "type": "nprofile",
          "attrs": {
            "nprofile": "nostr:nprofile1qy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcprfmhxue69uhhyetvv9ujuem9w3skccne9e3k7mf0wccsqgxxvqas78x0a339m8qgkaf7fam5atmarne8dy3rzfd4l4x6w2qpncmfs8zh",
            "pubkey": "c6603b0f1ccfec625d9c08b753e4f774eaf7d1cf2769223125b5fd4da728019e",
            "relays": ["wss://nos.lol/", "wss://relay.damus.io/", "wss://relay.getalby.com/v1"]
          }
        }
      ]
    }
  ]
}
```

### Parsing existing long-form content notes

The same thing as a normal note, just make sure your added the Markdown extension from [tiptap-markdown](https://github.com/aguingand/tiptap-markdown)

```ts
import { Markdown } from 'tiptap-markdown'

const editor = useEditor({
  autofocus: true,
  extensions: [
    StarterKit,
    Markdown.configure({
      transformCopiedText: true,
      transformPastedText: true,
    }),
    NostrExtension.configure({
      link: { autolink: true }, // needed for markdown links
    }),
  ],
})
```

## Commands

nostr-editor provides several commands to insert various types of content and manage media uploads.

#### insertNevent

```ts
editor.commands.insertNEvent({ nevent: 'nostr:nevent1...' })
```

#### insertNprofile

```ts
editor.commands.insertNProfile({ nprofile: 'nostr:nprofile1...' })
```

#### insertNAddr

```ts
editor.commands.insertNAddr({ naddr: 'nostr:naddr1...' })
```

#### insertBolt11

```ts
editor.commands.insertBolt11({ lnbc: 'lnbc...' })
```

#### selectFiles

Triggers a input type='file' click

```ts
editor.commands.selectFiles()
```

#### uploadFiles

Upload all pending images and videos,

```ts
editor.commands.uploadFiles()
```

This command returns `true` when the upload starts, not when the upload is completed. You can use `onComplete()` callback in the fileUpload extension options.

```ts
  const editor = useEditor({
    extensions: [
      NostrExtension.configure({
        fileUpload: {
          onComplete: () => console.log('All files uploaded')
        }
      })
    ]
  })
```

Note: all `nostr:` prefixes are optional

## Roadmap

- Add support for Asciidoc
- Issue [#2](https://github.com/cesardeazevedo/nostr-editor/issues/2)
- Implement collaborative editing features with [Yjs](https://tiptap.dev/docs/collaboration/getting-started/install)

## References

- [tiptap docs](https://tiptap.dev/docs/editor/getting-started/overview)
- [prosemirror docs](https://prosemirror.net/docs/guide/#intro)
- [tiptap-markdown](https://github.com/aguingand/tiptap-markdown)
- [svelte-tiptap](https://github.com/sibiraj-s/svelte-tiptap)
- [nip19 - bech32-encoded entities](https://github.com/nostr-protocol/nips/blob/master/19.md)
- [nip94 - File Integration](https://github.com/nostr-protocol/nips/blob/master/94.md)
- [nip96 - HTTP File Storage Integration](https://github.com/nostr-protocol/nips/blob/master/96.md)
- [blossom](https://github.com/hzrd149/blossom)

## License

[MIT](License.md)

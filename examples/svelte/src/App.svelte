<script lang="ts">
  import { JsonView } from '@zerodevx/svelte-json-view'
  import { IconBrandGithubFilled } from '@tabler/icons-svelte'
  import { onMount, onDestroy } from 'svelte'
  import { NostrExtension } from 'nostr-editor'
  import { Editor, type JSONContent } from '@tiptap/core'
  import StarterKit from '@tiptap/starter-kit'
  import { SvelteNodeViewRenderer } from 'svelte-tiptap'
  import MentionEditor from './lib/Mention/MentionEditor.svelte'
  import NEventEditor from './lib/NEvent/NEventEditor.svelte'

  let element: HTMLDivElement
  let editor: Editor
  let raw: string = ''
  let snapshot: JSONContent

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [
        StarterKit,
        NostrExtension.configure({
          extend: {
            nprofile: {
              addNodeView: () => SvelteNodeViewRenderer(MentionEditor),
            },
            nevent: {
              inline: true,
              group: "inline",
              addNodeView: () => SvelteNodeViewRenderer(NEventEditor),
            },
          },
        }),
      ],
      content: '',
      onUpdate: () => {
        snapshot = editor.getJSON()
        raw = editor.getText()
      },
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
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
  <div class="flex flex-row">
    <div class="fixed overflow-y-auto h-full w-1/2 p-4">
      <div class="flex flex-row items-center justify-between bg-black text-white py-1 px-4 rounded-tl-lg rounded-tr-lg">
        <h4 class="bg-white/20 inline px-2 rounded-full pb-0.5">nostr-editor</h4>
        <a
          href="https://github.com/cesardeazevedo/nostr-editor"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-row items-center no-underline px-2 bg-white/20 rounded-full p-0.5 text-inherit">
          <IconBrandGithubFilled class="mr-1" size={20} stroke-width="1.5" />
          Github
        </a>
      </div>
      <div class="mb-2 z-20 relative border border-gray-100 border-solid rounded-bl-2xl rounded-br-2xl p-8">
        <div bind:this={element} class="text-lg font-normal" />
      </div>
    </div>
  </div>
  <nav class="fixed overflow-y-auto h-full right-0 w-1/2 bg-gray-100 p-4">
    <pre class="break-all mt-2 text-wrap">{raw}</pre>
    <br />
    <JsonView json={snapshot} />
  </nav>
</main>

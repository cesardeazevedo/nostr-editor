<script lang="ts">
  import type { NodeViewProps, NodeViewRendererProps } from '@tiptap/core'
  import type { NEventAttributes } from 'nostr-editor'
  import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap'
  import NEvent from './NEvent.svelte'

  export let node: NodeViewProps['node']

  $: attrs = node.attrs as NEventAttributes
</script>

<NodeViewWrapper data-type="nevent" as="span">
  <NEvent id={attrs.id} relays={attrs.relays} nevent={attrs.nevent} />
</NodeViewWrapper>

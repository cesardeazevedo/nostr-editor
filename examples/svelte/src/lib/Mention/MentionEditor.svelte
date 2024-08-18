<script lang="ts">
  import type { NodeViewProps, NodeViewRendererProps } from '@tiptap/core'
  import type { NProfileAttributes } from 'nostr-editor'
  import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap'
  import Mention from './Mention.svelte'

  export let node: NodeViewProps['node']
  export let updateAttributes: NodeViewProps['updateAttributes']
  // export let deleteNode: NodeViewRendererProps['deleteNode']

  $: attrs = node.attrs as NProfileAttributes
</script>

<NodeViewWrapper data-type="mention" as="span">
  <Mention pubkey={attrs.pubkey} relays={attrs.relays} />
</NodeViewWrapper>

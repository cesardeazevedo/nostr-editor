<script lang="ts">
  import { onMount } from 'svelte'
  import { pool } from '../../nostr'
  import type { NostrEvent } from 'nostr-tools/core'

  export let id: string
  export let nevent: string
  export let relays: string[]

  let event: any = null

  onMount(async () => {
    const subscription = pool.subscribeMany(relays, [{ ids: [id] }], {
      onevent(e: NostrEvent) {
        event = e
      },
    })

    return () => subscription.close()
  })
</script>

<span
  data-tooltip={`
Id: ${id}
.
Relays: ${JSON.stringify(relays)}
`}>
  {#if event}
    <a href="#">{nevent.replace('nostr:', '').slice(0, 12)}: {event.content.slice(0, 20)}...</a>
  {:else}
    <span class="text-gray-600">loading</span>
  {/if}
</span>

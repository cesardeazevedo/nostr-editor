<script lang="ts">
  import { onMount } from 'svelte'
  import { pool } from '../../nostr'
  import type { NostrEvent } from 'nostr-tools/core'

  export let pubkey: string
  export let relays: string[]

  let profile: any = null
  let data: { display_name?: string; name?: string } | null = null

  async function fetchMention(pubkey: string, relays: string[]) {
    const subscription = pool.subscribeMany([...relays, 'wss://purplepag.es'], [{ kinds: [0], authors: [pubkey] }], {
      onevent(event: NostrEvent) {
        if (event.created_at >= (profile.created_at || 0)) {
          profile = event
          data = parseProfile(profile)
        }
      },
    })
    return () => subscription.close()
  }

  function parseProfile(profile: any) {
    if (profile) {
      return JSON.parse(profile.content || '{}')
    }
  }

  onMount(async () => {
    console.log('mount', pubkey, relays)
    profile = await fetchMention(pubkey, relays)
    console.log('parsed', data)
  })
</script>

<span
  data-tooltip={`
Pubkey: ${pubkey}
.
Relays: ${JSON.stringify(relays)}
`}>
  {#if data}
    <a href="#">@{data.display_name || data.name || ''}</a>
  {:else}
    <span class="text-gray-600">loading</span>
  {/if}
</span>

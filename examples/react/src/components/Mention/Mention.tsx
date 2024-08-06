import type { NProfileAttributes } from 'nostr-editor'
import { useMention, useProfileParsed } from '../../hooks/useMention'

type Props = NProfileAttributes

export function Mention(props: Props) {
  const { pubkey, relays } = props
  const profile = useMention(pubkey, relays)
  const data = useProfileParsed(profile)
  return (
    <span
      data-tooltip={`
Pubkey: ${pubkey}
.

Relays: ${JSON.stringify(relays)}
          `}>
      {data && <a>@{data.display_name || data.name || ''}</a>}
      {!data && <span className='text-gray-600'>loading</span>}
    </span>
  )
}

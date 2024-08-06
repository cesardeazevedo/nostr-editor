import type { NAddrAttributes } from 'nostr-editor'
import { useMention, useProfileParsed } from '../../hooks/useMention'

type Props = NAddrAttributes

export function NAddr(props: Props) {
  const { pubkey, identifier } = props
  const mention = useMention(pubkey)
  const profile = useProfileParsed(mention)
  return (
    <div className='border rounded-md p-2 pt-4 my-2'>
      <div className='flex flex-row'>
        <img src={profile?.picture} className='size-8 rounded-full' />
        <span className='ml-4'>{profile?.display_name || profile?.name}</span>
      </div>
      <div className='border rounded-md p-2 mt-2'>
        <h6>{identifier}</h6>
      </div>
    </div>
  )
}

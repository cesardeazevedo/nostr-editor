import type { NodeViewRendererProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import { useMention, useProfileParsed } from '../hooks/useMention'

export function Mention(props: NodeViewRendererProps) {
  const { pubkey, relays } = props.node.attrs
  const profile = useMention(pubkey, relays)
  const data = useProfileParsed(profile)
  return (
    <>
      <NodeViewWrapper as='span'>
        <span
          data-tooltip={`
Pubkey: ${pubkey}
.

Relays: ${JSON.stringify(relays)}
          `}>
          {data && <a>@{data.display_name || data.name || ''}</a>}
          {!data && <span className='text-gray-600'>loading</span>}
        </span>
      </NodeViewWrapper>
    </>
  )
}

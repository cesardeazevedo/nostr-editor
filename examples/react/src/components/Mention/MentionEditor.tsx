import type { NodeViewRendererProps } from '@tiptap/core'
import type { NProfileAttributes } from 'nostr-editor'
import { NodeViewWrapper } from '@tiptap/react'
import { Mention } from './Mention'

export function MentionEditor(props: NodeViewRendererProps) {
  return (
    <>
      <NodeViewWrapper as='span'>
        <Mention {...(props.node.attrs as NProfileAttributes)} />
      </NodeViewWrapper>
    </>
  )
}

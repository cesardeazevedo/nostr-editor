import type { BlockQuoteNode } from 'nostr-editor'
import React from 'react'
import Paragraph from './Paragraph'

type Props = {
  node: BlockQuoteNode
}

export default function BlockQuote(props: Props) {
  return (
    <div className='ml-2 my-4 px-2 py-1 border-l-4 border-gray-200 italic text-gray-600'>
      {props.node.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'paragraph' && <Paragraph node={node} />}
        </React.Fragment>
      ))}
    </div>
  )
}

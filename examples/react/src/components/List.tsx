import type { BulletListNode, OrderedListNode } from 'nostr-editor'
import React from 'react'
import Paragraph from './Paragraph'
import CodeBlock from './CodeBlock'

type Props = {
  type: 'ol' | 'ul'
  node: OrderedListNode | BulletListNode
}

function List(props: Props) {
  const { type, node } = props
  const ListComponent = type
  return (
    <ListComponent>
      {node.content.map((item, index) => (
        <li key={item.type + index}>
          {item.content.map((node, index) => (
            <React.Fragment key={node.type + index}>
              {node.type === 'paragraph' && <Paragraph node={node} />}
              {node.type === 'codeBlock' && <CodeBlock node={node} />}
            </React.Fragment>
          ))}
        </li>
      ))}
    </ListComponent>
  )
}

export default List

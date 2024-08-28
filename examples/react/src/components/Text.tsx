import type { Mark, BlockQuoteNode, HeadingNode, ParagraphNode, TextNode } from 'nostr-editor'
import React from 'react'
import { Mention } from './Mention/Mention'

type Props = {
  node: TextNode
}

function Text(props: Props) {
  const { text, marks = [] } = props.node
  return (
    <>
      {marks.reduce(
        (content, mark: Mark) => {
          switch (mark.type) {
            case 'bold':
              return <b>{content}</b>
            case 'italic':
              return <i>{content}</i>
            case 'strike':
              return <s>{content}</s>
            case 'code':
              return <span className='px-2 rounded-lg text-nowrap bg-gray-200'>{content}</span>
            case 'tag':
              return <a href='#'>{content}</a>
            case 'link':
              return (
                <a href={mark.attrs.href} target='_blank' rel='noopener noreferrer'>
                  {content}
                </a>
              )
            default:
              return content
          }
        },
        <span>{text}</span>,
      )}
    </>
  )
}

export function TextContent(props: { node: ParagraphNode | HeadingNode | BlockQuoteNode }) {
  return (
    <>
      {props.node.content?.map((node, index) => (
        <React.Fragment key={node.type + index}>
          {node.type === 'nprofile' && <Mention {...node.attrs} />}
          {node.type === 'text' && <Text node={node} />}
          {node.type === 'hardBreak' && <div className='mt-4' />}
        </React.Fragment>
      ))}
    </>
  )
}

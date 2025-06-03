import type { ContentSchema } from 'nostr-editor'
import React from 'react'
import BlockQuote from './BlockQuote'
import CodeBlock from './CodeBlock'
import Heading from './Heading'
import { Image } from './Image/Image'
import List from './List'
import { NEvent } from './NEvent/Nevent'
import Paragraph from './Paragraph'
import { Tweet } from './Tweet/Tweet'
import { Video } from './Video/Video'
import { Youtube } from './Youtube/Youtube'

type Props = {
  schema: ContentSchema
}

export const Content = function Content(props: Props) {
  const { schema } = props
  return (
    <>
      {schema.content.map((node, index) => {
        return (
          <React.Fragment key={node.type + index}>
            {node.type === 'heading' && <Heading node={node} />}
            {node.type === 'paragraph' && <Paragraph node={node} />}
            {node.type === 'horizontalRule' && <hr className='mt-6 mb-6' />}
            {node.type === 'image' && <Image src={node.attrs.src} tags={node.attrs.tags} />}
            {node.type === 'video' && <Video src={node.attrs.src} tags={node.attrs.tags} />}
            {node.type === 'nevent' && <NEvent {...node.attrs} />}
            {node.type === 'orderedList' && <List type='ol' node={node} />}
            {node.type === 'bulletList' && <List type='ul' node={node} />}
            {node.type === 'codeBlock' && <CodeBlock node={node} />}
            {node.type === 'blockquote' && <BlockQuote node={node} />}
            {node.type === 'tweet' && <Tweet src={node.attrs.src} />}
            {node.type === 'youtube' && <Youtube src={node.attrs.src} />}
          </React.Fragment>
        )
      })}
    </>
  )
}

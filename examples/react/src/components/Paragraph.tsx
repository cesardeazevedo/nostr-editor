import type { ParagraphNode } from 'nostr-editor'
import { TextContent } from './Text'

type Props = {
  node: ParagraphNode
}

export default function Paragraph(props: Props) {
  return (
    <div className='mt-2 ml-2'>
      <TextContent node={props.node} />
    </div>
  )
}

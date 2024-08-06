import type { HeadingNode } from 'nostr-editor'
import { TextContent } from './Text'

type Props = {
  node: HeadingNode
}

const levels: Record<number, string> = {
  1: 'text-3xl',
  2: 'text-2xl',
  3: 'text-xl',
  4: 'text-lg',
  5: 'text-lg',
  6: 'text-lg',
}

export default function Heading(props: Props) {
  return (
    <div className={`mt-8 ml-2 ${levels[props.node.attrs.level] || ''}`}>
      <TextContent node={props.node} />
    </div>
  )
}

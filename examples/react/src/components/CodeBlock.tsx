import { IconCheck, IconCopy } from '@tabler/icons-react'
import type { CodeBlockNode } from 'nostr-editor'
import React, { useCallback, useRef, useState } from 'react'

type Props = {
  node: CodeBlockNode
}

function CodeBlock(props: Props) {
  const refPre = useRef<HTMLPreElement | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (refPre.current) {
      navigator.clipboard.writeText(refPre.current?.innerText).then(() => {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
    }
  }, [])

  return (
    <div className='mx-2 pr-6 rounded-lg bg-gray-200 relative'>
      <pre className='my-1 py-2 px-2 overflow-scroll' ref={refPre}>
        {props.node.content.map((node, index) => (
          <React.Fragment key={node.type + index}>{node.type === 'text' && node.text}</React.Fragment>
        ))}
      </pre>
      <div className='absolute top-0 right-0'>
        <button className='p-4' onClick={handleCopy}>
          {copied ? <IconCheck size={20} strokeWidth='1.5' /> : <IconCopy size={20} strokeWidth='1.5' />}
        </button>
      </div>
    </div>
  )
}
export default CodeBlock

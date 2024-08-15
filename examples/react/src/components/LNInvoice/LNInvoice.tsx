import { IconBolt, IconCheck, IconCopy } from '@tabler/icons-react'
import type { NodeViewProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import { useCallback, useMemo, useState } from 'react'

export const LNInvoice = function LNInvoice(props: NodeViewProps) {
  const { bolt11, lnbc } = props.node.attrs
  const [copied, setCopied] = useState(false)

  const amount = useMemo(() => {
    return (bolt11.sections.find((x: { name: string }) => x.name === 'amount')?.value || 0) / 1000
  }, [bolt11])

  const expired = useMemo(() => {
    const timestamp = bolt11.sections.find((x: { name: string }) => x.name === 'timestamp')?.value
    return Date.now() > (timestamp + bolt11.expiry) * 1000
  }, [bolt11])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(lnbc).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    })
  }, [lnbc])

  return (
    <NodeViewWrapper data-drag-handle='' draggable={props.node.type.spec.draggable}>
      <div
        className={`relative my-2 bg-gray-100 border-gray-200 border border-solid py-8 px-8 rounded-xl ${props.selected ? 'opacity-60' : ''}`}>
        <button className='absolute right-4 top-4' onClick={() => handleCopy()}>
          {copied && <IconCheck size={20} strokeWidth='2.5' className='text-green-600' />}
          {!copied && <IconCopy size={20} />}
        </button>
        <h3 className='flex flex-row items-center'>
          <IconBolt strokeWidth='1.4' size={34} className='mr-4 bg-gray-200 rounded-full p-1 text-purple-500' />
          Lightning Invoice
        </h3>
        <h1 className='mt-12'>{amount} SATS</h1>
        {expired && 'expired'}
      </div>
    </NodeViewWrapper>
  )
}

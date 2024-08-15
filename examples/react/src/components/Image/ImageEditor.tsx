import { IconCheck } from '@tabler/icons-react'
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import type { ImageAttributes } from 'nostr-editor'
import { AltButton } from '../AltChip'
import { DeleteButton } from '../DeleteButton'
import { MediaFooter } from '../MediaFooter'
import { UploadChip } from '../UploadChip'
import { UploadingProgress } from '../UploadingProgress'
import { Image } from './Image'

export function ImageEditor(props: NodeViewProps) {
  const { src, alt, uploadUrl, uploadType, uploading, sha256 } = props.node.attrs as ImageAttributes
  return (
    <NodeViewWrapper
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      className={`relative my-2 [&>img]:m-0 w-fit h-fit ${props.selected ? 'opacity-90' : ''}`}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <UploadingProgress uploading={uploading} />
      <Image src={src} />
      <MediaFooter>
        <AltButton value={alt} onChange={(alt) => props.updateAttributes({ alt })} />
        {!sha256 && (
          <UploadChip
            uploadType={uploadType}
            uploadUrl={uploadUrl}
            onChange={(uploadType, uploadUrl) => {
              props.updateAttributes({ uploadType, uploadUrl })
            }}
          />
        )}
        {sha256 && (
          <IconCheck
            size={26}
            strokeWidth='2.5'
            className='p-1 flex flex-row justify-between rounded-full border border-white/20 bg-black text-green-300 text-xs right-2 bottom-2 z-50'
          />
        )}
      </MediaFooter>
    </NodeViewWrapper>
  )
}

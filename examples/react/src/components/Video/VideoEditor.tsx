import { IconCheck } from '@tabler/icons-react'
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/react'
import type { VideoAttributes } from 'nostr-editor'
import { AltButton } from '../AltChip'
import { DeleteButton } from '../DeleteButton'
import { MediaFooter } from '../MediaFooter'
import { UploadChip } from '../UploadChip'
import { UploadingProgress } from '../UploadingProgress'
import { Video } from './Video'

export function VideoEditor(props: NodeViewProps) {
  const { src, alt, sha256, uploadType, uploadUrl, uploading } = props.node.attrs as VideoAttributes
  return (
    <NodeViewWrapper
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      className={`relative w-fit h-fit [&>video]:m-0 ${props.selected ? 'opacity-90' : ''}`}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <UploadingProgress uploading={uploading} />
      <Video controls={false} src={src} />
      <MediaFooter>
        <AltButton value={alt} onChange={(alt) => props.updateAttributes({ alt })} />
        {!sha256 && (
          <UploadChip
            uploadType={uploadType}
            uploadUrl={uploadUrl}
            onChange={(uploadType, uploadUrl) => props.updateAttributes({ uploadType, uploadUrl })}
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

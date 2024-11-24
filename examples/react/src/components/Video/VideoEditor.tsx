import { IconCheck, IconFileX } from '@tabler/icons-react'
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
  const { src, alt, uploadError, uploadUrl, uploading } = props.node.attrs as VideoAttributes
  const isUploaded = !src.startsWith('blob://http')
  return (
    <NodeViewWrapper
      data-drag-handle=''
      draggable={props.node.type.spec.draggable}
      className={`relative w-fit h-fit ${props.selected ? 'opacity-90' : ''}`}>
      <DeleteButton onClick={() => props.deleteNode()} />
      <UploadingProgress uploading={uploading} />
      <Video controls={false} src={src} />
      <MediaFooter>
        {!isUploaded ? <AltButton value={alt} onChange={(alt) => props.updateAttributes({ alt })} /> : <div />}
        {!isUploaded && (
          <UploadChip
            uploadUrl={uploadUrl}
            onChange={(uploadType, uploadUrl) => props.updateAttributes({ uploadType, uploadUrl })}
          />
        )}
        {isUploaded && (
          <span data-tooltip={src}>
            <IconCheck
              size={26}
              strokeWidth='2.5'
              className='p-1 flex flex-row justify-between rounded-full border border-white/20 bg-black text-green-300 text-xs right-2 bottom-2 z-50'
            />
          </span>
        )}
        {uploadError && (
          <span data-tooltip={uploadError} className=''>
            <IconFileX
              size={28}
              strokeWidth='1.5'
              className='border border-white/20 bg-black rounded-full py-1 ml-1 text-red-500 relative top-0'
            />
          </span>
        )}
      </MediaFooter>
    </NodeViewWrapper>
  )
}

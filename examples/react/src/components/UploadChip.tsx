import { IconChevronDown } from '@tabler/icons-react'
import Tippy from '@tippyjs/react'
import type { UploadParams } from 'nostr-editor'
import { useMemo, useState } from 'react'

type Props = {
  uploadUrl: string
  onChange: (type: UploadParams['type'], url: string) => void
}

const nip96urls = ['https://nostr.build', 'https://nostrcheck.me', 'https://nostrage.com']

const blossomurls = ['https://cdn.satellite.earth']

function Item(props: { url: string; onClick: () => void }) {
  const { url, onClick } = props
  return (
    <li key={url} className='cursor-pointer w-full py-1 pl-2 hover:bg-white/10' onClick={() => onClick()}>
      {url}
    </li>
  )
}

export function UploadChip(props: Props) {
  const [open, setOpen] = useState(false)
  const { uploadUrl, onChange } = props
  const service = useMemo(() => new URL(uploadUrl), [uploadUrl]).hostname
  return (
    <>
      <Tippy
        interactive
        placement='bottom-end'
        visible={open}
        className='relative'
        onClickOutside={() => setOpen(false)}
        content={
          <div
            className='pt-2 bg-black text-white text-sm rounded-lg min-h-12 w-48 z-50 relative'
            style={{ zIndex: 1000000, position: 'relative' }}>
            <span className='p-2 font-bold'>NIP-96 Servers</span>
            <ul className='m-0 mb-1 list-none'>
              {nip96urls.map((url) => (
                <Item
                  key={url}
                  url={url}
                  onClick={() => {
                    onChange('nip96', url)
                    setOpen(false)
                  }}
                />
              ))}
            </ul>
            <span className='p-2 font-bold'>Blossom Servers:</span>
            <ul className='m-0 mb-1 list-none'>
              {blossomurls.map((url) => (
                <Item
                  key={url}
                  url={url}
                  onClick={() => {
                    onChange('blossom', url)
                    setOpen(false)
                  }}
                />
              ))}
            </ul>
          </div>
        }>
        <button
          className='py-1 px-2 rounded-full border border-white/20 bg-black text-white'
          onClick={(e) => {
            setOpen(!open)
            e.preventDefault()
          }}>
          <span className='text-sm flex flex-row items-center text-ellipsis overflow-hidden max-w-28'>
            {service} <IconChevronDown size={16} />
          </span>
        </button>
      </Tippy>
    </>
  )
}

import { useState } from 'react'

type Props = {
  value: string
  onChange: (text: string) => void
}

export function AltButton(props: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div
        className={`absolute transition-all ease-in duration-100 z-40 flex left-0 top-0 right-0 bottom-0 text-center items-center justify-center rounded-lg ${open ? 'bg-black/70' : ''} text-white ${!open ? 'pointer-events-none' : ''}`}>
        {open && (
          <textarea
            autoFocus
            value={props.value}
            className='bg-transparent mx-4 w-full outline-none text-sm h-28 mt-14 resize-none'
            placeholder='Alt description'
            onChange={(e) => props.onChange(e.currentTarget.value)}
          />
        )}
      </div>
      <div className='w-full'>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={`relative py-1 px-2 bg-black/80 border border-white/20 rounded-full ${open ? 'text-white' : 'text-gray-200'} z-50 text-xs`}>
          Alt
        </button>
      </div>
    </>
  )
}

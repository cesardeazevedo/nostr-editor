import { IconX } from '@tabler/icons-react'

type Props = {
  onClick: () => void
}

export function DeleteButton(props: Props) {
  return (
    <button
      className='absolute bg-black/80 p-1 right-2 top-2 rounded-full text-white z-10'
      onClick={() => props.onClick()}>
      <IconX strokeWidth='2.0' size={18} />
    </button>
  )
}

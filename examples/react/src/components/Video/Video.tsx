import { useMemo } from 'react'

type Props = {
  src: string
}

export function Video(props: Props) {
  const { src } = props
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  return (
    <video src={src} controls style={{ maxHeight: 400 }}>
      <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
    </video>
  )
}

import { useMemo } from 'react'

type Props = {
  src: string
  controls?: boolean
}

export function Video(props: Props) {
  const { src, controls = true } = props
  const extension = useMemo(() => new URL(src).pathname.split('.').pop(), [src])
  return (
    <video
      autoPlay
      loop
      muted
      controls={controls}
      src={src}
      className='my-2 rounded-lg z-auto'
      style={{ maxHeight: 400 }}>
      <source src={src} type={`video/${extension === 'mov' ? 'mp4' : extension}`} />
    </video>
  )
}

import { useMemo } from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

type Props = {
  src: string
}

export function Youtube(props: Props) {
  const { src } = props

  const embedId = useMemo(() => {
    const url = new URL(src)
    const value = url.host === 'youtu.be' ? url.pathname : new URLSearchParams(url.search).get('v')
    return value?.replace(/^\//, '')
  }, [src])

  return (
    <div>
      <style>
        {`
        .lty-playbtn {
          border: none;
          border-radius: 16%;
        }
      `}
      </style>
      {embedId && (
        <div className='overflow-hidden rounded-lg'>
          <LiteYouTubeEmbed id={embedId} title='' />
        </div>
      )}
    </div>
  )
}

import { useMemo } from 'react'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

const REGEX_VIDEO_ID = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/

type Props = {
  src: string
}

export function Youtube(props: Props) {
  const { src } = props

  const embedId = useMemo(() => {
    return src.match(REGEX_VIDEO_ID)?.[1]
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

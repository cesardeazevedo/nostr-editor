import { Tweet as ReactTweet } from 'react-tweet'

type Props = {
  src: string
}

export function Tweet(props: Props) {
  const { src } = props
  const id = src.slice(src.lastIndexOf('/') + 1)
  return <ReactTweet id={id} />
}

type Props = {
  src: string
}

export function Image(props: Props) {
  const { src } = props
  return (
    <>
      <img src={src} className='rounded-lg max-h-80 mb-2' />
    </>
  )
}

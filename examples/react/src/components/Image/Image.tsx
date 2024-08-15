type Props = {
  src: string
}

export function Image(props: Props) {
  const { src } = props
  return (
    <>
      <img src={src} className='max-h-80 rounded-lg my-2' />
    </>
  )
}

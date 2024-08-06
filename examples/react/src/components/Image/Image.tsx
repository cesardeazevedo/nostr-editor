type Props = {
  src: string
}

export function Image(props: Props) {
  const { src } = props
  return (
    <>
      <img src={src} />
    </>
  )
}

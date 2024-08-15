import React from 'react'

type Props = {
  children: React.ReactNode
}

export function MediaFooter(props: Props) {
  return (
    <div className='absolute bottom-0 left-0 right-0 top-0 flex flex-row items-end justify-between p-2'>
      {props.children}
    </div>
  )
}

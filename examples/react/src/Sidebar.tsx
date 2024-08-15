import React from 'react'

type Props = {
  children: React.ReactNode
}

export function Sidebar(props: Props) {
  return <nav className='fixed overflow-y-auto h-full right-0 w-1/2 bg-gray-100 p-4'>{props.children}</nav>
}

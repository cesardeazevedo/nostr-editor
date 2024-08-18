import React from 'react'

type Props = {
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
  children: React.ReactNode
}

export function MenuButton(props: Props) {
  return (
    <button
      disabled={props.disabled}
      className={`rounded-lg p-1 mb-1 mr-1 text-sm bg-gray-100  ${props.isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200'} disabled:line-through disabled:bg-gray-50`}
      onClick={props.onClick}>
      {props.children}
    </button>
  )
}

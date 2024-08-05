import type { NostrEvent } from 'nostr-tools'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useSearch } from '../hooks/useSearch'

type Props = {
  query: string
  command: (event: NostrEvent) => void
}

const Suggestions = forwardRef(function Suggestions(props: Props, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const items = useSearch(props.query)

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className='flex flex-col items-start bg-white py-1 rounded-lg border border-solid border-gray-300'>
      {items.map((item, index) => {
        const { name, display_name } = JSON.parse(item.content)
        return (
          <div
            className={`px-3 py-2 w-full text-left justify-start items-start hover:bg-gray-100 cursor-pointer ${index === selectedIndex ? 'bg-gray-100' : ''}`}
            key={index}
            onClick={() => selectItem(index)}>
            {display_name || name}
          </div>
        )
      })}
    </div>
  )
})

export default Suggestions

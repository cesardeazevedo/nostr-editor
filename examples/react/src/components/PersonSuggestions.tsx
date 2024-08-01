export function PersonSuggestions({query, command, loading, items, index}) {
  console.log({query, command, loading, items})
  return loading
    ? <div>loading...</div>
    : <div className="bg-white py-1 rounded-lg border border-solid border-gray-300">
        {items.slice(0, 10).map((item, i) => {
          const className = `px-3 py-2 hover:bg-gray-100 cursor-pointer ${index === i ? 'bg-gray-100' : ''}`
          const {name, display_name} = JSON.parse(item.content)

          return <div className={className} onClick={() => command(item)} key={item.id}>
            {name || display_name}
          </div>
        })}
      </div>
}

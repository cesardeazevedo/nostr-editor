import type { Icon, IconProps } from '@tabler/icons-react'

type Props = {
  label: string
  defaultChecked?: boolean
  icon?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>
  onChange: (value: boolean) => void
}

export function Switch(props: Props) {
  const { defaultChecked = true } = props
  const Icon = props.icon
  return (
    <label className='w-full mb-4 flex items-center cursor-pointer justify-between'>
      <span className='text-sm font-medium text-gray-900 flex flex-row align-center justify-center'>
        {Icon && <Icon strokeWidth='1.5' size={28} />} <span className='ml-4 leading-6'>{props.label}</span>
      </span>
      <input
        type='checkbox'
        defaultChecked={defaultChecked}
        onChange={(event) => props.onChange(event.target.checked)}
        className='sr-only peer'
      />
      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  )
}

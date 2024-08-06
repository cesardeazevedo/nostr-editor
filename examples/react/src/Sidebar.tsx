import {
  IconAt,
  IconBolt,
  IconBrandX,
  IconBrandYoutube,
  IconExternalLink,
  IconHash,
  IconLink,
  IconMovie,
  IconPassword,
  IconPhoto,
  IconQuote,
} from '@tabler/icons-react'

import { Switch } from './components/settings/Switch'
import type { EditorType } from './types'

type Props = {
  type: EditorType
  onChangeEditor: (type: 'text' | 'markdown') => void
  onChangeExtensions: (name: string, value: boolean) => void
}

export function Sidebar(props: Props) {
  const handleChange = (name: string) => (value: boolean) => {
    props.onChangeExtensions(name, value)
  }

  const activeColor = (value: EditorType) => (props.type === value ? 'bg-blue-500 text-white' : 'bg-gray-200')

  return (
    <nav className='fixed h-full right-0 w-5 bg-gray-100 px-8 py-14' style={{ width: 400 }}>
      <h3>Settings</h3>
      <div className='my-4'>
        <button
          className={`rounded-full px-3 mr-1 ${activeColor('text')}`}
          onClick={() => props.onChangeEditor('text')}>
          Text
        </button>
        <button
          className={`rounded-full px-3 mr-1 ${activeColor('markdown')}`}
          onClick={() => props.onChangeEditor('markdown')}>
          Markdown
        </button>
        <button className='rounded-full px-3 mr-1 bg-gray-100'>Asciidoc (soon)</button>
      </div>
      <h3>Extensions</h3>
      <div className='mt-4'>
        <Switch icon={IconQuote} label='nevent1' onChange={handleChange('nevent1')} />
        <Switch icon={IconAt} label='nprofile1' onChange={handleChange('nprofile1')} />
        <Switch icon={IconExternalLink} label='naddr1' onChange={handleChange('naddr1')} />
        <Switch icon={IconLink} label='Links' onChange={handleChange('links')} />
        <Switch icon={IconPhoto} label='Images' onChange={handleChange('images')} />
        <Switch icon={IconHash} label='Tags' onChange={handleChange('tags')} />
        <Switch icon={IconMovie} label='Videos' onChange={handleChange('videos')} />
        <Switch icon={IconBrandYoutube} label='Youtube' onChange={handleChange('youtube')} />
        <Switch icon={IconBrandX} label='Tweets' onChange={handleChange('tweet')} />
        <Switch icon={IconPassword} label='NsecReject' onChange={handleChange('nsecReject')} />
        <Switch icon={IconBolt} label='Bolt11' onChange={handleChange('bolt11')} />
      </div>
    </nav>
  )
}

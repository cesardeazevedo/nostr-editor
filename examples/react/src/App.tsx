import FocusExtension from '@tiptap/extension-focus'
import ImageExtension from '@tiptap/extension-image'
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { NostrMatcherExtension } from 'nostr-editor'
import { useCallback, useState } from 'react'
import ReactJsonView from 'react-json-view'
import { Image } from './components/Image'
import { Mention } from './components/Mention'
import { NEvent } from './components/NEvent'
import { LinkExtension } from './extensions/LinkExtension'
import { NEventExtension } from './extensions/NEventExtension'
import { NProfileExtension } from './extensions/NProfileExtension'
import { TagExtension } from './extensions/TagExtension'
import { VideoExtension } from './extensions/VideoExtension'

const extensions = [
  StarterKit.configure(),
  FocusExtension,
  NostrMatcherExtension,
  LinkExtension,
  TagExtension,
  VideoExtension,
  ImageExtension.extend({ addNodeView: () => ReactNodeViewRenderer(Image) }),
  NProfileExtension.extend({ addNodeView: () => ReactNodeViewRenderer(Mention) }),
  NEventExtension.extend({ addNodeView: () => ReactNodeViewRenderer(NEvent) }),
]

function App() {
  const editor = useEditor({
    extensions,
    onUpdate: () => {
      handleSnapshot()
    },
  })

  const [snapshot, setSnapshot] = useState({})

  const handleSnapshot = useCallback(() => {
    if (editor) {
      // ReactJsonView is buggy so we need to stringify and parse
      setSnapshot(JSON.parse(JSON.stringify(editor?.state.toJSON() || {})).doc.content)
    }
  }, [editor])

  return (
    <div className='w-3/4 relative'>
      <h1 className='text-xl'>nostr-editor</h1>
      <br />
      <h6>raw text</h6>
      <span id='raw' className='text-xs break-all text-wrap z-20 relative'>
        Hello
        nostr:nprofile1qy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcprfmhxue69uhhyetvv9ujuem9w3skccne9e3k7mf0wccsqgxxvqas78x0a339m8qgkaf7fam5atmarne8dy3rzfd4l4x6w2qpncmfs8zh
        and
        nostr:nprofile1qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qgmwaehxw309aex2mrp0yh8wetnw3jhymnzw33jucm0d5hsz9thwden5te0wfjkccte9ejxzmt4wvhxjme0qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gfnma0u
        and
        nostr:nprofile1qyfhwumn8ghj7ur4wfcxcetsv9njuetn9uqsuamnwvaz7tmwdaejumr0dshsz9mhwden5te0wfjkccte9ec8y6tdv9kzumn9wshsqgyzxs0cs2mw40xjhfl3a7g24ktpeur54u2mnm6y5z0e6250h7lx5gflu83m
        nostr:nevent1qvzqqqqqqypzplnld0r0wvutw6alsrd5q2k7vk2nug9j7glxd6ycyp9k8nzz2wdrqyg8wumn8ghj7mn0wd68ytnhd9hx2qg5waehxw309aex2mrp0yhxgctdw4eju6t0qyxhwumn8ghj7mn0wvhxcmmvqqs9gg4thq8ng87z8377jxksjwhk9dl0f8su9c4kq335ydzp0ykmv5gqt3csa
        image: https://image.nostr.build/87dbc55a6391d15bddda206561d53867a5679dd95e84fe8ed62bfe2e3adcadf3.jpg
      </span>
      <div className='mt-4 z-20 relative'>
        <EditorContent editor={editor} id='editor' />
        <small>
          Don't forget the{' '}
          <code>
            <b>nostr:</b>
          </code>{' '}
          prefix
        </small>
      </div>
      {snapshot && (
        <div className='text-left pl-5 mt-5'>
          <h1 className='mb-2'>Schema</h1>
          <ReactJsonView src={snapshot} />
        </div>
      )}
    </div>
  )
}

export default App

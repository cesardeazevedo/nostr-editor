import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { AnyExtension } from '@tiptap/react'
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { NostrMatcherExtension } from 'nostr-editor'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactJsonView from 'react-json-view'
import { Image } from './components/Image'
import { Mention } from './components/Mention'
import { NAddr } from './components/NAddr'
import { NEvent } from './components/NEvent'
import { Tweet } from './components/Tweet'
import { Video } from './components/Video'
import { LinkExtension } from './extensions/LinkExtension'
import { NAddrExtension } from './extensions/NAddressExtension'
import { NEventExtension } from './extensions/NEventExtension'
import { NProfileExtension } from './extensions/NProfileExtension'
import { TagExtension } from './extensions/TagExtension'
import { TweetExtension } from './extensions/TweetExtension'
import { VideoExtension } from './extensions/VideoExtension'
import { TestText } from './TestText'
import { Sidebar } from './Sidebar'
import type { EditorType, EditorExtensionSettings } from './types'

function App() {
  const [raw, setRaw] = useState('')
  const [type, setType] = useState<EditorType>('text')
  const [snapshot, setSnapshot] = useState({})
  const [settings, setSettings] = useState<EditorExtensionSettings>({
    nevent1: true,
    nprofile1: true,
    naddr1: true,
    links: true,
    images: true,
    tags: true,
    videos: true,
    youtube: true,
    tweet: true,
  })
  const extensions = useMemo(() => {
    const baseExtensions: AnyExtension[] = []

    if (type === 'text') {
      // Disabled markdown elements
      baseExtensions.push(
        StarterKit.configure({
          heading: false,
          bold: false,
          italic: false,
          strike: false,
          listItem: false,
          bulletList: false,
          orderedList: false,
          code: false,
          codeBlock: false,
          blockquote: false,
        }),
      )
    } else {
      // Markdown
      // StarterKit already bundles markdown elements
      baseExtensions.push(MarkdownExtension)
      baseExtensions.push(StarterKit)
    }

    baseExtensions.push(NostrMatcherExtension)

    if (settings.links) baseExtensions.push(LinkExtension)
    if (settings.tags) baseExtensions.push(TagExtension)
    if (settings.videos) baseExtensions.push(VideoExtension.extend({ addNodeView: () => ReactNodeViewRenderer(Video) }))
    if (settings.images)
      baseExtensions.push(
        ImageExtension.extend({
          addNodeView: () => ReactNodeViewRenderer(Image),
          renderText: (p) => p.node.attrs.src,
        }),
      )
    if (settings.youtube) baseExtensions.push(YoutubeExtension.extend({ renderText: (p) => p.node.attrs.src }))
    if (settings.tweet) baseExtensions.push(TweetExtension.extend({ addNodeView: () => ReactNodeViewRenderer(Tweet) }))
    if (settings.nprofile1)
      baseExtensions.push(NProfileExtension.extend({ addNodeView: () => ReactNodeViewRenderer(Mention) }))
    if (settings.nevent1)
      baseExtensions.push(NEventExtension.extend({ addNodeView: () => ReactNodeViewRenderer(NEvent) }))
    if (settings.naddr1) baseExtensions.push(NAddrExtension.extend({ addNodeView: () => ReactNodeViewRenderer(NAddr) }))

    return baseExtensions
  }, [type, settings])

  const prevContent = useRef('')

  const editor = useEditor(
    {
      extensions,
      onUpdate: () => {
        handleSnapshot()
      },
    },
    [extensions],
  )
  useEffect(() => {
    // Preserve the content when settings change
    editor?.commands.setContent(prevContent.current, true)
  }, [editor, prevContent])

  const handleSnapshot = useCallback(() => {
    if (editor) {
      prevContent.current = editor.getText()
      if (type === 'text') {
        setRaw(editor.getText())
      } else {
        setRaw(editor.storage.markdown.getMarkdown())
      }
      // ReactJsonView is buggy so we need to stringify and parse
      setSnapshot(JSON.parse(JSON.stringify(editor?.state.toJSON() || {})).doc.content)
    }
  }, [type, editor])

  const handleChangeEditor = useCallback(
    (type: EditorType) => {
      setType(type)
    },
    [type],
  )

  const handleChangeExtensions = useCallback(
    (name: string, value: boolean) => {
      setSettings({
        ...settings,
        [name]: value,
      })
    },
    [settings],
  )

  return (
    <div className='flex'>
      <main className='relative width-auto p-10' style={{ width: 'calc(100% - 400px)' }}>
        <h1>nostr-editor</h1>
        <br />
        <TestText />
        <div className='mt-2 z-20 relative'>
          <EditorContent editor={editor} id='editor' />
          <small>
            Don't forget the <code>nostr:</code>
            prefix
          </small>
        </div>
        {raw && (
          <>
            <h3>raw text</h3>
            <pre className='break-all text-wrap'>{raw}</pre>
          </>
        )}
        {snapshot && (
          <div className='text-left pl-5 mt-5'>
            <h3 className='mb-2'>Schema</h3>
            <ReactJsonView src={snapshot} />
          </div>
        )}
      </main>
      <Sidebar type={type} onChangeEditor={handleChangeEditor} onChangeExtensions={handleChangeExtensions} />
    </div>
  )
}

export default App

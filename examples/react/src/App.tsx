import { PluginKey } from '@tiptap/pm/state'
import type { AnyExtension } from '@tiptap/react'
import { EditorContent, ReactNodeViewRenderer, ReactRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Suggestion from '@tiptap/suggestion'
import { NostrExtension } from 'nostr-editor'
import { nip19 } from 'nostr-tools'
import { useCallback, useMemo, useRef, useState } from 'react'
import ReactJsonView from 'react-json-view'
import type { Instance } from 'tippy.js'
import tippy from 'tippy.js'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { ImageEditor } from './components/Image/ImageEditor'
import { LNInvoice } from './components/LNInvoice/LNInvoice'
import { MentionEditor } from './components/Mention/MentionEditor'
import { NAddrEditor } from './components/NAddr/NAddrEditor'
import { NEventEditor } from './components/NEvent/NEventEditor'
import Suggestions from './components/Suggestions'
import { TweetEditor } from './components/Tweet/TweetEditor'
import { VideoEditor } from './components/Video/VideoEditor'
import { Sidebar } from './Sidebar'
import { TestText } from './TestText'
import type { EditorExtensionSettings, EditorType } from './types'

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
    bolt11: true,
    nsecReject: true,
    fileUpload: true,
  })

  const prevContent = useRef('')

  const baseExtensions = useMemo(() => {
    return type === 'text'
      ? [
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
        ]
      : [MarkdownExtension, StarterKit]
  }, [type]) as AnyExtension[]

  const editor = useEditor(
    {
      autofocus: true,
      extensions: [
        ...baseExtensions,
        NostrExtension.configure({
          link: settings.links !== false && {},
          bolt11: settings.bolt11 !== false && { addNodeView: () => ReactNodeViewRenderer(LNInvoice) },
          naddr: settings.naddr1 !== false && { addNodeView: () => ReactNodeViewRenderer(NAddrEditor) },
          nevent: settings.nevent1 !== false && { addNodeView: () => ReactNodeViewRenderer(NEventEditor) },
          nprofile: settings.nprofile1 !== false && {
            addNodeView: () => ReactNodeViewRenderer(MentionEditor),
            addProseMirrorPlugins() {
              return [
                Suggestion({
                  char: '@',
                  editor: this.editor,
                  pluginKey: new PluginKey('@'),
                  command: ({ editor, range, props }) => {
                    // increase range.to by one when the next node is of type "text"
                    // and starts with a space character
                    const nodeAfter = editor.view.state.selection.$to.nodeAfter
                    const overrideSpace = nodeAfter?.text?.startsWith(' ')

                    if (overrideSpace) {
                      range.to += 1
                    }

                    const attrs = {
                      pubkey: props.pubkey,
                      relays: ['wss://purplepag.es', 'wss://relay.nostr.band'],
                    }
                    attrs.nprofile = 'nostr:' + nip19.nprofileEncode(attrs)

                    editor
                      .chain()
                      .focus()
                      .insertContentAt(range, [
                        { type: 'nprofile', attrs },
                        { type: 'text', text: ' ' },
                      ])
                      .run()

                    window.getSelection()?.collapseToEnd()
                  },
                  render: () => {
                    let component: ReactRenderer
                    let popover: Instance<unknown>[]
                    return {
                      onStart: (props) => {
                        component = new ReactRenderer(Suggestions, {
                          props,
                          editor: props.editor,
                        })

                        popover = tippy('body', {
                          getReferenceClientRect: props.clientRect as () => DOMRect | ClientRect,
                          appendTo: () => document.body,
                          content: component.element,
                          showOnCreate: true,
                          interactive: true,
                          trigger: 'manual',
                          placement: 'bottom-start',
                        })
                      },
                      onUpdate: (props) => {
                        component.updateProps(props)
                        if (props.clientRect) {
                          popover[0].setProps({
                            getReferenceClientRect: props.clientRect,
                          })
                        }
                      },
                      onKeyDown: (props) => {
                        if (props.event.key === 'Escape') {
                          popover[0].hide()
                          return true
                        }
                        return component.ref?.onKeyDown?.(props)
                      },
                      onExit() {
                        popover[0].destroy()
                        component.destroy()
                      },
                    }
                  },
                }),
              ]
            },
          },
          tag: settings.tags !== false && {},
          image: settings.images !== false && { addNodeView: () => ReactNodeViewRenderer(ImageEditor) },
          video: settings.videos !== false && { addNodeView: () => ReactNodeViewRenderer(VideoEditor) },
          tweet: settings.tweet !== false && { addNodeView: () => ReactNodeViewRenderer(TweetEditor) },
          youtube: settings.youtube !== false && { renderText: (props) => props.node.attrs.src },
          nsecReject: settings.nsecReject !== false && {},
          fileUpload: settings.fileUpload !== false && {},
        }),
      ],
      onUpdate: () => {
        handleSnapshot()
      },
    },
    [settings, baseExtensions],
  )

  const handleSnapshot = useCallback(() => {
    if (editor) {
      prevContent.current = editor.getText()
      if (type === 'text') {
        setRaw(editor.getText({ blockSeparator: '\n' }))
      } else {
        setRaw(editor.storage.markdown.getMarkdown())
      }
      // ReactJsonView is buggy so we need to stringify and parse
      setSnapshot(JSON.parse(JSON.stringify(editor?.getJSON().content || {})))
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

  const handleInsertNevent = useCallback(() => {
    editor
      ?.chain()
      .insertContent({ type: 'text', text: ' ' })
      .insertNEvent({
        nevent:
          'nostr:nevent1qvzqqqqqqypzplnld0r0wvutw6alsrd5q2k7vk2nug9j7glxd6ycyp9k8nzz2wdrqyg8wumn8ghj7mn0wd68ytnhd9hx2qg5waehxw309aex2mrp0yhxgctdw4eju6t0qyxhwumn8ghj7mn0wvhxcmmvqqs9gg4thq8ng87z8377jxksjwhk9dl0f8su9c4kq335ydzp0ykmv5gqt3csa',
      })
      .run()
    editor?.commands.focus('start')
  }, [editor])

  const handleInsertNProfile = useCallback(() => {
    editor
      ?.chain()
      .insertNProfile({
        nprofile:
          'nostr:nprofile1qy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcprfmhxue69uhhyetvv9ujuem9w3skccne9e3k7mf0wccsqgxxvqas78x0a339m8qgkaf7fam5atmarne8dy3rzfd4l4x6w2qpncmfs8zh',
      })
      .focus()
      .run()
  }, [editor])

  const handleInsertNAddr = useCallback(() => {
    editor
      ?.chain()
      .insertContent({ type: 'text', text: ' ' })
      .insertNAddr({
        naddr:
          'nostr:naddr1qqwysetjv5syxmmdv4ejqsnfw33k76twyp38jgznwp5hyctvqgsph3c2q9yt8uckmgelu0yf7glruudvfluesqn7cuftjpwdynm2gygrqsqqqa2w4ua43m',
      })
      .focus()
      .run()
    editor?.commands.focus('start')
  }, [editor])

  const handleInsertMedia = useCallback(() => {
    editor?.chain().selectFile().run()
  }, [editor])

  return (
    <div className='flex'>
      <main className='relative width-auto p-10' style={{ width: 'calc(100% - 400px)' }}>
        <h1>nostr-editor</h1>
        <br />
        <TestText />
        <div className='mt-2'>
          <button className='border rounded-lg p-2' onClick={handleInsertNevent}>
            Add NEvent
          </button>
          <button className='border rounded-lg p-2 ml-2' onClick={handleInsertNProfile}>
            Add NProfile
          </button>
          <button className='border rounded-lg p-2 ml-2' onClick={handleInsertNAddr}>
            Add NAddr
          </button>
          <button className='border rounded-lg p-2 ml-2' onClick={handleInsertMedia}>
            Add Media
          </button>
        </div>
        <div className='mt-2 z-20 relative'>
          <EditorContent editor={editor} id='editor' />
        </div>
        {raw && (
          <>
            <h3>{type === 'text' ? 'editor.getText()' : 'editor.storage.markdown.getMarkdown()'}</h3>
            <pre className='break-all mt-2 text-wrap'>{raw}</pre>
          </>
        )}
        {snapshot && (
          <div className='text-left pl-0 mt-5'>
            <h3 className='mb-2'>editor.getJSON()</h3>
            <ReactJsonView src={snapshot} />
          </div>
        )}
      </main>
      <Sidebar type={type} onChangeEditor={handleChangeEditor} onChangeExtensions={handleChangeExtensions} />
    </div>
  )
}

export default App

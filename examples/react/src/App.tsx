import tippy from 'tippy.js'
import {throttle} from 'throttle-debounce'
import {PluginKey} from '@tiptap/pm/state'
import {mergeAttributes} from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import type { AnyExtension } from '@tiptap/react'
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { NostrMatcherExtension, NEventExtension, NAddrExtension, NProfileExtension } from 'nostr-editor'
import ReactDOM from 'react-dom/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactJsonView from 'react-json-view'
import { Image } from './components/Image'
import { Mention } from './components/Mention'
import { NAddr } from './components/NAddr'
import { NEvent } from './components/NEvent'
import { Tweet } from './components/Tweet'
import { Video } from './components/Video'
import { PersonSuggestions } from './components/PersonSuggestions'
import { LinkExtension } from './extensions/LinkExtension'
import { TagExtension } from './extensions/TagExtension'
import { TweetExtension } from './extensions/TweetExtension'
import { VideoExtension } from './extensions/VideoExtension'
import { TestText } from './TestText'
import { Sidebar } from './Sidebar'
import type { EditorType, EditorExtensionSettings } from './types'
import { pool } from './nostr'

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
      baseExtensions.push(
        NProfileExtension
          .extend({
            addNodeView: () => ReactNodeViewRenderer(Mention),
            addProseMirrorPlugins() {
              return [
                Suggestion({
                  char: '@',
                  editor: this.editor,
                  pluginKey: new PluginKey('@'),
                  command: ({editor, range, props}: any) => {
                    // increase range.to by one when the next node is of type "text"
                    // and starts with a space character
                    const nodeAfter = editor.view.state.selection.$to.nodeAfter
                    const overrideSpace = nodeAfter?.text?.startsWith(' ')

                    if (overrideSpace) {
                      range.to += 1
                    }

                    const attrs = {
                      pubkey: props.pubkey,
                      relays: ['wss://purplepag.es'],
                    }

                    editor
                      .chain()
                      .focus()
                      .insertContentAt(range, [
                        {type: 'nprofile', attrs},
                        {type: 'text', text: ' '},
                      ])
                      .run()

                    window.getSelection()?.collapseToEnd()
                  },
                  render: () => {
                    const target = document.createElement("div")
                    const root = ReactDOM.createRoot(target)

                    let popover: any
                    let renderProps = {loading: false, index: 0, items: []}

                    const render = newProps => {
                      renderProps = {...renderProps, ...newProps}

                      root.render(<PersonSuggestions {...renderProps} />)
                    }

                    const search = throttle(800, async () => {
                      render({loading: true})

                      const items = []
                      const sub = pool.subscribeMany(['wss://relay.nostr.band'], [{kinds: [0], search: renderProps.query}], {
                        onevent(event) {
                          items.push(event)
                        },
                      })

                      setTimeout(() => {
                        sub.close()

                        if (items.length > 0) {
                          render({loading: false, items})
                        } else {
                          render({loading: false})
                        }
                      }, 800)
                    })

                    return {
                      onStart: props => {
                        popover = tippy("body", {
                          getReferenceClientRect: props.clientRect,
                          appendTo: () => document.body,
                          content: target,
                          showOnCreate: true,
                          interactive: true,
                          trigger: "manual",
                          placement: "bottom-start",
                        })

                        render(props)
                      },
                      onUpdate: props => {
                        if (props.clientRect) {
                          popover[0].setProps({
                            getReferenceClientRect: props.clientRect,
                          })
                        }

                        render(props)
                        search()
                      },
                      onKeyDown: props => {
                        if (props.event.key === "Escape") {
                          popover[0].hide()

                          return true
                        }

                        if (props.event.key === "Enter") {
                          const item = renderProps.items[renderProps.index]

                          if (item) {
                            renderProps.command(item)
                          }

                          return true
                        }

                        if (props.event.key === "ArrowUp") {
                          render({index: Math.max(0, renderProps.index - 1)})

                          return true
                        }

                        if (props.event.key === "ArrowDown") {
                          render({index: Math.min(renderProps.items.length - 1, renderProps.index + 1)})

                          return true
                        }
                      },
                      onExit: () => {
                        popover[0].destroy()
                      },
                    }
                  },
                }),
              ]
            },
          })
      )
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

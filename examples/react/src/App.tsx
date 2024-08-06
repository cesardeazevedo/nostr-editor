import Dropcursor from '@tiptap/extension-dropcursor'
import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import { PluginKey } from '@tiptap/pm/state'
import type { AnyExtension } from '@tiptap/react'
import { EditorContent, ReactNodeViewRenderer, ReactRenderer, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import Suggestion from '@tiptap/suggestion'
import {
  AutoLinkExtension,
  Bolt11Extension,
  LinkExtension,
  NAddrExtension,
  NEventExtension,
  NProfileExtension,
  NSecRejectExtension,
  TagExtension,
  TweetExtension,
  VideoExtension,
} from 'nostr-editor'
import { nip19 } from 'nostr-tools'
import { useCallback, useMemo, useRef, useState } from 'react'
import ReactJsonView from 'react-json-view'
import type { Instance } from 'tippy.js'
import tippy from 'tippy.js'
import { Markdown as MarkdownExtension } from 'tiptap-markdown'
import { Image } from './components/Image'
import { LNInvoice } from './components/LNInvoice'
import { Mention } from './components/Mention'
import { NAddr } from './components/NAddr'
import { NEvent } from './components/NEvent'
import Suggestions from './components/Suggestions'
import { Tweet } from './components/Tweet'
import { Video } from './components/Video'
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
  })
  const extensions = useMemo(() => {
    const baseExtensions: AnyExtension[] = [Dropcursor]

    if (type === 'text') {
      // Disabled markdown elements
      baseExtensions.push(StarterKit.configure({
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
      }))
    } else if (type === 'markdown') {
      // StarterKit already bundles some markdown elements
      baseExtensions.push(MarkdownExtension)
      baseExtensions.push(StarterKit)
    } else {
      // todo
    }

    if (settings.links) {
      baseExtensions.push(AutoLinkExtension)
    }
    if (settings.links) {
      baseExtensions.push(LinkExtension)
    }
    if (settings.tags) {
      baseExtensions.push(TagExtension)
    }
    if (settings.videos) {
      baseExtensions.push(VideoExtension.extend({ addNodeView: () => ReactNodeViewRenderer(Video) }))
    }
    if (settings.images)
      baseExtensions.push(
        ImageExtension.extend({
          addNodeView: () => ReactNodeViewRenderer(Image),
          renderText: (p) => p.node.attrs.src,
        }),
      )
    if (settings.youtube) {
      baseExtensions.push(YoutubeExtension.extend({ renderText: (p) => p.node.attrs.src }))
    }
    if (settings.tweet) {
      baseExtensions.push(TweetExtension.extend({ addNodeView: () => ReactNodeViewRenderer(Tweet) }))
    }
    if (settings.nprofile1)
      baseExtensions.push(
        NProfileExtension.extend({
          addNodeView: () => ReactNodeViewRenderer(Mention),
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
        }),
      )
    if (settings.nevent1) {
      baseExtensions.push(NEventExtension.extend({ addNodeView: () => ReactNodeViewRenderer(NEvent) }))
    }
    if (settings.naddr1) {
      baseExtensions.push(NAddrExtension.extend({ addNodeView: () => ReactNodeViewRenderer(NAddr) }))
    }
    if (settings.nsecReject) {
      baseExtensions.push(NSecRejectExtension)
    }
    if (settings.bolt11) {
      baseExtensions.push(Bolt11Extension.extend({ addNodeView: () => ReactNodeViewRenderer(LNInvoice) }))
    }

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

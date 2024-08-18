import { IconBrandGithubFilled } from '@tabler/icons-react'
import type { Editor } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import type { AnyExtension } from '@tiptap/react'
import { EditorContent, ReactNodeViewRenderer, ReactRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Suggestion from '@tiptap/suggestion'
import type { NProfileAttributes } from 'nostr-editor'
import { NostrExtension } from 'nostr-editor'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
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
import { YoutubeEditor } from './components/Youtube/YoutubeEditor'
import { MenuButton } from './MenuButton'
import { Sidebar } from './Sidebar'
import { TEST_LNBC, TEST_NADDR, TEST_NEVENT_1, TEST_NPROFILE_1, TestText } from './TestText'
import type { EditorExtensionSettings, EditorType } from './types'

export type NostrExtension = {
  signEvent(event: EventTemplate): Promise<NostrEvent>
}

function App() {
  const [raw, setRaw] = useState('')
  const [type, setType] = useState<EditorType>('text')
  const [snapshot, setSnapshot] = useState({})
  const [settings] = useState<EditorExtensionSettings>({
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

  const [isPending, setPending] = useState<boolean>(false)

  const prevContent = useRef('')

  const baseExtensions = useMemo(() => {
    if (type === 'text') {
      return [
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
    }
    return [StarterKit, MarkdownExtension.configure({ transformCopiedText: true, transformPastedText: true })]
  }, [type]) as AnyExtension[]

  const editor = useEditor(
    {
      autofocus: true,
      extensions: [
        ...baseExtensions,
        NostrExtension.configure({
          extend: {
            bolt11: { addNodeView: () => ReactNodeViewRenderer(LNInvoice) },
            naddr: { addNodeView: () => ReactNodeViewRenderer(NAddrEditor) },
            nevent: { addNodeView: () => ReactNodeViewRenderer(NEventEditor) },
            image: { addNodeView: () => ReactNodeViewRenderer(ImageEditor) },
            video: { addNodeView: () => ReactNodeViewRenderer(VideoEditor) },
            tweet: { addNodeView: () => ReactNodeViewRenderer(TweetEditor) },
            youtube: { addNodeView: () => ReactNodeViewRenderer(YoutubeEditor) },
            nprofile: {
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

                      const attrs: Partial<NProfileAttributes> = {
                        pubkey: props.pubkey,
                        relays: ['wss://purplepag.es', 'wss://relay.nostr.band'],
                      }
                      attrs.nprofile = 'nostr:' + nip19.nprofileEncode(attrs as nip19.ProfilePointer)

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
                            getReferenceClientRect: props.clientRect as () => DOMRect,
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
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-ignore
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
          },
          link: { autolink: type === 'markdown' },
          video: {
            defaultUploadUrl: 'https://nostr.build',
            defaultUploadType: 'nip96',
          },
          image: {
            defaultUploadUrl: 'https://nostr.build',
            defaultUploadType: 'nip96',
          },
          fileUpload: settings.fileUpload !== false && {
            immediateUpload: false,
            sign: async (event) => {
              if ('nostr' in window) {
                const nostr = window.nostr as NostrExtension
                return await nostr.signEvent(event)
              }
              console.error('No nostr extension found')
              return Promise.reject('No signer found, install a nostr browser extension')
            },
            onDrop() {
              setPending(true)
            },
            onComplete(currentEditor: Editor) {
              console.log('Upload Completed', currentEditor.getText())
              setPending(false)
            },
          },
        }),
      ],
      onUpdate: () => {
        handleSnapshot()
      },
    },
    [baseExtensions],
  )!

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
      setRaw('')
    },
    [type],
  )

  return (
    <div className='flex flex-row'>
      <main className='fixed overflow-y-auto h-full w-1/2 p-4'>
        <div className='flex flex-row items-center justify-between bg-black text-white py-1 px-4 rounded-tl-lg rounded-tr-lg'>
          <h4 className='bg-white/20 inline px-2 rounded-full pb-0.5'>nostr-editor</h4>
          <a
            href='https://github.com/cesardeazevedo/nostr-editor'
            target='_blank'
            rel='noopener noreferrer'
            className='flex flex-row items-center no-underline px-2 bg-white/20 rounded-full p-0.5 text-inherit'>
            <IconBrandGithubFilled className='mr-1' size={20} strokeWidth='1.5' />
            Github
          </a>
        </div>
        <div className='mb-2 z-20 relative border border-gray-100 border-solid rounded-bl-2xl rounded-br-2xl p-8'>
          <div className=''>
            <div>
              <MenuButton isActive={type === 'text'} onClick={() => handleChangeEditor('text')}>
                Text
              </MenuButton>
              <MenuButton isActive={type === 'markdown'} onClick={() => handleChangeEditor('markdown')}>
                Markdown
              </MenuButton>
            </div>
            <MenuButton
              onClick={() => {
                editor.chain().insertContent({ type: 'text', text: ' ' }).insertNEvent({ nevent: TEST_NEVENT_1 }).run()
              }}>
              Add NEvent
            </MenuButton>
            <MenuButton
              onClick={() => {
                editor.chain().insertNProfile({ nprofile: TEST_NPROFILE_1 }).focus().run()
              }}>
              Add NProfile
            </MenuButton>
            <MenuButton
              onClick={() => {
                editor
                  .chain()
                  .insertContent({ type: 'text', text: ' ' })
                  .insertNAddr({ naddr: TEST_NADDR })
                  .focus()
                  .run()
              }}>
              Add NAddr
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor
                  .chain()
                  .insertContent({ type: 'text', text: ' ' })
                  .insertBolt11({ lnbc: TEST_LNBC })
                  .focus()
                  .run()
              }>
              Add Bolt11
            </MenuButton>
            <MenuButton onClick={() => editor.chain().selectFiles().run()}>Add Media</MenuButton>
            <MenuButton onClick={() => editor.chain().uploadFiles().run()}>Upload</MenuButton>
            <MenuButton disabled={isPending} onClick={() => { }}>
              Sign
            </MenuButton>
          </div>
          <EditorContent editor={editor} id='editor' className='text-lg font-normal' />
        </div>
        <TestText />
      </main>
      <Sidebar>
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
      </Sidebar>
    </div>
  )
}

export default App

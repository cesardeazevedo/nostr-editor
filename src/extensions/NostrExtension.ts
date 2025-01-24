import type { AnyExtension, MarkConfig, NodeConfig } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { LinkOptions } from '@tiptap/extension-link'
import type { YoutubeOptions } from '@tiptap/extension-youtube'
import YoutubeExtension from '@tiptap/extension-youtube'
import type { UnsignedEvent } from 'nostr-tools'
import { type NostrEvent } from 'nostr-tools'
import { parseImeta, type IMetaTags } from '../helpers/nip92.imeta'
import { Bolt11Extension } from './Bolt11Extension'
import type { FileUploadOptions, FileUploadStorage } from './FileUploadExtension'
import { FileUploadExtension } from './FileUploadExtension'
import type { ImageOptions } from './ImageExtension'
import { ImageExtension } from './ImageExtension'
import { LinkExtension } from './LinkExtension'
import type { NAddrAttributes } from './NAddrExtension'
import { NAddrExtension } from './NAddrExtension'
import type { NEventAttributes } from './NEventExtension'
import { NEventExtension } from './NEventExtension'
import type { NProfileAttributes } from './NProfileExtension'
import { NProfileExtension } from './NProfileExtension'
import { NSecRejectExtension, type NSecRejectOptions } from './NSecRejectExtension'
import type { TagAttributes } from './TagExtension'
import { TagExtension } from './TagExtension'
import { TweetExtension } from './TweetExtension'
import { VideoExtension } from './VideoExtension'
import { replaceTextContent } from '../helpers/utils'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nostr: {
      setEventContent: (event: UnsignedEvent, imeta?: IMetaTags) => ReturnType
      setEventContentKind0: (event: UnsignedEvent) => ReturnType
    }
  }
}

export interface NostrOptions {
  extend?: {
    nprofile?: Partial<NodeConfig>
    nevent?: Partial<NodeConfig>
    naddr?: Partial<NodeConfig>
    link?: Partial<MarkConfig>
    image?: Partial<NodeConfig>
    youtube?: Partial<NodeConfig>
    tweet?: Partial<NodeConfig>
    video?: Partial<NodeConfig>
    tag?: Partial<MarkConfig>
    bolt11?: Partial<NodeConfig>
    nsecReject?: Partial<NSecRejectOptions>
    fileUpload?: Partial<FileUploadOptions>
  }
  nprofile?: boolean
  nevent?: boolean
  naddr?: boolean
  tweet?: boolean
  tag?: boolean
  bolt11?: boolean
  link?: Partial<LinkOptions> | false
  image?: Partial<ImageOptions> | false
  video?: Partial<NodeConfig> | false
  youtube?: Partial<YoutubeOptions> | false
  nsecReject?: Partial<NSecRejectOptions> | false
  fileUpload?: Partial<FileUploadOptions> | false
}

export interface NostrStorage {
  imeta: IMetaTags | null
  setImeta: (imeta: IMetaTags) => void
  getTags: () => TagAttributes[]
  getNprofiles: () => NProfileAttributes[]
  getNevents: () => NEventAttributes[]
  getNaddrs: () => NAddrAttributes[]
  getTtags: () => NostrEvent['tags']
  getImetaTags: () => NostrEvent['tags']
  getPtags: (hints?: boolean) => NostrEvent['tags']
  getQtags: (hints?: boolean) => NostrEvent['tags']
  getAtags: (hints?: boolean) => NostrEvent['tags']
  getEditorTags: (hints?: boolean) => NostrEvent['tags']
}

export const NostrExtension = Extension.create<NostrOptions, NostrStorage>({
  name: 'nostr',

  addExtensions() {
    const { extend = {} } = this.options
    const extensions = [] as AnyExtension[]
    if (this.options.nprofile !== false) {
      extensions.push(NProfileExtension.extend(extend.nprofile))
    }
    if (this.options.nevent !== false) {
      extensions.push(NEventExtension.extend(extend.nevent))
    }
    if (this.options.naddr !== false) {
      extensions.push(NAddrExtension.extend(extend.naddr))
    }
    if (this.options.link !== false) {
      extensions.push(LinkExtension.extend(extend.link).configure(this.options.link))
    }
    if (this.options.tag !== false) {
      extensions.push(TagExtension.extend(extend.tag))
    }
    if (this.options.youtube !== false) {
      extensions.push(
        YoutubeExtension.extend({
          renderText: (p) => p.node.attrs.src,
          ...extend.youtube,
        }),
      )
    }
    if (this.options.image !== false) {
      extensions.push(ImageExtension.configure(this.options.image).extend(extend.image))
    }
    if (this.options.video !== false) {
      extensions.push(VideoExtension.extend(extend.video))
    }
    if (this.options.tweet !== false) {
      extensions.push(TweetExtension.extend(extend.tweet))
    }
    if (this.options.bolt11 !== false) {
      extensions.push(Bolt11Extension.extend(extend.bolt11))
    }
    if (this.options.nsecReject !== false) {
      extensions.push(NSecRejectExtension)
    }
    if (this.options.fileUpload !== false) {
      extensions.push(FileUploadExtension.configure(this.options.fileUpload))
    }
    return extensions
  },

  addStorage() {
    return {
      imeta: null,
      setImeta: () => {},
      getTags: () => [],
      getNaddrs: () => [],
      getNprofiles: () => [],
      getNevents: () => [],
      getPtags: () => [],
      getQtags: () => [],
      getAtags: () => [],
      getTtags: () => [],
      getImetaTags: () => [],
      getEditorTags: () => [],
    }
  },

  onBeforeCreate() {
    this.storage.setImeta = (imeta: IMetaTags) => {
      this.storage.imeta = imeta
    }

    this.storage.getTags = () => {
      const tags: TagAttributes[] = []
      this.editor.state.doc.descendants((node) => {
        if (node.type.name === 'text' && node.marks.length > 0) {
          node.marks.forEach((mark) => {
            if (mark.type.name === 'tag') {
              tags.push(mark.attrs as TagAttributes)
            }
          })
        }
      })
      return tags
    }

    this.storage.getNprofiles = () => {
      const nprofiles: NProfileAttributes[] = []
      this.editor.state.doc.descendants((node) => {
        if (node.type.name === 'nprofile') {
          nprofiles.push(node.attrs as NProfileAttributes)
        }
      })
      return nprofiles
    }

    this.storage.getNevents = () => {
      const nevents: NEventAttributes[] = []
      this.editor.state.doc.descendants((node) => {
        if (node.type.name === 'nevent') {
          nevents.push(node.attrs as NEventAttributes)
        }
      })
      return nevents
    }

    this.storage.getNaddrs = () => {
      const naddress: NAddrAttributes[] = []
      this.editor.state.doc.descendants((node) => {
        if (node.type.name === 'naddr') {
          naddress.push(node.attrs as NAddrAttributes)
        }
      })
      return naddress
    }

    this.storage.getTtags = () => {
      return this.storage.getTags().map(({ tag }) => ['t', tag])
    }

    this.storage.getPtags = (hints = true) => {
      return this.storage
        .getNprofiles()
        .map(({pubkey, relays}) => {
          const tag = ['p', pubkey]

          if (hints) {
            tag.push(relays?.[0] || '')
          }

          return tag
        })
    }

    this.storage.getQtags = (hints = true) => {
      return this.storage
        .getNevents()
        .map(({id, author, relays}) => {
          const tag = ['q', id]

          if (hints) {
            tag.push(relays?.[0] || '')

            if (author) {
              tag.push(author)
            }
          }

          return tag
        })
    }

    this.storage.getAtags = (hints = true) => {
      return this.storage
        .getNaddrs()
        .map(({kind, pubkey, identifier, relays}) => {
          const tag = ['a', `${kind}:${pubkey}:${identifier}`]

          if (hints) {
            tag.push(relays?.[0] || '')
          }

          return tag
        })
    }

    this.storage.getImetaTags = () => {
      const uploader = this.editor.storage.fileUpload.uploader as FileUploadStorage
      return uploader
        .getFiles()
        .filter((x) => !!x.sha256)
        .map((x) => {
          // Provide default imeta based on what we know
          const meta: Record<string, string> = {
            url: x.src,
            x: x.sha256,
            m: x.file.type,
          }

          // Add imeta based on tags returned by our uploader
          for (const [k, v] of x.tags) {
            meta[k] = v
          }

          return [
            'imeta',
            ...Object.entries(meta)
              .map((kv) => kv.join(' '))
              .sort(),
          ]
        })
    }

    this.storage.getEditorTags = (hints = true) => {
      return [
        ...this.storage.getPtags(hints),
        ...this.storage.getQtags(hints),
        ...this.storage.getAtags(hints),
        ...this.storage.getImetaTags(),
        ...this.storage.getTtags(),
      ] as NostrEvent['tags']
    }
  },

  addCommands() {
    return {
      setEventContent: (event: UnsignedEvent, imeta?: IMetaTags) => (props) => {
        this.storage.setImeta(imeta || parseImeta(event.tags))
        props
          .chain()
          // These metadata will trigger pasting rules on all other extensions
          .setMeta('parse', true)
          .setMeta('uiEvent', 'paste')
          .setContent(event.kind === 1 ? replaceTextContent(event.content) : event.content)
        return true
      },
      setEventContentKind0: (event: UnsignedEvent) => (props) => {
        if (event.kind !== 0) {
          return false
        }
        let content
        try {
          content = JSON.parse(event.content) as { about?: string }
        } catch (error) {
          return false
        }
        if (content.about) {
          props.chain().setMeta('parse', true).setMeta('uiEvent', 'paste').setContent(replaceTextContent(content.about))
        }
        return true
      },
    }
  },
})

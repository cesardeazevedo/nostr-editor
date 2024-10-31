import type { AnyExtension, MarkConfig, NodeConfig } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { LinkOptions } from '@tiptap/extension-link'
import type { YoutubeOptions } from '@tiptap/extension-youtube'
import YoutubeExtension from '@tiptap/extension-youtube'
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
import { NSecRejectExtension, type NSecRejectionOptions } from './NSecRejectExtension'
import type { TagAttributes } from './TagExtension'
import { TagExtension } from './TagExtension'
import { TweetExtension } from './TweetExtension'
import { VideoExtension } from './VideoExtension'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nostr: {
      setEventContent: (event: NostrEvent) => ReturnType
      setEventContentKind0: (event: NostrEvent) => ReturnType
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
    nsecReject?: Partial<NSecRejectionOptions>
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
  nsecReject?: Partial<NSecRejectionOptions> | false
  fileUpload?: Partial<FileUploadOptions> | false
}

export interface NostrStorage {
  imeta: IMetaTags | null
  setImeta: (imeta: IMetaTags) => void
  getTags: () => TagAttributes[]
  getNprofiles: () => NProfileAttributes[]
  getNevents: () => NEventAttributes[]
  getNaddress: () => NAddrAttributes[]
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
      getNaddress: () => [],
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

    this.storage.getNaddress = () => {
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
        .map((nprofile) => ['p', nprofile.pubkey, hints && nprofile.relays[0]].filter((x) => x !== false))
    }

    this.storage.getQtags = (hints = true) => {
      return this.storage
        .getNevents()
        .map((nevent) => ['q', nevent.id, hints ? nevent.relays[0] || '' : '', nevent.author])
    }

    this.storage.getAtags = (hints = true) => {
      return this.storage.getNaddress().map((naddr) => {
        const address = `${naddr.kind}:${naddr.pubkey}:${naddr.identifier}`
        return ['a', address, hints && (naddr.relays?.[0] || false)].filter((x) => x !== false)
      })
    }

    this.storage.getImetaTags = () => {
      const uploader = this.editor.storage.fileUpload.uploader as FileUploadStorage
      return (
        uploader
          .getFiles()
          .filter((x) => !!x.sha256)
          .map((x) => ['imeta', ...x.tags.map(([key, value]) => `${key} ${value}`)]) || []
      )
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
      setEventContent: (event: NostrEvent, imeta?: IMetaTags) => (props) => {
        this.storage.setImeta(imeta || parseImeta(event.tags))
        props
          .chain()
          // These metadata will trigger pasting rules on all other extensions
          .setMeta('parse', true)
          .setMeta('uiEvent', 'paste')
          .setContent(event.kind === 1 ? event.content.replace(/(\n|\r)+/g, '<br />') : event.content)
        return true
      },
      setEventContentKind0: (event: NostrEvent) => (props) => {
        if (event.kind !== 0) {
          return false
        }
        let content
        try {
          content = JSON.parse(event.content)
        } catch (error) {
          return false
        }
        props.chain().setMeta('parse', true).setMeta('uiEvent', 'paste').setContent(content.about, true)
        return true
      },
    }
  },
})

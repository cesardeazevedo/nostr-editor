import type { AnyExtension, MarkConfig, NodeConfig } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import type { YoutubeOptions } from '@tiptap/extension-youtube'
import YoutubeExtension from '@tiptap/extension-youtube'
import { type NostrEvent } from 'nostr-tools'
import { parseImeta, type IMetaTags } from '../helpers/nip92.imeta'
import { Bolt11Extension } from './Bolt11Extension'
import type { FileUploadOptions } from './FileUploadExtension'
import { FileUploadExtension } from './FileUploadExtension'
import type { ImageOptions } from './ImageExtension'
import { ImageExtension } from './ImageExtension'
import { LinkExtension } from './LinkExtension'
import { NAddrExtension } from './NAddrExtension'
import { NEventExtension } from './NEventExtension'
import { NProfileExtension } from './NProfileExtension'
import { NSecRejectExtension, type NSecRejectionOptions } from './NSecRejectExtension'
import { TagExtension } from './TagExtension'
import { TweetExtension } from './TweetExtension'
import { VideoExtension } from './VideoExtension'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nostr: {
      parseNote: (event: NostrEvent) => ReturnType
      parseUserAbout: (event: NostrEvent) => ReturnType
    }
  }
}

export interface NostrParserOptions {
  extend?: {
    nprofile?: Partial<NodeConfig>
    nevent?: Partial<NodeConfig>
    naddr?: Partial<NodeConfig>
    autolink?: Partial<NodeConfig>
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
  autolink?: boolean
  link?: boolean
  tweet?: boolean
  tag?: boolean
  bolt11?: boolean
  image?: Partial<ImageOptions> | false
  video?: Partial<NodeConfig> | false
  youtube?: Partial<YoutubeOptions> | false
  nsecReject?: Partial<NSecRejectionOptions> | false
  fileUpload?: Partial<FileUploadOptions> | false
}

export const NostrExtension = Extension.create<NostrParserOptions>({
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
      extensions.push(LinkExtension.extend(extend.link))
    }
    if (this.options.tag !== false) {
      extensions.push(TagExtension.extend(extend.tag))
    }
    if (this.options.youtube !== false) {
      extensions.push(
        YoutubeExtension.extend({
          renderText: (p) => p.node.attrs.src,
          ...this.options.youtube,
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
      setImeta(imeta: IMetaTags) {
        this.imeta = imeta
      },
    }
  },

  addCommands() {
    return {
      parseNote: (event: NostrEvent, imeta?: IMetaTags) => (props) => {
        this.storage.setImeta(imeta || parseImeta(event.tags))
        props
          .chain()
          // These metadata will trigger pasting rules on all other extensions
          .setMeta('parse', true)
          .setMeta('uiEvent', 'paste')
          .setContent(event.kind === 1 ? event.content.replace(/(\n)+/g, '<br />') : event.content)
        return true
      },
      parseUserAbout: (event: NostrEvent) => (props) => {
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

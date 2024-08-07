import type { AnyExtension, NodeConfig } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import { HardBreak } from '@tiptap/extension-hard-break'
import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import { type NostrEvent } from 'nostr-tools'
import { parseImeta, type IMetaTags } from '../helpers/nip92.imeta'
import { AutoLinkExtension } from './AutoLinkExtension'
import { Bolt11Extension } from './Bolt11Extension'
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
    }
  }
}

export interface NostrParserOptions {
  nprofile: Partial<NodeConfig> | false
  nevent: Partial<NodeConfig> | false
  naddr: Partial<NodeConfig> | false
  autolink: Partial<NodeConfig> | false
  link: Partial<NodeConfig> | false
  image: Partial<NodeConfig> | false
  youtube: Partial<NodeConfig> | false
  tweet: Partial<NodeConfig> | false
  video: Partial<NodeConfig> | false
  tag: Partial<NodeConfig> | false
  bolt11: Partial<NodeConfig> | false
  nsecReject: Partial<NSecRejectionOptions> | false
}

export const NostrExtension = Extension.create<NostrParserOptions>({
  name: 'nostr',

  addExtensions() {
    const extensions = [HardBreak] as AnyExtension[]
    if (this.options.nprofile !== false) {
      extensions.push(NProfileExtension.extend(this.options.nprofile))
    }
    if (this.options.nevent !== false) {
      extensions.push(NEventExtension.extend(this.options.nevent))
    }
    if (this.options.naddr !== false) {
      extensions.push(NAddrExtension.extend(this.options.naddr))
    }
    if (this.options.autolink !== false) {
      extensions.push(AutoLinkExtension)
    }
    if (this.options.link !== false) {
      extensions.push(LinkExtension)
    }
    if (this.options.tag !== false) {
      extensions.push(TagExtension)
    }
    if (this.options.image !== false) {
      extensions.push(
        ImageExtension.extend({
          renderText: (p) => p.node.attrs.src,
          ...this.options.image,
        }),
      )
    }
    if (this.options.youtube !== false) {
      extensions.push(
        YoutubeExtension.extend({
          renderText: (p) => p.node.attrs.src,
          ...this.options.youtube,
        }),
      )
    }
    if (this.options.video !== false) {
      extensions.push(VideoExtension.extend(this.options.video))
    }
    if (this.options.tweet !== false) {
      extensions.push(TweetExtension.extend(this.options.tweet))
    }
    if (this.options.bolt11 !== false) {
      extensions.push(Bolt11Extension.extend(this.options.bolt11))
    }
    if (this.options.nsecReject !== false) {
      extensions.push(NSecRejectExtension)
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
    }
  },
})

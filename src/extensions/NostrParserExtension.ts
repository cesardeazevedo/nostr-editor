import type { AnyExtension } from '@tiptap/core'
import { Extension, getText } from '@tiptap/core'
import ImageExtension from '@tiptap/extension-image'
import YoutubeExtension from '@tiptap/extension-youtube'
import { type NostrEvent } from 'nostr-tools'
import { type Attrs, type MarkType, type NodeType } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import { findLinks } from '../helpers/findLinks'
import { findNostrRefs } from '../helpers/findNostrRefs'
import { findTags } from '../helpers/findTags'
import { parseReferences, type NostrReference } from '../helpers/nip27.references'
import { parseImeta, type IMetaTags } from '../helpers/nip92.imeta'
import type { Matches } from '../plugins/AutoLinkPlugin'
import { removeIntersectingNodes } from '../helpers/utils'
import { LinkExtension } from './LinkExtension'
import { NAddrExtension } from './NAddrExtension'
import { NEventExtension } from './NEventExtension'
import { NProfileExtension } from './NProfileExtension'
import { TagExtension } from './TagExtension'
import { TweetExtension } from './TweetExtension'
import { VideoExtension } from './VideoExtension'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nostrparser: {
      parseNote: (event: NostrEvent) => ReturnType
    }
  }
}

export interface NostrParserOptions {
  nprofile: boolean
  nevent: boolean
  naddr: boolean
  link: boolean
  image: boolean
  youtube: boolean
  tweet: boolean
  video: boolean
  tag: boolean
}

export const NostrParserExtension = Extension.create<NostrParserOptions>({
  name: 'nostrparser',

  addExtensions() {
    const extensions = [] as AnyExtension[]
    if (this.options.nprofile !== false) {
      extensions.push(NProfileExtension)
    }
    if (this.options.nevent !== false) {
      extensions.push(NEventExtension)
    }
    if (this.options.naddr !== false) {
      extensions.push(NAddrExtension)
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
        }),
      )
    }
    if (this.options.video !== false) {
      extensions.push(VideoExtension)
    }
    if (this.options.youtube !== false) {
      extensions.push(YoutubeExtension)
    }
    if (this.options.tweet !== false) {
      extensions.push(TweetExtension)
    }
    return extensions
  },

  addCommands() {
    return {
      parseNote: (event: NostrEvent, imeta?: IMetaTags, references?: NostrReference[]) => (props) => {
        function addMark(tr: Transaction, from: number, to: number, mark: MarkType | undefined, attrs: Attrs) {
          if (mark) {
            tr.addMark(from, to, mark.create(attrs))
          }
        }
        function replaceWith(tr: Transaction, from: number, to: number, node: NodeType | undefined, attrs: Attrs) {
          if (node) {
            tr.replaceWith(from, to, node.create(attrs))
          }
        }

        props.commands.setContent(event.content)

        const tr = props.state.tr
        const content = getText(tr.doc)

        const refs = findNostrRefs(content, references || parseReferences({ content }))
        const links = findLinks(content, imeta || parseImeta(event.tags))
        const tags = findTags(content)
        const replacements = [...links, ...tags, ...refs].map((match) => ({
          ...match,
          from: match.from + 1,
          to: match.to + 1,
        }))
        replacements
          // All the replacements should be done in reverse order so we maintain the correct ranges
          .sort((a, b) => (a.to > b.to ? -1 : 1))
          .reduce(removeIntersectingNodes, [] as Matches[])
          .forEach((match) => {
            const { kind, text, from, to } = match
            const { nodes, marks } = this.editor.state.schema
            switch (kind) {
              case 'text': {
                addMark(tr, from, to, marks.link, { href: match.href })
                break
              }
              case 'image': {
                replaceWith(tr, from, to, nodes.image, { src: match.href })
                break
              }
              case 'youtube': {
                replaceWith(tr, from, to, nodes.youtube, { src: match.href })
                break
              }
              case 'tweet': {
                replaceWith(tr, from, to, nodes.tweet, { src: match.href })
                break
              }
              case 'video': {
                replaceWith(tr, from, to, nodes.video, { src: match.href })
                break
              }
              case 'tag': {
                addMark(tr, from, to, marks.tag, { tag: match.text })
                break
              }
              case 'nostr': {
                const { ref } = match
                switch (ref.prefix) {
                  case 'npub':
                  case 'nprofile': {
                    replaceWith(tr, from, to, nodes.nprofile, { ...ref.profile, nprofile: text })
                    break
                  }
                  case 'note':
                  case 'nevent': {
                    replaceWith(tr, from, to, nodes.nevent, { ...ref.event, nevent: text })
                    break
                  }
                  case 'naddr': {
                    replaceWith(tr, from, to, nodes.naddr, { ...ref.address, naddr: text })
                    break
                  }
                  default: {
                    break
                  }
                }
                break
              }
              default: {
                break
              }
            }
          })
        return true
      },
    }
  },
})

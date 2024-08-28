import type { PasteRuleMatch } from '@tiptap/core'
import extractDomain from 'extract-domain'
import tlds from 'tlds'
import type { IMetaTags } from './nip92.imeta'

export function isValidTLD(str: string): boolean {
  const domain = extractDomain(str)

  if (domain === '') {
    // Not a domain
    return true
  }

  const parts = domain?.toString().split('.') || []
  const tld = parts[parts.length - 1]

  return tlds.includes(tld)
}

export const createPasteRuleMatch = <T extends Record<string, unknown>>(
  match: RegExpMatchArray,
  data: T,
): PasteRuleMatch => ({ index: match.index!, replaceWith: match[2], text: match[0], match, data })

export function parseRelayAttribute(element: HTMLElement) {
  const relays = element.getAttribute('relays') || []
  return typeof relays === 'string' ? relays.split(',') : relays
}

export type LinkKinds = 'text' | 'image' | 'video' | 'tweet' | 'youtube'

const IMAGE_EXTENSIONS = /.(jpg|jpeg|gif|png|bmp|svg|webp)$/
const VIDEO_EXTENSIONS = /.(webm|mp4|ogg|mov)$/

export function getLinkKind(url: string, href: string, imeta?: IMetaTags): LinkKinds {
  const mimetype = imeta?.[url]?.m?.split?.('/')?.[0]
  if (mimetype === 'image') {
    return 'image'
  } else if (mimetype === 'video') {
    return 'video'
  } else if (/youtube|youtu.be/.test(url)) {
    return 'youtube'
  } else if (/^https?:\/\/(twitter|x)\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/.test(url)) {
    return 'tweet'
  } else {
    try {
      const { pathname } = new URL(href)
      return IMAGE_EXTENSIONS.test(pathname) ? 'image' : VIDEO_EXTENSIONS.test(pathname) ? 'video' : 'text'
    } catch (error) {
      console.log('url parser error', error)
      return 'text'
    }
  }
}

import * as linkifyjs from 'linkifyjs'
import type { IMetaTags } from './nip92.imeta'
import type { MatchBase } from './types'
import { isValidTLD } from './utils'

const IMAGE_EXTENSIONS = /.(jpg|jpeg|gif|png|bmp|svg|webp)$/
const VIDEO_EXTENSIONS = /.(webm|mp4|ogg|mov)$/

export interface MatchLinks extends MatchBase {
  kind: 'text' | 'image' | 'video' | 'tweet' | 'youtube'
  href: string
}

function getLinkKind(url: string, href: string, imeta?: IMetaTags): MatchLinks['kind'] {
  const mimetype = imeta?.[url]?.m?.split?.('/')?.[0]
  if (mimetype && ['image', 'video'].includes(mimetype)) {
    return mimetype as 'image' | 'video'
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

export function findLinks(text: string, imeta?: IMetaTags): MatchLinks[] {
  const links: MatchLinks[] = []

  for (const { start: from, end: to, value, href } of linkifyjs.find(text) || []) {
    const kind = getLinkKind(value, href, imeta)

    if (!isValidTLD(href) && !href.startsWith('tel:')) {
      continue
    }

    links.push({ text: value, href, kind, from, to })
  }

  return links
}

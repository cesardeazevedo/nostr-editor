import type { MatchBase } from '../types'

export interface MatchTag extends MatchBase {
  kind: 'tag'
}

const REGEX_TAG = /(#\w+)/g

export function findTags(text: string): MatchTag[] {
  const tags: MatchTag[] = []
  for (const match of text.matchAll(REGEX_TAG)) {
    const text = match[0]
    const from = match.index || 0
    const to = from + text.length
    tags.push({ text: match[0], kind: 'tag', from, to })
  }
  return tags
}

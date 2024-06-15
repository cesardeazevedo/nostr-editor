import tlds from 'tlds'
import extractDomain from 'extract-domain'
import { Matches } from './NostrMatcherPlugin'

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

export function removeIntersectingNodes(acc: Matches[], current: Matches) {
  const prev = acc[acc.length - 1]
  if (current.to < (prev?.from || Infinity)) {
    return [...acc, current]
  }
  return acc
}

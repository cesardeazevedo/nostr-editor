import extractDomain from 'extract-domain'
import tlds from 'tlds'

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

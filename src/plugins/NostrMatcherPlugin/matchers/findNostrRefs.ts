import { NostrReference, parseReferences } from '../nip27.references'
import { MatchBase } from '../types'

export interface MatchNostr extends MatchBase {
  kind: 'nostr'
  ref: NostrReference
}

export function findNostrRefs(text: string, references: NostrReference[]): MatchNostr[] {
  const refs: MatchNostr[] = []
  const parsed = references || parseReferences({ content: text })
  for (const ref of parsed) {
    const from = ref.index
    const to = from + ref.text.length
    refs.push({ kind: 'nostr', from, to, text: ref.text, ref })
  }
  return refs
}

import { Base64 } from 'js-base64'
import {hexToBytes, bytesToHex} from "@noble/hashes/utils"
import { gcm } from '@noble/ciphers/aes'
import { randomBytes } from '@noble/ciphers/webcrypto'
import type { EventTemplate, NostrEvent } from 'nostr-tools/core'
import type { UploadTask } from './types'

export interface BlossomOptions {
  file: File
  serverUrl: string
  expiration?: number
  hash?: (file: File) => Promise<string>
  sign?: (event: EventTemplate) => Promise<NostrEvent> | NostrEvent
  encryptionAlgorithm?: 'aes-gcm'
}

export interface BlossomResponse {
  sha256: string
  size: number
  type: string
  nip94: Record<string, string>
  uploaded: number
  url: string
}

export interface BlossomResponseError {
  message: string
}

export interface EncryptionResult {
  key: string
  nonce: string
  ciphertext: Uint8Array
}

export async function encryptFile({encryptionAlgorithm, file}: BlossomOptions): Promise<EncryptionResult> {
  if (encryptionAlgorithm !== 'aes-gcm') {
    throw new Error(`Unsupported encryption algorithm: ${encryptionAlgorithm}`)
  }

  const keyBytes = randomBytes(32)
  const nonceBytes = randomBytes(12)
  const key = bytesToHex(keyBytes)
  const nonce = bytesToHex(nonceBytes)
  const fileBuffer = await file.arrayBuffer()
  const fileData = new Uint8Array(fileBuffer)
  const cipher = gcm(keyBytes, nonceBytes)
  const ciphertext = cipher.encrypt(fileData)

  return {ciphertext, key, nonce}
}

export interface DecryptionOptions extends EncryptionResult {
  encryptionAlgorithm: string
}

export function decryptFile({encryptionAlgorithm, key, nonce, ciphertext}: DecryptionOptions): Uint8Array {
  if (encryptionAlgorithm !== 'aes-gcm') {
    throw new Error(`Unsupported encryption algorithm: ${encryptionAlgorithm}`)
  }

  const cipher = gcm(hexToBytes(key), hexToBytes(nonce))
  const decryptedData = cipher.decrypt(ciphertext)

  return decryptedData
}

const mapUrlWithExtension = (url: string) => (tag: string[]) => (tag[0] === 'url' ? [tag[0], url] : tag)

export async function uploadBlossom(options: BlossomOptions): Promise<UploadTask> {
  if (!options.hash) {
    throw new Error('No hash function provided')
  }
  if (!options.sign) {
    throw new Error('No signer provided')
  }

  let file: File = options.file
  let encryptionResult: EncryptionResult | undefined = undefined

  if (options.encryptionAlgorithm) {
    encryptionResult = await encryptFile(options)
    const blob = new Blob([encryptionResult.ciphertext])

    file = new File([blob], file.name, {type: file.type})
  }

  const now = Math.floor(Date.now() / 1000)
  const event = await options.sign({
    kind: 24242,
    content: `Upload ${file.name}`,
    created_at: now,
    tags: [
      ['u', options.serverUrl],
      ['method', 'PUT'],
      ['t', 'upload'],
      ['expiration', Math.floor(now + (options.expiration || 60000)).toString()],
      ['x', await options.hash(file)],
      ['size', file.size.toString()],
    ],
  })

  const base64 = Base64.encode(JSON.stringify(event))
  const authorization = `Nostr ${base64}`
  const res = await fetch(options.serverUrl + '/upload', {
    method: 'PUT',
    body: file,
    headers: {
      authorization,
    },
  })
  if (res.status !== 200) {
    const reason = res.headers.get('X-Reason')
    throw new Error(reason || 'Error on blossom upload')
  }
  const data = await res.json()
  const { nip94, ...json } = data as BlossomResponse
  // Always append file extension if missing
  const { pathname } = new URL(json.url)
  const hasExtension = pathname.split('.').length === 2
  const extension = '.' + file.type.split('/')[1]
  const url = json.url + (hasExtension ? '' : extension)
  const tags = Array.isArray(nip94)
      ? nip94.map(mapUrlWithExtension(url))
      : Object.entries(nip94 || {}).map(mapUrlWithExtension(url))
  const result = {...json, url, tags}

  // Add encryption metadata to the result if file was encrypted
  if (encryptionResult && options.encryptionAlgorithm) {
    tags.push(
      ['decryption-key', encryptionResult.key],
      ['decryption-nonce', encryptionResult.nonce],
      ['encryption-algorithm', options.encryptionAlgorithm],
    )
  }

  return result
}

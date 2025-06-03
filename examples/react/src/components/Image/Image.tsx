import { useState, useEffect } from 'react'
import { Base64 } from 'js-base64'
import { decryptFile } from 'nostr-editor'

type Props = {
  src: string
  tags?: string[][]
}

export function Image(props: Props) {
  const { src, tags } = props
  const [imageSrc, setImageSrc] = useState<string>(src)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const encryptionAlgorithm = tags?.find(tag => tag[0] === 'encryption-algorithm')?.[1]
    const key = tags?.find(tag => tag[0] === 'decryption-key')?.[1]
    const nonce = tags?.find(tag => tag[0] === 'decryption-nonce')?.[1]

    if (encryptionAlgorithm === 'aes-gcm') {
      if (key && nonce) {
        decryptAndSetImage(src, encryptionAlgorithm, key, nonce)
      } else {
        setError('Missing decryption key or nonce')
      }
    }
  }, [src, tags])

  const decryptAndSetImage = async (src: string, encryptionAlgorithm: string, key: string, nonce: string) => {
    try {
      setIsDecrypting(true)
      setError(null)

      // Fetch the encrypted image data
      const response = await fetch(src)
      if (!response.ok) {
        throw new Error(`Failed to fetch encrypted image: ${response.statusText}`)
      }

      const ciphertext = new Uint8Array(await response.arrayBuffer())
      const decryptedData = decryptFile({ciphertext, key, nonce, encryptionAlgorithm})
      const blobUrl = URL.createObjectURL(new Blob([new Uint8Array(decryptedData)]))

      setImageSrc(blobUrl)

      // Clean up the blob URL when component unmounts
      return () => URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrypt image')
    } finally {
      setIsDecrypting(false)
    }
  }

  if (error) {
    return (
      <div className="max-h-80 rounded-lg my-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  if (isDecrypting) {
    return (
      <div className="max-h-80 rounded-lg my-2 bg-gray-100 border border-gray-300 px-4 py-3 flex items-center justify-center">
        <span>Decrypting image...</span>
      </div>
    )
  }

  return (
    <>
      <img src={imageSrc} className='max-h-80 rounded-lg my-2' />
    </>
  )
}

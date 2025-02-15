import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { bufferToHex } from '../extensions/FileUploadExtension'

const url = 'https://localhost:3000'

export const hash1 = '6c36995913e97b73d5365f93a7b524a9e45edc68e4f11b78060154987c53602c'
export const hash2 = '008a2224c4d2a513ab2a4add09a2ac20c2d9cec1144b5111bc1317edb2366eac'
export const hash3 = '94f4e40be68952422f78f5bf5ff63cddd2490bfdb7fa92351c3a38317043426c'

export const responses = {
  [hash1]: {
    sha256: hash1,
    url: `${url}/${hash1}`,
    type: 'image/png',
    size: 21792,
    nip94: {
      url: `${url}/${hash1}`,
      size: 21792,
      x: hash1,
      m: 'image/png',
      dim: '500x500',
    },
  },
  [hash2]: {
    sha256: hash2,
    url: `${url}/${hash2}`,
    type: 'image/png',
    size: 16630,
    nip94: {
      url: `${url}/${hash2}`,
      size: 16630,
      x: hash2,
      m: 'image/png',
      dim: '500x500',
    },
  },
  // error hash
  [hash3]: {
    message: 'Invalid file',
  },
}

export const mockBlossomServer = setupServer(
  http.put(`${url}/upload`, async (info) => {
    const buffer = (await info.request.body?.getReader().read())?.value
    if (buffer) {
      const sha256 = bufferToHex(await crypto.subtle.digest('SHA-256', buffer.buffer)) as keyof typeof responses
      if (sha256 === hash3) {
        // Return error file response
        return HttpResponse.json(responses[sha256] || {}, {
          status: 401,
          headers: { 'X-Reason': responses[sha256].message },
        })
      } else {
        return HttpResponse.json(responses[sha256] || {}, { status: 200 })
      }
    }
  }),
)

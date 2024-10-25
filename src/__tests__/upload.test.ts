import crypto from 'crypto'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import type { FileUploadExtension } from '../extensions/FileUploadExtension'
import { bufferToHex } from '../extensions/FileUploadExtension'
import { test } from './fixtures'

const server = setupServer(
  http.put('https://localhost:3000/upload', async (info) => {
    const contentType = info.request.headers.get('content-type')
    const buffer = (await info.request.body?.getReader().read())?.value
    if (buffer) {
      const sha256 = bufferToHex(await crypto.subtle.digest('SHA-256', buffer.buffer))
      return HttpResponse.json({
        sha256,
        url: `https://localhost:3000/${sha256}`,
        type: contentType,
        size: buffer?.buffer.byteLength,
      })
    }
  }),
)

describe('FileUpload', () => {
  beforeAll(() => {
    server.listen()
  })

  afterAll(() => {
    server.close()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  test('assert 2 successfully file uploads', async ({ editor, getFile }) => {
    const fileUpload = editor.extensionManager.extensions.find(
      (x) => x.name === 'fileUpload',
    ) as typeof FileUploadExtension

    const spySign = vitest.fn()
    const spyHash = vitest.fn()
    const spyStart = vitest.fn()
    const spyUpload = vitest.fn()
    const spyComplete = vitest.fn()

    fileUpload.options.sign = spySign
    fileUpload.options.hash = spyHash
    fileUpload.options.onStart = spyStart
    fileUpload.options.onUpload = spyUpload
    fileUpload.options.onComplete = spyComplete

    editor.setOptions()
    const file = await getFile('test_upload.png')
    const file2 = await getFile('test_upload2.png')

    editor.commands.setContent('GM!')
    editor.commands.addFile(file, editor.$doc.size - 2)
    editor.commands.addFile(file2, editor.$doc.size - 2)

    // less than ideal
    await new Promise<void>((resolve) => setTimeout(() => resolve()))

    const schema = editor.getJSON()

    expect(schema.content).toHaveLength(3)
    expect(schema.content?.[0]).toStrictEqual({ type: 'paragraph', content: [{ type: 'text', text: 'GM!' }] })
    expect(schema.content?.[1].type).toBe('image')
    expect(schema.content?.[1].attrs?.sha256).toBe(null)
    expect(schema.content?.[1].attrs?.src).toContain('blob:nodedata')
    expect(schema.content?.[2].type).toBe('image')
    expect(schema.content?.[2].attrs?.sha256).toBe(null)
    expect(schema.content?.[2].attrs?.src).toContain('blob:nodedata')

    editor.commands.uploadFiles()

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100))

    const schema2 = editor.getJSON()
    const hash1 = '008a2224c4d2a513ab2a4add09a2ac20c2d9cec1144b5111bc1317edb2366eac'
    const hash2 = '6c36995913e97b73d5365f93a7b524a9e45edc68e4f11b78060154987c53602c'
    expect(schema2.content?.[1].attrs?.sha256).toStrictEqual(hash1)
    expect(schema2.content?.[1].attrs?.src).toStrictEqual(`https://localhost:3000/${hash1}`)
    expect(schema2.content?.[2].attrs?.sha256).toStrictEqual(hash2)
    expect(schema2.content?.[2].attrs?.src).toStrictEqual(`https://localhost:3000/${hash2}`)
    const files = [
      {
        sha256: '008a2224c4d2a513ab2a4add09a2ac20c2d9cec1144b5111bc1317edb2366eac',
        url: 'https://localhost:3000/008a2224c4d2a513ab2a4add09a2ac20c2d9cec1144b5111bc1317edb2366eac',
        type: 'image/jpeg',
        size: 16630,
      },
      {
        sha256: '6c36995913e97b73d5365f93a7b524a9e45edc68e4f11b78060154987c53602c',
        url: 'https://localhost:3000/6c36995913e97b73d5365f93a7b524a9e45edc68e4f11b78060154987c53602c',
        type: 'image/jpeg',
        size: 21792,
      },
    ]
    expect(editor.storage.fileUpload).toStrictEqual({ files })

    expect(spySign).toHaveBeenCalledTimes(2)
    expect(spyHash).toHaveBeenCalledTimes(2)
    expect(spyStart).toHaveBeenCalledOnce()
    expect(spyUpload).toHaveBeenNthCalledWith(1, editor, files[0])
    expect(spyUpload).toHaveBeenNthCalledWith(2, editor, files[1])
    expect(spyComplete).toHaveBeenNthCalledWith(1, editor, files)

    expect(editor.getText({ blockSeparator: ' ' })).toStrictEqual(
      `GM! https://localhost:3000/008a2224c4d2a513ab2a4add09a2ac20c2d9cec1144b5111bc1317edb2366eac https://localhost:3000/6c36995913e97b73d5365f93a7b524a9e45edc68e4f11b78060154987c53602c`,
    )
  })
})

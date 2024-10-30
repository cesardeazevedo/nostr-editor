import crypto from 'crypto'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { bufferToHex } from '../extensions/FileUploadExtension'
import { test } from './fixtures'

const hash1 = '6c36995913e97b73d5365f93a7b524a9e45edc68e4f11b78060154987c53602c'
const hash2 = '008a2224c4d2a513ab2a4add09a2ac20c2d9cec1144b5111bc1317edb2366eac'
// error hash
const hash3 = '94f4e40be68952422f78f5bf5ff63cddd2490bfdb7fa92351c3a38317043426c'

const res1 = {
  sha256: hash1,
  url: `https://localhost:3000/${hash1}`,
  type: 'image/png',
  size: 21792,
  tags: [],
}
const res2 = {
  sha256: hash2,
  url: `https://localhost:3000/${hash2}`,
  type: 'image/png',
  size: 16630,
  tags: [],
}

const server = setupServer(
  http.put('https://localhost:3000/upload', async (info) => {
    const contentType = info.request.headers.get('content-type')
    const buffer = (await info.request.body?.getReader().read())?.value
    if (buffer) {
      const sha256 = bufferToHex(await crypto.subtle.digest('SHA-256', buffer.buffer))
      // Test error file
      if (sha256 === hash3) {
        return HttpResponse.json({ message: 'Invalid file' }, { status: 401 })
      }
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

  test('assert 2 successfully file uploads', async ({ editor, getFile, fileUploadSpies }) => {
    const { spySign, spyHash, spyDrop, spyStart, spyUpload, spyUploadError, spyComplete } = fileUploadSpies(editor)

    const file = await getFile('test_upload.png')
    const file2 = await getFile('test_upload2.png')

    editor.commands.setContent('GM!')
    editor.commands.addFile(file2, editor.$doc.size - 2)
    editor.commands.addFile(file, editor.$doc.size - 2)

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

    const files = await editor.storage.fileUpload.uploader.start()

    expect(files).toHaveLength(2)

    const schema2 = editor.getJSON()
    expect(schema2.content?.[1].attrs?.sha256).toStrictEqual(hash1)
    expect(schema2.content?.[1].attrs?.src).toStrictEqual(`https://localhost:3000/${hash1}.png`)
    expect(schema2.content?.[2].attrs?.sha256).toStrictEqual(hash2)
    expect(schema2.content?.[2].attrs?.src).toStrictEqual(`https://localhost:3000/${hash2}.png`)

    expect(spySign).toHaveBeenCalledTimes(2)
    expect(spyHash).toHaveBeenCalledTimes(2)
    expect(spyDrop).toHaveBeenCalledTimes(2)
    expect(spyStart).toHaveBeenCalledOnce()
    expect(spyUpload).toHaveBeenNthCalledWith(1, editor, res1)
    expect(spyUpload).toHaveBeenNthCalledWith(2, editor, res2)
    expect(spyUploadError).not.toHaveBeenCalled()
    expect(spyComplete).toHaveBeenNthCalledWith(1, editor, files)

    expect(editor.getText({ blockSeparator: ' ' })).toStrictEqual(
      `GM! https://localhost:3000/${hash1}.png https://localhost:3000/${hash2}.png`,
    )
  })

  test('assert error upload', async ({ editor, getFile, fileUploadSpies }) => {
    const { spyDrop, spyUpload, spyUploadError, spyComplete } = fileUploadSpies(editor)

    const file = await getFile('test_upload.png')
    const file2 = await getFile('test_upload_error.png')

    editor.commands.setContent('GM!')
    editor.commands.addFile(file2, editor.$doc.size - 2)
    editor.commands.addFile(file, editor.$doc.size - 2)

    await new Promise<void>((resolve) => setTimeout(() => resolve()))
    await expect(editor.storage.fileUpload.uploader.start()).rejects.toStrictEqual(new Error('Error: Invalid file'))

    const schema2 = editor.getJSON()
    expect(schema2.content?.[1].attrs?.sha256).toStrictEqual(hash1)
    expect(schema2.content?.[1].attrs?.uploadError).toBeNull()
    expect(schema2.content?.[2].attrs?.sha256).toBeNull()
    expect(schema2.content?.[2].attrs?.uploadError).toStrictEqual('Error: Invalid file')

    expect(spyDrop).toHaveBeenCalledTimes(2)
    expect(spyUpload).toHaveBeenCalledOnce()
    expect(spyUpload).toHaveBeenCalledWith(editor, res1)
    expect(spyUploadError).toHaveBeenCalledOnce()
    expect(spyUploadError).toHaveBeenCalledWith(editor, { uploadError: 'Error: Invalid file' })
    expect(spyComplete).not.toHaveBeenCalledOnce()
  })

  test('assert uploads with immediateUpload true', async ({
    editor,
    getFile,
    fileUploadExtension,
    fileUploadSpies,
  }) => {
    const fileUpload = fileUploadExtension(editor)
    fileUpload.options.immediateUpload = true

    const { spyDrop, spyStart, spyUpload, spyUploadError, spyComplete } = fileUploadSpies(editor)

    const file = await getFile('test_upload.png')

    editor.commands.setContent('GM!')
    editor.commands.addFile(file, editor.$doc.size - 2)

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100))

    expect(spyDrop).toHaveBeenCalledOnce()
    expect(spyStart).toHaveBeenCalledOnce()
    expect(spyUpload).toHaveBeenCalledOnce()
    expect(spyUploadError).not.toHaveBeenCalled()
    expect(spyComplete).toHaveBeenCalledOnce()
  })
})

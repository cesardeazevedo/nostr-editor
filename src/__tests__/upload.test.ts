import { hash1, hash2, responses, mockBlossomServer } from './mockBlossom'
import { test } from './fixtures'
import { fakeEvent } from './testUtils'

function getReponse(hash: typeof hash1 | typeof hash2) {
  const res = responses[hash]
  return {
    sha256: res.sha256,
    type: res.type,
    size: res.size,
    url: res.url + '.png',
    tags: [
      ['url', res.url + '.png'],
      ['size', res.size],
      ['x', res.sha256],
      ['m', res.type],
      ['dim', '500x500'],
    ],
  }
}

const res1 = getReponse(hash1)
const res2 = getReponse(hash2)

describe('FileUpload', () => {
  beforeAll(() => {
    mockBlossomServer.listen()
  })

  afterAll(() => {
    mockBlossomServer.close()
  })

  afterEach(() => {
    mockBlossomServer.resetHandlers()
  })

  test('assert 2 successfully file uploads', async ({ editor, getFile, fileUploadSpies }) => {
    const { spySign, spyHash, spyDrop, spyStart, spyUpload, spyUploadError, spyComplete } = fileUploadSpies(editor)

    const file = await getFile('test_upload.png')
    const file2 = await getFile('test_upload2.png')

    editor.commands.setContent('GM!')
    editor.storage.fileUpload.uploader.addFile(file, editor.$doc.size - 2)
    editor.storage.fileUpload.uploader.addFile(file2, editor.$doc.size - 2)

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
    editor.storage.fileUpload.uploader.addFile(file, editor.$doc.size - 2)
    editor.storage.fileUpload.uploader.addFile(file2, editor.$doc.size - 2)

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
    expect(spyUploadError).toHaveBeenCalledWith(editor, {
      uploadError: 'Error: Invalid file',
      url: 'https://localhost:3000',
    })
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

  test('assert blob urls as pending uploads and real urls as uploaded', async ({
    editor,
    getFile,
    fileUploadExtension,
  }) => {
    const fileUpload = fileUploadExtension(editor)
    editor.commands.setEventContent(fakeEvent({ content: 'test link https://nostr.com/image.jpg' }))
    await expect(editor.storage.fileUpload.uploader.start()).resolves.toEqual([
      {
        alt: null,
        file: null,
        sha256: null,
        src: 'https://nostr.com/image.jpg',
        tags: null,
        uploadError: null,
        uploadType: 'blossom',
        uploadUrl: 'https://localhost:3000',
        uploading: false,
      },
    ])
    editor.commands.clearContent()
    const file = await getFile('test_upload.png')
    editor.commands.addFile(file, editor.$doc.size - 2)
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100))
    const found = fileUpload.storage.uploader?.['findNodes'](false)
    expect(found).toHaveLength(1)
    expect(found?.[0][0].type.name).toBe('image')
  })
})

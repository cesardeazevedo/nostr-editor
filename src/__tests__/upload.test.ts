import { test } from './fixtures'
import { fakeEvent, getFakeUrl, getFakeHash, getFakeTask } from './testUtils'

describe('FileUpload', () => {
  test('assert 2 successfully file uploads', async ({ editor, getFile, fileUploadSpies }) => {
    const { spyOnDrop, spyOnStart, spyOnUpload, spyOnUploadError, spyOnComplete } = fileUploadSpies(editor)

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
    expect(schema2.content?.[1].attrs?.sha256).toStrictEqual(getFakeHash(file))
    expect(schema2.content?.[1].attrs?.src).toStrictEqual(getFakeUrl(file))
    expect(schema2.content?.[2].attrs?.sha256).toStrictEqual(getFakeHash(file2))
    expect(schema2.content?.[2].attrs?.src).toStrictEqual(getFakeUrl(file2))

    expect(spyOnDrop).toHaveBeenCalledTimes(2)
    expect(spyOnStart).toHaveBeenCalledOnce()
    expect(spyOnUpload).toHaveBeenNthCalledWith(1, editor, getFakeTask(file))
    expect(spyOnUpload).toHaveBeenNthCalledWith(2, editor, getFakeTask(file2))
    expect(spyOnUploadError).not.toHaveBeenCalled()
    expect(spyOnComplete).toHaveBeenNthCalledWith(1, editor, files)

    expect(editor.getText({ blockSeparator: ' ' })).toStrictEqual(
      `GM! ${getFakeUrl(file)} ${getFakeUrl(file2)}`,
    )
  })

  test('assert error upload', async ({ editor, getFile, fileUploadSpies }) => {
    const { spyOnDrop, spyOnUpload, spyOnUploadError, spyOnComplete } = fileUploadSpies(editor)

    const file = await getFile('test_upload.png')
    const file2 = await getFile('test_upload_error.png')

    editor.commands.setContent('GM!')
    editor.storage.fileUpload.uploader.addFile(file, editor.$doc.size - 2)
    editor.storage.fileUpload.uploader.addFile(file2, editor.$doc.size - 2)

    await expect(editor.storage.fileUpload.uploader.start()).rejects.toStrictEqual(new Error('Invalid file'))

    const schema2 = editor.getJSON()
    expect(schema2.content?.[1].attrs?.sha256).toStrictEqual(getFakeHash(file))
    expect(schema2.content?.[1].attrs?.error).toBeNull()
    expect(schema2.content?.[2].attrs?.sha256).toBeNull()
    expect(schema2.content?.[2].attrs?.error).toStrictEqual('Invalid file')

    expect(spyOnDrop).toHaveBeenCalledTimes(2)
    expect(spyOnUpload).toHaveBeenCalledOnce()
    expect(spyOnUpload).toHaveBeenCalledWith(editor, getFakeTask(file))
    expect(spyOnUploadError).toHaveBeenCalledOnce()
    expect(spyOnUploadError).toHaveBeenCalledWith(editor, {error: 'Invalid file'})
    expect(spyOnComplete).not.toHaveBeenCalledOnce()
  })

  test('assert uploads with immediateUpload true', async ({
    editor,
    getFile,
    fileUploadExtension,
    fileUploadSpies,
  }) => {
    const fileUpload = fileUploadExtension(editor)
    fileUpload.options.immediateUpload = true

    const { spyOnDrop, spyOnStart, spyOnUpload, spyOnUploadError, spyOnComplete } = fileUploadSpies(editor)

    const file = await getFile('test_upload.png')

    editor.commands.setContent('GM!')
    editor.commands.addFile(file, editor.$doc.size - 2)

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 100))

    expect(spyOnDrop).toHaveBeenCalledOnce()
    expect(spyOnStart).toHaveBeenCalledOnce()
    expect(spyOnUpload).toHaveBeenCalledOnce()
    expect(spyOnUploadError).not.toHaveBeenCalled()
    expect(spyOnComplete).toHaveBeenCalledOnce()
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
        error: null,
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

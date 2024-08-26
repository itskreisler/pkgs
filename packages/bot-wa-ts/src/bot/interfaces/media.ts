import { readFileSync, statSync } from 'fs'
export class Media {
  mimetype: string
  buffer: Buffer
  size: number
  text?: string
  isImage: boolean
  isVideo: boolean
  isAudio: boolean
  isDocument: boolean
  viewOnce: boolean

  constructor(buffer: Buffer, opts: { mimetype: string, size: number, text?: string, viewOnce?: boolean }) {
    const { mimetype, size, text, viewOnce } = opts
    this.buffer = buffer
    this.size = size
    this.text = text
    this.mimetype = mimetype
    this.viewOnce = !(viewOnce === false)
    this.isImage = Boolean(mimetype.startsWith('image'))
    this.isVideo = Boolean(mimetype.startsWith('video'))
    this.isAudio = Boolean(mimetype.startsWith('audio'))
    this.isDocument = Boolean(mimetype.startsWith('document'))
  }

  static create(path: string, opts: {
    mimetype: 'image' | 'video' | 'gif' | 'sticker'
    text?: string
    viewOnce?: boolean
  }): Media {
    const realPath = require.resolve(path)

    try {
      const { mimetype, text, viewOnce } = opts

      const { size } = statSync(realPath)
      const buffer = readFileSync(realPath)

      return new Media(buffer, {
        mimetype,
        size,
        text,
        viewOnce
      })
    } catch (e) {
      throw new Error('Can not read file from path ' + realPath)
    }
  }
}

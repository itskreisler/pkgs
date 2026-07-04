import type TelegramBot from 'node-telegram-bot-api'
import { type ClientBot } from '@/bot/core/main'
import { EChatType } from './constants'
import { Readable } from 'stream'
import path from 'path'
import fs from 'fs/promises'
import { IClsBot } from './proto'

type SendMessageOptions = Parameters<TelegramBot['sendMessage']>[2]
type SendDocumentOptions = Parameters<TelegramBot['sendDocument']>[2]
type SendPhotoOptions = Parameters<TelegramBot['sendPhoto']>[2]
type SendVideoOptions = Parameters<TelegramBot['sendVideo']>[2]
type SendStickerOptions = Parameters<TelegramBot['sendSticker']>[1]
type SendAudioOptions = Parameters<TelegramBot['sendAudio']>[2]
type FileOptions = Parameters<TelegramBot['sendDocument']>[3]
type EditMessageTextForm = Parameters<TelegramBot['editMessageText']>[0]
type EditMessageTextResult = Awaited<ReturnType<TelegramBot['editMessageText']>>
type TelegramMessage = Awaited<ReturnType<TelegramBot['sendMessage']>>
type DownloadMediaMode = 'path' | 'buffer' | 'stream' | 'all'
interface DownloadedMedia {
  path: string
  buffer: Buffer
  stream: Readable
  fileLink: string
}
type MediaSource =
  | NonNullable<TelegramMessage['document']>
  | NonNullable<TelegramMessage['video']>
  | NonNullable<TelegramMessage['audio']>
  | NonNullable<TelegramMessage['sticker']>
  | NonNullable<NonNullable<TelegramMessage['photo']>[number]>

export class Message {
  protected _data: TelegramMessage
  chatId: number
  client: ClientBot | TelegramBot
  message_id: number
  text: string | undefined
  isReply: boolean
  isGroup: boolean
  isChannel: boolean
  // fromMe: boolean
  // hasMedia: boolean

  constructor(client: ClientBot | TelegramBot, data: TelegramMessage) {
    this.client = client
    this._data = data
    this.text = data.text
    this.chatId = data.chat.id
    this.isReply = typeof data.reply_to_message !== 'undefined'
    this.isGroup = data.chat.type === EChatType.Group || data.chat.type === EChatType.SuperGroup
    this.isChannel = data.chat.type === EChatType.Channel
    this.message_id = data.message_id
  }

  getData() {
    // this.send({text : 'hola', { parse_mode: 'Markdown' }})
    return this._data
  }

  // sobre carga de metodos
  async send(
    content: { text: string },
    options?: SendMessageOptions
  ): Promise<Message>
  async send(
    content: { doc: string | Readable | Buffer },
    options?: SendDocumentOptions,
    fileOptions?: FileOptions
  ): Promise<Message>
  async send(
    content: { photo: string | Readable | Buffer },
    options?: SendPhotoOptions,
    fileOptions?: FileOptions
  ): Promise<Message>
  async send(
    content: { video: string | Readable | Buffer },
    options?: SendVideoOptions,
    fileOptions?: FileOptions
  ): Promise<Message>
  async send(
    content: { sticker: string | Readable | Buffer },
    options?: SendStickerOptions
  ): Promise<Message>
  async send(
    content: { audio: string | Readable | Buffer },
    options?: SendAudioOptions,
    fileOptions?: FileOptions
  ): Promise<Message>
  //
  async send(content: IClsBot.TSendContent,
    options?:
      | SendMessageOptions
      | SendDocumentOptions
      | SendPhotoOptions
      | SendVideoOptions
      | SendStickerOptions
      | SendAudioOptions,
    fileOptions?: FileOptions
  ) {
    const { text, doc, photo, audio, video } = content
    if (typeof text !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendMessage(this.chatId, text, options as SendMessageOptions)))
    if (typeof doc !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendDocument(this.chatId, doc, options as SendDocumentOptions, fileOptions)))
    if (typeof photo !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendPhoto(this.chatId, photo, options as SendPhotoOptions, fileOptions)))
    if (typeof video !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendVideo(this.chatId, video, options as SendVideoOptions, fileOptions)))
    if (typeof audio !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendAudio(this.chatId, audio, options as SendAudioOptions, fileOptions)))
    throw new Error('Invalid content provided.')
  }

  async reply(content: any, options?: any) {
    return await Promise.resolve(this.client.sendMessage(this.chatId, content, { ...options, reply_to_message_id: this._data.message_id }))
  }

  async delete() {
    return await Promise.resolve(await this.client.deleteMessage(this.chatId, this._data.message_id))
  }

  async editText(
    text: string,
    options?: Omit<EditMessageTextForm, 'text' | 'chat_id' | 'message_id'>
  ): Promise<EditMessageTextResult> {
    return await Promise.resolve(
      await this.client.editMessageText({
        ...options,
        text,
        chat_id: this.chatId,
        message_id: this.message_id
      })
    )
  }

  private getSourceMessage() {
    return this._data.reply_to_message ?? this._data
  }

  private getMediaSource(message: TelegramMessage): MediaSource | null {
    return (
      message.document ??
      message.video ??
      message.audio ??
      message.sticker ??
      message.photo?.at(-1) ??
      null
    )
  }

  private async getMediaBuffer(fileLink: string): Promise<Buffer> {
    const response = await fetch(fileLink)

    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.status} ${response.statusText}`)
    }

    return Buffer.from(await response.arrayBuffer())
  }

  private async writeMediaFile(outputDir: string, fileLink: string, fileId: string, buffer: Buffer): Promise<string> {
    await fs.mkdir(outputDir, { recursive: true })

    const fileNameFromLink = path.basename(new URL(fileLink).pathname)
    const fileName = fileNameFromLink || `${fileId}.bin`
    const outputPath = path.join(outputDir, fileName)

    await fs.writeFile(outputPath, buffer)
    return outputPath
  }

  private buildMediaResult(fileLink: string, filePath: string, buffer: Buffer): DownloadedMedia {
    return {
      fileLink,
      path: filePath,
      buffer,
      stream: Readable.from(buffer)
    }
  }

  async downloadMedia(outputDir?: string): Promise<string | null>
  async downloadMedia(mode: 'buffer', outputDir?: string): Promise<Buffer | null>
  async downloadMedia(mode: 'stream', outputDir?: string): Promise<Readable | null>
  async downloadMedia(mode: 'all', outputDir?: string): Promise<DownloadedMedia | null>
  async downloadMedia(mode: 'path', outputDir?: string): Promise<string | null>
  async downloadMedia(
    modeOrOutputDir: DownloadMediaMode | string = 'path',
    maybeOutputDir = './tmp'
  ): Promise<string | Buffer | Readable | DownloadedMedia | null> {
    const mode: DownloadMediaMode =
      modeOrOutputDir === 'path' || modeOrOutputDir === 'buffer' || modeOrOutputDir === 'stream' || modeOrOutputDir === 'all'
        ? modeOrOutputDir
        : 'path'
    const outputDir = mode === 'path' && modeOrOutputDir !== 'path'
      ? modeOrOutputDir
      : maybeOutputDir

    const sourceMessage = this.getSourceMessage()
    const mediaSource = this.getMediaSource(sourceMessage)

    if (!mediaSource) return null

    const fileId = mediaSource.file_id
    const fileLink = await this.client.getFileLink(fileId)
    const buffer = await this.getMediaBuffer(fileLink)
    const filePath = await this.writeMediaFile(outputDir, fileLink, fileId, buffer)
    const media = this.buildMediaResult(fileLink, filePath, buffer)

    if (mode === 'buffer') return media.buffer
    if (mode === 'stream') return media.stream
    if (mode === 'all') return media
    return media.path
  }

  getQuotedMsg() {
    return this._data.reply_to_message
  }
}

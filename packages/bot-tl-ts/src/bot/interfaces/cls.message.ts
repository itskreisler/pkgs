import type TelegramBot from 'node-telegram-bot-api'
import { type ClientBot } from '@/bot/core/main'
import { EChatType } from './constants'
import { type Stream } from 'stream'
import { IClsBot } from './proto'
export class Message {
  protected _data: TelegramBot.Message
  chatId: number
  client: ClientBot | TelegramBot
  message_id: number
  text
  isReply: boolean
  isGroup: boolean
  isChannel: boolean
  // fromMe: boolean
  // hasMedia: boolean

  constructor(client: ClientBot | TelegramBot, data: TelegramBot.Message) {
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
    options?: TelegramBot.SendMessageOptions
  ): Promise<Message>
  async send(
    content: { doc: string | Stream | Buffer },
    options?: TelegramBot.SendDocumentOptions,
    fileOptions?: TelegramBot.FileOptions
  ): Promise<Message>
  async send(
    content: { photo: string | Stream | Buffer },
    options?: TelegramBot.SendPhotoOptions,
    fileOptions?: TelegramBot.FileOptions
  ): Promise<Message>
  async send(
    content: { video: string | Stream | Buffer },
    options?: TelegramBot.SendVideoOptions,
    fileOptions?: TelegramBot.FileOptions
  ): Promise<Message>
  async send(
    content: { sticker: string | Stream | Buffer },
    options?: TelegramBot.SendStickerOptions
  ): Promise<Message>
  async send(
    content: { audio: string | Stream | Buffer },
    options?: TelegramBot.SendAudioOptions,
    fileOptions?: TelegramBot.FileOptions
  ): Promise<Message>
  //
  async send(content: IClsBot.TSendContent,
    options?: TelegramBot.SendMessageOptions
    | TelegramBot.SendDocumentOptions
    | TelegramBot.SendPhotoOptions
    | TelegramBot.SendVideoOptions
    | TelegramBot.SendStickerOptions
    | TelegramBot.SendAudioOptions,
    fileOptions?: TelegramBot.FileOptions
  ) {
    const { text, doc, photo, audio, video } = content
    if (typeof text !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendMessage(this.chatId, text, options)))
    if (typeof doc !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendDocument(this.chatId, doc, options, fileOptions)))
    if (typeof photo !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendPhoto(this.chatId, photo, options, fileOptions)))
    if (typeof video !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendVideo(this.chatId, video, options, fileOptions)))
    if (typeof audio !== 'undefined') return new Message(this.client, await Promise.resolve(this.client.sendAudio(this.chatId, audio, options, fileOptions)))
    throw new Error('Invalid content provided.')
  }

  async reply(content: any, options?: any) {
    return await Promise.resolve(this.client.sendMessage(this.chatId, content, { ...options, reply_to_message_id: this._data.message_id }))
  }

  async delete() {
    return await Promise.resolve(await this.client.deleteMessage(this.chatId, this._data.message_id))
  }

  async editText(text: string, options?: TelegramBot.EditMessageTextOptions): Promise<TelegramBot.Message | boolean> {
    return await Promise.resolve(await this.client.editMessageText(text, { ...options, chat_id: this.chatId, message_id: this.message_id }))
  }

  downloadMedia(): undefined {

  }

  getQuotedMsg() {
    return this._data.reply_to_message
  }
}

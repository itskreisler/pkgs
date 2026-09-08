import {
  Bot,
  InputFile,
  type BotOptions,
  type ChatId,
  type Message,
  type SendMessageParams,
  type SendDocumentParams,
  type SendPhotoParams,
  type SendVideoParams,
  type SendAudioParams,
  type SendStickerParams,
  type EditMessageTextParams,
  type SetMyCommandsParams,
  type SendMediaGroupParams,
  type BotCommand,
  type InputMedia
} from 'node-telegram-bot-api'
import { fromPath } from 'node-telegram-bot-api/node'
import fs from 'fs'
import { type Readable } from 'stream'
import { TELEGRAM_TOKEN_DEV, TELEGRAM_TOKEN_PROD, NODE_ENV } from '../helpers/env.js'
import { type IClsBot } from '../interfaces/proto'

const TOKEN: string = NODE_ENV === 'production' ? TELEGRAM_TOKEN_PROD : TELEGRAM_TOKEN_DEV

export async function toInputFile (input: string | Readable | Buffer | InputFile): Promise<string | InputFile> {
  if (input instanceof InputFile) return input
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://') || !fs.existsSync(input)) {
      return input
    }
    return await fromPath(input)
  }
  if (Buffer.isBuffer(input)) {
    return new InputFile(input)
  }
  return new InputFile(() => input as any)
}

export class ClientBot extends Bot {
  token: string
  commands = new Map<RegExp, IClsBot.IExportCMD>()
  slashArray = []

  constructor (
    token = TOKEN,
    options?: BotOptions
  ) {
    super(token, options)
    this.token = token
  }

  get Bot () {
    return this
  }

  async sendMessage (chatId: ChatId, text: string, options?: Omit<SendMessageParams, 'chat_id' | 'text'>): Promise<Message> {
    return await this.api.sendMessage({ chat_id: chatId, text, ...options })
  }

  async sendDocument (chatId: ChatId, doc: string | Readable | Buffer | InputFile, options?: Omit<SendDocumentParams, 'chat_id' | 'document'>, fileOptions?: any): Promise<Message> {
    const document = await toInputFile(doc)
    return await this.api.sendDocument({ chat_id: chatId, document, ...options })
  }

  async sendPhoto (chatId: ChatId, photo: string | Readable | Buffer | InputFile, options?: Omit<SendPhotoParams, 'chat_id' | 'photo'>, fileOptions?: any): Promise<Message> {
    const photoInput = await toInputFile(photo)
    return await this.api.sendPhoto({ chat_id: chatId, photo: photoInput, ...options })
  }

  async sendVideo (chatId: ChatId, video: string | Readable | Buffer | InputFile, options?: Omit<SendVideoParams, 'chat_id' | 'video'>, fileOptions?: any): Promise<Message> {
    const videoInput = await toInputFile(video)
    return await this.api.sendVideo({ chat_id: chatId, video: videoInput, ...options })
  }

  async sendAudio (chatId: ChatId, audio: string | Readable | Buffer | InputFile, options?: Omit<SendAudioParams, 'chat_id' | 'audio'>, fileOptions?: any): Promise<Message> {
    const audioInput = await toInputFile(audio)
    return await this.api.sendAudio({ chat_id: chatId, audio: audioInput, ...options })
  }

  async sendSticker (chatId: ChatId, sticker: string | Readable | Buffer | InputFile, options?: Omit<SendStickerParams, 'chat_id' | 'sticker'>): Promise<Message> {
    const stickerInput = await toInputFile(sticker)
    return await this.api.sendSticker({ chat_id: chatId, sticker: stickerInput, ...options })
  }

  async deleteMessage (chatId: ChatId, messageId: number): Promise<boolean> {
    return await this.api.deleteMessage({ chat_id: chatId, message_id: messageId })
  }

  async editMessageText (params: EditMessageTextParams): Promise<Message | boolean> {
    return await this.api.editMessageText(params)
  }

  async getFileLink (fileId: string): Promise<string> {
    const file = await this.api.getFile({ file_id: fileId })
    if (!file.file_path) {
      throw new Error('File path not found for file_id: ' + fileId)
    }
    return `https://api.telegram.org/file/bot${this.token}/${file.file_path}`
  }

  async setMyCommands (commands: BotCommand[], options?: Omit<SetMyCommandsParams, 'commands'>): Promise<boolean> {
    return await this.api.setMyCommands({ commands, ...options })
  }

  /**
   * @description Envia un grupo de 10 (fotos) al chat
   */
  async sendMediaGroupTenByTen (
    chatId: ChatId,
    medias: readonly InputMedia[],
    options?: Omit<SendMediaGroupParams, 'chat_id' | 'media'>
  ): Promise<Message[]> {
    // Divide las imágenes en grupos de 10
    const chunkedMedias: InputMedia[][] = medias.reduce<InputMedia[][]>((acc, cur, i) => {
      if (i % 10 === 0) {
        acc.push([cur])
      } else {
        acc[acc.length - 1].push(cur)
      }
      return acc
    }, [])
    // Envía cada grupo de 10 imágenes
    const promises = chunkedMedias.map(async (chunk) => await this.api.sendMediaGroup({ chat_id: chatId, media: chunk, ...options }))
    return (await Promise.all(promises)).flat()
  }

  async sendDocumentOnebyOne (
    chatId: ChatId,
    documents: (string | Readable | Buffer | InputFile)[],
    options?: Omit<SendDocumentParams, 'chat_id' | 'document'>,
    fileOptions?: any) {
    // Mapea cada documento a una promesa de envío
    const promises = documents.map(async (document) => await this.sendDocument(chatId, document, options, fileOptions))

    // Espera a que todas las promesas se completen
    return await Promise.all(promises)
  }

  async initialize () {
    await this.loadEvents()
    await this.loadHandlers()
    await this.loadCommands()
    // await this.loadCommandsSlash()
    this.api.getMe().then((me) => {
      console.log(
        '✅ [Telegram] Logged in as: https://t.me/'.concat(me.username ?? 'unknown')
      )
    }).catch((err) => {
      console.error('❌ [Telegram] Failed to getMe:', err)
    })
    this.startPolling().catch((err) => {
      console.error('❌ [Telegram] Polling error:', err)
    })
  }

  get getCommands (): [RegExp, IClsBot.IExportCMD][] {
    return Array.from(this.commands)
  }

  findCommand (str: string): [boolean, [RegExp, IClsBot.IExportCMD] | []] {
    const cmd = this.getCommands.find(([expreg]) => expreg.test(str))
    if (typeof cmd === 'undefined') {
      return [false, []]
    }
    return [true, cmd]
  }

  async dynamicImport<O>(path: string): Promise<O> {
    return await import(path)
  }

  async loadEvents () {
    console.log('📗(%) Cargando eventos')
    const events = [{
      event: 'message', path: '../events/client/message.js'
    }]

    for (const { event, path } of events) {
      const { handler } = await this.dynamicImport<{ handler: IClsBot.TImportEvent }>(path)
      this.on(event as any, async (ctx) => {
        if (ctx.message) {
          await handler(this, ctx.message)
        }
      })
    }
    console.log('📚(%) Eventos cargados')
  }

  async loadCommands () {
    console.log('📗(%) Cargando comandos')
    const commands = [
      { path: '../commands/public/cmd.ping.js' },
      { path: '../commands/public/expregYouTube.js' }
    ]

    for (const { path } of commands) {
      const moduleImport = await this.dynamicImport<IClsBot.IImportCMD>(path)
      const { active, regexp } = moduleImport.default
      if (active === false) continue
      this.commands.set(regexp, moduleImport.default)
    }
    console.log('📚(%) Comandos cargados', commands.length)
  }

  async loadCommandsSlash () {
    console.log('📗(%) Cargando comandos slash')
    const commands = await import('../commands/cmd/slash.js')
    await this.setMyCommands(commands.default as BotCommand[])
    console.log('📚(%) Comandos slash cargados correctamente')
  }

  async loadHandlers () {
    console.log('📗(%) Cargando manejadores')

    const handlers = [
      // {path: './devil.js'},
      { path: '../handlers/antiCrash.js' }
    ]

    for (const { path } of handlers) {
      const handler = await this.dynamicImport<{ default: () => void }>(path)
      handler.default()
    }
  }
}

export function dateNow (): string { return Date.now().toLocaleString() }

import TelegramBot from 'node-telegram-bot-api'
import { type Stream } from 'stream'
import { TELEGRAM_TOKEN_DEV, TELEGRAM_TOKEN_PROD, NODE_ENV } from '@/bot/helpers/env'
import { IClsBot } from '@/bot/interfaces/proto'
const TOKEN: string = NODE_ENV === 'production' ? TELEGRAM_TOKEN_PROD : TELEGRAM_TOKEN_DEV
export class ClientBot extends TelegramBot {
  commands = new Map<RegExp, IClsBot.IExportCMD>()
  slashArray = []
  //
  constructor(
    token = TOKEN,
    options = {
      polling: true
    }
  ) {
    super(token, {
      ...options
    })

    this.Bot.getMe().then((me) => {
      console.log(
        '✅ [Telegram] Logged in as: https://t.me/'.concat(me.username ?? 'unknown')
      )
    })
  }

  get Bot() {
    return this
  }

  /**
   * @description Envia un grupo de 10 (fotos) al chat
   */
  async sendMediaGroupTenByTen(
    chatId: TelegramBot.ChatId,
    medias: readonly TelegramBot.InputMedia[],
    options?: TelegramBot.SendMediaGroupOptions
  ): Promise<TelegramBot.Message[]> {
    const bot = this.Bot
    // Divide las imágenes en grupos de 10
    const chunkedMedias: TelegramBot.InputMedia[][] = medias.reduce<TelegramBot.InputMedia[][]>((acc, cur, i) => {
      if (i % 10 === 0) {
        acc.push([cur])
      } else {
        acc[acc.length - 1].push(cur)
      }
      return acc
    }, [])
    // Envía cada grupo de 10 imágenes
    const promises = chunkedMedias.map(async (chunk) => await bot.sendMediaGroup(chatId, chunk, options))
    return (await Promise.all(promises)).flat()
  }

  async sendDocumentOnebyOne(
    chatId: TelegramBot.ChatId,
    documents: string[] | Stream[] | Buffer[],
    options?: TelegramBot.SendDocumentOptions,
    fileOptions?: TelegramBot.FileOptions) {
    const bot = this.Bot
    // Mapea cada documento a una promesa de envío
    const promises = documents.map(async (document) => await bot.sendDocument(chatId, document, options, fileOptions))

    // Espera a que todas las promesas se completen
    return await Promise.all(promises)
  }

  async initialize() {
    await this.loadEvents()
    await this.loadHandlers()
    await this.loadCommands()
    // await this.loadCommandsSlash()
  }

  get getCommands(): [RegExp, IClsBot.IExportCMD][] {
    return Array.from(this.commands)
  }

  findCommand(str: string): [boolean, [RegExp, IClsBot.IExportCMD] | []] {
    const cmd = this.getCommands.find(([expreg]) => expreg.test(str))
    if (typeof cmd === 'undefined') {
      return [false, []]
    }
    return [true, cmd]
  }

  async dynamicImport<O>(path: string): Promise<O> {
    return await import(path)
  }

  async loadEvents() {
    console.log('📗(%) Cargando eventos')
    const events = [{
      event: 'message', path: './message.js'
    }]

    for (const { event, path } of events) {
      const { handler } = await this.dynamicImport<{ handler: IClsBot.TImportEvent }>(path)
      this.on(event, handler.bind(null, this))
    }
    console.log('📚(%) Eventos cargados')
  }

  async loadCommands() {
    console.log('📗(%) Cargando comandos')
    const commands = [
      { path: './cmd.ping.js' }
    ]

    for (const { path } of commands) {
      const moduleImport = await this.dynamicImport<IClsBot.IImportCMD>(path)
      const { active, regexp } = moduleImport.default
      if (active === false) continue
      this.commands.set(regexp, moduleImport.default)
    }
    console.log('📚(%) Comandos cargados')
  }

  async loadCommandsSlash() {
    console.log('📗(%) Cargando comandos slash')
    const commands = await import('@/bot/commands/cmd/slash')
    this.setMyCommands(commands.default)
    console.log('📚(%) Comandos slash cargados correctamente')
  }

  async loadHandlers() {
    console.log('📗(%) Cargando manejadores')

    const handlers = [
      // {path: './devil.js'},
      { path: './antiCrash.js' }
    ]

    for (const { path } of handlers) {
      const handler = await this.dynamicImport<{ default: () => void }>(path)
      handler.default()
    }
  }
}

export function dateNow(): string { return Date.now().toLocaleString() }

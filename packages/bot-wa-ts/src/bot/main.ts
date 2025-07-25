import {
  makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  type WASocket,
  type MediaType,
  type AnyMessageContent,
  type MiscMessageGenerationOptions,
  type DownloadableMessage,
  type MediaDownloadOptions,
  proto
} from 'baileys'
import pino from 'pino'
import { Sticker, createSticker, type IStickerOptions, StickerTypes } from 'wa-sticker-formatter'
import { CommandImport, WaMessageTypes, type MessageBody, type BodyMsg } from '@/bot/interfaces/inter'
import { Media } from '@/bot/interfaces/media'
import { Message } from './interfaces/message'
import { printLog } from '@/bot/helpers/utils'

//
class Whatsapp {
  printLog = printLog
  //
  upTime: number = Date.now()
  logger: any
  sock: WASocket
  status: number
  qr: string | null | undefined
  saveCreds: () => Promise<void>
  commands: Map<RegExp, CommandImport>
  folderCreds = 'creds'
  //
  constructor() {
    this.logger = pino({ level: 'silent' })
    /**
     * @type {import('baileys').WASocket}
     */
    this.sock = null as unknown as WASocket
    this.status = 0
    this.qr = null
    this.saveCreds = null as unknown as () => Promise<void>
    this.commands = new Map()
  }

  async getMeInfo() {
    return this.sock.user
  }

  //
  async sendMsgGroup(
    jids: string | string[],
    media: AnyMessageContent[] | Promise<AnyMessageContent[]>,
    options?: MiscMessageGenerationOptions,
    batchSize = 10 // Tamaño del lote, puedes ajustarlo según tus necesidades
  ): Promise<(proto.WebMessageInfo | undefined)[]> {
    const promises: Promise<proto.WebMessageInfo | undefined>[] = []
    const resolvedMedia = await Promise.resolve(media)
    if (resolvedMedia.length > batchSize) {
      return await this.sendMsgGroupBatch(jids, resolvedMedia, options)
    }
    const hasArray = Array.isArray(jids) && jids.length > 0
    if (hasArray) for (const jid of jids) for (const chunk of resolvedMedia) promises.push(this.sock.sendMessage(jid, chunk, options))
    else if (typeof jids === 'string') for (const chunk of resolvedMedia) promises.push(this.sock.sendMessage(jids, chunk, options))
    return await Promise.all(promises)
  }

  async sendMsgGroupBatch(
    jids: string | string[], media: AnyMessageContent[] | Promise<AnyMessageContent[]>,
    options?: MiscMessageGenerationOptions,
    batchSize = 5 // Tamaño del lote, puedes ajustarlo según tus necesidades
  ): Promise<(proto.WebMessageInfo | undefined)[]> {
    const resolvedMedia = await Promise.resolve(media)
    const jidArray = Array.isArray(jids) ? jids : [jids]
    const results: (proto.WebMessageInfo | undefined)[] = []

    // Helper para procesar un lote de promesas
    const processBatch = async (batch: Promise<proto.WebMessageInfo | undefined>[]) => {
      const batchResults = await Promise.all(batch)
      results.push(...batchResults)
    }

    // Crear lotes
    let batch: Promise<proto.WebMessageInfo | undefined>[] = []
    for (const jid of jidArray) {
      for (const chunk of resolvedMedia) {
        batch.push(this.sock.sendMessage(jid, chunk, options))

        // Si alcanzamos el tamaño del lote, procesarlo
        if (batch.length >= batchSize) {
          await processBatch(batch)
          batch = [] // Vaciar el lote después de procesarlo
        }
      }
    }

    // Procesar el último lote si quedó algún mensaje sin enviar
    if (batch.length > 0) {
      await processBatch(batch)
    }

    return results
  }

  //
  getTextMessage(c: proto.IMessage | null | undefined): BodyMsg {
    let typeMessage = Object.keys(c as proto.IMessage ?? {})[0] as WaMessageTypes
    if (typeof c === 'undefined') return { typeMessage }
    // logica en caso de que sea un mensaje de texto extendido
    const hasExtendedTextMessage = this.hasOwnProp(c, WaMessageTypes.extendedTextMessage)
    if (hasExtendedTextMessage) {
      typeMessage = WaMessageTypes.extendedTextMessage
      return {
        body: c?.extendedTextMessage?.text,
        typeMessage
      }
    }
    // logica en caso de que sea una imagen
    const hasImageMessage: boolean = this.hasOwnProp(c, WaMessageTypes.imageMessage)
    if (hasImageMessage) {
      const hasImageMessageCaption: boolean = this.hasOwnProp(c, WaMessageTypes.imageMessage.concat('.').concat('caption'))
      typeMessage = WaMessageTypes.imageMessage
      if (hasImageMessageCaption) {
        return {
          body: c?.imageMessage?.caption ?? '',
          typeMessage
        }
      } else {
        return {
          typeMessage
        }
      }
    }
    // logica en caso de que sea un video
    const hasVideoMessage: boolean = this.hasOwnProp(c, WaMessageTypes.videoMessage)
    if (hasVideoMessage) {
      const hasVideoMessageCaption: boolean = this.hasOwnProp(c, WaMessageTypes.videoMessage.concat('.').concat('caption'))
      typeMessage = WaMessageTypes.videoMessage
      if (hasVideoMessageCaption) {
        return {
          body: c?.videoMessage?.caption,
          typeMessage
        }
      } else {
        return {
          typeMessage
        }
      }
    }
    // logica en caso de que sea un documento con caption
    const hasDocumentWithCaptionMessage: boolean = this.hasOwnProp(c, WaMessageTypes.documentWithCaptionMessage)
    if (hasDocumentWithCaptionMessage) {
      typeMessage = WaMessageTypes.documentWithCaptionMessage
      return {
        body: c?.documentWithCaptionMessage?.message?.documentMessage?.caption,
        typeMessage
      }
    }
    // logica en caso de que sea una conversacion
    const hasConversation: boolean = this.hasOwnProp(c, WaMessageTypes.conversation)
    if (hasConversation) {
      typeMessage = WaMessageTypes.conversation
      return {
        body: c?.conversation,
        typeMessage
      }
    }

    //
    const hasEphemeralMessage: boolean = this.hasOwnProp(c, WaMessageTypes.ephemeralMessage)
    if (hasEphemeralMessage) {
      typeMessage = WaMessageTypes.ephemeralMessage
      return {
        body: c?.ephemeralMessage?.message?.extendedTextMessage?.text,
        typeMessage
      }
    }
    const hasViewOnceMessageV2: boolean = this.hasOwnProp(c, WaMessageTypes.viewOnceMessageV2)
    if (hasViewOnceMessageV2) {
      return this.getTextMessage(c?.viewOnceMessageV2?.message)
    }
    return { typeMessage }
  }

  //
  getMessageBody(c: proto.IMessage | null | undefined): MessageBody {
    const hasQuotedMessage = this.hasOwnProp(c, 'extendedTextMessage.contextInfo.quotedMessage')
    let quotedBody: BodyMsg | undefined
    if (hasQuotedMessage) {
      quotedBody = this.getTextMessage(c?.extendedTextMessage?.contextInfo?.quotedMessage)
    }

    const body = this.getTextMessage(c)

    return { ...body, quotedBody }
  }

  async getLogger() { return this.logger }
  async imageUrl2Base64(url: string): Promise<[Buffer, string]> {
    const req = await globalThis.fetch(url, {
      method: 'GET'
    })
    // leer el mimetype
    const mimeType = req.headers.get('Content-Type') ?? 'application/octet-stream'
    // Validar si es de tipo imagen
    if (!mimeType.startsWith('image/')) {
      throw new Error(`El archivo no es una imagen. Tipo MIME recibido: ${mimeType}`)
    }
    // const contentLength = req.headers.get('Content-Length')

    const res = await req.arrayBuffer()
    // const size = (contentLength != null) ? parseInt(contentLength, 10) : res.byteLength

    return [Buffer.from(res), mimeType]
  }

  buffer2base64(buffer: Buffer, mimeType: `image/${string | 'png'}`) {
    const BASE_64 = 'base64'
    return `data:${mimeType};${BASE_64},`.concat(buffer.toString(BASE_64))
  }

  async stickerGenerator(mediaData: string | Buffer): Promise<Buffer> {
    const stickerOption: IStickerOptions = {
      pack: 'sticker.ly/user/itskreisler',
      author: 'itskreisler',
      type: StickerTypes.FULL,
      quality: 100
    }
    const generateSticker = await createSticker(mediaData, stickerOption)
    return generateSticker
  }

  async stickerGeneratorFromPath(image: string | Buffer) {
    const sticker = new Sticker(image, {
      pack: 'sticker.ly/user/itskreisler',
      author: 'itskreisler',
      type: StickerTypes.FULL,
      quality: 100
    })
    return await sticker.toMessage()
  }

  /**
   * @description Descargar un archivo multimedia de un mensaje
   * @param msg
   * @param type
   * @param opt
   * @returns {Promise<Buffer>}
   */
  async getMedia(msg: DownloadableMessage, type: MediaType, opt?: MediaDownloadOptions): Promise<Buffer> {
    const stream = await downloadContentFromMessage(msg, type, opt)
    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }
    return buffer
  }

  /**
   *
   * @param {string} prop - Propiedad a buscar
   * @param {any} obj - Objeto en el que se buscará la propiedad
   * @returns {boolean}
   */
  hasOwnProp(obj: any, prop: string): boolean {
    // Dividir la propiedad en partes usando el punto como separador
    const parts = prop.split('.')

    // Recorrer cada parte de la propiedad
    for (let i = 0; i < parts.length; i++) {
      // Verificar si el objeto tiene la propiedad en cuestión
      if (obj === null || typeof obj === 'undefined') return false as boolean
      if (parts[i] === null || typeof parts[i] === 'undefined') return false as boolean
      if (!Object.prototype.hasOwnProperty.call(obj, parts[i])) {
        return false as boolean // Si no la tiene, devolver false
      }
      // Si la tiene, mover el objeto a la propiedad actual para la siguiente iteración
      obj = obj[parts[i]]
    }

    // Si se recorrieron todas las partes y se encontraron, devolver true
    return true as boolean
  }

  /**
   * @description Obtener una propiedad anidada de un objeto
   * @param {any} obj - Objeto en el que se buscará la propiedad
   * @param {string} propPath - Propiedad a buscar
   * @returns {U | undefined} - Valor de la propiedad o undefined si no se encuentra
   */
  getNestedProp<U>(obj: any, propPath: string): U | undefined {
    // Dividir la ruta de la propiedad en partes usando el punto como separador
    const parts = propPath.split('.')

    // Recorrer cada parte de la propiedad
    for (let i = 0; i < parts.length; i++) {
      // Verificar si el objeto tiene la propiedad en cuestión
      if (obj === null) return undefined
      if (parts[i] === null) return undefined
      if (!Object.prototype.hasOwnProperty.call(obj, parts[i])) {
        return undefined // Si no la tiene, devolver undefined
      }
      // Si la tiene, mover el objeto a la propiedad actual para la siguiente iteración
      obj = obj[parts[i]]
    }

    // Devolver el valor final de la propiedad
    return obj
  }

  async WAConnect() {
    if (this.sock !== null) {
      console.log('Ya esta conectado')
      this.sock = null as unknown as WASocket
    }
    const { state, saveCreds } = await useMultiFileAuthState(this.folderCreds)
    this.sock = makeWASocket({
      auth: state,
      logger: this.logger,
      // printQRInTerminal: true,
      browser: ['KLEYBOT_BUSINESS', '', '']
    })
    this.saveCreds = saveCreds
    // this.start()
    this.loadEvents()
  }

  /**
   * @param {string} jid
   * @param {import('baileys').AnyMessageContent} str
   * @param {import('baileys').MiscMessageGenerationOptions} [op={}]
   */
  async sendText(jid: string, str: AnyMessageContent, op: MiscMessageGenerationOptions = {}) {
    await this.sock.sendMessage(jid, str, op)
  }

  async start() {
    await this.loadEvents()
    await this.loadHandlers()
    await this.loadCommands()
  }

  //
  async loadHandlers() {
    console.log('(⏳) Cargando handlers')

    try {
      // antiCrash
      (await import('@/bot/handlers/antiCrash')).default.bind(this)()
      console.log('(✅) Handlers cargados correctamente')
    } catch (e) {
      console.error({ e })
      console.log('(❌) ERROR AL CARGAR EL HANDLER')
    }
    try {
      (await import('@/bot/handlers/devil')).devil.bind(this)(this)
    } catch (e) {
      console.error({ e })
      console.log('(❌) ERROR AL CARGAR EL DEVIL')
    }
  }

  async loadEvents() {
    console.log('(⏳) Cargando eventos')
    // this.sock.ev.removeAllListeners('creds.update')
    // this.sock.ev.removeAllListeners('connection.update')
    // this.sock.ev.removeAllListeners('messages.upsert')

    try {
      // creds.update
      this.sock.ev.on('creds.update', this.saveCreds)

      // connection.update
      const { handler: conUp } = await import('@/bot/events/client/connection.update')
      this.sock.ev.on('connection.update', conUp.bind(null, this))
      // messages.upsert
      const { handler: msgUpsert } = await import('@/bot/events/client/messages.upsert')
      this.sock.ev.on('messages.upsert', msgUpsert.bind(null, this))
      //

      console.log('(✅) Eventos cargados correctamente')
    } catch (e) {
      console.error('(❌) Errror al cargar eventos', e)
    }
  }

  //
  getCommands(): [RegExp, CommandImport][] {
    return Array.from(this.commands)
  }

  //
  findCommand(str: string): [boolean, [RegExp, CommandImport] | []] {
    const cmd = this.getCommands().find(([expreg]) => expreg.test(str))
    if (typeof cmd === 'undefined') {
      return [false, []]
    }
    return [true, cmd]
  }

  //
  async loadCommands() {
    console.log('(⏳) Cargando comandos')
    this.commands.clear()
    try {
      const commands = [
        { moduleImport: await import('@/bot/commands/public/cmd.random'), name: 'random' },
        { moduleImport: await import('@/bot/commands/public/cmd.kudasai'), name: 'kudasai' },
        { moduleImport: await import('@/bot/commands/public/cmd.ig'), name: 'ig' },
        { moduleImport: await import('@/bot/commands/public/cmd.config'), name: 'config' },
        { moduleImport: await import('@/bot/commands/public/cmd.delete'), name: 'delete' },
        { moduleImport: await import('@/bot/commands/public/cmd.dlurl'), name: 'dlurl' },
        { moduleImport: await import('@/bot/commands/public/cmd.unlock'), name: 'unlock' },
        { moduleImport: await import('@/bot/commands/public/cmd.r34'), name: 'r34' },
        { moduleImport: await import('@/bot/commands/public/cmd.uptime'), name: 'uptime' },
        { moduleImport: await import('@/bot/commands/public/cmd.tiktok'), name: 'tiktok' },
        { moduleImport: await import('@/bot/commands/public/cmd.mal'), name: 'mal' },
        { moduleImport: await import('@/bot/commands/public/cmdPing'), name: 'ping' },
        { moduleImport: await import('@/bot/commands/public/cmd.flv'), name: 'flv' },
        { moduleImport: await import('@/bot/commands/public/cmd.lat'), name: 'lat' },
        { moduleImport: await import('@/bot/commands/public/cmd.stickers'), name: 'st' }
      ]

      commands.forEach(async ({ moduleImport, name }) => {
        try {
          if (this.hasOwnProp(moduleImport.default, 'active') && moduleImport.default.active === true) {
            this.commands.set(moduleImport.default.ExpReg, moduleImport.default)
            console.log(`(✅) Comando ${name} cargado correctamente`)
          }
        } catch (e) {
          console.log(`(❌) Error al cargar el comando ${name}`, { e })
        }
      })
    } catch (e) {
      console.error({ e })
    } finally {
      console.log('(✅) Comandos cargados correctamente', this.getCommands().length)
    }
  }

  /**
   * @deprecated
   * @param id
   * @param content
   * @param opts
   * @returns
   */
  async send(id: string, content: string | Media | AnyMessageContent, opts?: MiscMessageGenerationOptions): Promise<Message> {
    return await new Promise((resolve) => {
      (async () => {
        let msg: proto.WebMessageInfo
        if (typeof content === 'string') msg = (await this.sock.sendMessage(id, { text: content }, opts)) as proto.WebMessageInfo
        else if (content instanceof Media) {
          msg = (await this.sock.sendMessage(id, {
            text: content.text,
            video: (content.isVideo === true) ? content.buffer : undefined,
            image: (content.isImage === true) ? content.buffer : undefined,
            audio: (content.isAudio === true) ? content.buffer : undefined,
            // @ts-expect-error se ignora el error de typescript porque no se puede enviar un documento con baileys
            document: (content.isDocument === true) ? content.buffer : undefined
          }, opts)) as proto.WebMessageInfo
        } else {
          msg = (await this.sock.sendMessage(id, content, {
            ...opts
          })) as proto.WebMessageInfo
        }

        resolve(new Message(this, msg))
      })()
    })
  }
}

export { Whatsapp }
export default Whatsapp

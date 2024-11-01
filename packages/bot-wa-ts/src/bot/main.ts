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
} from '@whiskeysockets/baileys'
import pino from 'pino'
import { createSticker, type IStickerOptions, StickerTypes } from 'wa-sticker-formatter'
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
  folderCreds: string = 'creds'
  //
  constructor() {
    this.logger = pino({ level: 'silent' })
    /**
     * @type {import('@whiskeysockets/baileys').WASocket}
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
  async sendMsgGroup (jid: string, media: AnyMessageContent[] | Promise<AnyMessageContent[]>, options?: MiscMessageGenerationOptions): Promise<Array<proto.WebMessageInfo | undefined>> {
    const promises: Array<Promise<proto.WebMessageInfo | undefined>> = []
    const resolvedMedia = await Promise.resolve(media)
    for (const chunk of resolvedMedia) {
      promises.push(this.sock.sendMessage(jid, chunk, options))
    }
    return await Promise.all(promises)
  }

  //
  getTextMessage(c: proto.IMessage | null | undefined): BodyMsg {
    let typeMessage = Object.keys(c as proto.IMessage)[0] as WaMessageTypes
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

  /**
   * @deprecated
   */
  async saveFile(file: import('fs').PathOrFileDescriptor, content: string) {
    const fs = await import('fs')
    // archivo no existe crearlo
    if (!fs.existsSync(file as import('fs').PathLike)) {
      fs.writeFileSync(file, '[]', { encoding: 'utf-8' })
    }
    const temp = fs.readFileSync(file, { encoding: 'utf-8' })
    const data: any[] = JSON.parse(temp)
    data.push(JSON.parse(content)[0])
    fs.writeFileSync(file, JSON.stringify(data, null, 2), { encoding: 'utf-8' })
  }

  async getLogger() { return this.logger }
  async imageUrl2Base64 (url: string): Promise<[Buffer, string]> {
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

  buffer2base64 (buffer: Buffer, mimeType: `image/${string | 'png'}`) {
    const BASE_64 = 'base64'
    return `data:${mimeType};${BASE_64},`.concat(buffer.toString(BASE_64))
  }

  async stickerGenerator (mediaData: string | Buffer): Promise<Buffer> {
    const stickerOption: IStickerOptions = {
      pack: 'KleyStickers',
      author: 'Kley',
      type: StickerTypes.FULL,
      quality: 100
    }
    const generateSticker = await createSticker(mediaData, stickerOption)
    return generateSticker
  }

  /**
   * @description Descargar un archivo multimedia de un mensaje
   * @param msg
   * @param type
   * @param opt
   * @returns {Promise<Buffer>}
   */
  async getMedia (msg: DownloadableMessage, type: MediaType, opt?: MediaDownloadOptions): Promise<Buffer> {
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
  hasOwnProp (obj: any, prop: string): boolean {
    // Dividir la propiedad en partes usando el punto como separador
    const parts = prop.split('.')

    // Recorrer cada parte de la propiedad
    for (let i = 0; i < parts.length; i++) {
    // Verificar si el objeto tiene la propiedad en cuestión
      if (obj === null) return false as boolean
      if (parts[i] === null) return false as boolean
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
    const { state, saveCreds } = await useMultiFileAuthState(this.folderCreds)
    this.sock = makeWASocket({
      auth: state,
      logger: this.logger,
      printQRInTerminal: true
    })
    this.saveCreds = saveCreds
    this.start()
  }

  /**
   * @param {string} jid
   * @param {import('@whiskeysockets/baileys').AnyMessageContent} str
   * @param {import('@whiskeysockets/baileys').MiscMessageGenerationOptions} [op={}]
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
      console.log('(❌) ERROR AL CARGAR EL HANDLER')
    }
  }

  async loadEvents() {
    console.log('(⏳) Cargando eventos')

    this.sock.ev.removeAllListeners('messages.upsert')

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
  getCommands(): Array<[RegExp, CommandImport]> {
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
      //
      try {
        const CMD_PING = await import('@/bot/commands/public/cmdPing')
        if (this.hasOwnProp(CMD_PING.default, 'active')) {
          if (CMD_PING.default.active === true) this.commands.set(CMD_PING.default.ExpReg, CMD_PING.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando ping', { e })
      }
      //
      try {
        const CMD_MAL = await import('@/bot/commands/public/cmd.mal')
        if (this.hasOwnProp(CMD_MAL.default, 'active')) {
          if (CMD_MAL.default.active === true) this.commands.set(CMD_MAL.default.ExpReg, CMD_MAL.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando mal', { e })
      }
      //
      try {
        const CMD_TIKTOK = await import('@/bot/commands/public/cmd.tiktok')
        if (this.hasOwnProp(CMD_TIKTOK.default, 'active')) {
          if (CMD_TIKTOK.default.active === true) this.commands.set(CMD_TIKTOK.default.ExpReg, CMD_TIKTOK.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando tiktok', { e })
      }

      //
      try {
        const CMD_UPTIME = await import('@/bot/commands/public/cmd.uptime')
        if (this.hasOwnProp(CMD_UPTIME.default, 'active')) {
          if (CMD_UPTIME.default.active === true) this.commands.set(CMD_UPTIME.default.ExpReg, CMD_UPTIME.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando uptime', { e })
      }
      //
      try {
        const CMD_R34 = await import('@/bot/commands/public/cmd.r34')
        if (this.hasOwnProp(CMD_R34.default, 'active')) {
          if (CMD_R34.default.active === true) this.commands.set(CMD_R34.default.ExpReg, CMD_R34.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando r34', { e })
      }

      //
      try {
        const CMD_UNLOCK = await import('@/bot/commands/public/cmd.unlock')
        if (this.hasOwnProp(CMD_UNLOCK.default, 'active')) {
          if (CMD_UNLOCK.default.active === true) this.commands.set(CMD_UNLOCK.default.ExpReg, CMD_UNLOCK.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando unlock', { e })
      }

      //
      try {
        const CMD_DLURL = await import('@/bot/commands/public/cmd.dlurl')
        if (this.hasOwnProp(CMD_DLURL.default, 'active')) {
          if (CMD_DLURL.default.active === true) this.commands.set(CMD_DLURL.default.ExpReg, CMD_DLURL.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando dlurl', { e })
      }

      //
      try {
        const CMD_DELETE = await import('@/bot/commands/public/cmd.delete')
        if (this.hasOwnProp(CMD_DELETE.default, 'active')) {
          if (CMD_DELETE.default.active === true) this.commands.set(CMD_DELETE.default.ExpReg, CMD_DELETE.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando delete', { e })
      }

      //
      try {
        const CMD_CONFIG = await import('@/bot/commands/public/cmd.config')
        if (this.hasOwnProp(CMD_CONFIG.default, 'active')) {
          if (CMD_CONFIG.default.active === true) this.commands.set(CMD_CONFIG.default.ExpReg, CMD_CONFIG.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando config', { e })
      }

      //
      try {
        const CMD_IG = await import('@/bot/commands/public/cmd.ig')
        if (this.hasOwnProp(CMD_IG.default, 'active')) {
          if (CMD_IG.default.active === true) this.commands.set(CMD_IG.default.ExpReg, CMD_IG.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando ig', { e })
      }

      //
      try {
        const CMD_KUDASAI = await import('@/bot/commands/public/cmd.kudasai')
        if (this.hasOwnProp(CMD_KUDASAI.default, 'active')) {
          if (CMD_KUDASAI.default.active === true) this.commands.set(CMD_KUDASAI.default.ExpReg, CMD_KUDASAI.default)
        }
      } catch (e) {
        console.log('Error al cargar el comando kudasai', { e })
      }
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
            // @ts-expect-error
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

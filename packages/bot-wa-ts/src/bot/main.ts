import {
  makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  type WASocket,
  type MediaType,
  type AnyMessageContent,
  type MiscMessageGenerationOptions,
  type DownloadableMessage
} from '@whiskeysockets/baileys'
import pino from 'pino'
import { createSticker, type IStickerOptions, StickerTypes } from 'wa-sticker-formatter'
import { CommandImport } from '@/bot/interfaces/inter'

//
class Whatsapp {
  BOT_USERNAME: string = 'botsito'
  logger: any
  sock: WASocket
  status: number
  qr: string | null | undefined
  saveCreds: () => Promise<void>
  commands: Map<RegExp, CommandImport>

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

  async saveFile(file: import('fs').PathOrFileDescriptor, content: string) {
    const fs = await import('fs')
    fs.writeFileSync(file, content, 'utf-8')
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
      pack: 'KafkaSticker',
      author: 'Kreisler',
      type: StickerTypes.FULL,
      quality: 100
    }
    const generateSticker = await createSticker(mediaData, stickerOption)
    return generateSticker
  }

  async getMedia (msg: DownloadableMessage, type: MediaType): Promise<Buffer> {
    const stream = await downloadContentFromMessage(msg, type)
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
      if (!Object.prototype.hasOwnProperty.call(obj, parts[i])) {
        return false // Si no la tiene, devolver false
      }
      // Si la tiene, mover el objeto a la propiedad actual para la siguiente iteración
      obj = obj[parts[i]]
    }

    // Si se recorrieron todas las partes y se encontraron, devolver true
    return true
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
    const { state, saveCreds } = await useMultiFileAuthState('creds')
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

  async loadHandlers() {
    console.log('(%) Cargando handlers')

    try {
      (await import('@/bot/handlers/antiCrash')).default.bind(this)()
    } catch (e) {
      console.log('ERROR AL CARGAR EL HANDLER')
    }
  }

  async loadEvents() {
    console.log('(%) Cargando eventos')

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

      console.log('(✅) Eventos cargaods correctamente')
    } catch (e) {
      console.error('(X) Errror al cargar eventos', e)
    }
  }

  getCommands(): Array<[RegExp, CommandImport]> {
    return Array.from(this.commands)
  }

  findCommand(str: string): [boolean, [RegExp, CommandImport] | []] {
    const cmd = this.getCommands().find(([expreg]) => expreg.test(str))
    if (typeof cmd === 'undefined') {
      return [false, []]
    }
    return [true, cmd]
  }

  async loadCommands() {
    console.log('(%) Cargando comandos')
    this.commands.clear()
    try {
      const COMANDO = await import('@/bot/commands/public/cmdPing')
      if (this.hasOwnProp(COMANDO.default, 'active')) {
        if (COMANDO.default.active === true) this.commands.set(COMANDO.default.ExpReg, COMANDO.default)
      }
    } catch (e) {
      console.error({ e })
    }
  }
}

export { Whatsapp }
export default Whatsapp

import {
  makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  type WASocket,
  type WAMessage,
  type MediaType,
  type AnyMessageContent,
  type MiscMessageGenerationOptions
} from '@whiskeysockets/baileys'
import pino from 'pino'

//
class Whatsapp {
  BOT_USERNAME: string = 'botsito'
  logger: any
  sock: WASocket
  status: number
  qr: string | null | undefined
  saveCreds: () => Promise<void>
  constructor() {
    this.logger = pino({ level: 'silent' })
    /**
     * @type {import('@whiskeysockets/baileys').WASocket}
     */
    this.sock = null as unknown as WASocket
    this.status = 0
    this.qr = null
    this.saveCreds = null as unknown as () => Promise<void>
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

  async getMedia (msg: WAMessage): Promise<Buffer> {
    type MessageType = 'imageMessage' | 'stickerMessage' | 'extendedTextMessage'
    console.log(msg)
    this.buffer2base64(Buffer.from([]), 'image/')
    const messageType = Object.keys(msg as { [key: string]: any })[0] as MessageType
    // console.log({ messageType }, msg.message[messageType])
    const stream = await downloadContentFromMessage((msg as any)[messageType as any], messageType.replace('Message', '') as MediaType)
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
    this.loadEvents()
  }

  /**
   * @param {string} jid
   * @param {import('@whiskeysockets/baileys').AnyMessageContent} str
   * @param {import('@whiskeysockets/baileys').MiscMessageGenerationOptions} [op={}]
   */
  async sendText(jid: string, str: AnyMessageContent, op: MiscMessageGenerationOptions = {}) {
    await this.sock.sendMessage(jid, str, op)
  }

  async loadEvents() {
    console.log('(%) Cargando eventos')

    // this.sock.ev.removeAllListeners('messages.upsert')
    /*
    const { loadFiles } = await import('@/bot/helpers/utils')
    const RUTA_ARCHIVOS = await loadFiles('src/bot/events/client')
    */
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
}

export { Whatsapp }
export default Whatsapp

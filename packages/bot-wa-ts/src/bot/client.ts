import EventEmitter from 'events'
import qrcode from 'qrcode-terminal'
import {
  ConnectionState,
  DisconnectReason,
  makeWASocket,
  MessageUpsertType,
  SocketConfig,
  useMultiFileAuthState,
  WAMessage,
  WASocket,
  type BaileysEventMap,
  proto
} from '@whiskeysockets/baileys'
import pino from 'pino'
import { Boom } from '@hapi/boom'
import { WaConnectionState } from '@/bot/interfaces/inter'
//
export interface ClientOptions {
  id?: string
  shouldReconnect?: boolean
  baileysOpts?: Partial<SocketConfig>
}
export class ClientWsp extends EventEmitter {
  sock: WASocket | ReturnType<typeof makeWASocket>
  opts?: ClientOptions
  logger: any
  qr: string | null | undefined
  private saveCreds: () => Promise<void>
  constructor(options?: ClientOptions) {
    super()
    this.logger = pino({ level: 'silent' })
    this.sock = null as unknown as WASocket
    this.qr = null
    this.saveCreds = null as unknown as () => Promise<void>
    this.opts = options
  }

  async initialize () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info/'.concat(this.opts?.id ?? 'default'))
    this.sock = makeWASocket({
      auth: state,
      logger: this.logger,
      printQRInTerminal: false
    })
    this.saveCreds = saveCreds
    this.setupEventsHandlers()
  }

  recoverListeners<T extends keyof BaileysEventMap>() {

  }

  private setupEventsHandlers () {
    this.sock.ev.on('creds.update', this.saveCreds)
    this.sock.ev.on('connection.update', (update: Partial<ConnectionState>) => {
      this.emit('connectionUpdate', update)
      const { connection, lastDisconnect, qr } = update
      if (connection === WaConnectionState.close) {
        this.emit('close', lastDisconnect)
        const koneksiUlang = (lastDisconnect?.error as Boom)?.output.payload.statusCode !== DisconnectReason.loggedOut
        if (koneksiUlang) {
          this.initialize()
        }
        client.qr = null
      } else if (connection === WaConnectionState.open) {
        this.emit('open', lastDisconnect)
        this.emit('username', this.sock.user?.name)
        client.qr = null
      } else {
        if (typeof qr === 'string') {
          this.qr = update.qr
          this.emit('qr', qr)
        } else {
          this.qr = null
        }
      }
    })
    this.sock.ev.on('messages.upsert', ({ messages, type }) => {
      this.emit('wamessage', { content: { messages, type } })
      messages.forEach((message) => {
        if (message.key.remoteJid as string === 'status@broadcast' || (message.message != null)) return
        this.emit('message', message)
      })
    })
  }
}

export declare interface ClientWsp {
  on: <T extends keyof ClientEvents>(event: T, cb: (args: ClientEvents[T]) => void) => this
  emit: <T extends keyof ClientEvents>(event: T, args: ClientEvents[T]) => boolean
}

interface ClientEvents extends BaileysEventMap {
  message: proto.IWebMessageInfo
  wamessage: { content: {
    messages: WAMessage[]
    type: MessageUpsertType
  } }
  qr: string
  connectionUpdate: Partial<ConnectionState>
  username: string | undefined
  open: {
    error: Error | undefined
    date: Date
  } | undefined
  close: {
    error: Error | undefined
    date: Date
  } | undefined
}
const client = new ClientWsp()

client.on('qr', (qr) => {
  // Generate and scan this code with your phone
  console.log('QR RECEIVED', qr)
  qrcode.generate(qr, { small: true })
})
client.on('wamessage', (message) => {
  console.log('MESSAGE RECEIVED', message)
})

client.initialize()

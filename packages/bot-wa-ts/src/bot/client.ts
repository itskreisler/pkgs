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
  proto,
  fetchLatestBaileysVersion
} from 'baileys'
import P, { type Logger } from 'pino'
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
  logger: Logger | undefined
  qr: string | null | undefined
  private saveCreds: () => Promise<void>
  constructor(options?: ClientOptions) {
    super()
    this.logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination('./wa-logs.txt'))
    this.logger.level = 'trace'
    this.sock = null as unknown as WASocket
    this.qr = null
    this.saveCreds = null as unknown as () => Promise<void>
    this.opts = options
  }

  async initialize() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info/'.concat(this.opts?.id ?? 'default'))
    const { version, isLatest } = await fetchLatestBaileysVersion()
    this.sock = makeWASocket({
      auth: state,
      logger: this.logger,
      version,
      printQRInTerminal: false
    })
    this.saveCreds = saveCreds
    this.setupEventsHandlers()
  }

  recoverListeners<T extends keyof BaileysEventMap>() {

  }

  private setupEventsHandlers() {
    console.log('🔧 Setting up event handlers')
    this.sock.ev.on('creds.update', this.saveCreds)
    this.sock.ev.on('connection.update', (update: Partial<ConnectionState>) => {
      console.log('🔌 Connection update:', update.connection)
      this.emit('connectionUpdate', update)
      const { connection, lastDisconnect, qr } = update
      if (connection === WaConnectionState.close) {
        this.emit('close', lastDisconnect)
        const razon1 = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
        const razon2 = (lastDisconnect?.error as Boom)?.output.payload.statusCode !== DisconnectReason.loggedOut
        if (razon1 || razon2) {
          this.initialize()
        } else {
          console.log('Connection closed. You are logged out.')
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
      console.log('🔔 messages.upsert event triggered')
      console.log('📊 Number of messages:', messages.length)
      console.log('📝 Type:', type)

      this.emit('wamessage', { content: { messages, type } })

      messages.forEach((message, index) => {
        console.log(`\n--- Message ${index + 1} ---`)
        console.log('📱 Remote JID:', message.key.remoteJid)
        console.log('📩 Has message content:', message.message != null)
        console.log('🔍 Is status broadcast:', message.key.remoteJid === 'status@broadcast')

        // Lógica corregida: debe emitir si NO es status@broadcast Y SI tiene contenido
        if (message.key.remoteJid === 'status@broadcast') {
          console.log('❌ Skipping: status broadcast')
          return
        }

        if (message.message == null) {
          console.log('❌ Skipping: no message content')
          return
        }

        console.log('✅ Emitting message event')
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
  wamessage: {
    content: {
      messages: WAMessage[]
      type: MessageUpsertType
    }
  }
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
  console.log('📱 QR Code received')
  qrcode.generate(qr, { small: true })
})
client.on('wamessage', (message) => {
  console.log('💬 MESSAGE RECEIVED')
  console.dir(message, { depth: null })
})

client.on('message', (msg) => {
  console.log('📨 Individual message event triggered')
  console.log('From:', msg.key.remoteJid)
  console.log('Message:', JSON.stringify(msg.message, null, 2))
})

console.log('🚀 Initializing WhatsApp client...')
client.initialize()

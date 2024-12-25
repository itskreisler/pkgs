import EventEmitter from 'events'
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
  private readonly saveCreds: () => Promise<void>
  constructor(options?: ClientOptions) {
    super()
    this.logger = pino({ level: 'silent' })
    this.sock = null as unknown as WASocket
    this.qr = null
    this.saveCreds = null as unknown as () => Promise<void>
    this.opts = options
  }

  async initialize () {
    this.setupEventsHandlers()
  }

  recoverListeners<T extends keyof BaileysEventMap>() {

  }

  private setupEventsHandlers () {

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

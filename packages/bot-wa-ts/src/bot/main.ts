import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type WASocket
} from '@whiskeysockets/baileys'
import MAIN_LOGGER from 'pino'
// import qrcode from 'qrcode-terminal'
// import fs from 'fs'
//
export default class Whatsapp {
  logger
  sock: WASocket
  status
  qr: string | null | undefined
  count
  constructor() {
    this.logger = MAIN_LOGGER.default()
    this.logger.level = 'silent' // Change this to silent or error
    /**
     * @type {import('@whiskeysockets/baileys').WASocket}
     */
    this.sock = null
    this.status = 0
    this.qr = null
    this.count = 0

    this.readCount()
  }

  async readCount() {
    // this.count = await readCount()
  }

  async WAConnect() {
    const { state, saveCreds } = await useMultiFileAuthState('creds')
    this.sock = makeWASocket.default({
      auth: state,
      logger: this.logger,
      printQRInTerminal: true
    })

    this.sock.ev.on('creds.update', saveCreds)

    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update
      if (connection === 'close') {
        const koneksiUlang =
          lastDisconnect.error.output.payload.statusCode !==
          DisconnectReason.loggedOut
        if (koneksiUlang) {
          this.WAConnect()
        }
        this.status = 0
        this.qr = null
      } else if (connection === 'open') {
        this.status = 3
        this.qr = null
      } else {
        const QR = !(update.qr == null)
        if (QR) {
          // qrcode.generate(QR, { small: true })
          this.status = 1
          this.qr = update.qr
        } else {
          this.status = 3
          this.qr = null
        }
      }
    })

    this.sock.ev.on('messages.upsert', async (m) => {
      // fs.writeFileSync('message.json', JSON.stringify(m, null, 2))
      // descargar si es un sticker

      const isRevoked = m.messages[0]?.hasOwnProperty('message')
        ? !!m.messages[0].message.hasOwnProperty('protocolMessage')
        : false
      // console.log(m)
      if (!m.messages[0].key.fromMe) {
        if (!isRevoked) {
          const isMessage = !!m.messages[0]?.hasOwnProperty('message')
          const isImage = isMessage
            ? !!m.messages[0].message.hasOwnProperty('imageMessage')
            : false
          const from = m.messages[0].key.remoteJid
          const msg = isMessage
            ? isImage
              ? m.messages[0].message.imageMessage.caption
              : m.messages[0].message.hasOwnProperty('conversation')
                ? m.messages[0].message.conversation
                : m.messages[0].message.hasOwnProperty('extendedTextMessage')
                  ? m.messages[0].message.extendedTextMessage.text
                  : ''
            : ''

          const regex = /wa\.me\/settings/gi
          // console.log("True 1");
          // console.log(m.messages[0])
          // console.log(msg)
          if (regex.test(msg)) {
            // console.log("True 2");
            await this.sock.readMessages([m.messages[0].key])
            await this.sock.chatModify(
              {
                clear: {
                  messages: [
                    {
                      id: m.messages[0].key.id,
                      fromMe: m.messages[0].key.fromMe,
                      timestamp: m.messages[0].messageTimestamp
                    }
                  ]
                }
              },
              from,
              []
            )
            // await this.sendText(from, "Shinjimae !")
            this.count += 1
            // await writeCount(this.count)
            // await writeLog('From        : ' + m.messages[0].key.remoteJid)
            // await writeLog('PushName    : ' + m.messages[0].pushName)
            // await writeLog('Message     : ' + msg)
            // await writeLog(newline)
          }

          if (msg === '@isalive') {
            await this.sock.readMessages([m.messages[0].key])
            setTimeout(
              async () => await this.sendText(from, { text: 'I am still Alive' }),
              1300
            )
          }
        }
      }
    })
  }

  getCount() {
    return this.count
  }

  /**
   * @param {string} jid
   * @param {import('@whiskeysockets/baileys').AnyMessageContent} str
   * @param {import('@whiskeysockets/baileys').MiscMessageGenerationOptions} [op={}]
   */
  async sendText(jid: string, str: import('@whiskeysockets/baileys').AnyMessageContent, op: import('@whiskeysockets/baileys').MiscMessageGenerationOptions = {}) {
    await this.sock.sendMessage(jid, str, op)
  }
}

const WhatsappInterface = new Whatsapp()
WhatsappInterface.WAConnect()
export { WhatsappInterface }

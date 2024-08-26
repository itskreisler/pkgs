import { ConnectionState, DisconnectReason } from '@whiskeysockets/baileys'
import { WaConnectionState } from '@/bot/interfaces/inter'
import { Boom } from '@hapi/boom'
//

//
export async function handler (client: import('@/bot/main').Whatsapp, update: Partial<ConnectionState>): Promise<void> {
  const { connection, lastDisconnect } = update
  if (connection === WaConnectionState.close) {
    console.log('BOT WHATSAPP ❌ -- BY KREISLER!')
    /*
    const fs = await import('fs')
    fs.rmSync(client.folderCreds, { recursive: true })
    console.log('Credenciales eliminadas')
    */
    const koneksiUlang = (lastDisconnect?.error as Boom)?.output.payload.statusCode !== DisconnectReason.loggedOut
    if (koneksiUlang) {
      client.WAConnect()
    }
    client.status = 0
    client.qr = null
  } else if (connection === WaConnectionState.open) {
    console.log('BOT WHATSAPP ✅ -- BY KREISLER!')
    client.status = 3
    client.qr = null
  } else {
    const QR = !(update.qr == null)
    if (QR) {
      // qrcode.generate(QR, { small: true })
      client.status = 1
      client.qr = update.qr
    } else {
      client.status = 3
      client.qr = null
    }
  }
}

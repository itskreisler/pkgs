import { ConnectionState, DisconnectReason } from '@whiskeysockets/baileys'
import { WaConnectionState } from '@/bot/interfaces/inter'
export async function handler (client: import('@/bot/main').Whatsapp, update: Partial<ConnectionState>): Promise<void> {
  const { connection, lastDisconnect } = update
  if (connection === WaConnectionState.close) {
    console.log('BOT WHATSAPP ❌ -- BY KREISLER!')
    const koneksiUlang = (lastDisconnect as any).error.output.payload.statusCode !== DisconnectReason.loggedOut
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

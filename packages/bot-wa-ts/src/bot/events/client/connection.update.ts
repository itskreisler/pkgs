import { ConnectionState, DisconnectReason } from 'baileys'
import { WaConnectionState } from '@/bot/interfaces/inter'
import { Boom } from '@hapi/boom'
import qrcode from 'qrcode-terminal'
//

//
export async function handler(client: import('@/bot/main').Whatsapp, update: Partial<ConnectionState>): Promise<void> {
  const { connection, lastDisconnect, qr } = update
  if (connection === WaConnectionState.close) {
    console.log('BOT WHATSAPP ❌')
    /*
    const fs = await import('fs')
    fs.rmSync(client.folderCreds, { recursive: true })
    console.log('Credenciales eliminadas')
    */
    const razon1 = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
    const razon2 = (lastDisconnect?.error as Boom)?.output.payload.statusCode !== DisconnectReason.loggedOut
    if (razon1 || razon2) {
      console.log('BOT WHATSAPP ⏳')
      client.WAConnect()
    }
    client.status = 0
    client.qr = null
  } else if (connection === WaConnectionState.open) {
    console.log('BOT WHATSAPP ✅ Logged --', client.sock.user?.name)
    client.status = 3
    client.qr = null
  } else {
    console.log('BOT WHATSAPP 👾')
    if (typeof qr === 'string') {
      qrcode.generate(qr, { small: true })
      client.status = 1
      client.qr = update.qr
    } else {
      client.status = 3
      client.qr = null
    }
  }
}

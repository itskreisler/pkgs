import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/client.example'
const { BOT_USERNAME } = configEnv() as { BOT_USERNAME: string }
//
export default {
  active: true,
  ExpReg: new RegExp(`^/ping(?:@${BOT_USERNAME})?$`, 'im'), // /^\/ping(?:@username)?$/im

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    client.sock.sendMessage(from, { text: '🏓 Pong!' }, { quoted: wamsg })
  }
}

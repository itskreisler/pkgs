import { configEnv } from '@/bot/helpers/env.test'
import Whatsapp from '@/bot/main'
import { type WAMessage } from '@whiskeysockets/baileys'
const { BOT_USERNAME } = configEnv
//
export default {
  active: true,
  ExpReg: new RegExp(`^/ping(?:@${BOT_USERNAME as string})?$`, 'im'), /* /^\/ping(?:@username_bot)?$/im, */

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   */
  async cmd(client: Whatsapp, msg: WAMessage, match: RegExpMatchArray | null | undefined) {
    const from: string = msg.key.remoteJid as string
    client.sendText(from, { text: 'Pong!' }, { quoted: msg })
  }
}

import { configEnv } from '@/bot/helpers/env.test'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
//
export default {
  active: true,
  ExpReg: new RegExp(`^/ping(?:@${BOT_USERNAME})?$`, 'im'), // /^\/ping(?:@username)?$/im

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray | null} match
   */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray | null): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    client.sendText(from, { text: '🏓 Pong!' }, { quoted: wamsg })
    msg.react('🏓')
  }
}

// import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
// const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
//
export default {
  active: true,
  ExpReg: /^\/tt(?:\s+(https?:\/\/((?:www\.)?|(?:vm\.)?|(?:m\.)?)tiktok\.com\/(?:@[a-zA-Z0-9_]+\/)?(?:video\/)?([a-zA-Z0-9]+)))?/ims,

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, url] = match
  }
}

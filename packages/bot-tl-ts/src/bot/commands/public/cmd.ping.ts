import { BOT_USERNAME } from '@/bot/helpers/env'
import { type ClientBot } from '@/bot/core/main'
import { type IClsBot } from '@/bot/interfaces/proto'
import { EParseMode } from '@/bot/interfaces/constants'

//
export default {
  active: true,
  regexp: new RegExp(`^/ping(?:@${BOT_USERNAME as string})?$`, 'im'),

  /**
   * @description
   * @param {import("../src/bot/core/main").ClientBot} client
   * @param {import("../src/bot/interfaces/proto").IClsBot.ICTX} { msg, ctx }
   * @param {RegExpMatchArray} match
   */
  async cmd (client: ClientBot, { msg, ctx }: IClsBot.ICTX, match: RegExpMatchArray): Promise<void> {
    const start = Number(new Date())
    const send = await ctx.send({ text: '*Pinging...*' }, { parse_mode: EParseMode.Markdown })
    const end = Number(new Date())
    const ping = end - start
    await send.editText(`*Pong! Latency is* \`${ping}ms\``, { parse_mode: EParseMode.Markdown })
  }
}

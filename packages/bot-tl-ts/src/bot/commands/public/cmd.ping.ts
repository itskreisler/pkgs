import { BOT_USERNAME } from '../../helpers/env.js'
import { type ClientBot } from '../../core/main.js'
import { type IClsBot } from '../../interfaces/proto'
import { EParseMode } from '../../interfaces/constants.js'

//
export default {
  active: true,
  regexp: new RegExp(`^/ping(?:@${BOT_USERNAME as string})?$`, 'im'),

  /**
   * @description
   * @param {import("../../core/main.js").ClientBot} client
   * @param {import("../../interfaces/proto").IClsBot.ICTX} { msg, ctx }
   * @param {RegExpMatchArray} match
   */
  async cmd (client: ClientBot, { msg, ctx }: IClsBot.ICTX, match: RegExpMatchArray): Promise<void> {
    const start = Number(new Date())
    const send = await ctx.send({ text: '*Pinging...*' }, { parse_mode: EParseMode.Markdown })
    const end = Number(new Date())
    const ping = end - start
    await send.editText(`*Pong! Latency is* \`${ping}ms\``, { parse_mode: EParseMode.Markdown })
    setTimeout(async () => {
      await send.delete()
    }, 5000)
  }
}

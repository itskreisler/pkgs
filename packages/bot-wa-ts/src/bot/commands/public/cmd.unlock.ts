import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg } from '@/bot/interfaces/inter'
import { type Message } from '@/bot/interfaces/message'
import type Whatsapp from '@/bot/main'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
//
export default {
  active: true,
  ExpReg: new RegExp(`^/unlock(?:@${BOT_USERNAME})?$`, 'im'),

  /**
   * @description unlock any media (viewOnce)
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    if (msg.isReply === false) {
      await msg.reply({
        text: 'P-perdona, necesitas ejecutar el comando junto a la multimedia que deseas desbloquear.'
      })
      return
    }
    const quote = msg.getQuotedMsg() as Message
    if (quote.hasMedia === false || quote.isViewOnce === false) {
      await msg.reply({ text: 'El contenido del mensaje no es multimedia o no es un mensaje de una sola ves' })
      return
    }
    const media = await quote.downloadMediaV2()
    if (typeof media === 'undefined') {
      msg.reply({ text: 'No se pudo desbloquear.' })
      return
    }
    const multimedia = media.fileType?.mime.startsWith('image') === true
      ? { image: media.buffer }
      : media.fileType?.mime.startsWith('video') === true
        ? { video: media.buffer }
        : {
            document: media.buffer,
            mimetype: media.fileType?.mime as string,
            fileName: Date.now().toString().concat('.', media.fileType?.ext as string)
          }
    await msg.send(multimedia)
  }
}

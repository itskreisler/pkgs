import { CobaltService } from '@/bot/services/cobalt.services'
import { type ClientBot } from '@/bot/core/main'
import { type IClsBot } from '@/bot/interfaces/proto'

const cobalt = new CobaltService()

export default {
  active: true,
  regexp: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/(?:p|reel|tv)\/|twitter\.com\/\w+\/status\/|x\.com\/\w+\/status\/)[\w-]+/gim,

  /**
   * @description Download video/photos from Instagram and X (Twitter) using Cobalt
   * @param {import("@/bot/core/main").ClientBot} client
   * @param {import("@/bot/interfaces/proto").IClsBot.ICTX} { msg, ctx }
   * @param {RegExpMatchArray} match
   */
  async cmd(client: ClientBot, { msg, ctx }: IClsBot.ICTX, match: RegExpMatchArray): Promise<void> {
    const [mediaUrl] = match
    const sms = await ctx.send({ text: '⏳ Procesando contenido...' })

    try {
      const data = await cobalt.download(mediaUrl)

      if (data.status === 'stream' || data.status === 'redirect') {
        if (data.url) {
          await sms.editText('Subiendo contenido...')
          await ctx.send({ video: data.url })
          await sms.delete()
        }
      } else if (data.status === 'picker' && Array.isArray(data.picker)) {
        await sms.editText('Subiendo álbum...')
        for (const item of data.picker) {
          if (item.type === 'video') {
            await ctx.send({ video: item.url })
          } else {
            await ctx.send({ photo: item.url })
          }
        }
        await sms.delete()
      } else {
        await sms.editText('❌ No se pudo procesar el contenido de la publicación.')
      }
    } catch (error) {
      console.error('Cobalt error:', error)
      await sms.editText('❌ Ocurrió un error al procesar el enlace con Cobalt.')
    }
  }
}

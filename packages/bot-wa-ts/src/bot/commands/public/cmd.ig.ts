import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { instagramGetUrl, InstaVideoResult } from '@/bot/services/ig.services'
//
const PATTERN_IG = /(?:https?:\/\/)?(?:www.)?instagram.com\/?([a-zA-Z0-9\\.\\_\\-]+)?\/([reel|p]+)?\/([a-zA-Z0-9\-\\_\\.]+)\/?([0-9]+)?/
export default {
  active: true,
  ExpReg: new RegExp(`^/ig(?:\\s+${PATTERN_IG.source})?`, 'im'),

  /**
   * @description Comando para descargar contenido de Instagram (reels e imágenes)
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg, body, quotedBody }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    if (typeof body === 'undefined' || body === null) return
    const from: string = wamsg.key.remoteJid as string
    const [_url] = body.match(PATTERN_IG) as [string, string | undefined, 'p' | 'reel', string, string | undefined] ?? []
    let url: string = _url
    if (typeof quotedBody?.body !== 'undefined') {
      url = quotedBody.body as string
    }
    if (typeof url !== 'string') {
      await msg.reply({ text: 'No se ha encontrado el enlace de instagram (reel o album)' })
      return
    }
    const [hasError, data] = await (async() => {
      let data
      let error
      try {
        data = await instagramGetUrl(url)
      } catch (e) {
        error = JSON.stringify(e)
      }
      return [error, data] as [string | undefined, InstaVideoResult]
    })()
    if (typeof hasError !== 'undefined') {
      await msg.reply({ text: 'No se pudo obtener la información' })
      return
    }
    const { urlList, type, resultsNumber } = data
    if (resultsNumber === 0) {
      await msg.reply({ text: 'No se encontraron resultados' })
      return
    }
    const media = type === 'image' || type === 'thumbnail'
      ? await Promise.all(urlList.map(async (url) => ({ image: { stream: await getStreamFromUrl(url) } })))
      : type === 'video'
        ? await Promise.all(urlList.map(async (url) => ({ video: { stream: await getStreamFromUrl(url) } })))
        : [{ text: 'No se encontraron resultados para la descarga de este contenido' }]
    await client.sendMsgGroup(from, media).catch(() => {
      msg.reply({ text: 'No se pudo enviar el contenido, intente de nuevo' })
    })
  }
}
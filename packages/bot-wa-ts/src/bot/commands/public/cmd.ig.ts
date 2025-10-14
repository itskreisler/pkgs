import { tryCatchPromise } from '@kreisler/try-catch/dist/tryCatch.mjs'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/client.example'
export type IG = {
  results_number: number
  url_list: Array<string>
  post_info: {
    owner_username: string
    owner_fullname: string
    is_verified: boolean
    is_private: boolean
    likes: number
    is_ad: boolean
    caption: string
  }
  media_details: Array<{
    type: string
    dimensions: {
      height: number
      width: number
    }
    url: string
  }>
}

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
  async cmd(client: Whatsapp, { wamsg, msg, body, quotedBody }: ContextMsg, match: RegExpMatchArray): Promise<void> {
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
    const instagramGetUrl: (link: string) => Promise<IG> = async (link: string) => {
      try {
        const links = await (await globalThis.fetch('https://apis-public.vercel.app/api/services/ig', {
          method: 'POST',
          body: JSON.stringify({ url: link, retries: 10 }),
          headers: {
            'Content-Type': 'application/json'
          }
        })).json()
        return links
      } catch (error) {
        const links = await (await globalThis.fetch(`https://apis-public.vercel.app/api/services/ig?url=${encodeURIComponent(link)}`)).json()
        return links
      }
    }
    const [hasError, data] = await tryCatchPromise(instagramGetUrl, url)
    if (hasError !== null) {
      console.error(hasError)
      await msg.reply({ text: 'No se pudo obtener la información' })
      return
    }
    await msg.reply({ text: JSON.stringify(data, null, 2).slice(0, 4096) })
    return
    const media = await Promise.all(data.media_details.map(async ({ url, type }) => type === 'image' ? { image: { stream: await getStreamFromUrl(url) } } : { video: { stream: await getStreamFromUrl(url) } }))
    await client.sendMsgGroup(from, media).catch(() => {
      msg.reply({ text: 'No se pudo enviar el contenido, intente de nuevo' })
    })
  }
}

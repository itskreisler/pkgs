import { configEnv } from '@/bot/helpers/env'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { createApi } from '@kreisler/createapi'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { Readable } from 'stream'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
const yamete: {
  'kudasai.php': () => Promise<Array<{
    date: string
    image: string
    slug: string
    title: string
    category: {
      name: string
      slug: string
    }
  }>>
} = createApi('https://www3.animeflv.net')
//
export default {
  active: true,
  ExpReg: new RegExp(`^/k(?:udasai)?(?:@${BOT_USERNAME})?$`, 'im'),

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    const data = await yamete['kudasai.php']()
    const urlBase = 'https://somoskudasai.com/'
    const blogs = data.map(({ category: { slug: cslug }, slug, title, date }) => {
      const linkPost = `${urlBase}${cslug}/${slug}/`
      const linkCategory = `${urlBase}categoria/${cslug}/`
      return MarkdownWsp.Quote(`🔥 ${title}
📅 ${date}
🔗 ${linkPost}
🔗 ${linkCategory}`)
    }).join('\n\n')
    // await msg.send({ text: blogs })
    // enviar posts con imagen
    const multimedias: Array<{
      image: { stream: Readable }
      caption: string
    }> = []
    for (const { image, title, category: { slug: cslug }, slug } of data) {
      multimedias.push({
        image: {
          stream: await getStreamFromUrl(image.replace('-150x150', ''))
        },
        caption: title.concat('\n\n', MarkdownWsp.Quote(urlBase.concat(cslug, '/', slug, '/')))
      })
    }
    await client.sendMsgGroup(from, multimedias)
  }
}

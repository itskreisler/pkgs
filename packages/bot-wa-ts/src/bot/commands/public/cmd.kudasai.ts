import { configEnv } from '@/bot/helpers/env'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { type ContextMsg, type IPostMedia } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { IKudasaiData, kudasaiApi } from '@/bot/services/apis.services'
import { GlobalDB } from '@/bot/services/zustand.services'
import { MarkdownWsp } from '@kreisler/js-helpers'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }

//
export default {
  active: true,
  ExpReg: new RegExp(`^/k(?:udasai)?(?:_(\\w+))?(?:@${BOT_USERNAME})?$`, 'im'),

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    const urlBase = 'https://somoskudasai.com/'
    /*     const blogs = data.map(({ slug, category: { slug: cslug }, title, date }) => {
      const linkPost = `${urlBase}${cslug}/${slug}/`
      const linkCategory = `${urlBase}categoria/${cslug}/`
      return MarkdownWsp.Quote(`🔥 ${title}
📅 ${date}
🔗 ${linkPost}
🔗 ${linkCategory}`)
    }) */
    // await msg.send({ text: blogs })
    // enviar posts con imagen

    async function fnApi() {
      return kudasaiApi()
    }
    async function fnMedia(fn: Function): Promise<IPostMedia[]> {
      const data: IKudasaiData[] = await fn()
      const multimedias: IPostMedia[] = []
      for (const { image, title, category: { slug: cslug }, slug } of data) {
        multimedias.push({
          image: {
            stream: await getStreamFromUrl(image.replace('-150x150', ''))
          },
          caption: title.concat('\n\n', MarkdownWsp.Quote(urlBase.concat(cslug, '/', slug, '/')))
        })
      }
      return multimedias
    }
    GlobalDB.getState().groupDatabases.set(from,
      new Map().set('k',
        new Map().set('data', [])
      )
    )
    if (GlobalDB.getState().cmdAcctions.has('k') === false) GlobalDB.getState().setCmdAcctions('k', fnApi, fnMedia)
    else console.log('ya existe', GlobalDB.getState().cmdAcctions.get('k'), GlobalDB.getState().groupDatabases[from].k.data)
    // await client.sendMsgGroup(from, multimedias)
  }
}

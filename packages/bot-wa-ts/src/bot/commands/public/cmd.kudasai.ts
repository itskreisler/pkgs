import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { EConstCMD, type ContextMsg, type IPostMedia } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { IKudasaiData, kudasaiApi, GlobalDB, CmdActions } from '@kreisler/bot-services'
import { MarkdownWsp } from '@kreisler/js-helpers'

//
export default {
  active: true,
  ExpReg: /^\/k(?:udasai)?(?:_(\w+))?$/im,

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    const [, accion] = match as [string, 'on' | 'off' | 'list' | 'start' | 'clear' | 'fetch' | undefined]
    const urlBase = 'https://somoskudasai.com/'

    const isGroup: boolean = msg.isGroup
    if (!isGroup) {
      await msg.reply({ text: 'Este comando solo puede ser usado en grupos' })
      return
    }
    switch (accion) {
      case 'clear': {
        GlobalDB.getState().addCommandData(from, EConstCMD.Kudasai, [])
        await msg.reply({ text: 'Datos eliminados' })
        break
      }
      case 'fetch': {
        const medias = fnMedia(fnApi)
        await client.sendMsgGroup(from, medias)
        break
      }
      case 'start': {
        const data = await fnApi()
        GlobalDB.getState().addCommandData(from, EConstCMD.Kudasai, data)
        await msg.reply({ text: 'Se han añadido las noticias actuales a la base de datos' })
        console.log('Datos agregados')
        break
      }
      case 'on': {
        const isActive: boolean = GlobalDB.getState().getNotifications(from, EConstCMD.Kudasai)
        if (isActive) {
          await msg.reply({ text: 'Las notificaciones de Kudasai ya están activadas' })
          return
        }
        GlobalDB.getState().toggleNotifications(from, EConstCMD.Kudasai, true)
        CmdActions.setCmdActions(EConstCMD.Kudasai, fnApi, fnMedia)
        await msg.reply({ text: 'Notificaciones de Kudasai activadas' })
        break
      }
      case 'off': {
        const isActive: boolean = GlobalDB.getState().getNotifications(from, EConstCMD.Kudasai)
        if (!isActive) {
          await msg.reply({ text: 'Las notificaciones de Kudasai ya están desactivadas' })
          return
        }
        GlobalDB.getState().toggleNotifications(from, EConstCMD.Kudasai, false)
        await msg.reply({ text: 'Notificaciones de Kudasai desactivadas' })
        break
      }
      case 'list': {
        const datos = GlobalDB.getState().getCommandData(from, EConstCMD.Kudasai) as IKudasaiData[]
        const total = datos.length
        const list = datos.sort((a, b) => a.slug.localeCompare(b.slug)).map((key) => {
          const { title, category: { slug: cslug }, slug } = key
          return `${MarkdownWsp.Bold(title)} ${urlBase.concat(cslug, '/', slug, '/')}`
        }).join('\n')
        await msg.send({
          text: `Noticias en la base de datos: ${total}\n${list}`
        })
        break
      }
      default: {
        await msg.reply({ text: 'Ejemplo de uso:\n/k_on\n/k_off' })
        break
      }
    }

    async function fnApi() {
      return (await kudasaiApi()).map(item => ({ id: item.slug, ...item }))
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
    // await client.sendMsgGroup(from, multimedias)
  }
}

import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { EConstCMD, type ContextMsg, type IPostMedia } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { IKudasaiData, kudasaiApi } from '@/bot/services/apis.services'
import { GlobalDB } from '@/bot/services/zustand.services'
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
  async cmd (client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    const [, accion] = match as [string, 'on' | 'off' | 'list' | 'start' | 'clear' | 'fetch' | undefined]
    const urlBase = 'https://somoskudasai.com/'

    const isGroup: boolean = msg.isGroup
    if (!isGroup) {
      await msg.reply({ text: 'Este comando solo puede ser usado en grupos' })
      return
    }
    GlobalDB.getState().startDbGroup({ from, cmd: EConstCMD.Kudasai })
    switch (accion) {
      case 'clear': {
        const temp = GlobalDB.getState().groupDatabases[from][EConstCMD.Kudasai]
        if (temp.data.size > 0) {
          temp.data.clear()
          await msg.reply({ text: 'Datos de Kudasai eliminados' })
        } else {
          await msg.reply({ text: 'No hay datos que eliminar' })
        }
        break
      }
      case 'fetch': {
        const medias = fnMedia(fnApi)
        await client.sendMsgGroup(from, medias)
        break
      }
      case 'start': {
        const data = await fnApi()
        GlobalDB.getState().setData({
          from, cmd: EConstCMD.Kudasai, data
        })
        await msg.reply({ text: 'Se han añadido las noticias actuales a la base de datos' })
        console.log('Datos agregados')
        break
      }
      case 'on': {
        const isActive: boolean = GlobalDB.getState().getNotification({ from, cmd: EConstCMD.Kudasai })
        if (isActive) {
          await msg.reply({ text: 'Las notificaciones de Kudasai ya están activadas' })
          return
        }
        GlobalDB.getState().setNotification({ from, cmd: EConstCMD.Kudasai, active: true })
        await msg.reply({ text: 'Notificaciones de Kudasai activadas' })
        // registrar input y output
        GlobalDB.getState().setCmdAcctions(EConstCMD.Kudasai, fnApi, fnMedia)
        break
      }
      case 'off': {
        const isActive: boolean = GlobalDB.getState().getNotification({ from, cmd: EConstCMD.Kudasai })
        if (!isActive) {
          await msg.reply({ text: 'Las notificaciones de Kudasai ya están desactivadas' })
          return
        }
        GlobalDB.getState().setNotification({ from, cmd: EConstCMD.Kudasai, active: false })
        await msg.reply({ text: 'Notificaciones de Kudasai desactivadas' })
        break
      }
      case 'list': {
        const keys = Object.keys(Object.fromEntries(GlobalDB.getState().groupDatabases[from][EConstCMD.Kudasai].data))
        const total = keys.length
        const list = keys.sort((a, b) => a.localeCompare(b)).map((key) => {
          const { title, category: { slug: cslug }, slug } = GlobalDB.getState().groupDatabases[from][EConstCMD.Kudasai].data.get(key) as unknown as { title: string, category: { slug: string }, slug: string }
          return `${MarkdownWsp.Bold(title)} ${urlBase.concat(cslug, '/', slug, '/')}`
        }).join('\n')
        await msg.send({
          text: `Noticias en la base de datos: ${total}\n${list}`
        })
        break
      }
      default: {
        await msg.reply({ text: 'Ejemplo de uso:\n/k_on\n/off' })
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

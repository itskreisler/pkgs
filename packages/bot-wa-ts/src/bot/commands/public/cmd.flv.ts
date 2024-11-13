import { EConstCMD, IPostMedia, type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { AnimeFLVScraper, IEpisodeAdded, URIS } from '@/bot/services/anime.services'
import { GlobalDB } from '@/bot/services/zustand.services'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'
//
export default {
  active: true,
  ExpReg: /^\/flv(?:_(\w+))?(?:@)?$/im,

  /**
     * @description Comando para obtener los ultimos episodios de animeflv
     *
     * @param client - Cliente de Whatsapp-web.js
     * @param msg - Mensaje de Whatsapp-web.js
     * @param match - Resultado de la expresión regular
     */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    const [, accion] = match as [string, 'on' | 'off' | 'start' | 'list' | 'fetch' | undefined]
    const isGroup: boolean = msg.isGroup
    if (!isGroup) {
      await msg.reply({ text: 'Este comando solo puede ser usado en grupos' })
      return
    }
    GlobalDB.getState().startDbGroup({ from, cmd: EConstCMD.Flv })
    const scraper = new AnimeFLVScraper()

    switch (accion) {
      case 'fetch': {
        const medias = await fnMedia(fnApi)
        await client.sendMsgGroup(from, medias)
        break
      }
      case 'start': {
        const data = await fnApi()
        GlobalDB.getState().setData({
          from, cmd: EConstCMD.Flv, data
        })
        await msg.reply({ text: 'Se han añadido animes flv mas reciente' })
        console.log('Datos agregados')
        break
      }
      case 'on': {
        const isActive: boolean = GlobalDB.getState().getNotification({ from, cmd: EConstCMD.Flv })
        if (isActive) {
          await msg.reply({ text: 'Las notificaciones de AnimeFlv ya están activadas' })
          return
        }
        GlobalDB.getState().setNotification({ from, cmd: EConstCMD.Flv, active: true })
        GlobalDB.getState().setCmdAcctions(EConstCMD.Flv, fnApi, fnMedia)
        await msg.reply({ text: 'Notificaciones de AnimeFlv activadas' })
        break
      }
      case 'off': {
        const isActive: boolean = GlobalDB.getState().getNotification({ from, cmd: EConstCMD.Flv })
        if (!isActive) {
          await msg.reply({ text: 'Las notificaciones de AnimeFlv ya están desactivadas' })
          return
        }
        GlobalDB.getState().setNotification({ from, cmd: EConstCMD.Flv, active: false })
        await msg.reply({ text: 'Notificaciones de AnimeFlv desactivadas' })
        break
      }
      case 'list': {
        const keys = Object.keys(Object.fromEntries(GlobalDB.getState().groupDatabases[from][EConstCMD.Flv].data))
        const total = keys.length
        const list = keys.sort((a, b) => a.localeCompare(b)).map((key) => {
          const { title, episode } = GlobalDB.getState().groupDatabases[from][EConstCMD.Flv].data.get(key) as unknown as { title: string, episode: number }
          return `${MarkdownWsp.Bold(title)} #${String(episode)}`
        }).join('\n')
        await msg.reply({ text: `Total: ${total}\n${list}` })
        break
      }
      default: {
        await msg.reply({ text: 'Ejemplo de uso:\n/flv_on\n/flv_off' })
        break
      }
    }

    //
    async function fnApi() {
      return scraper.latestEpisodesAdded()
    }
    async function fnMedia(fn: Function): Promise<IPostMedia[]> {
      const data: IEpisodeAdded[] = await fn()
      const multimedias: IPostMedia[] = []
      for (const { episode, title, poster, servers } of data) {
        const enlacesParaVer = servers.watchOnline.map(({ title, code }) => MarkdownWsp.Quote(MarkdownWsp.Bold(title).concat(': ', code))).join('\n')
        const caption = MarkdownWsp.Quote(URIS.FLV_BASE_URL)
          .concat('\n')
          .concat(`${MarkdownWsp.Quote(`El episodio #${String(episode)} de ${MarkdownWsp.Bold(title)} ya está disponible\n`)}`)
          .concat(enlacesParaVer)
        multimedias.push({
          image: {
            stream: await getStreamFromUrl(poster)
          },
          caption
        })
      }

      return multimedias
    }
  }
}

import { EConstCMD, IPostMedia, type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { AnimeFLVScraper, IEpisodeAdded, URIS, GlobalDB, CmdActions } from '@kreisler/bot-services'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { tryCatchPromise } from '@kreisler/try-catch'
//
export default {
  active: true,
  ExpReg: /^\/flv(?:_(\w+))?(?:@username)?(?:\s+(.+))?$/im,

  /**
     * @description Comando para obtener los ultimos episodios de animeflv
     *
     * @param client - Cliente de Whatsapp-web.js
     * @param msg - Mensaje de Whatsapp-web.js
     * @param match - Resultado de la expresión regular
     */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    const [, accion, query] = match as [string, 'on' | 'off' | 'start' | 'list' | 'fetch' | 'id' | undefined, string | undefined]
    const isGroup: boolean = msg.isGroup
    if (!isGroup) {
      await msg.reply({ text: 'Este comando solo puede ser usado en grupos' })
      return
    }
    const scraper = new AnimeFLVScraper()

    switch (accion) {
      case 'fetch': {
        const medias = await fnMedia(fnApi)
        await client.sendMsgGroup(from, medias)
        break
      }
      case 'start': {
        const data = await fnApi()
        GlobalDB.getState().addCommandData(from, EConstCMD.Flv, data)
        await msg.reply({ text: 'Se han añadido animes flv mas reciente' })
        console.log('Datos agregados')
        break
      }
      case 'on': {
        const isActive: boolean = GlobalDB.getState().getNotifications(from, EConstCMD.Flv)
        if (isActive) {
          await msg.reply({ text: 'Las notificaciones de AnimeFlv ya están activadas' })
          return
        }
        GlobalDB.getState().toggleNotifications(from, EConstCMD.Flv, true)
        CmdActions.setCmdActions(EConstCMD.Flv, fnApi, fnMedia)
        await msg.reply({ text: 'Notificaciones de AnimeFlv activadas' })
        break
      }
      case 'off': {
        const isActive: boolean = GlobalDB.getState().getNotifications(from, EConstCMD.Flv)
        if (!isActive) {
          await msg.reply({ text: 'Las notificaciones de AnimeFlv ya están desactivadas' })
          return
        }
        GlobalDB.getState().toggleNotifications(from, EConstCMD.Flv, false)
        await msg.reply({ text: 'Notificaciones de AnimeFlv desactivadas' })
        break
      }
      case 'list': {
        const datos = GlobalDB.getState().getCommandData(from, EConstCMD.Flv) as IEpisodeAdded[]
        const grouped = datos
          .sort((a, b) => a.id.localeCompare(b.id))
          .reduce<{ [key: string]: number[] }>((acc, item) => {
          if (typeof acc[item.title] === 'undefined') {
            acc[item.title] = []
          }
          acc[item.title].push(item.episode)
          return acc
        }, {})
        const total = String(datos.length)
        const list = Object.entries(grouped).map(([title, episodes]) => {
          const episodeList = episodes.sort((a, b) => a - b).map(ep => `#${ep}`).join(', ')
          return MarkdownWsp.Quote(`${title} (${episodeList})`)
        }).join('\n')
        await msg.reply({ text: `Total: ${total}\n${list}` })
        break
      }
      case 'id':{
        if (typeof query === 'undefined') {
          await msg.reply({ text: 'Proporciona un id de anime' })
          return
        }
        const [error, servers] = await tryCatchPromise(scraper.AnimeServers, query)
        if (error != null) {
          await msg.reply({ text: 'No se encontró el anime' })
          return
        }
        const enlacesParaVer = servers.watchOnline.map(({ title, code }) => MarkdownWsp.Quote(MarkdownWsp.Bold(title).concat(': ', code))).join('\n')
        await msg.reply({ text: enlacesParaVer })
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

import { EConstCMD, IPostMedia, type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/client.example'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { LatAnimeScraper, IEpisodeAdded, URIS, GlobalDB } from '@kreisler/bot-services'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { tryCatchPromise } from '@kreisler/try-catch'

export default {
  active: true,
  ExpReg: /^\/lat(?:_(\w+))?(?:@username)?(?:\s+(.+))?$/im,

  /**
   * @description Comando para obtener los últimos episodios de latanime.org
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
    const scraper = new LatAnimeScraper()

    switch (accion) {
      case 'fetch': {
        const data = await scraper.latestEpisodesAdded()
        const medias: IPostMedia[] = []
        for (const { episode, title, poster, servers } of data.slice(0, 5)) {
          const enlacesParaVer = servers.watchOnline.map(({ title, code }) => MarkdownWsp.Quote(MarkdownWsp.Bold(title).concat(': ', code))).join('\n')
          const caption = MarkdownWsp.Quote(URIS.LAT_BASE_URL)
            .concat('\n')
            .concat(`${MarkdownWsp.Quote(`El episodio #${String(episode)} de ${MarkdownWsp.Bold(title)} ya está disponible\n`)}`)
            .concat(enlacesParaVer)
          medias.push({
            image: {
              stream: await getStreamFromUrl(poster)
            },
            caption
          })
        }
        await client.sendMsgGroup(from, medias)
        break
      }
      case 'start': {
        const data = await scraper.latestEpisodesAdded()
        GlobalDB.getState().addCommandData(from, EConstCMD.Lat, data)
        await msg.reply({ text: 'Se han añadido animes de latanime.org más recientes' })
        console.log('Datos agregados')
        break
      }
      case 'on': {
        // usar el estado aqui
        const isActive: boolean = GlobalDB.getState().getNotifications(from, EConstCMD.Lat)
        if (isActive) {
          await msg.reply({ text: 'Las notificaciones de LatAnime ya están activadas' })
          return
        }
        // usar el estado aqui
        GlobalDB.getState().toggleNotifications(from, EConstCMD.Lat, true)
        await msg.reply({ text: 'Notificaciones de LatAnime activadas' })
        break
      }
      case 'off': {
        // usar el estado aqui
        const isActive: boolean = GlobalDB.getState().getNotifications(from, EConstCMD.Lat)
        if (!isActive) {
          await msg.reply({ text: 'Las notificaciones de LatAnime ya están desactivadas' })
          return
        }
        // usar el estado aqui
        GlobalDB.getState().toggleNotifications(from, EConstCMD.Lat, false)
        await msg.reply({ text: 'Notificaciones de LatAnime desactivadas' })
        break
      }
      case 'list': {
        const datos = GlobalDB.getState().getCommandData(from, EConstCMD.Lat) as IEpisodeAdded[]
        const grouped = datos
          .sort((a, b) => a.id.localeCompare(b.id))
          .reduce<Record<string, number[]>>((acc, item) => {
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
        await msg.reply({ text: `Total: ${total}\n${list.slice(0, 1000)}` })
        break
      }
      case 'id': {
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
        await msg.reply({ text: 'Ejemplo de uso:\n/lat_on\n/lat_off' })
        break
      }
    }
  }
}

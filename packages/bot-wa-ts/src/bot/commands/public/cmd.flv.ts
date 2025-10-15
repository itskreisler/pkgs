import { EConstCMD, IPostMedia, type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/client.example'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { AnimeFLVScraper, IEpisodeAdded, URIS, GlobalDB } from '@kreisler/bot-services'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { tryCatchPromise } from '@kreisler/try-catch'
import Stream from 'stream'
import { printLog } from '@/bot/helpers/utils'
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
    const [, accion, query] = match as [string, 'file' | 'on' | 'off' | 'start' | 'list' | 'fetch' | 'id' | undefined, string | undefined]
    const isGroup: boolean = msg.isGroup
    if (!isGroup) {
      await msg.reply({ text: 'Este comando solo puede ser usado en grupos' })
      return
    }
    const scraper = new AnimeFLVScraper()

    switch (accion) {
      case 'fetch': {
        const data = await scraper.latestEpisodesAdded()
        const medias: IPostMedia[] = []
        for (const { episode, title, poster, servers } of data) {
          const enlacesParaVer = servers.watchOnline.map(({ title, code }) => MarkdownWsp.Quote(MarkdownWsp.Bold(title).concat(': ', code))).join('\n')
          const caption = MarkdownWsp.Quote(URIS.FLV_BASE_URL)
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
          .reduce<Record<string, number[]>>((acc, item) => {
            if (typeof acc[item.title] === 'undefined') {
              acc[item.title] = []
            }
            acc[item.title].push(item.episode)
            return acc
          }, {})
        const registros = String(datos.length)
        const total = String(Object.keys(grouped).length).concat(' títulos, ', registros, ' registros')
        const list = Object.entries(grouped).map(([title, episodes]) => {
          const episodeList = episodes.sort((a, b) => a - b).map(ep => `#${ep}`).join(', ')
          return MarkdownWsp.Quote(`${title} (${episodeList})`)
        })
        const chunkSize = 100
        const chunks = list.reduce<string[][]>((acc, item, index) => {
          const chunkIndex = Math.floor(index / chunkSize)
          if (!acc[chunkIndex]) acc[chunkIndex] = []
          acc[chunkIndex].push(item)
          return acc
        }, [])
        await client.sendMsgGroupBatch(from, chunks.map((chunk, i) => {
          const start = i * chunkSize + 1
          const end = start + chunk.length - 1
          return {
            text: `Total: ${start}-${end}/${total}\n${chunk.join('\n')}`
          }
        }), undefined, 1, true).catch((error) => {
          printLog(error, 'red')
        })
        break
      }
      case 'file': {
        const datos = GlobalDB.getState().getCommandData(from, EConstCMD.Flv) as IEpisodeAdded[]
        const grouped = datos
          .sort((a, b) => a.id.localeCompare(b.id))
          .reduce<Record<string, number[]>>((acc, item) => {
            if (typeof acc[item.title] === 'undefined') {
              acc[item.title] = []
            }
            acc[item.title].push(item.episode)
            return acc
          }, {})
        const registros = String(datos.length)
        const total = String(Object.keys(grouped).length).concat(' títulos, ', registros, ' registros')
        const list = Object.entries(grouped).map(([title, episodes]) => {
          const episodeList = episodes.sort((a, b) => a - b).map(ep => `#${ep}`).join(', ')
          return MarkdownWsp.Quote(`${title} (${episodeList})`)
        }).join('\n')
        const buffer = Buffer.from(`Total: ${total}\n${list}`, 'utf-8')
        await client.sock.sendMessage(from, {
          document: {
            stream: Stream.Readable.from(buffer)
          },
          fileName: `animeflv_${Date.now()}.txt`,
          mimetype: 'text/plain'
        })
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
        await msg.reply({ text: 'Ejemplo de uso:\n/flv_on\n/flv_off' })
        break
      }
    }
  }
}

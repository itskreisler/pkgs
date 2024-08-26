import { configEnv } from '@/bot/helpers/env.test'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { MarkdownWsp } from './../../../../../js-helpers/src/lib/MarkdownWsp'
import { en2es, getAnimeById, getAnimeSearch, getRandom } from '@/bot/services/jikan.services'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
const DEFALT_TEXT = 'N/A'
//
export default {
  active: true,
  ExpReg: new RegExp(`^/m(?:al)?(?:_(\\w+))?(?:@${BOT_USERNAME})?(?:\\s+(.+))?$`, 'ims'),

  /**
     * @description
     * @param {import("@/bot/main").Whatsapp} client
     * @param {ContextMsg}
     * @param {RegExpMatchArray | null} match
     */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, accion, q] = match as [string, 's' | 'search' | 'id' | 'byid' | 'r' | 'random', string]
    console.log({ accion, q }) // kimi to boku\nNo\nSaigo
    switch (accion.toLowerCase()) {
      case 's':
      case 'search': {
        if (typeof q === 'undefined') {
          msg.reply(
            { text: `Debes escribir el nombre del anime a buscar.\nEjemplo:\n/anime_search ${MarkdownWsp.Bold('konosuba')}` }
          )
          return
        }
        const { data } = await getAnimeSearch(q)
        if (data.length === 0) {
          msg.reply({
            text: `No se encontraron resultados para ${MarkdownWsp.Bold(MarkdownWsp.Italic(q))}`
          })
          return
        }
        const resultado: string[] = data.map(({ mal_id: malId, title, title_japanese: titleJapanese, year, type, episodes, status, url, synopsis, genres, themes }: {
          mal_id: number
          title: string
          title_japanese: string | null
          year: number | null
          type: string | null
          episodes: number | null
          status: string
          url: string
          synopsis: string | null
          genres: Array<{ name: string }>
          themes: Array<{ name: string }>
        }) => MarkdownWsp.Monospace(
`🆔 MAL_ID: ${malId}
🔥 TITLE: ${title} (${titleJapanese ?? DEFALT_TEXT})
✔️ Episodios: ${episodes ?? DEFALT_TEXT}
✔️ Año: ${year ?? DEFALT_TEXT}
✔️ Format: ${type ?? DEFALT_TEXT}
`).concat('\n', MarkdownWsp.Quote(url)))
        const message = `
Resultado de la busqueda: _${q}_\n
${resultado.join('\n')}
          `
        client.sock.sendMessage(wamsg.key.remoteJid as string, { text: message })
        break
      }
      case 'id':
      case 'byid': {
        if (typeof q === 'undefined') {
          msg.reply(
            { text: `Debes escribir el id del anime a buscar.\nEjemplo:\n/anime_byid ${MarkdownWsp.Bold('6789')}` }
          )
          return
        }
        const { data, status } = await getAnimeById(Number(q))
        if (typeof status !== 'undefined') {
          msg.reply({
            text: `No se encontraron resultados para ${MarkdownWsp.Bold(MarkdownWsp.Italic(q))}`
          })
          return
        }
        const { images: { jpg: { large_image_url: largeImageUrl } }, url, episodes, title, year, genres, synopsis, type, source, duration, season, themes }: {
          images: { jpg: { large_image_url: string } }
          url: string
          episodes: number | null
          title: string
          year: number | null
          genres: Array<{ name: string }>
          synopsis: string
          type: string | null
          source: string
          duration: string | null
          season: string | null
          themes: Array<{ name: string }>
        } = data
        const translation: string = await en2es(synopsis)
        const caption = `
🔥 Título: ${MarkdownWsp.Monospace(title)}
✔️ Temporada: ${season ?? DEFALT_TEXT}
✔️ Géneros: ${genres.length > 0 ? genres.map(({ name }) => name).join(', ') : DEFALT_TEXT}
✔️ Categorías: ${themes.length > 0 ? themes.map(({ name }) => name).join(', ') : DEFALT_TEXT}
✔️ Episodios: ${episodes ?? DEFALT_TEXT}
✔️ Duración del episodio: ${duration ?? DEFALT_TEXT}
✔️ Año: ${year ?? DEFALT_TEXT}
✔️ Format: ${type ?? DEFALT_TEXT}
✔️ Fuente: ${source}
🔰 Sinopsis: ${translation.length === 0 ? DEFALT_TEXT : translation}
🌐 Url: ${url}`
        const [media] = await client.imageUrl2Base64(largeImageUrl)
        client.sock.sendMessage(wamsg.key.remoteJid as string, {
          image: media,
          caption
        })
        break
      }
      case 'r':
      case 'random': {
        const { data } = await getRandom()
        const { images: { jpg: { large_image_url: largeImageUrl } }, url, episodes, title, year, genres, synopsis, type, source, duration, season, themes }: {
          images: { jpg: { large_image_url: string } }
          url: string
          episodes: number | null
          title: string
          year: number | null
          genres: Array<{ name: string }>
          synopsis: string
          type: string | null
          source: string
          duration: string | null
          season: string | null
          themes: Array<{ name: string }>
        } = data
        const translation: string = await en2es(synopsis)
        const caption = `
🔥 Título: ${MarkdownWsp.Monospace(title)}
✔️ Temporada: ${season ?? DEFALT_TEXT}
✔️ Géneros: ${genres.length > 0 ? genres.map(({ name }) => name).join(', ') : DEFALT_TEXT}
✔️ Categorías: ${themes.length > 0 ? themes.map(({ name }) => name).join(', ') : DEFALT_TEXT}
✔️ Episodios: ${episodes ?? DEFALT_TEXT}
✔️ Duración del episodio: ${duration ?? DEFALT_TEXT}
✔️ Año: ${year ?? DEFALT_TEXT}
✔️ Format: ${type ?? DEFALT_TEXT}
✔️ Fuente: ${source}
🔰 Sinopsis: ${translation.length === 0 ? DEFALT_TEXT : translation}
🌐 Url: ${url}`
        const [media] = await client.imageUrl2Base64(largeImageUrl)
        client.sock.sendMessage(wamsg.key.remoteJid as string, {
          image: media,
          caption
        })
        break
      }
      default: {
        const text = `
${MarkdownWsp.Italic('Comandos disponibles:')}
${MarkdownWsp.Monospace('/anime_search TITLE')} - Busca un anime por su nombre
${MarkdownWsp.Monospace('/anime_byid MAL_ID')} - Busca un anime por su id
${MarkdownWsp.Monospace('/anime_random')} - Busca un anime aleatorio
                    `
        msg.reply({ text })
        break
      }
    }
  }
}

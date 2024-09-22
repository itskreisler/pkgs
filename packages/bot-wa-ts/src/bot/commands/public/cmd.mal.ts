import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { en2es, getAnimeById, getAnimeSearch, getRandom, groupAnimeByTitle } from '@/bot/services/jikan.services'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
const DEFALT_TEXT = 'N/A'
//
interface AnimeSearch {
  mal_id: number
  title: string
  title_japanese: string | null
  year: number | null
  type: string | null
  episodes: number | null
  url: string
}
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
  async cmd (client: Whatsapp, { wamsg, msg, quotedBody }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, accion, _q] = match as [string, 's' | 'search' | 'id' | 'byid' | 'r' | 'random' | undefined, string | undefined]
    let q: string | undefined
    if (msg.isReply === true) {
      const hasQuotedBody: boolean = client.hasOwnProp(quotedBody, 'body')
      if (!hasQuotedBody) {
        msg.reply({ text: 'Debes citar un mensaje que tenga texto' })
        return
      }
      q = client.getNestedProp<string>(quotedBody, 'body')
    } else {
      q = _q
    }
    switch (accion?.toLowerCase()) {
      case 's':
      case 'search': {
        if (typeof q === 'undefined') {
          msg.reply(
            { text: `Debes escribir el nombre del anime a buscar.\nEjemplo:\n/mal_search ${MarkdownWsp.Bold('konosuba')}` }
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
        const groups = groupAnimeByTitle(data).map(group => group.sort((a, b) => a.title.localeCompare(b.title)))
        // console.log(JSON.stringify(groups.map(g => g.map(a => a.title)), null, 2))
        const resultado = groups.map(group => {
          // Mapear cada anime dentro del grupo en el formato compacto
          const groupResults = group.map(({ mal_id: malId, title, title_japanese: titleJapanese, year, type, episodes }: AnimeSearch) =>
            MarkdownWsp.Quote(`🔥 ${title} — 🆔(${malId}) 📅(${year ?? DEFALT_TEXT}) 🎞️(${type ?? DEFALT_TEXT}) 📺(${episodes ?? DEFALT_TEXT})`)
          )

          // Unimos los resultados del grupo con saltos de línea
          return groupResults.join('\n')
        })
        /*        const _resultado: string[] = data.map(({ mal_id: malId, title, title_japanese: titleJapanese, year, type, episodes, status, url, synopsis, genres, themes }: AnimeSearch) => MarkdownWsp.Monospace(`🆔 MAL_ID: ${malId}
🔥 TITLE: ${title} (${titleJapanese ?? DEFALT_TEXT})
✔️ Episodios: ${episodes ?? DEFALT_TEXT}
✔️ Año: ${year ?? DEFALT_TEXT}
✔️ Format: ${type ?? DEFALT_TEXT}`).concat('\n', MarkdownWsp.Quote(url)))
*/
        const message = `Resultado de la búsqueda: _${q}_\n\n`.concat(resultado.join('\n\n————————————————\n\n'))
        client.sock.sendMessage(wamsg.key.remoteJid as string, { text: message })
        break
      }
      case 'id':
      case 'byid': {
        if (typeof q === 'undefined') {
          msg.reply(
            { text: `Debes escribir el id del anime a buscar.\nEjemplo:\n/mal_byid ${MarkdownWsp.Bold('6789')}` }
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
${MarkdownWsp.Monospace('/mal_search TITLE')} - Busca un anime por su nombre
${MarkdownWsp.Monospace('/mal_byid MAL_ID')} - Busca un anime por su id
${MarkdownWsp.Monospace('/mal_random')} - Busca un anime aleatorio
                    `
        msg.reply({ text })
        break
      }
    }
  }
}

import { configEnv } from '@/bot/helpers/env'
import { getStreamFromUrl, Cadena } from '@/bot/helpers/polyfill'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { r34API, r34Tags, r34RandomPic } from '@/bot/services/r34.services'
import { MarkdownWsp } from '@kreisler/js-helpers'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
//

//
export default {
  active: true,
  ExpReg: new RegExp(`^/r(?:ule)?34(?:_(\\w+))?(?:@${BOT_USERNAME})?(?:\\s+(.+))?$`, 'ims'),

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, accion, q] = match as [string, 'r' | 'random' | undefined, string | undefined]

    switch (accion?.toLowerCase()) {
      case 'r':
      case 'random': {
        break
      }
      default:{
        if (typeof q === 'undefined') {
          msg.reply({ text: 'Debes escribir una etiqueta para buscar' })
          return
        }
        const tags = await r34Tags(q)
        if (tags.length === 0) {
          msg.reply({
            text: `No se encontraron resultados para ${MarkdownWsp.Bold(MarkdownWsp.Italic(q))}`
          })
          return
        }
        const [first] = tags
        const { label, value: tag } = first
        const count = label.match(/\((\d+)\)/g)?.pop()?.match(/([\d]+)/gm) as [string] | undefined
        if (count != null && tag != null) {
          const totalRegistros = Number(count[0])
          const limit = totalRegistros > 1000 ? 500 : Number(count[0])
          // Calculamos cuántas páginas completas hay
          const paginasCompletas = Math.floor(totalRegistros / limit)
          // Si hay algún registro sobrante, necesitamos una página extra
          const paginasExtra = totalRegistros % limit > 0 ? 1 : 0
          // El número total de páginas será la suma de las completas más las extras
          const pages = paginasCompletas + paginasExtra
          const minMaxInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
          const pid = minMaxInt(0, pages - 1)
          console.log({ totalRegistros, limit, pid, pages })
          const result = await r34API([tag], { limit, pid })
          const random = r34RandomPic(result)
          console.log(random.file_url)
          const stream = await getStreamFromUrl(random.file_url)
          // console.log('Descargando archivo...')
          // const kcheBuffer = await convertStreamToBuffer(stream)
          // console.log('Archivo descargado')
          // const kche = await fileTypeFromBuffer(kcheBuffer)
          // console.log('Leyendo archivo...', kche?.mime)
          const caption = tag.concat('\n', random.file_url)
          const viewOnce = true
          const multimedia = random.file_url.endsWith('.mp4') === true
            ? { video: { stream }, caption, viewOnce }
            : (new Cadena(random.file_url)).endsWithV2(['.png', '.jpg', '.jpeg']) === true
                ? { image: { stream }, caption, viewOnce }
                : { text: 'No se pudo obtener el archivo, pero aqui tienes el link.'.concat('\n', MarkdownWsp.Quote(random.file_url)) }
          await msg.send(multimedia)
        }
      }
    }
  }
}

import { configEnv } from '@/bot/helpers/env'
import { getStreamFromUrl, Cadena } from '@/bot/helpers/polyfill'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { r34API, r34Tags, r34RandomPic, type R34Tags, R34Const, R34Response } from '@/bot/services/r34.services'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { createApi } from '@kreisler/createapi'
const { BOT_USERNAME } = configEnv() as { BOT_USERNAME: string }
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
  async cmd (client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
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
        const listTags = q.split(' ').map((tag) => r34Tags(tag))
        const results = await Promise.allSettled(listTags)
        const resultsTags = results
          .filter(r => r.status === 'fulfilled' && r.value.length > 0) as Array<{ status: 'fulfilled', value: R34Tags[] }>
        const tags = resultsTags.map(r => r.value)
        let result: R34Response[] = []
        let tag: string = ''
        const viewOnce = false
        if (tags.length === 0) {
          msg.reply({
            text: `No se encontraron resultados para ${MarkdownWsp.InlineCode(q)}`
          })
          return
        } else if (tags.length === 1) {
          tag = tags[0].map(t => t.value)[0]
          const label = tags[0].map(t => t.label)[0]
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
            const minMaxInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min
            const pid = minMaxInt(0, pages - 1)
            client.printLog({ totalRegistros, pid, pages }, 'yellow')
            result = await (async () => {
              let res
              try {
                res = await r34API([tag], { limit, pid })
              } catch (error) {
                client.printLog(JSON.stringify(error, null, 2), 'redBlock')
                res = await r34API([tag], { limit, pid: 0 })
              }
              return res
            })()
          }
        } else {
          const tags = resultsTags.map(r => r.value.shift()?.value).flat() as string[]
          tag = tags.join(' ')
          result = await r34API(tags)
        }
        if (result.length < 50) {
          msg.reply({
            text: 'La cantidad de resultados para '.concat(MarkdownWsp.InlineCode(tag), ' es muy baja, intenta con otras etiquetas.\nCantidad: ', String(result.length))
          })
        }
        client.printLog({ tag, cantidad: result.length }, 'purple')
        const random = r34RandomPic(result)
        client.printLog(random.file_url, 'purpleBlock')
        const posturl = await createApi<{
          'index.php': (id: { page: 'post', s: 'view', id: number }) => Promise<{ path: string }>
        }>(R34Const.BASE, { x_debug: true })['index.php']({ page: 'post', s: 'view', id: random.id })
        const caption = tag.concat('\nArchivo: ', random.file_url, '\nPost: ', posturl.path)
        const stream = await getStreamFromUrl(random.file_url)
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

import { nodeFetchBuffer, getStreamFromUrl } from '@/bot/helpers/polyfill'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
//
export default {
  active: true,
  ExpReg: /^\/dl(?:\s+(.+))?$/ims,

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, url] = match as [string, string | null]
    if (url === null) {
      msg.reply({ text: 'Proporciona un enlace para descargar(imagen o video)' })
      return
    }
    if (url.startsWith('http')) {
      const kche = await (async () => {
        try {
          return await Promise.resolve(await nodeFetchBuffer(url))
        } catch {
          return undefined
        }
      })()

      if (typeof kche === 'undefined') {
        msg.reply({ text: 'No se pudo descargar el archivo, revisa la url' })
        return
      }
      const { fileType } = kche
      const multimedia = fileType?.mime.startsWith('image') === true
        ? { image: { stream: await getStreamFromUrl(url) } }
        : fileType?.mime.startsWith('video') === true
          ? { video: { stream: await getStreamFromUrl(url) } }
          : { text: 'No es una imagen o video' }
      await msg.send(multimedia)
    }
  }
}

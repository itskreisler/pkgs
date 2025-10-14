import { nodeFetchBuffer, getStreamFromUrl } from '@/bot/helpers/polyfill'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/client.example'
//
export default {
  active: true,
  ExpReg: /^\/dl(?:_(\w+))?(?:\s+(.+))?$/ims,

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, opcion, url] = match as [string, string | undefined, string | undefined]
    if (typeof url === 'undefined') {
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
      const fileName = Date.now().toString().concat('.', fileType?.ext as string)
      const multimedia = typeof opcion === 'string'
        ? { document: { stream: await getStreamFromUrl(url) }, fileName, mimetype: fileType?.mime as string }
        : fileType?.mime.startsWith('image') === true
          ? { image: { stream: await getStreamFromUrl(url) } }
          : fileType?.mime.startsWith('video') === true
            ? { video: { stream: await getStreamFromUrl(url) } }
            : { text: 'No es una imagen o video' }
      await msg.send(multimedia)
    }
  }
}

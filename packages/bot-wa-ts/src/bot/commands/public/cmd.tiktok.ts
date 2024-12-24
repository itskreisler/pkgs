import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { tikwm, TikTokStatusCodes, sizeMB } from '@/bot/services/tiktok.services'
import { nodeFetchBuffer, getStreamFromUrl } from '@/bot/helpers/polyfill'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { proto } from '@whiskeysockets/baileys'
//
const ExpReg = /^\/tt(?:\s+(https?:\/\/((?:www\.)?|(?:vm\.)?|(?:vt\.)?|(?:m\.)?)tiktok\.com\/(?:@[a-zA-Z0-9_]+\/)?(?:video\/)?([a-zA-Z0-9]+)))?/ims
function validateDomainTikTok (url: string): boolean {
  const [, , domain] = url.split('/')
  const array = ['www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com']
  return array.some((e) => e === domain)
}
export default {
  active: true,
  ExpReg,

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg, quotedBody }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, _url] = match as [string, string | undefined]
    let url = _url
    if (typeof quotedBody?.body !== 'undefined') {
      url = client.getNestedProp<string>(quotedBody, 'body')
    }
    if (typeof url !== 'undefined') {
      if (!validateDomainTikTok(url)) {
        msg.reply({ text: 'El enlace no es de tiktok' })
        return
      }
      const { code, data, domain, msg: mg } = await tikwm(url)
      // si codigo es -1 es que ha fallado
      if (code === TikTokStatusCodes.FAILED) {
        msg.reply({ text: mg })
        return
      }
      // si no hay datos
      if (typeof data === 'undefined') {
        msg.reply({ text: 'No se ha podido obtener información' })
        return
      }
      // si hay imagenes
      if (typeof data.images !== 'undefined') {
        const promises: Array<Promise<proto.WebMessageInfo | undefined>> = []
        for (const img of data.images) {
          const kche = await nodeFetchBuffer(img)
          promises.push(
            client.sock.sendMessage(wamsg.key.remoteJid as string, {
              image: kche.buffer,
              mimetype: kche.fileType?.mime as string,
              fileName: Date.now().toString().concat('.', kche.fileType?.ext as string)
            })
          )
        }
        await Promise.all(promises)
          .then((Wmsginfo) => {
            client.sock.sendMessage(wamsg.key.remoteJid as string, {
              text: 'Cantidad de imagenes enviadas: '.concat(String(Wmsginfo.length))
            }, { quoted: Wmsginfo.pop() })
            // msg.reply({ text: 'Cantidad de imagenes enviadas: '.concat(String(data.images?.length)) })
          })
          .catch((e) => {
            console.error('Ha ocurrido un error al enviar las imagenes', { e })
            msg.reply({ text: 'Ha ocurrido un error al enviar las imagenes\n'.concat(MarkdownWsp.InlineCode(JSON.stringify(e, null, 2))) })
          })
      } else {
        const urlPLay = (str: 'play' | 'hdplay' | 'wmplay' | 'cover' | 'music'): string => domain.concat(data[str])
        const caption = [{
          title: 'No Watermark',
          url: urlPLay('play'),
          size: data.size
        }, {
          title: 'No Watermark(HD)',
          url: urlPLay('hdplay'),
          size: data.hd_size
        },
        {
          title: 'Watermark',
          url: urlPLay('wmplay'),
          size: data.wm_size
        },
        {
          title: 'Cover',
          url: urlPLay('cover'),
          size: null
        },
        {
          title: 'Music',
          url: urlPLay('music'),
          size: null
        }
        ].map(({ title, url, size }) => MarkdownWsp.Quote(
          title.concat(
            size !== null ? ' ('.concat(sizeMB(size), 'MB)') : ''
          ).concat(': ', url)
        )).join('\n')
        client.sock.sendMessage(wamsg.key.remoteJid as string, {
          video: {
            stream: await getStreamFromUrl(urlPLay('play'))
          },
          caption
        }).catch(async (e) => {
          console.error('Ha ocurrido un error al enviar el video', { e })
          msg.reply({ text: 'Ha ocurrido un error al enviar el video\n'.concat(MarkdownWsp.InlineCode(JSON.stringify(e, null, 2))) })
          //
          const kcheCover = await nodeFetchBuffer(urlPLay('cover'))
          client.sock.sendMessage(wamsg.key.remoteJid as string, {
            image: kcheCover.buffer,
            mimetype: kcheCover.fileType?.mime as string,
            caption
          })
        })
      }
    }
  }
}
/* async function tryCatch<T, U = any>(fn: (...args: U[]) => Promise<T>, ...args: U[]): Promise<[Error | null, T | null]> {
  try {
    const data = await fn(...args)
    return [null, data]
  } catch (error) {
    return [error as Error, null]
  }
} */

// import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { tikwm, TikTokStatusCodes } from '@/bot/services/tiktok.services'
import { nodeFetchBuffer } from '@/bot/helpers/polyfill'
import { MarkdownWsp } from '@kreisler/js-helpers'
// const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
//
const ExpReg = /^\/tt(?:\s+(https?:\/\/((?:www\.)?|(?:vm\.)?|(?:m\.)?)tiktok\.com\/(?:@[a-zA-Z0-9_]+\/)?(?:video\/)?([a-zA-Z0-9]+)))?/ims
function validateDomainTikTok (url: string): boolean {
  const [, , domain] = url.split('/')
  const array = ['www.tiktok.com', 'vm.tiktok.com']
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
  async cmd(client: Whatsapp, { wamsg, msg, quotedBody }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, _url] = match as [string, string | undefined]
    let url = _url
    if (typeof quotedBody?.body !== 'undefined') {
      url = client.getNestedProp<string>(quotedBody, 'body')
    }
    if (typeof url !== 'undefined' && validateDomainTikTok(url)) {
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
        const promises = []
        for (const img of data.images) {
          const tempBuffer = await nodeFetchBuffer(img)
          promises.push(
            client.sock.sendMessage(wamsg.key.remoteJid as string, {
              image: tempBuffer.buffer,
              mimetype: tempBuffer.fileType?.mime as string,
              fileName: Date.now().toString().concat('.', tempBuffer.fileType?.ext as string)
            })
          )
        }
        await Promise.all(promises)
          .then(() => {
            msg.reply({ text: 'Cantidad de imagenes enviadas: '.concat(String(data.images?.length)) })
          })
          .catch((e) => {
            console.log('Ha ocurrido un error al enviar las imagenes', { e })
            msg.reply({ text: 'Ha ocurrido un error al enviar las imagenes' })
          })
      } else {
        const urlPLay = (str: 'play' | 'hdplay' | 'hdplay'): string => domain.concat(data[str])
        const caption = [{
          type: 'play',
          url: urlPLay('play')
        }, {
          type: 'hdplay',
          url: urlPLay('hdplay')
        },
        {
          type: 'cover',
          url: urlPLay('cover')
        }
        ].map(({ type, url }) => MarkdownWsp.Quote(type.concat(': ', url))).join('\n')
        console.log(
          caption
        )
        const playMB = Math.round((data.size as number) / 1024 / 1024)
        const hdplayMB = Math.round((data.hd_size as number) / 1024 / 1024)
        console.log(hdplayMB, playMB)
        let tempBuffer
        if (hdplayMB < 49) {
          tempBuffer = await nodeFetchBuffer(urlPLay('hdplay'))
          console.log('Enviando video en hd')
          await client.sock.sendMessage(wamsg.key.remoteJid as string, {
            video: tempBuffer.buffer,
            mimetype: tempBuffer.fileType?.mime as string,
            fileName: Date.now().toString().concat('.', tempBuffer.fileType?.ext as string),
            caption
          }).catch(async (e1) => {
            console.log('Ha ocurrido un error al enviar el video en hd', { e1 })
            msg.reply({ text: 'Ha ocurrido un error al enviar el video en hd' })
            //
            tempBuffer = await nodeFetchBuffer(urlPLay('play'))
            await client.sock.sendMessage(wamsg.key.remoteJid as string, {
              video: tempBuffer.buffer,
              mimetype: tempBuffer.fileType?.mime as string,
              fileName: Date.now().toString().concat('.', tempBuffer.fileType?.ext as string),
              caption
            }).catch((e2) => {
              console.log('Ha ocurrido un error al enviar el video en play', { e2 })
              msg.reply({ text: 'Ha ocurrido un error al enviar el video en play' })
              // send cover
            })
          })
        }
      }
    }
  }
}

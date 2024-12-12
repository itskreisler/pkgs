import { type ContextMsg } from '@/bot/interfaces/inter'
import { Message } from '@/bot/interfaces/message'
import type Whatsapp from '@/bot/main'
import fs, { writeFileSync } from 'fs'
//
export default {
  active: true,
  ExpReg: /^\/st(?:_(\w+))?(?:@username)?(?:\s+(.+))?$/ims,

  /**
   * @description Comando para crear stickers
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg, quotedBody }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const from: string = wamsg.key.remoteJid as string
    let chat: Message
    const [, accion, query] = match as [string, string | undefined, string | undefined]
    console.log({ accion, query })
    let q: string | undefined
    if (msg.isReply === true) {
      const hasQuotedBody: boolean = client.hasOwnProp(quotedBody, 'body')
      if (!hasQuotedBody) {
        msg.reply({ text: 'Debes citar un mensaje que tenga una imagen o video' })
        return
      }
      chat = msg.getQuotedMsg() as Message
      q = client.getNestedProp<string>(quotedBody, 'body')
    } else {
      chat = msg
      q = query
    }
    if (chat.hasMedia === false) {
      await msg.reply({ text: 'El contenido del mensaje no es multimedia o no es un mensaje de una sola ves' })
      return
    }
    const media = await chat.downloadMediaV2()
    const generateSticker = await client.stickerGenerator(media?.buffer as Buffer)
    await msg.send({
      sticker: generateSticker
    })
  }
}

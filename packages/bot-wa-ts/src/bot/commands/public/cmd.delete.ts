import { type ContextMsg } from '@/bot/interfaces/inter'
import { Message } from '@/bot/interfaces/message'
import type Whatsapp from '@/bot/client.example'
//
export default {
  active: true,
  ExpReg: /^\/delete/im,

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const hasReplay = msg.isReply
    if (hasReplay === false) {
      msg.reply({
        text: '❌ *No hay mensaje para borrar*'
      })
      return
    }
    const quote = msg.getQuotedMsg() as Message
    const elBotEnviaMsg = quote.fromMe
    if (elBotEnviaMsg === false) {
      msg.reply({
        text: '❌ *No puedes borrar mensajes de otros*'
      })
      return
    }
    await msg.send({
      delete: quote.getData().key
    })
  }
}

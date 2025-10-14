import {
  type WAMessage,
  type MessageUpsertType
} from 'baileys'
import type Whatsapp from '@/bot/client.example'
import { BOT_PREFIX } from '@/bot/helpers/env'
import { type ContextMsg, type decounceMessage } from '@/bot/interfaces/inter'
import { Message } from '@/bot/interfaces/message'
import { debounce } from '@kreisler/debounce'
import { printLog } from '@/bot/helpers/utils'
//
const messageDebounced = debounce(messageHandler, 2500, {
  immediate: true,
  flood: 10,
  onFlood: (result: decounceMessage) => {
    result.context.msg.reply({
      text: '🚨 *Flood detectado*\n_Espera 2.5 segundos antes de volver a ejecutar un comando_'
    })
  },
  onComplete: (result: decounceMessage) => {
    console.info(
      'Se ha completado el comando', result.context.body, result.ExpReg
    )
  }
})
async function messageHandler({ client, context, comando, ExpReg }: decounceMessage): Promise<void> {

  const match = context.body?.match(ExpReg) as RegExpMatchArray
  await comando.cmd(client, context, match)
}
/**
 * @description Manejador de eventos de mensajes
 * @param {Whatsapp} client
 * @param {{ messages: import("baileys").WAMessage[], type: import("baileys").MessageUpsertType }} content
 */
export async function handler(client: Whatsapp, content: {
  messages: WAMessage[]
  type: MessageUpsertType
}): Promise<void> {
  const chat = content.messages[0]

  if (chat.message === null) return
  const getMessageBody = client.getMessageBody(chat.message)
  const { body, typeMessage, quotedBody } = getMessageBody
  if (chat.key.fromMe === true || typeof body === 'undefined' || body === null) return
  const hasPrefix: boolean = body.startsWith(BOT_PREFIX)
  if (!hasPrefix) return
  const [existe, [ExpReg, comando]] = client.findCommand(body)
  if (existe === true && comando?.active === true) {
    try {
      const msg = new Message(client, chat)
      const context: ContextMsg = { msg, wamsg: chat, ...getMessageBody }
      await messageDebounced({ client, context, comando, ExpReg })
      await msg.react('✅')
    } catch (e) {
      printLog(`❌ Error ejecutando comando: ${e}`, 'red')
      const from: string = chat.key.remoteJid as string
      client.sock.sendMessage(
        from,
        { text: `*Ha ocurrido un error al ejecutar el comando \`${body as string}\`*\n*Mira la consola para más detalle*` }
      )
    }
  }
}

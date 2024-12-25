import { type ClientBot } from '@/bot/core/main'
import type TelegramBot from 'node-telegram-bot-api'
import { debounce as _ } from '@kreisler/debounce'
import { type IClsBot } from '@/bot/interfaces/proto'
import { Message } from '@/bot/interfaces/cls.message'
//
const messageDebounced = _(messageHandler, 2000, {
  immediate: true,
  flood: 5,
  onFlood: (ctx:
  IClsBot.IDebounceParams
  ) =>
    ctx.client.sendMessage(
      ctx.msg.chat.id,
      '🚨 *Flood detectado*\n_Espera 5 segundos antes de volver a ejecutar un comando_',
      { parse_mode: 'MarkdownV2', reply_to_message_id: ctx.msg.message_id }
    )
})
function messageHandler ({ client, msg, comando, ExpReg }: IClsBot.IDebounceParams) {
  const { text } = msg
  comando.cmd(client, { msg, ctx: new Message(client, msg) }, text?.match(ExpReg) ?? null)
}
/**
 *
 * @param {import('node-telegram-bot-api')} client
 * @param {import('node-telegram-bot-api').Message} msg
 */
export async function handler (client: ClientBot, msg: TelegramBot.Message): Promise<void> {
  const { text, chat, from } = msg
  if (typeof text === 'undefined') return
  console.log('(Event->Message)', {
    text,
    chatUsername: chat.username ?? chat.first_name,
    fromUsername: from?.username ?? from?.first_name ?? ''
  })
  const [existe, [ExpReg, comando]] = client.findCommand(text)
  if (existe === false) return
  messageDebounced({ client, msg, comando, ExpReg })
}

import {
  type WAMessage,
  type MessageUpsertType
} from '@whiskeysockets/baileys'
import type Whatsapp from '@/bot/main'
import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg, type decounceMessage } from '@/bot/interfaces/inter'
import { Message } from '@/bot/interfaces/message'
import { debounce } from '@kreisler/debounce'
//
const { BOT_PREFIX } = configEnv as { BOT_PREFIX: string }
const messageDebounced = debounce(messageHandler, 5000, {
  immediate: true,
  flood: 5,
  onFlood: (result: decounceMessage) => {
    result.context.msg.reply({
      text: '🚨 *Flood detectado*\n_Espera 5 segundos antes de volver a ejecutar un comando_'
    })
  },
  onComplete: (result: decounceMessage) => {
    console.info(
      'Se ha completado el comando', result.context.body, result.ExpReg
    )
  }
})
async function messageHandler ({ client, context, comando, ExpReg }: decounceMessage): Promise<void> {
  // @ts-expect-error
  const match = context.body.match(ExpReg) as RegExpMatchArray
  await comando.cmd(client, context, match)
}
/**
 * @description Manejador de eventos de mensajes
 * @param {Whatsapp} client
 * @param {{ messages: import("@whiskeysockets/baileys").WAMessage[], type: import("@whiskeysockets/baileys").MessageUpsertType }} content
 */
export async function handler (client: Whatsapp, content: {
  messages: WAMessage[]
  type: MessageUpsertType
}): Promise<void> {
  const chat = content.messages[0]
  if (chat.message === null) return
  const getMessageBody = client.getMessageBody(chat.message)
  const { body, typeMessage, quotedBody } = getMessageBody
  // client.saveFile('./dist/chat.json', JSON.stringify([chat], null, 2))
  // if (chat?.key?.remoteJid === 'status@broadcast' || ((chat?.message) == null) || chat.key.fromMe === true || body.length === 0) return
  if (chat.key.fromMe === true || typeof body === 'undefined' || body === null) return
  const hasPrefix: boolean = body.startsWith(BOT_PREFIX)
  if (!hasPrefix) return
  client.printLog(JSON.stringify({ body, typeMessage, quotedBody }, null, 2), 'cyan')
  const [existe, [ExpReg, comando]] = client.findCommand(body)
  if (existe === true && comando?.active === true) {
    try {
      const msg = new Message(client, chat)
      const context: ContextMsg = { msg, wamsg: chat, ...getMessageBody }
      await messageDebounced({ client, context, comando, ExpReg })
      // await comando.cmd(client, context, context?.body?.match(ExpReg as RegExp) as RegExpMatchArray)
      await msg.react('✅')
    } catch (e) {
      console.error('Ha ocurrido un error al ejecutar el comando', { e })
      const from: string = chat.key.remoteJid as string
      client.sendText(
        from,
        { text: `*Ha ocurrido un error al ejecutar el comando \`${body as string}\`*\n*Mira la consola para más detalle*` }
      )
    }
  }
  // const msg = new Message(this, chat)

  // msg.reply('Hola')
  /*
  const hasMessage: boolean = client.hasOwnProp(content.messages[0], 'message')
  const hasConversation: boolean = client.hasOwnProp(content.messages[0].message, 'conversation')
  const hasImageMessage: boolean = client.hasOwnProp(content.messages[0].message, 'imageMessage')
  const hasExtendedTextMessage: boolean = client.hasOwnProp(content.messages[0].message, 'extendedTextMessage')
  const hasQuotedMessage: boolean = client.hasOwnProp(content.messages[0].message, 'extendedTextMessage.contextInfo.quotedMessage')
  const protocolMessage: boolean = client.hasOwnProp(content.messages[0].message, 'protocolMessage')
  const hasDocumentWithCaptionMessage: boolean = client.hasOwnProp(content.messages[0].message, 'documentWithCaptionMessage.message.documentMessage.caption')
  console.log({
    hasMessage,
    hasConversation,
    hasImageMessage,
    hasExtendedTextMessage,
    hasQuotedMessage,
    protocolMessage,
    hasDocumentWithCaptionMessage
  })
  */
  // const hasImageMessageCaption = client.hasOwnProp(content.messages[0].message, 'imageMessage.caption')
  // const isRevoked = hasMessage ? !!protocolMessage : false

  // if (content.messages[0].key.fromMe === false) {
  //   if (!isRevoked) {
  //     const isMessage = !!hasMessage
  //     const isImage = isMessage
  //       ? !!hasImageMessage
  //       : false
  //     const from: string = content.messages[0].key.remoteJid as string
  //     const body: string = isMessage
  //       ? isImage
  //         ? client.getNestedProp<string>(content.messages[0].message, 'imageMessage.caption') ?? ''
  //         : hasConversation
  //           ? client.getNestedProp<string>(content.messages[0].message, 'conversation') ?? ''
  //           : hasExtendedTextMessage
  //             ? client.getNestedProp<string>(content.messages[0].message, 'extendedTextMessage.text') ?? ''
  //             : hasDocumentWithCaptionMessage
  //               ? client.getNestedProp<string>(content.messages[0].message, 'documentWithCaptionMessage.message.documentMessage.caption') ?? ''
  //               : ''
  //       : '' as string
  //     if (!body.startsWith(BOT_PREFIX)) return
  //     console.log({ body })
  //     const [existe, [ExpReg, comando]] = client.findCommand(body)
  //     if (existe === true) {
  //       try {
  //         const match = body.match(ExpReg as RegExp);
  //         (comando as CommandImport).cmd(client, chat, match)
  //       } catch (e) {
  //         console.log({ e })
  //         client.sendText(
  //           from,
  //           { text: `*Ha ocurrido un error al ejecutar el comando \`${body}\`*\n*Mira la consola para más detalle*` }
  //         )
  //       }
  //     }
  //     /*
  //     async function getQuotedMessageRecursive(message: proto.IMessage | null | undefined) {
  //       const quotedMessage = client.getNestedProp<WAMessage>(content.messages[0].message, 'extendedTextMessage.contextInfo.quotedMessage')
  //       if (typeof quotedMessage !== 'undefined') return quotedMessage
  //       return message
  //     }
  //     const quotedMessage = await getQuotedMessageRecursive(content.messages[0].message)
  //     const regex = /wa\.me\/settings/gi
  //     const st = /^\/st/gi

  //     if ((st.test(msg as string) && isImage) || hasQuotedMessage || hasDocumentWithCaptionMessage) {
  //       // const quotedMessage = client.getNestedProp<WAMessage>(content.messages[0].message, 'extendedTextMessage.contextInfo.quotedMessage')
  //       /* const mediaData = hasQuotedMessage ? await client.getMedia(quotedMessage?.message?.documentMessage as WAMessage) : await client.getMedia(content.messages[0].message?.stickerMessage as WAMessage)

  //       await client.sock.sendMessage(from, {
  //         sticker: generateSticker
  //       }, { quoted: content.messages[0] })

  //     }
  //     if (regex.test(msg as string)) {
  //       await client.sock.readMessages([content.messages[0].key])
  //       await client.sock.chatModify(
  //         {
  //           clear: {
  //             messages: [
  //               {
  //                 id: content.messages[0].key.id as string,
  //                 fromMe: content.messages[0].key.fromMe,
  //                 timestamp: content.messages[0].messageTimestamp
  //               }
  //             ]
  //           }
  //         },
  //         from
  //       )
  //       // await client.sendText(from, "Shinjimae !")
  //       // client.count += 1
  //       // await writeCount(client.count)
  //       // await writeLog('From        : ' + content.messages[0].key.remoteJid)
  //       // await writeLog('PushName    : ' + content.messages[0].pushName)
  //       // await writeLog('Message     : ' + msg)
  //       // await writeLog(newline)
  //     }

  //     if (msg === '@isalive') {
  //       await client.sock.readMessages([content.messages[0].key])
  //       setTimeout(
  //         async () => client.sendText(from, { text: 'Hola como estas' }),
  //         1300
  //       )
  //     } */
  //   }
  // }
}
//

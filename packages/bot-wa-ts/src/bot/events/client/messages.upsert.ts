import {
  type WAMessage,
  type MessageUpsertType,
  type proto
} from '@whiskeysockets/baileys'
import { configEnv } from '@/bot/helpers/env.test'
import { CommandImport, WaMessageTypes } from '@/bot/interfaces/inter'
import { Message } from '@/bot/interfaces/message'

//
const { BOT_PREFIX } = configEnv as { BOT_PREFIX: string }
/**
 * @description Manejador de eventos de mensajes
 * @param {import('@/bot/main').Whatsapp} client
 * @param {{ messages: import("@whiskeysockets/baileys").WAMessage[], type: import("@whiskeysockets/baileys").MessageUpsertType }} content
 */
export async function handler (client: import('@/bot/main').Whatsapp, content: {
  messages: WAMessage[]
  type: MessageUpsertType
}): Promise<void> {
  const getMessageBody = (c: proto.IWebMessageInfo): { body: string, typeMessage: string & keyof typeof WaMessageTypes } => {
    const hasMessage: boolean = client.hasOwnProp(c, 'message')
    if (hasMessage) {
      // logica en caso de que sea una imagen
      const hasImageMessage: boolean = client.hasOwnProp(c.message, WaMessageTypes.imageMessage)
      if (hasImageMessage) {
        const hasImageMessageCaption: boolean = client.hasOwnProp(c.message, WaMessageTypes.imageMessage.concat('.').concat('caption'))
        if (hasImageMessageCaption) {
          return {
            body: c.message?.imageMessage?.caption ?? '',
            typeMessage: WaMessageTypes.imageMessage
          }
        }
      }
      // logica en caso de que sea un mensaje de texto
      const hasExtendedTextMessage: boolean = client.hasOwnProp(c.message, WaMessageTypes.extendedTextMessage)
      if (hasExtendedTextMessage) {
        // logica en caso de que sea una respuesta
        if (client.hasOwnProp(c.message?.extendedTextMessage, 'contextInfo') as boolean) {
          const hasQuotedMessage: boolean = client.hasOwnProp(c.message?.extendedTextMessage?.contextInfo, 'quotedMessage')
          if (hasQuotedMessage) {
            let conversation: string | undefined = ''
            const hasQuotedMessageConversation: boolean = client.hasOwnProp(c.message, 'extendedTextMessage.contextInfo.quotedMessage.conversation')
            const hasQuotedMessageConversationExtendedTextMessage: boolean = client.hasOwnProp(c.message, 'extendedTextMessage.contextInfo.quotedMessage.conversation.extendedTextMessage')
            if (hasQuotedMessageConversation) {
              conversation = client.getNestedProp<string>(c.message, 'extendedTextMessage.contextInfo.quotedMessage.conversation')
            }
            if (hasQuotedMessageConversationExtendedTextMessage) {
              conversation = client.getNestedProp<string>(c.message, 'extendedTextMessage.contextInfo.quotedMessage.conversation.extendedTextMessage.text')
            }
            if (hasQuotedMessageConversation || hasQuotedMessageConversationExtendedTextMessage) {
              console.log({
                hasQuotedMessageConversation,
                conversation,
                hasQuotedMessageConversationExtendedTextMessage
              })
            }
          }
        }
        return {
          body: c.message?.extendedTextMessage?.text ?? '',
          typeMessage: WaMessageTypes.extendedTextMessage
        }
      }
      // logica en caso de que sea un documento con caption
      const hasDocumentWithCaptionMessage: boolean = client.hasOwnProp(c.message, WaMessageTypes.documentWithCaptionMessage)
      if (hasDocumentWithCaptionMessage) {
        return {
          body: c.message?.documentWithCaptionMessage?.message?.documentMessage?.caption ?? '',
          typeMessage: WaMessageTypes.documentWithCaptionMessage
        }
      }
      // logica en caso de que sea una conversacion
      const hasConversation: boolean = client.hasOwnProp(c.message, WaMessageTypes.conversation)
      if (hasConversation) {
        return {
          body: c.message?.conversation ?? '',
          typeMessage: WaMessageTypes.conversation
        }
      }
      //
      const hasEphemeralMessage: boolean = client.hasOwnProp(c.message, WaMessageTypes.ephemeralMessage)
      if (hasEphemeralMessage) {
        return {
          body: c.message?.ephemeralMessage?.message?.extendedTextMessage?.text ?? '',
          typeMessage: WaMessageTypes.ephemeralMessage
        }
      }
    }
    return { body: '', typeMessage: '' as keyof typeof WaMessageTypes }
  }
  const chat = content.messages[0]
  const { body, typeMessage } = getMessageBody(chat)
  // client.saveFile('./dist/chat.json', JSON.stringify([chat], null, 2))
  if (chat?.key?.remoteJid === 'status@broadcast' || ((chat?.message) == null) || chat.key.fromMe === true || body.length === 0) return
  console.log({ typeMessage, body })
  if (!body.startsWith(BOT_PREFIX)) return
  const [existe, [ExpReg, comando]] = client.findCommand(body)
  if (existe === true) {
    try {
      const msg = new Message(client, chat)
      const match = body.match(ExpReg as RegExp);
      (comando as CommandImport).cmd(client, { msg, wamsg: chat }, match as RegExpMatchArray)
    } catch (e) {
      console.log({ e })
      const from: string = chat.key.remoteJid as string
      client.sendText(
        from,
        { text: `*Ha ocurrido un error al ejecutar el comando \`${body}\`*\n*Mira la consola para más detalle*` }
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

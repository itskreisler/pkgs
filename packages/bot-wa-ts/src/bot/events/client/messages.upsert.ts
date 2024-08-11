import {
  WAMessage,
  type MessageUpsertType
} from '@whiskeysockets/baileys'
import { createSticker, StickerTypes, type IStickerOptions } from 'wa-sticker-formatter'
//
export async function handler (client: import('@/bot/main').Whatsapp, content: {
  messages: WAMessage[]
  type: MessageUpsertType
}): Promise<void> {
  // const chat = content.messages[0]
  console.log(JSON.stringify({ content }, null, 2))
  // fs.writeFileSync('message.json', JSON.stringify(m, null, 2))
  // descargar si es un sticker
  const hasMessage: boolean = client.hasOwnProp(content.messages[0], 'message')
  const hasConversation: boolean = client.hasOwnProp(content.messages[0].message, 'conversation')
  const hasImageMessage: boolean = client.hasOwnProp(content.messages[0].message, 'imageMessage')
  const hasExtendedTextMessage: boolean = client.hasOwnProp(content.messages[0].message, 'extendedTextMessage')
  const hasQuotedMessage: boolean = client.hasOwnProp(content.messages[0].message, 'extendedTextMessage.contextInfo.quotedMessage')
  const protocolMessage: boolean = client.hasOwnProp(content.messages[0].message, 'protocolMessage')
  // const hasImageMessageCaption = client.hasOwnProp(content.messages[0].message, 'imageMessage.caption')
  const isRevoked = hasMessage
    ? !!protocolMessage
    : false
    // console.log(m)
  if (content.messages[0].key.fromMe === false) {
    if (!isRevoked) {
      const isMessage = !!hasMessage
      const isImage = isMessage
        ? !!hasImageMessage
        : false
      const from = content.messages[0].key.remoteJid as string
      const msg = isMessage
        ? isImage
          ? client.getNestedProp<string>(content.messages[0].message, 'imageMessage.caption') ?? ''
          : hasConversation
            ? client.getNestedProp<string>(content.messages[0].message, 'conversation')
            : hasExtendedTextMessage
              ? client.getNestedProp<string>(content.messages[0].message, 'extendedTextMessage.text')
              : ''
        : ''
      console.log({ msg })
      const regex = /wa\.me\/settings/gi
      const st = /^\/st/gi
      // console.log("True 1");
      // console.log(content.messages[0])
      // console.log(msg)
      if ((st.test(msg as string) && isImage) || hasQuotedMessage) {
        console.log('Sticker')
        const quotedMessage = client.getNestedProp<WAMessage>(content.messages[0].message, 'extendedTextMessage.contextInfo.quotedMessage')
        const mediaData = hasQuotedMessage ? await client.getMedia(quotedMessage as WAMessage) : await client.getMedia(content.messages[0].message as WAMessage)
        const stickerOption: IStickerOptions = {
          pack: 'KafkaSticker',
          author: 'Kreisler',
          type: StickerTypes.FULL,
          quality: 100
        }
        const generateSticker = await createSticker(mediaData, stickerOption)
        await client.sock.sendMessage(from, {
          sticker: generateSticker
        }, { quoted: content.messages[0] })
      }
      if (regex.test(msg as string)) {
        // console.log("True 2");
        await client.sock.readMessages([content.messages[0].key])
        await client.sock.chatModify(
          {
            clear: {
              messages: [
                {
                  id: content.messages[0].key.id as string,
                  fromMe: content.messages[0].key.fromMe,
                  timestamp: content.messages[0].messageTimestamp
                }
              ]
            }
          },
          from
        )
        // await client.sendText(from, "Shinjimae !")
        // client.count += 1
        // await writeCount(client.count)
        // await writeLog('From        : ' + content.messages[0].key.remoteJid)
        // await writeLog('PushName    : ' + content.messages[0].pushName)
        // await writeLog('Message     : ' + msg)
        // await writeLog(newline)
      }

      if (msg === '@isalive') {
        await client.sock.readMessages([content.messages[0].key])
        setTimeout(
          async () => client.sendText(from, { text: 'Hola como estas' }),
          1300
        )
      }
    }
  }
}

import { type ContextMsg } from '@/bot/interfaces/inter'
import { Message } from '@/bot/interfaces/message'
import type Whatsapp from '@/bot/main'
import fs from 'fs'
import { argv2Object } from '@kreisler/js-helpers'
import { execPromise } from '@kreisler/exec-promise'
import { configEnv } from '@/bot/helpers/env'
//
const models = { bg: 'u2net', bg2: 'u2net_human_seg', bg3: 'isnet-anime' }
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
    let chat: Message
    const [, accion, query] = match as [string, string | undefined, string | undefined]

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
    console.log({ accion, query, q })
    if (chat.hasMedia === false) {
      await msg.reply({ text: 'El contenido del mensaje no es multimedia' })
      return
    }
    if (typeof query === 'string') {
      const argv: { remove: 'bg' | 'bg2' | 'bg3' } = argv2Object(query?.split(' ') ?? [], true)
      console.log({ argv })
      if (Object.hasOwn(argv, 'remove') as boolean && argv.remove?.length > 0) {
        const media = await chat.downloadMediaV2()
        if (media?.fileType?.mime.startsWith('image') === false) {
          await msg.reply({ text: 'El contenido del mensaje no es una imagen' })
          return
        }
        const tempName = Date.now().toString()
        const nameFileInput = './tmpbot/fileINPUT'.concat(tempName, '.', media?.fileType?.ext ?? 'png')
        const nameFileOutput = './tmpbot/fileOUTPUT'.concat(tempName, '.png')
        fs.writeFileSync(nameFileInput, media?.buffer as Uint8Array, { encoding: 'base64' })
        const ifUbuntu = configEnv().NODE_ENV === 'production' ? '3' : ''
        const m = models[argv.remove] ?? models.bg
        const backgroundremover = `python${ifUbuntu} -m backgroundremover.cmd.cli -i "${nameFileInput}" -m "${m}" -o "${nameFileOutput}"`
        const scripts = {
          bg: backgroundremover,
          bg2: backgroundremover,
          bg3: `python${ifUbuntu} "bin/remove_background.py" -i "${nameFileInput}" -o "${nameFileOutput}" -m "${m}"`

        }
        const script = scripts[argv.remove] ?? scripts.bg
        await execPromise(script)
        const image = fs.readFileSync(nameFileOutput)
        await msg.send(await client.stickerGeneratorFromPath(image)).then(() => {
          fs.unlinkSync(nameFileInput)
          fs.unlinkSync(nameFileOutput)
        })
      }
    } else {
      const media = await chat.downloadMediaV2()
      const generateSticker = await client.stickerGenerator(media?.buffer as Buffer)
      await msg.send({
        sticker: generateSticker
      })
    }
  }
}

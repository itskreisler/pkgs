import { configEnv } from '@/bot/helpers/env'
import { MarkdownWsp, trimText } from '@kreisler/js-helpers'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/client.example'
const { BOT_USERNAME } = configEnv() as { BOT_USERNAME: string }
//
export default {
  active: true,
  ExpReg: new RegExp(`^/r(?:andom)?(?:_(\\w+))?(?:@${BOT_USERNAME})?(?:\\s+(.+))?$`, 'mis'),

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd(client: Whatsapp, { wamsg, msg, quotedBody }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, accion, _q] = match as [string, 's' | 'shuffle' | undefined, string | undefined]
    let q: string | undefined
    if (msg.isReply === true) {
      const hasQuotedBody: boolean = client.hasOwnProp(quotedBody, 'body')
      if (!hasQuotedBody) {
        msg.reply({ text: 'Debes citar un mensaje que tenga texto' })
        return
      }
      q = client.getNestedProp<string>(quotedBody, 'body')
    } else {
      q = _q
    }
    if (typeof q === 'undefined') {
      msg.reply({ text: 'Debes escribir una lista de elementos separados por salto de línea' })
      return
    }
    console.log({ q })
    const text = trimText(q)
    const listOfArray = text.split('\n')
    let randomArray
    switch (accion?.toLowerCase()) {
      case 's':
      case 'shuffle': {
        randomArray = listOfArray.sort(() => Math.random() - 0.5)
        break
      }

      default: {
        randomArray = listOfArray
        break
      }
    }
    const randomIndex = Math.floor(Math.random() * randomArray.length)
    const randomText = randomArray[randomIndex]
    const mensajeConShuffle = typeof accion !== 'undefined' ? `Lista desordenada:\n${randomArray.join('\n')}\n` : ''
    await msg.reply({
      text:
        mensajeConShuffle.concat(`Elemento aleatorio (# ${MarkdownWsp.Bold(String(randomIndex + 1))}):\n`, MarkdownWsp.Monospace(randomText))
    })
  }
}

import { configEnv } from '@/bot/helpers/env.test'
import { type WAMessage, type WASocket } from '@whiskeysockets/baileys'
const { BOT_USERNAME } = configEnv
export const MDL = {
  active: true,
  ExpReg: new RegExp(`^/ping(?:@${BOT_USERNAME as string})?$`, 'im'), /* /^\/ping(?:@username_bot)?$/im, */

  /**
   * @description
   */
  async cmd(client: WASocket, msg: WAMessage, match: RegExpMatchArray) {

  },
  clg(m: string) {
    console.log(m)
  }
}

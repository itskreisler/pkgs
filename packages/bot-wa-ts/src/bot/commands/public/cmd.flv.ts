import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { MarkdownWsp } from '@kreisler/js-helpers'
import { AnimeFLVScraper } from '@/bot/services/anime.services'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
//
export default {
  active: true,
  ExpReg: new RegExp(`^/flv(?:_(\\w+))?(?:@${BOT_USERNAME})?$`, 'im'),

  /**
     * @description Comando para obtener los ultimos episodios de animeflv
     *
     * @param client - Cliente de Whatsapp-web.js
     * @param msg - Mensaje de Whatsapp-web.js
     * @param match - Resultado de la expresión regular
     */
  async cmd(client: Whatsapp, msg: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const CRON_JOB = '0 */15 6-23 * * * *'
    const [, accion] = match as [string, 'on' | 'off' | 'start' | 'list' | undefined]
  }
}

import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { createApi } from '@kreisler/createapi'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
//
export default {
  active: true,
  ExpReg: new RegExp(`^/ping(?:@${BOT_USERNAME})?$`, 'im'), // /^\/ping(?:@username)?$/im

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd(client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    async function r34API(tag: string[], limit: number): Promise<{ preview_url: string, sample_url: string, file_url: string } | 'no résult found'> {
      const tags = tag.join(' ')
      const r34: {
        'index.php': (params: { tags: string, page: string, s: string, q: string, limit: number, pid: number, json: number }) => Promise<any>
      } = createApi('https://api.rule34.xxx')
      const data = await r34['index.php']({
        tags,
        page: 'dapi',
        s: 'post',
        q: 'index',
        limit,
        pid: 1,
        json: 1
      })
      if (data.length < 1) return 'no résult found'
      const n = Math.floor(Math.random() * data.length)
      // if (n === 0) return await r34API(tag)
      return data[n]
    }
    async function getPic() {
      const image = await r34API(['hu_tao_(genshin_impact)'], 1000)
      console.log(image)
    }
    // getPic()

    async function getTags(query: string) {
      const r34: {
        'autocomplete.php': (params: { q: string }) => Promise<Array<{ label: string, value: string }>>
      } = createApi('https://ac.rule34.xxx')
      const data = await r34['autocomplete.php']({ q: query })
      return data
    }
    getTags('hu_tao').then(([{ label, value: tag }]) => {
      const count = label.match(/([\d]+)/gm)
      if (count != null) {
        const limit = parseInt(count[0])
        r34API([tag], limit).then(console.log)
      }
    })
  }
}

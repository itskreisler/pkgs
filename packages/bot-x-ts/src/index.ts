import { TwitterApi } from 'twitter-api-v2'
import { JsCron } from '@kreisler/js-cron'
import { TwitterApiRateLimitPlugin } from '@twitter-api-v2/plugin-rate-limit'
import { APP_KEY, APP_SECRET, ACCESS_TOKEN, ACCESS_SECRET } from '@/SECRETS'
const jsCron = new JsCron({ timezone: 'America/Bogota', runOnInit: true })
/* const rateLimitPlugin = new TwitterApiRateLimitPlugin()
const twitterClient = new TwitterApi({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_SECRET
}, { plugins: [rateLimitPlugin] }) */

const BASE_URL = 'https://stw-daily.vercel.app'
const OG_IMAGE_URL = BASE_URL.concat('/api/v1/og.png')
const API_ONLINE = BASE_URL.concat('/api/v1/online/es.json')
const API_EPIC = BASE_URL.concat('/api/v1/online/vbucks.json')
console.log({ BASE_URL, OG_IMAGE_URL, API_ONLINE, API_EPIC })

const BANNER = `¡Usa el código KLEI para apoyarme! #ad

Tienda: https://www.fortnite.com/item-shop?creator-code=klei

Alertas en Español: ${BASE_URL.concat('/es')}`

export class ClientBot extends TwitterApi {
    constructor(
        options: {
            appKey: string
            appSecret: string
            accessToken: string
            accessSecret: string
        } = {
                appKey: APP_KEY,
                appSecret: APP_SECRET,
                accessToken: ACCESS_TOKEN,
                accessSecret: ACCESS_SECRET
            }
    ) {
        const rateLimitPlugin = new TwitterApiRateLimitPlugin()
        super(options, { plugins: [rateLimitPlugin] })
    }

    async main() {
        interface APIONLINE {
            'totalVbucks': number,
            missions: {
                powerLevel: number
                vbucks: number
                zone: string
                biome: string
                name: string
            }[]
        }
        interface APIEPIC {
            success: boolean
            data: {
                latest: {
                    totalVbucks: number
                    missions: Pick<APIONLINE['missions'][number], 'vbucks' | 'zone'>[]
                }
                history: {
                    id: number
                    date: string
                    timestamp: number
                    value: number
                }[]
            }
        }
        const [api_online, api_epic]: [APIONLINE, APIEPIC] = await Promise.all([
            (await globalThis.fetch(API_ONLINE)).json(),
            (await globalThis.fetch(API_EPIC)).json()
        ])
        if (!api_online && !api_epic) {
            console.log('Ambos APIs respondieron incorrectamente')
            return
        }
        console.log({ api_online, api_epic })
        if (api_online.totalVbucks === api_epic.data.latest.totalVbucks) {
            const me = await this.v2.me()
            console.log({ me })
            const media = await this.uploadMediaFromUrl(OG_IMAGE_URL)
            const tweet = await this.tweetWithMedia(`${api_online.totalVbucks} V-Bucks\n`.concat(BANNER), {
                media: {
                    media_ids: [media]
                }
            })
            // Eliminar pero al dia siguiente
            console.log('Eliminando tweet...')
            const result = await tweet.deleteTweet()
            console.log('Tweet eliminado exitosamente!', { result })
        } else {
            console.log('Los totales de V-Bucks no coinciden')
        }
    }
    async getBufferFromUrl(url: string) {
        const fetch = await globalThis.fetch(url)
        const arrayBuffer = await fetch.arrayBuffer()
        return Buffer.from(arrayBuffer)
    }
    //

    uploadMediaFromUrl(url: string): Promise<string>;
    uploadMediaFromUrl(url: string[]): Promise<MediaIds['media_ids']>;
    async uploadMediaFromUrl(urls: any): Promise<any> {
        if (typeof urls === 'string') {
            console.log(`Subiendo media desde URL: ${urls}`, 'string')
            const buffer = await this.getBufferFromUrl(urls)
            const media = await this.v2.uploadMedia(buffer, { media_type: 'image/png' })
            console.log({ media })
            return media
        } else {
            const media_ids: MediaIds['media_ids'] = await urls.reduce(async (accPromise: Promise<string[]>, url: string) => {
                const acc = await accPromise
                console.log(`Subiendo media desde URL: ${url}`, 'array')
                const buffer = await this.getBufferFromUrl(url)
                const media = await this.v2.uploadMedia(buffer, { media_type: 'image/png' })
                acc.push(media)
                return acc
            }, Promise.resolve([] as string[]))
            console.log({ media_ids })

            return media_ids
        }
    }
    async tweetWithMedia(tweetText: string, payload?: Parameters<TwitterApi['v2']['tweet']>[0]) {
        const PostTweetResult = await this.v2.tweet(tweetText, payload)
        return new Tweet(this, PostTweetResult)
    }
}

class Tweet {
    client: ClientBot
    ctx: Awaited<ReturnType<TwitterApi['v2']['tweet']>>
    constructor(client: ClientBot, ctx: Awaited<ReturnType<TwitterApi['v2']['tweet']>>) {
        this.client = client
        this.ctx = ctx
    }

    async deleteTweet() {
        return await this.client.v2.deleteTweet(this.ctx.data.id)
    }
    async reply(payload: ReplyPayload) {
        return new Tweet(this.client, await this.client.v2.tweet({ quote_tweet_id: this.ctx.data.id, ...payload }))
    }
}
const bot = new ClientBot()

//
type ReplyPayload = Omit<Parameters<TwitterApi['v2']['tweet']>[0], 'quote_tweet_id'>
type MediaIds = Pick<NonNullable<Parameters<TwitterApi['v2']['tweet']>[0]['media']>, 'media_ids'>
//
const CRON_JOB = '5 0-2 19 * * * *'
const result = jsCron.createTask('vbucksTask', CRON_JOB, () => {
    // console.log('Consultando alertas', new Date().toLocaleString())
    bot.main().catch(console.error)
})
// console.log(result)

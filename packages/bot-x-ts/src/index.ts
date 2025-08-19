import { TwitterApi } from 'twitter-api-v2'
import { JsCron } from '@kreisler/js-cron'
import fs from 'node:fs'
import { TwitterApiRateLimitPlugin } from '@twitter-api-v2/plugin-rate-limit'
import { APP_KEY, APP_SECRET, ACCESS_TOKEN, ACCESS_SECRET } from '@/SECRETS'
const jsCron = new JsCron({ timezone: 'America/Bogota', runOnInit: true })

// Archivo para persistir información del tweet
const TWEET_DATA_FILE = './tweet-data.json'

// Interfaz para los datos del tweet persistidos
interface TweetData {
    id: string
    created_at: string
    totalVbucks: number
    date: string
}
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
        try {
            // 1. Leer archivo de datos del tweet anterior (si existe)
            const previousTweetData = this.readTweetData()

            // 2. Si existe un tweet anterior, eliminarlo
            if (previousTweetData) {
                console.log('Tweet anterior encontrado, eliminando...', previousTweetData)
                await this.deletePreviousTweet(previousTweetData.id)
            }

            // 3. Consultar APIs
            const [api_online, api_epic]: [APIONLINE, APIEPIC] = await Promise.all([
                (await globalThis.fetch(API_ONLINE)).json(),
                (await globalThis.fetch(API_EPIC)).json()
            ])

            if (!api_online && !api_epic) {
                console.log('Ambos APIs respondieron incorrectamente')
                return
            }

            console.log({ api_online, api_epic })

            // 4. Verificar que los totales coincidan
            if (api_online.totalVbucks === api_epic.data.latest.totalVbucks) {
                const me = await this.v2.me()
                console.log({ me })

                // 5. Crear nuevo tweet
                const media = await this.uploadMediaFromUrl(OG_IMAGE_URL)
                const tweet = await this.tweetWithMedia(`${api_online.totalVbucks} Pavos(Vbucks)!\n`
                    .concat(api_online.missions.map(m => `${m.powerLevel}⚡ | ${m.vbucks} Pavos(Vbucks) en ${m.zone} (${m.biome}) - ${m.name}`).join('\n'))
                    .concat('\n', BANNER), {
                    media: {
                        media_ids: [media]
                    }
                })

                console.log('Nuevo tweet creado:', tweet.ctx)

                // 6. Guardar información del nuevo tweet
                const tweetData: TweetData = {
                    id: tweet.ctx.data.id,
                    created_at: new Date().toISOString(),
                    totalVbucks: api_online.totalVbucks,
                    date: new Date().toDateString()
                }

                this.saveTweetData(tweetData)
                console.log('Información del tweet guardada exitosamente')

            } else {
                console.log('Los totales de V-Bucks no coinciden')
            }
        } catch (error) {
            console.error('Error en main():', error)
        }
        return new Date().toLocaleDateString('es', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
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
        const postTweetResult = await this.v2.tweet(tweetText, payload)

        return new Tweet(this, postTweetResult)
    }
    async getTweet(tweetIds: Parameters<TwitterApi['v2']['tweets']>[0]) {
        const tweets = await this.v2.tweets(tweetIds)
        return tweets.data.map(tweet => new Tweet(this, { data: tweet }))
    }

    /**
     * Lee los datos del tweet desde el archivo JSON
     */
    readTweetData(): TweetData | null {
        try {
            if (fs.existsSync(TWEET_DATA_FILE)) {
                const data = fs.readFileSync(TWEET_DATA_FILE, 'utf8')
                return JSON.parse(data) as TweetData
            }
            return null
        } catch (error) {
            console.error('Error leyendo archivo de datos del tweet:', error)
            return null
        }
    }

    /**
     * Guarda los datos del tweet en el archivo JSON
     */
    saveTweetData(tweetData: TweetData): void {
        try {
            fs.writeFileSync(TWEET_DATA_FILE, JSON.stringify(tweetData, null, 2), 'utf8')
        } catch (error) {
            console.error('Error guardando archivo de datos del tweet:', error)
        }
    }

    /**
     * Elimina un tweet anterior por su ID
     */
    async deletePreviousTweet(tweetId: string): Promise<void> {
        try {
            const result = await this.v2.deleteTweet(tweetId)
            console.log('Tweet anterior eliminado exitosamente:', result)
        } catch (error) {
            console.error('Error eliminando tweet anterior:', error)
            // No lanzamos el error para que continúe el proceso
        }
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
type ReplyPayload = Omit<Parameters<TwitterApi['v2']['tweet']>[0], 'quote_tweet_id'>
type MediaIds = Pick<NonNullable<Parameters<TwitterApi['v2']['tweet']>[0]['media']>, 'media_ids'>
//
const CRON_JOB = '5 0-2 19 * * * *'
jsCron.createTask('vbucksTask', CRON_JOB, () => {
    // console.log('Consultando alertas', new Date().toLocaleString())
    bot.main().then(console.log).catch(console.error)
})
// console.log(result)

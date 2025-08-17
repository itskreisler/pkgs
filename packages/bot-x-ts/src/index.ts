import { TwitterApi } from 'twitter-api-v2'
import { TwitterApiRateLimitPlugin } from '@twitter-api-v2/plugin-rate-limit'
import { APP_KEY, APP_SECRET, ACCESS_TOKEN, ACCESS_SECRET } from '@/SECRETS'

/* const rateLimitPlugin = new TwitterApiRateLimitPlugin()
const twitterClient = new TwitterApi({
    appKey: APP_KEY,
    appSecret: APP_SECRET,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_SECRET
}, { plugins: [rateLimitPlugin] }) */

// sendTweetMedia('https://stw-daily.vercel.app', 'https://stw-daily.vercel.app/api/v1/og.png')

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
        // Main bot logic goes here
        const me = await this.v2.me()
        console.log({ me })
        // test
        const media = await this.uploadMediaFromUrl('https://stw-daily.vercel.app/api/v1/og.png')
        const tweet = await this.tweetWithMedia('https://stw-daily.vercel.app/es', {
            media: {
                media_ids: [media]
            }
        })
        // const reply = await tweet.reply({ text: '¡Hola desde el bot' })
        console.log({ ctx: tweet.ctx })

        // Cuenta regresiva de 10 segundos
        return
        const deleteAfterSeconds = 10
        for (let i = deleteAfterSeconds; i > 0; i--) {
            console.log(`Eliminando tweet en ${i} segundo${i > 1 ? 's' : ''}...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        console.log('Eliminando tweet...')
        const result = await tweet.deleteTweet()
        console.log('Tweet eliminado exitosamente!', { result })
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
bot.main().catch(console.error)
//
type ReplyPayload = Omit<Parameters<TwitterApi['v2']['tweet']>[0], 'quote_tweet_id'>
type MediaIds = Pick<NonNullable<Parameters<TwitterApi['v2']['tweet']>[0]['media']>, 'media_ids'>

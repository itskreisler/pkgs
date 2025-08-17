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

// console.log(await twitterClient.v2.me())

export async function run(): Promise<void> {
    const _text = 'Hello, World!'.concat(new Date().toISOString())
    // sendTweetMedia(_text, 'https://stw-daily.vercel.app/api/v1/og.png');
}

export async function sendTweet(tweetText: string): Promise<void> {
    try {
        await twitterClient.v2.tweet(tweetText)
        console.log('Tweet sent successfully!')
    } catch (error) {
        console.error('Error sending tweet:', error)
    }
}

export async function sendTweetMedia(tweetText: string, mediaUrl: string): Promise<void> {
    try {
        // const media = await twitterClient.v1.uploadMedia(mediaUrl);
        const fetch = await globalThis.fetch(mediaUrl)
        const arrayBuffer = await fetch.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        // const media = await twitterClient.v2.uploadMedia(buffer,{media_type: 'image/png',})
        const mediaIds = await Promise.all([
            twitterClient.v2.uploadMedia(buffer, { media_type: 'image/png' })
        ])
        const _tweetId = await twitterClient.v2.tweet(tweetText, {
            media: {
                media_ids: mediaIds
            }
        })
        console.log('Tweet sent successfully!')
        // setTimeout(async () => {console.log("Deleting tweet...");await twitterClient.v2.deleteTweet(_tweetId.data.id)}, 1000 * 10)
    } catch (error) {
        console.error('Error sending tweet:', error)
    }
}

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
        const media_ids = await this.uploadMediaFromUrl('https://stw-daily.vercel.app/api/v1/og.png')
        const tweet = await this.tweetWithMedia('https://stw-daily.vercel.app/es', { media_ids })
        console.log(tweet.ctx)

        // Cuenta regresiva de 10 segundos
        const deleteAfterSeconds = 10
        for (let i = deleteAfterSeconds; i > 0; i--) {
            console.log(`Eliminando tweet en ${i} segundo${i > 1 ? 's' : ''}...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        console.log('Eliminando tweet...')
        const result = await tweet.deleteTweet()
        console.log('Tweet eliminado exitosamente!', { result })
    }
    async uploadMediaFromUrl(url: string) {
        const fetch = await globalThis.fetch(url)
        const arrayBuffer = await fetch.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const media_ids = await Promise.all([
            this.v2.uploadMedia(buffer, { media_type: 'image/png' })
        ])
        console.log({ media_ids })
        return media_ids
    }
    async tweetWithMedia(tweetText: string, media: Parameters<TwitterApi['v2']['tweet']>[0]['media']) {
        const PostTweetResult = await this.v2.tweet(tweetText, {
            media
        })
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
        return this.client.v2.deleteTweet(this.ctx.data.id)
    }
}
const bot = new ClientBot()
bot.main().catch(console.error)

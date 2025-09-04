import youtubedl from 'youtube-dl-exec'
import { glob } from 'glob'
import fs from 'fs'
import { type ClientBot } from '@/bot/core/main'
import { type IClsBot } from '@/bot/interfaces/proto'
const exec = youtubedl.exec
const VIDEO_TYPES = Object.freeze({ embed: 'embed', shorts: 'shorts' })

const getVideoIdFromURl = (text: string): string => {
  const { searchParams, pathname } = new URL(text)
  if (!searchParams.get('v')) {
    const pathSplit = pathname.split('/')
    if (pathSplit.some((pathValue) => pathValue === VIDEO_TYPES.embed)) {
      return pathSplit[2]
    }
    if (pathSplit.some((pathValue) => pathValue === VIDEO_TYPES.shorts)) {
      return pathSplit[2]
    }
    return pathSplit[1]
  } else {
    return searchParams.get('v') as string
  }
}

const url = (text: string, id: string): string => 'https://img.youtube.com/vi/'.concat(getVideoIdFromURl(text), '/', id, '.jpg')
const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault']

async function loadFiles(dirName: string): Promise<string[]> {
  // usalo si usas la version glob@^10.2.2
  // const Files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/*.{mp3,flac}`)
  const patternGlob = `${process.cwd().replace(/\\/g, '/')}/${dirName}/!(*.test*).{mp3,flac}`
  const files = await glob(patternGlob)
  // files.forEach((file) => delete require.cache[require.resolve(file)])
  return files
}

const tempDir = './tmp/'
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir)
}

//
export default {
  active: true,
  regexp: /(?:https?:)?(?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gim,

  /**
   * @description Download YouTube audio and send thumbnail options
   * @param {import("@/bot/core/main").ClientBot} client
   * @param {import("@/bot/interfaces/proto").IClsBot.ICTX} { msg, ctx }
   * @param {RegExpMatchArray} match
   */
  async cmd(client: ClientBot, { msg, ctx }: IClsBot.ICTX, match: RegExpMatchArray): Promise<void> {
    const text = msg.text || ''
    const chatId = msg.chat.id

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: qualities.map((quality) => [
          {
            text: quality,
            url: url(text, quality)
          }
        ])
      })
    }

    await ctx.send({ text: 'Miniatura del video', ...options })

    const outputDir = tempDir.concat(Date.now().toString())
    const outputFile = 'tmp/'.concat(Date.now().toString())

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    const [youtubeUrl] = match

    const sms = await ctx.send({ text: 'Comenzando descarga...' })

    const ytFlags = {
      audioQuality: 0,
      extractAudio: true,
      audioFormat: 'mp3',
      // ffmpegLocation: 'C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffprobe.exe',
      output: `${outputDir}/%(title)s.%(ext)s`,
      addMetadata: true,
      embedThumbnail: true,
      noPlaylist: true,
      cookies: './tmpbot/cookies.txt'
    }

    try {
      await sms.editText('Descargando audio...')
      await exec(youtubeUrl, ytFlags)
      const [audio] = await loadFiles(outputFile)
      await sms.editText('Subiendo audio...')

      if (typeof audio !== 'undefined') {
        // const stream = fs.createReadStream(audio)
        // const buffer = fs.readFileSync(audio);
        await client.sendAudio(chatId, audio, { caption: 'Audio descargado desde youtube' })
        await sms.delete()
        fs.rmSync(outputDir, { recursive: true })
      }
    } catch (error) {
      await sms.delete()
      await ctx.send({ text: 'Ahora mismo este comando no esta disponible, lamentamos las molestias, te invitamos a usar otro bot @usharebot' })
      fs.rmSync(outputDir, { recursive: true })
      console.error(error)
    }
  }
}

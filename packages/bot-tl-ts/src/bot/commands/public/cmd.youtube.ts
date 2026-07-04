import fs from 'fs'
import { glob } from 'glob'
import { create } from 'youtube-dl-exec'
import { type ClientBot } from '@/bot/core/main'
import { type IClsBot } from '@/bot/interfaces/proto'

const exec = create('yt-dlp')
const VIDEO_TYPES = Object.freeze({ embed: 'embed', shorts: 'shorts' })
const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault']
const tempDir = './tmp/'

const getVideoIdFromUrl = (text: string): string => {
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
  }

  return searchParams.get('v') as string
}

const url = (text: string, id: string): string =>
  'https://img.youtube.com/vi/'.concat(getVideoIdFromUrl(text), '/', id, '.jpg')

async function loadFiles(dirName: string): Promise<string[]> {
  const patternGlob = `${process.cwd().replace(/\\/g, '/')}/${dirName}/!(*.test*).{mp3,flac}`
  return await glob(patternGlob)
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

export default {
  active: true,
  regexp: /(?:https?:)?(?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gim,

  async cmd(client: ClientBot, { msg, ctx }: IClsBot.ICTX, match: RegExpMatchArray | null): Promise<void> {
    const text = msg.text ?? ''
    const chatId = msg.chat.id
    const youtubeUrl = match?.[0] ?? text

    const options = {
      reply_markup: {
        inline_keyboard: [
          ...qualities.map((quality) => [
            {
              text: quality,
              url: url(text, quality)
            }
          ]),
          [{ text: '🎬 Descargar Video', callback_data: 'yt_video|' + youtubeUrl }]
        ]
      }
    }

    await client.sendMessage(chatId, 'Miniatura del video', options)

    const outputDir = tempDir.concat(Date.now().toString())

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const sms = await ctx.send({ text: 'Preparando descarga...' })
    const ytFlags = {
      audioQuality: 0,
      extractAudio: true,
      audioFormat: 'mp3',
      output: `${outputDir}/%(title)s.%(ext)s`,
      addMetadata: true,
      embedThumbnail: true,
      noPlaylist: true,
      cookies: 'cookies.txt',
      update: true,
      jsRuntimes: 'node',
      extractorArgs: 'youtube:player-client=default,-web_safari',
      remoteComponents: 'ejs:github'
    }

    const optionsEdits = {
      chat_id: chatId,
      message_id: sms.message_id
    }

    try {
      await client.editMessageText({
        ...optionsEdits,
        text: 'Descargando audio...'
      })
      await exec(youtubeUrl, ytFlags)
      const [audio] = await loadFiles(outputDir)

      await client.editMessageText({
        ...optionsEdits,
        text: 'Subiendo audio...'
      })

      if (typeof audio !== 'undefined') {
        await client.sendAudio(chatId, audio, { caption: 'Audio descargado desde youtube' })
        await sms.delete()
      }

      fs.rmSync(outputDir, { recursive: true, force: true })
    } catch (error) {
      await client.deleteMessage(chatId, sms.message_id)
      await client.sendMessage(
        chatId,
        'Ahora mismo este comando no esta disponible, lamentamos las molestias, te invitamos a usar otro bot @usharebot'
      )
      fs.rmSync(outputDir, { recursive: true, force: true })
      console.error(error)
    } finally {
      //
    }
  }
}

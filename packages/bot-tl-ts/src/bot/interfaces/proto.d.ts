import { type Message } from '@/bot/interfaces/cls.message'
import { type ClientBot } from '@/bot/core/main'
import type { Message as TelegramMessage, InputFile } from 'node-telegram-bot-api'
import { type Readable } from 'stream'

declare namespace IClsBot {
  interface ICTX {
    msg: TelegramMessage
    ctx: Message
  }
  interface IExportCMD {
    active: boolean
    regexp: RegExp
    cmd: (client: ClientBot, context: ICTX, match: RegExpMatchArray | null) => Promise<void>
  }
  interface IImportCMD {
    default: IExportCMD
  }
  type TImportEvent = (client: ClientBot, msg: TelegramMessage) => Promise<void>

  interface IDebounceParams { client: ClientBot, msg: TelegramMessage, comando: IClsBot.IExportCMD, ExpReg: RegExp }

  type AtLeastOne<T, K extends keyof T = keyof T> =
    K extends keyof T
      ? Required<Pick<T, K>> & Partial<Omit<T, K>>
      : never

  type TSendContent = AtLeastOne<{
    text?: string
    doc?: string | Readable | Buffer | InputFile
    photo?: string | Readable | Buffer | InputFile
    video?: string | Readable | Buffer | InputFile
    sticker?: string | Readable | Buffer | InputFile
    audio?: string | Readable | Buffer | InputFile
  }>
}

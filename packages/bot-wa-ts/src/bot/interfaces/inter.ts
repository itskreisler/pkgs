import Whatsapp from '@/bot/main'
import { WAMessage } from '@whiskeysockets/baileys'
import { Message } from './message'

export const WaConnectionState = {
  open: 'open',
  connecting: 'connecting',
  close: 'close'
}
export enum WaMessageTypes {
  extendedTextMessage = 'extendedTextMessage',
  imageMessage = 'imageMessage',
  videoMessage = 'videoMessage',
  stickerMessage = 'stickerMessage',
  audioMessage = 'audioMessage',
  documentMessage = 'documentMessage',
  documentWithCaptionMessage = 'documentWithCaptionMessage',
  viewOnceMessage = 'viewOnceMessage',
  ephemeralMessage = 'ephemeralMessage',
  conversation = 'conversation'
}
export type WAMessageTypesStr = keyof typeof WaMessageTypes
export interface QuotedBodyMsg {
  quotedBody?: BodyMsg
}
export interface BodyMsg {
  body?: string | null | undefined
  typeMessage: WAMessageTypesStr
}
export type MessageBody = BodyMsg & QuotedBodyMsg
export interface ContextMsg extends MessageBody {
  wamsg: WAMessage
  msg: Message
}
export interface CommandImport {
  active: boolean
  ExpReg: RegExp
  cmd: (client: Whatsapp, context: ContextMsg, match: RegExpMatchArray) => Promise<void>
}
export interface decounceMessage {
  client: Whatsapp
  context: ContextMsg
  comando: CommandImport
  ExpReg: RegExp
}

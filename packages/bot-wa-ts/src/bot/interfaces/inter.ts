import Whatsapp from '@/bot/main'
import { WAMessage } from '@whiskeysockets/baileys'

export const WaConnectionState = {
  open: 'open',
  connecting: 'connecting',
  close: 'close'
}
export enum WaMessageTypes {
  stickerMessage = 'stickerMessage',
  imageMessage = 'imageMessage',
  extendedTextMessage = 'extendedTextMessage',
  documentWithCaptionMessage = 'documentWithCaptionMessage',
}

export interface CommandImport {
  active: boolean
  ExpReg: RegExp
  cmd: (client: Whatsapp, msg: WAMessage, match: RegExpMatchArray | null | undefined) => Promise<void>
}

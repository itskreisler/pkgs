// types/baileys.d.ts
import { type UserFacingSocketConfig, type WASocket } from '@whiskeysockets/baileys'

declare module '@whiskeysockets/baileys' {
  const baileys: {
    (opts?: UserFacingSocketConfig): WASocket
    default: (opts?: UserFacingSocketConfig) => WASocket
  }
  export default baileys
  export = baileys
}

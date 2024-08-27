import dotenv from 'dotenv'
dotenv.config()
export interface TprocessEnv extends NodeJS.ProcessEnv {
  /** PORT */
  readonly BOT_USERNAME?: string
  /** default: / */
  readonly BOT_PREFIX?: string
}
export const configEnv: TprocessEnv = { ...process.env }

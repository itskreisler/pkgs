import dotenv from 'dotenv'
import fs from 'fs'
// si no existe el archivo .env, se crea uno con valores por defecto
if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', 'BOT_USERNAME="kafka"\nBOT_PREFIX="/"')
}
dotenv.config()
export interface TprocessEnv extends NodeJS.ProcessEnv {
  /** PORT */
  readonly BOT_USERNAME?: string
  /** default: / */
  readonly BOT_PREFIX?: string
  /** default: development */
  readonly NODE_ENV?: 'development' | 'production'
  /** Name:5730012345678,Name:5730012345678 */
  AUTHORIZED_USERS?: string
}
export const configEnv: TprocessEnv = { ...process.env }

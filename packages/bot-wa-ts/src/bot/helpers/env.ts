import fs from 'fs'
// si no existe el archivo .env, se crea uno con valores por defecto
if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env', 'BOT_USERNAME="kafka"\nBOT_PREFIX="/"')
}
process.loadEnvFile()
//
export interface TprocessEnv extends NodeJS.ProcessEnv {
  /** BOT_USERNAME */
  readonly BOT_USERNAME: string
  /** default: / */
  readonly BOT_PREFIX: string
  /** default: development */
  readonly NODE_ENV: 'development' | 'production'
  /** Name:5730012345678,Name:5730012345678 */
  AUTHORIZED_USERS?: string
}
export const {
  BOT_USERNAME = 'klei',
  BOT_PREFIX = '/',
  NODE_ENV = 'development',
  AUTHORIZED_USERS = ''
} = process.env as TprocessEnv
export const configEnv = () => ({
  BOT_USERNAME,
  BOT_PREFIX,
  NODE_ENV,
  AUTHORIZED_USERS
})
export const NEW_ADMINS: string[] = []
export const PERMANENT_ADMINS = AUTHORIZED_USERS?.split(',').map((e: string) => e.split(':').pop()) as string[]
export const isAuthorized = (n: string): boolean => NEW_ADMINS.concat(PERMANENT_ADMINS).includes(n)

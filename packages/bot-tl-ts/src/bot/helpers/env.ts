import fs from 'fs'
// si no existe el archivo .env, se crea uno con valores por defecto
if (!fs.existsSync('.env')) {
  fs.writeFileSync('.env',
`TELEGRAM_TOKEN_DEV=
`)
}
process.loadEnvFile()
//
export interface IprocessEnv extends NodeJS.ProcessEnv {
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
  TELEGRAM_TOKEN_PROD = String(),
  TELEGRAM_TOKEN_DEV = String(),
  BOT_USERNAME = 'username',
  BOT_PREFIX = '/',
  NODE_ENV = 'development',
  AUTHORIZED_USERS = ''
} = process.env as IprocessEnv
export const configEnv = () => ({
  TELEGRAM_TOKEN_PROD,
  TELEGRAM_TOKEN_DEV,
  BOT_USERNAME,
  BOT_PREFIX,
  NODE_ENV,
  AUTHORIZED_USERS
})
// console.log(process.env);

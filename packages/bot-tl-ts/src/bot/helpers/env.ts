import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const envFilePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env')

// si no existe el archivo .env, se crea uno con valores por defecto
if (!fs.existsSync(envFilePath)) {
  fs.writeFileSync(envFilePath, 'TELEGRAM_TOKEN_DEV=\n')
}

process.loadEnvFile(envFilePath)

const envSchema = z.object({
  TELEGRAM_TOKEN_PROD: z.string().default(''),
  TELEGRAM_TOKEN_DEV: z.string().default(''),
  BOT_USERNAME: z.string().default('username'),
  BOT_PREFIX: z.string().default('/'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  AUTHORIZED_USERS: z.string().default('')
})

export type IprocessEnv = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
export const {
  TELEGRAM_TOKEN_PROD,
  TELEGRAM_TOKEN_DEV,
  BOT_USERNAME,
  BOT_PREFIX,
  NODE_ENV,
  AUTHORIZED_USERS
} = env

export const configEnv = (): IprocessEnv => ({
  ...env
})

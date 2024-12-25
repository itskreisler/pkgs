import { defineConfig } from 'tsup'
import { readdirSync } from 'fs'
console.log('configurando tsup')
// leer todos los comando de src/bot/**/*.ts
const commands = readdirSync('src/bot/commands/public')
  .filter((file) => file.endsWith('.ts'))
  .map((file) => ([file.replace('.ts', ''), `src/bot/commands/public/${file}`]))

const events = readdirSync('src/bot/events/client')
  .filter((file) => file.endsWith('.ts'))
  .map((file) => ([file.replace('.ts', ''), `src/bot/events/client/${file}`]))

const handlers = readdirSync('src/bot/handlers')
  .filter((file) => file.endsWith('.ts'))
  .map((file) => ([file.replace('.ts', ''), `src/bot/handlers/${file}`]))

export default defineConfig({
  entry: {
    ...Object.fromEntries(commands),
    ...Object.fromEntries(events),
    ...Object.fromEntries(handlers)
  },
  banner: {
    js: '//'
  },
  format: ['esm']
  // dts: true
})

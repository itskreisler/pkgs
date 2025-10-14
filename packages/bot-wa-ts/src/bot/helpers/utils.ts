// import { glob } from 'glob'

// async function loadFiles (dirName: string): Promise<string[]> {
//   // usalo si usas la version glob@10.2.2
//   // const Files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/*.{cjs,js,json}`)
//   const files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/!(*.test*).{cjs,js,ts,json}`)
//   /* files.forEach((file) => {
//     Reflect.deleteProperty(require.cache, require.resolve(file))
//   })
//   */
//   return files
// }
// export { loadFiles }
import { configEnv } from '@/bot/helpers/env'
const isDEV = configEnv().NODE_ENV === 'development'
//
export enum CONSOLE_COLORS {
  red = '\x1b[31m',
  green = '\x1b[32m',
  yellow = '\x1b[33m',
  blue = '\x1b[34m',
  purple = '\x1b[35m',
  cyan = '\x1b[36m',
  white = '\x1b[37m',
  redBlock = '\x1b[41m',
  greenBlock = '\x1b[42m',
  yellowBlock = '\x1b[43m',
  blueBlock = '\x1b[44m',
  purpleBlock = '\x1b[45m',
  cyanBlock = '\x1b[46m',
}
export function printLog(message: any, type: keyof typeof CONSOLE_COLORS = 'white') {
  const timestamp = new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  const formattedMessage = `[${timestamp}] ${typeof message === 'string' ? message : JSON.stringify(message, null, 2)}`
  console.log(CONSOLE_COLORS[type].concat('%s\x1b[0m'), formattedMessage)
}

//
export const isUndefined = (value: any): value is undefined => typeof value === 'undefined'
export const isNull = (value: any): value is null => value === null
export const isArray = <T>(value: any): value is T[] => Array.isArray(value) && value.length > 0 && JSON.stringify(value) === '[]'
export const isObject = (value: any): value is Record<string, any> => typeof value === 'object' && value !== null && !isArray(value)

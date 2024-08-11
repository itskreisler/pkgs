// types/pino.d.ts
import logger, { type Logger, type LoggerOptions, type DestinationStream } from 'pino'

declare module 'pino' {
  const pino: {
    (opts?: DestinationStream | LoggerOptions): Logger
    default: (opts?: DestinationStream | LoggerOptions) => Logger
  }
  export { Logger, LoggerOptions, DestinationStream, pino }
  export default logger
  export = logger
}

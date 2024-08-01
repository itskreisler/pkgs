import { errorHandler, notFound, requestLoggerMiddleware } from './middlewares'
import { compose } from 'compose-middleware'
import { RequestHandler } from 'express'

const middleware: RequestHandler = compose([
  notFound,
  errorHandler,
  requestLoggerMiddleware
])

export {
  middleware
}

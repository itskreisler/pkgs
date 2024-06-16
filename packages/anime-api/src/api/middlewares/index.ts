import { errorHandler, notFound, requestLoggerMiddleware } from './middlewares'
import { compose } from 'compose-middleware'

const middleware = compose([
  notFound,
  errorHandler,
  requestLoggerMiddleware
])

export {
  middleware
}

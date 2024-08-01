import { type Request, type Response } from 'express'
const notFound = (req: Request, res: Response, next: (err?: any) => void) => {
  res.status(404)
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`)
  next(error)
}

const errorHandler = (err: Error, req: Request, res: Response, next: (err?: any) => void) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  })
}

const requestLoggerMiddleware = (req: Request, res: Response, next: (err?: any) => void) => {
  console.log(`${req.method} ${req.originalUrl}`)
  const start = new Date().getTime()
  res.on('finish', () => {
    const elapsed = new Date().getTime() - start
    console.info(`${req.method} ${req.originalUrl} ${req.statusCode ?? 500} ${elapsed}ms`)
  })
  next()
}

export {
  notFound,
  errorHandler,
  requestLoggerMiddleware
}

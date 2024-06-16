const notFound = (req, res, next) => {
  res.status(404)
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`)
  next(error)
}

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  })
}

const requestLoggerMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  const start = new Date().getTime()
  res.on('finish', () => {
    const elapsed = new Date().getTime() - start
    console.info(`${req.method} ${req.originalUrl} ${req.statusCode} ${elapsed}ms`)
  })
  next()
}

export {
  notFound,
  errorHandler,
  requestLoggerMiddleware
}

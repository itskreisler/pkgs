export default () => {
  process.removeAllListeners()

  process.on('unhandledRejection', (reason, p) => {
    console.log(' [ANTICRASH] :: unhandledRejection')
    console.log(reason, p)
  })
  process.on('uncaughtException', (err, origin) => {
    console.log(' [ANTICRASH] :: uncaughtException')
    console.log(err, origin)
  })
  process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(' [ANTICRASH] :: uncaughtExceptionMonitor')
    console.log(err, origin)
  })
  process.on('multipleResolves', () => {

  })
  process.on('SIGINT', () => process.exit())
  process.on('SIGUSR1', () => process.exit())
  process.on('SIGUSR2', () => process.exit())
}

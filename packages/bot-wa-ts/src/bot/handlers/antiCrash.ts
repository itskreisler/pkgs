export default (): void => {
  process.removeAllListeners()

  process.on('unhandledRejection', (reason, p) => {
    console.error('[ANTICRASH] unhandledRejection:', reason, p)
  })
  process.on('uncaughtException', (err, origin) => {
    console.error('[ANTICRASH] uncaughtException:', err, origin)
  })
  process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error('[ANTICRASH] uncaughtExceptionMonitor:', err, origin)
  })
  process.on('multipleResolves', () => {

  })
  process.on('SIGINT', () => process.exit())
  process.on('SIGUSR1', () => process.exit())
  process.on('SIGUSR2', () => process.exit())
}

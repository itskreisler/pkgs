/**
 * Export all
 */
// export * from '@/bot/main'
import { Whatsapp } from '@/bot/main'
import { printLog } from '@/bot/helpers/utils'

const WhatsappInterface = new Whatsapp()
WhatsappInterface.WAConnect().then(() => {
  printLog('✅ Conectado.....', 'green')
  WhatsappInterface.loadHandlers()
  WhatsappInterface.loadCommands()
})

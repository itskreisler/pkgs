/**
 * Export all
 */
// export * from '@/bot/main'
import { Whatsapp } from '@/bot/main'
const WhatsappInterface = new Whatsapp()
WhatsappInterface.WAConnect().then(() => {
  console.log('✅ Conectado.....')
  WhatsappInterface.loadHandlers()
  WhatsappInterface.loadCommands()
})

import qrcode from 'qrcode-terminal'
import { Whatsapp } from '@/bot/client.example'
import { printLog } from '@/bot/helpers/utils'
const client = new Whatsapp()

client.on('qr', (qr) => {
  printLog('📱 QR Code received', 'yellow')
  qrcode.generate(qr, { small: true })
})

printLog('🚀 Initializing WhatsApp client...', 'cyan');
(async () => {
  try {
    await client.initialize()
    printLog('✅ Cliente inicializado correctamente', 'green')
  } catch (error) {
    printLog(`❌ Error al inicializar el cliente: ${error}`, 'red')
    process.exit(1)
  }
})()


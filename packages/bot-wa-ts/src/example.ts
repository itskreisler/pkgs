import qrcode from 'qrcode-terminal'
import { Whatsapp } from '@/bot/client.example'
import { printLog } from '@/bot/helpers/utils'
const client = new Whatsapp()

client.on('qr', (qr) => {
  // Generate and scan this code with your phone
  printLog('📱 QR Code received', 'yellow')
  qrcode.generate(qr, { small: true })
})
client.on('wamessage', (message) => {
  printLog('💬 MESSAGE RECEIVED', 'cyan')
  console.dir(message, { depth: null })
})

client.on('message', (msg) => {
  printLog('📨 Individual message event triggered', 'blue')
  printLog(`From: ${msg.key.remoteJid}`, 'white')
  printLog(`Message: ${JSON.stringify(msg.message, null, 2)}`, 'white')
  printLog(`Message ID: ${msg.key.id}`, 'white')

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


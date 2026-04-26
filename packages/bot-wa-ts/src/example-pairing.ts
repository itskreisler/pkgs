import { Boom } from '@hapi/boom'
import makeWASocket, { delay, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState } from 'baileys'
import P from 'pino'
import readline from 'readline'

const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination('./wa-logs.txt'))
logger.level = 'trace'

const msgRetryCounterCache = new Map<string, number>()

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text: string) => new Promise<string>((resolve) => rl.question(text, resolve))

const startSock = async () => {
    const usePairingCode = process.argv.includes('--pairing-code')
    const phoneNumberArg = process.argv.find(arg => arg.startsWith('--phone='))?.split('=')[1]

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_pairing')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
    })

    let pairingCodeGenerated = false

    sock.ev.process(async (events) => {
        if (events['connection.update']) {
            const update = events['connection.update']
            const { connection, lastDisconnect, qr } = update

            if (connection === 'open') {
                console.log('✅ ¡Conectado a WhatsApp!')
                pairingCodeGenerated = false
            }

            if (qr && !sock.authState.creds.registered && usePairingCode && !pairingCodeGenerated) {
                const phoneNumber = phoneNumberArg || await question('Enter your phone number (with country code, no +): ')
                const code = await sock.requestPairingCode(phoneNumber)
                console.log(`\n📱 PAIRING CODE: ${code}\n`)
                console.log('Enter this code in WhatsApp: Settings > Linked Devices > Link a Device > Link with Phone Number')
                pairingCodeGenerated = true
            }
            if (connection === 'close') {
                if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                    startSock()
                } else {
                    console.log('🔴 Connection closed. You are logged out.')
                }
            } else if (connection === 'open') {
                console.log('✅ Connected to WhatsApp!')
            }
        }
        if (events['creds.update']) {
            await saveCreds()
        }
    })

    return sock
}

startSock()
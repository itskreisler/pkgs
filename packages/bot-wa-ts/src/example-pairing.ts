/**
 * @fileoverview Ejemplo de conexión WhatsApp usando Pairing Code en lugar de QR Code
 * 
 * Este script permite autenticarse en WhatsApp Web sin necesidad de escanear un código QR.
 * En su lugar, se genera un código de vinculación (pairing code) que se ingresa manualmente
 * en la aplicación de WhatsApp.
 * 
 * @module example-pairing
 * @description WhatsApp Bot con autenticación por Pairing Code
 * 
 * @example
 * // Con número de teléfono como argumento
 * npx tsx src/example-pairing.ts --pairing-code --phone=573052547705
 * 
 * @example
 * // Para ingresar el número interactivamente
 * npx tsx src/example-pairing.ts --pairing-code
 * 
 * @author Kreisler
 * @version 1.0.0
 * 
 * @see {@link https://whiskeysockets-baileys-94.mintlify.app/guides/connecting-pairing-code}
 * @see {@link https://www.whatsapp.com/linked_devices/}
 * 
 * @copyright 2026
 */
import { Boom } from '@hapi/boom'
import makeWASocket, { delay, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState } from 'baileys'
import P from 'pino'
import readline from 'readline'

/**
 * Logger configurado para guardar logs en wa-logs.txt
 * @constant {P.Logger}
 */
const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.destination('./wa-logs.txt'))
logger.level = 'trace'

/**
 * Cache para reintentar mensajes fallidos
 * @constant {Map<string, number>}
 */
const msgRetryCounterCache = new Map<string, number>()

/**
 * Crea una interfaz de readline para leer entrada del usuario desde la terminal.
 * @constant {readline.Interface}
 */
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

/**
 * Función helper que muestra una pregunta al usuario y retorna una Promise con la respuesta.
 * @param {string} text - Pregunta a mostrar al usuario
 * @returns {Promise<string>} Respuesta del usuario
 * @example
 * const numero = await question('Ingresa tu número: ')
 */
const question = (text: string) => new Promise<string>((resolve) => rl.question(text, resolve))

/**
 * Inicia la conexión con WhatsApp usando el socket de Baileys.
 * Maneja la autenticación por pairing code y reconnexión automática.
 * 
 * @async
 * @function startSock
 * @returns {Promise<ReturnType<typeof makeWASocket>>} Socket configurado
 * 
 * @description Flujo de conexión:
 * 1. Carga credenciales guardadas o crea nuevas
 * 2. Configura el socket con opciones de logging
 * 3. Si hay QR y pairing code activo, solicita código de vinculación
 * 4. Guarda credenciales al actualizar
 * 5. Reconecta automáticamente si se pierde la conexión (excepto logged out)
 */
const startSock = async () => {
/**
     * Activa el modo pairing code automáticamente si se proporciona número
     * @constant {boolean}
     */
    const usePairingCode = true

    /**
     * Extrae el número de teléfono de los argumentos si está especificado.
     * Formato: código de país + número sin símbolos (ej: 573052547705)
     * @constant {string|undefined}
     */
    const phoneNumberArg = process.argv.find(arg => arg.startsWith('--phone='))?.split('=')[1] || await question('Enter your phone number (with country code, no +): ')
    const authFolder = `auth_info_${phoneNumberArg}`

    /**
     * Inicializa el estado de autenticación multi-file.
     * Guarda las credenciales en la carpeta auth_info_{número}/
     * @constant {{ state: any, saveCreds: () => Promise<void> }}
     */
    const { state, saveCreds } = await useMultiFileAuthState(authFolder)

    /**
     * Obtiene la última versión de Baileys disponible.
     * @constant {{ version: number[], isLatest: boolean }}
     */
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`)

    /**
     * Crea el socket de WhatsApp Web con la configuración especificada.
     * 
     * @param {Object} config - Configuración del socket
     * @param {boolean} config.printQRInTerminal - Desactivado para pairing code
     * @param {Object} config.auth - Estado de autenticación con credenciales cifradas
     * @param {Object} config.keys - Cache de claves criptográficas
     * @param {Map} config.msgRetryCounterCache - Contador de reintentos para mensajes
     * @param {boolean} config.generateHighQualityLinkPreview - Previews enriquecidos
     */
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

    /**
     * Flag para evitar generar múltiples códigos de vinculación.
     * @variable {boolean}
     */
    let pairingCodeGenerated = false

    /**
     * Procesador de eventos del socket.
     * Maneja updates de conexión, credenciales y mensajes.
     */
    sock.ev.process(async (events) => {
        if (events['connection.update']) {
            const update = events['connection.update']
            const { connection, lastDisconnect, qr } = update

            if (connection === 'open') {
                console.log('✅ ¡Conectado a WhatsApp!')
                pairingCodeGenerated = false
            }

            /**
             * Si hay QR code y pairing activo, genera el código de vinculación.
             * @event qr
             */
            if (qr && !sock.authState.creds.registered && usePairingCode && !pairingCodeGenerated) {
                const code = await sock.requestPairingCode(phoneNumberArg)
                console.log(`\n📱 PAIRING CODE: ${code}\n`)
                console.log(`Auth folder: ${authFolder}`)
                console.log('Enter this code in WhatsApp: Settings > Linked Devices > Link a Device > Link with Phone Number')
                pairingCodeGenerated = true
            }

            /**
             * Manejo de desconexión - reconectar automáticamente excepto si fue logged out.
             * @event connection.close
             */
            if (connection === 'close') {
                if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                    startSock()
                } else {
                    console.log('🔴 Connection closed. You are logged out.')
                }
            }
        }

        /**
         * Guarda credenciales cuando se actualizan.
         * @event creds.update
         */
        if (events['creds.update']) {
            await saveCreds()
        }
    })

    return sock
}

startSock()
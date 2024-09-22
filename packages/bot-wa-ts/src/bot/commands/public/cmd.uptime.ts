import { configEnv } from '@/bot/helpers/env'
import { type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }
//
export default {
  active: true,
  ExpReg: new RegExp(`^/uptime(?:@${BOT_USERNAME})?$`, 'im'),

  /**
   * @description
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const fechaActual = new Date(client.upTime)
    const dia = fechaActual.getDate().toString().padStart(2, '0')
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0')
    const ano = fechaActual.getFullYear().toString().slice(-2)
    const hora = fechaActual.getHours().toString().padStart(2, '0')
    const minutos = fechaActual.getMinutes().toString().padStart(2, '0')
    const segundos = fechaActual.getSeconds().toString().padStart(2, '0')
    const fechaFormateada = `${dia}/${mes}/${ano} ${hora}:${minutos}:${segundos}`
    //
    // Calcula el tiempo de actividad en segundos
    const uptime = process.uptime()

    // Convierte los segundos a meses, días, horas, minutos y segundos
    const years = Math.floor(uptime / (365 * 24 * 60 * 60))
    const months = Math.floor(uptime / (30 * 24 * 60 * 60))
    const days = Math.floor((uptime % (30 * 24 * 60 * 60)) / (24 * 60 * 60))
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((uptime % (60 * 60)) / 60)
    const seconds = Math.floor(uptime % 60)
    // Crea el mensaje de tiempo de actividad
    const uptimeMessage: string = new Intl.ListFormat('es-ES').format([
      `${years} años`,
      `${months} meses`,
      `${days} días`,
      `${hours} horas`,
      `${minutes} minutos`,
      `${seconds} segundos`
    ])
    const from: string = wamsg.key.remoteJid as string
    // Envía el mensaje al chat del usuario que hizo el comando
    client.sock.sendMessage(
      from,
      {
        text: `*🤖 Bot Uptime*
\n*Hora desde mi inicio:*\n${fechaFormateada}
\n*Estoy activo desde hace:*\n${uptimeMessage}`
      }
    )
  }
}

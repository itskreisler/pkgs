import { configEnv, NEW_ADMINS, PERMANENT_ADMINS, isAuthorized } from '@/bot/helpers/env'
import { CommandImport, type ContextMsg } from '@/bot/interfaces/inter'
import type Whatsapp from '@/bot/main'
import { MarkdownWsp } from '@kreisler/js-helpers'
const { BOT_USERNAME } = configEnv as { BOT_USERNAME: string }

//
export default {
  active: true,
  ExpReg: new RegExp(`^/cmd(?:_(\\w+))?(?:@${BOT_USERNAME})?(?:\\s+(.+))?$`, 'ims'),

  /**
   * @description Configura los comandos, activa o desactiva comandos
   * @param {import("@/bot/main").Whatsapp} client
   * @param {ContextMsg}
   * @param {RegExpMatchArray} match
   */
  async cmd (client: Whatsapp, { wamsg, msg }: ContextMsg, match: RegExpMatchArray): Promise<void> {
    const [, accion, search] = match as [string, 'on' | 'off' | 'list' | 'msg' | 'admin' | undefined, string | undefined]
    const numberPhone: string = msg.author.number

    if (isAuthorized(numberPhone) === false) {
      await msg.reply({ text: 'No tienes permisos para realizar esta acción.' })
      return
    }
    switch (accion?.toLowerCase()) {
      case 'admin':{
        if (typeof search === 'undefined') {
          await msg.reply({ text: 'Debes incluir un parametro' })
          return
        }
        const users = await msg.getMentions()
        if (users.length === 0) {
          await msg.reply({ text: 'Debes mencionar a alguien' })
          return
        }
        for (const { number } of users) {
          // Si el usuario no está autorizado, lo agregamos
          if (isAuthorized(number) === false) {
            NEW_ADMINS.push(number)
          } else {
            const indexAuthorized = NEW_ADMINS.indexOf(number)
            if (indexAuthorized !== -1) {
              NEW_ADMINS.splice(indexAuthorized, 1)
            }
          }
        }

        console.log(NEW_ADMINS.concat(PERMANENT_ADMINS))
        break
      }
      case 'on':{
        if (typeof search === 'undefined') {
          await msg.reply({ text: 'Debes incluir un parametro de busqueda' })
          return
        }
        const [existe, [ExpReg, comando]] = client.findCommand(search) as [boolean, [RegExp, CommandImport]]
        if (!existe) {
          await msg.reply({ text: 'Este comando no existe' })
          return
        }
        if (comando.active === true) {
          await msg.reply({ text: `Este comando (${MarkdownWsp.InlineCode(search)}) ya esta activo` })
          return
        }
        comando.active = true
        client.commands.delete(ExpReg)
        client.commands.set(ExpReg, comando)
        break
      }
      case 'off':{
        if (typeof search === 'undefined') {
          await msg.reply({ text: 'Debes incluir un parametro de busqueda' })
          return
        }
        if (search === 'cmd') return
        const [existe, [ExpReg, comando]] = client.findCommand(search) as [boolean, [RegExp, CommandImport]]
        if (!existe) {
          await msg.reply({ text: 'Este comando no existe' })
          return
        }
        if (comando.active === false) {
          await msg.reply({ text: `Este comando (${MarkdownWsp.InlineCode(search)}) ya esta desactivado` })
          return
        }
        comando.active = false
        client.commands.delete(ExpReg)
        client.commands.set(ExpReg, comando)
        break
      }
      case 'list':{
        const commands = Array.from(client.commands.entries())
        const text = commands.map(([ExpReg, { active }]) => {
          return `${MarkdownWsp.InlineCode(ExpReg.source.slice(0, 10))} - ${active as boolean ? 'Activo' : 'Desactivado'}`
        }).join('\n')
        await msg.reply({ text })
        break
      }
      case 'msg':{
        if (typeof search === 'undefined') {
          await msg.reply({ text: 'Debes incluir un parametro (on/off)' })
          return
        }
        switch (search.toLowerCase()) {
          case 'on':{
            if (msg.isGroup === true) client.sock.groupSettingUpdate(wamsg.key.remoteJid as string, 'not_announcement')
            break
          }
          case 'off':{
            if (msg.isGroup === true) client.sock.groupSettingUpdate(wamsg.key.remoteJid as string, 'announcement')
            break
          }
        }

        break
      }
      default:{
        await msg.reply({
          text: `
Que puedes hacer con este comando:
- /cmd_on <comando>: Activa un comando
- /cmd_off <comando>: Desactiva un comando
- /cmd_list: Lista todos los comandos
- /cmd_msg <on/off>: Activa o desactiva los mensajes del grupo

Aqui tienes unos ejemplos de otros comandos:
- /mal_search <search>: Busca un anime en MyAnimeList
- /mal_byid <mal_id>: Busca un anime por ID en MyAnimeList
- /mal_random: Busca un anime aleatorio en MyAnimeList
- /tt <link>: Descarga un video/album de TikTok
- /dl <link>: Descarga un video/image de internet
- /ping: Muestra el tiempo de respuesta del bot
- /uptime: Muestra el tiempo que lleva el bot encendido
- /unlock: Desbloquea mensajes multimedia en el grupo
- /r34 <tags>: Busca imagenes en rule34 (random)
- /delete: Elimina el mensaje citado(Solo del bot)
          `
        })
      }
    }
  }
}

import type Whatsapp from '@/bot/client.example'
import {
  JsCron
  // , buildCronExpression
} from '@kreisler/js-cron'
import { type IPostMedia } from '../interfaces/inter'
import { type IKudasaiData, type IEpisodeAdded, CMDS, GlobalDB, CmdActions, type InputFunction, type OutputFunction } from '@kreisler/bot-services'
import { printLog } from '../helpers/utils'

// Ejecutar cada 15 minutos desde las 6:00 hasta las 23:45
const CRON_JOB = '0 */15 6-23 * * * *'
// const CRON_JOB = buildCronExpression({ second: '*/20' })
export async function devil(client: Whatsapp): Promise<void> {
  const deamon = new JsCron()
  const { getState } = GlobalDB
  deamon.createTask('suscripciones', CRON_JOB, async () => {
    printLog('🛎️ Ejecutando tarea de suscripciones...', 'yellow')
    const idsGroups = Object.keys(getState().groupDatabases)
    for (const idGroup of idsGroups) {
      const cmds = Object.keys(getState().groupDatabases[idGroup]) as CMDS[]
      for (const cmd of cmds) {
        const { data, notifications } = getState().groupDatabases[idGroup][cmd]
        if (notifications === false) continue

        const { input, output } = CmdActions.getCmdActions(cmd) as { input: InputFunction, output: OutputFunction }
        const latestData = await input() as (IEpisodeAdded & IKudasaiData)[]
        const newData = latestData.filter(i => typeof data.find(o => o.id === i.id) === 'undefined')
        if (newData.length === 0) {
          printLog(`✅ No hay nuevos datos para el comando ${cmd} en el grupo ${idGroup}`, 'green')
          continue
        }
        printLog(`🆕 Nuevos datos encontrados para el comando ${cmd} en el grupo ${idGroup}: ${newData.length} items`, 'yellow')

        const media = output(async function () {
          return await Promise.resolve(newData)
        }) as IPostMedia[]
        client.sendMsgGroup(idGroup, media)
          .then(() => {
            const oldSize = data.length
            printLog(`✅ Enviados ${newData.length} mensajes para el comando ${cmd} en el grupo ${idGroup} (antes ${oldSize}, ahora ${oldSize + newData.length})`, 'green')
            getState().addCommandData(idGroup, cmd, newData)
          })
          .catch(err => {
            printLog('❌ Error al enviar mensajes:'.concat(err), 'red')
            client.sock.sendMessage(idGroup, { text: `❌Error al enviar ${newData.length} mensajes` })
          })
      }
    }
  })
}

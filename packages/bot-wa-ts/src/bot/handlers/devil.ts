import type Whatsapp from '@/bot/main'
import {
  JsCron
  // , buildCronExpression
} from '@kreisler/js-cron'
import { type IPostMedia } from '../interfaces/inter'
import { type IKudasaiData, type IEpisodeAdded, CMDS, GlobalDB, CmdActions, type InputFunction, type OutputFunction } from '@kreisler/bot-services'

// Ejecutar cada 15 minutos desde las 6:00 hasta las 23:45
const CRON_JOB = '0 */15 6-23 * * * *'
// const CRON_JOB = buildCronExpression({ second: '*/20' })
export async function devil(client: Whatsapp): Promise<void> {
  const deamon = new JsCron()
  const { getState } = GlobalDB
  deamon.createTask('suscripciones', CRON_JOB, async () => {
    console.log('Ejecutando tarea', new Date().toLocaleString())
    const idsGroups = Object.keys(getState().groupDatabases)
    console.log({ idsGroups })
    for (const idGroup of idsGroups) {
      const cmds = Object.keys(getState().groupDatabases[idGroup]) as CMDS[]
      console.log({ cmds })
      for (const cmd of cmds) {
        const { data, notifications } = getState().groupDatabases[idGroup][cmd]
        if (notifications === false) {
          console.log('Notificaciones desactivadas', idGroup, cmd)
          continue
        }
        const { input, output } = CmdActions.getCmdActions(cmd) as { input: InputFunction, output: OutputFunction }
        const latestData = await input() as (IEpisodeAdded & IKudasaiData)[]
        const newData = latestData.filter(i => typeof data.find(o => o.id === i.id) === 'undefined')
        if (newData.length === 0) {
          console.log('No hay nuevos datos', idGroup, cmd)
          continue
        }
        console.log('Nuevos datos', newData.length, idGroup, cmd)

        const media = output(async function () {
          return await Promise.resolve(newData)
        }) as IPostMedia[]
        client.sendMsgGroup(idGroup, media)
          .then(() => {
            // registrar los nuevos datos
            const oldSize = data.length
            getState().addCommandData(idGroup, cmd, newData)
            console.log('Tamano de datos: old=', oldSize, ' new=', data.length, ' cmd=', cmd, ' group=', idGroup)
          })
          .catch(err => {
            console.error('Error al enviar mensajes', err)
            client.sendText(idGroup, { text: `❌Error al enviar ${data.length} mensajes` })
          })
      }
    }
  })
}

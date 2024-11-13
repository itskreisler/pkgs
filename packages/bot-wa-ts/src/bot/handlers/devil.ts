import type Whatsapp from '@/bot/main'
import {
  JsCron
  //, buildCronExpression
} from '@kreisler/js-cron'
import { CMDS, GlobalDB } from '@/bot/services/zustand.services'
import { IPostMedia } from '../interfaces/inter'
const CRON_JOB = '0 */15 6-23 * * * *'
// const CRON_JOB = buildCronExpression({ second: '*/20' })
export async function devil (client: Whatsapp): Promise<void> {
  const deamon = new JsCron()
  const { getState } = GlobalDB
  deamon.createTask('suscripciones', CRON_JOB, async () => {
    console.log('Ejecutando tarea', new Date().toLocaleString(), getState().groupDatabases, getState().cmdAcctions)
    const idsGroups = Object.keys(getState().groupDatabases)

    for (const idGroup of idsGroups) {
      const cmds = Object.keys(getState().groupDatabases[idGroup]) as CMDS[]
      for (const cmd of cmds) {
        const { data, notifications } = getState().groupDatabases[idGroup][cmd]
        if (notifications === false) {
          console.log('Notificaciones desactivadas', cmd)
          continue
        }
        const { input, output } = getState().getCmdAcctions(cmd) as { input: Function, output: Function }
        const latestData = await input() as Array<{ id: string }>
        const newData = latestData.filter(i => data.has(i.id) === false)
        if (newData.length === 0) {
          console.log('No hay nuevos datos', cmd)
          continue
        }
        console.log('Nuevos datos', newData.length, cmd)
        // getState().setData({ from: idGroup, cmd, data: newData })
        const media = output(input) as IPostMedia[]
        client.sendMsgGroup(idGroup, media).finally(() => {
          // registrar los nuevos datos
          const oldSize = data.size
          getState().setData({ from: idGroup, cmd, data: newData })
          console.log('Tamano de datos: old=', oldSize, ' new=', data.size)
        })
      }
    }

    await client.sendMsgGroup('jid', [{ text: 'Hola Mundo' }])
  })
}

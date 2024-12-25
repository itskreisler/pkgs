import { type ClientBot } from '@/bot/core/main'
import {
  JsCron
  //, buildCronExpression
} from '@kreisler/js-cron'

const CRON_JOB = '0 */15 6-23 * * * *'
// const CRON_JOB = buildCronExpression({ second: '*/20' })
export async function devil (client: ClientBot): Promise<void> {
  const deamon = new JsCron()
  deamon.createTask('suscripciones', CRON_JOB, async () => {
    console.log('Ejecutando tarea', new Date().toLocaleString())
  })
}

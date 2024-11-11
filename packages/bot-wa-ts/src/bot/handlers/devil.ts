import Whatsapp from '@/bot/main'
import { JsCron, buildCronExpression } from '@kreisler/js-cron'
import { GlobalDB } from '@/bot/services/zustand.services'
const expression = buildCronExpression({
  second: '*/10'
})
export async function devil (client: Whatsapp): Promise<void> {
  const deamon = new JsCron()
  deamon.createTask('suscripciones', expression, async () => {
    const { getState } = GlobalDB
    const keys = Object.keys(getState().groupDatabases)

    await client.sendMsgGroup('jid', [{ text: 'Hola Mundo' }])
  })
}

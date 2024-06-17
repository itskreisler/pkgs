import { type TprocessEnv } from '@/interfaces/types'
import app from './app'
const PORT: string | number = (process.env.PORT as TprocessEnv['PORT']) ?? 4321

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`\n🚀 ... Listening: http://localhost:${PORT}`)
  /* eslint-enable no-console */
})

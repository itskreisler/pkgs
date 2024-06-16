import { ProcessEnv } from '../interfaces/types'
import app from './app'
const { PORT = 5000 } = process.env as ProcessEnv

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`\n🚀 ... Listening: http://localhost:${PORT}`)
  /* eslint-enable no-console */
})

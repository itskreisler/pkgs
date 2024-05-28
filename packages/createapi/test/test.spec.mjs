/**
 * @author Kreisler Ramirez Sierra
 * @file
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES

// » IMPORT MODULES
import { createApi } from '../dist/index.js'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(async () => {
  const api = createApi('https://api.adviceslip.com')
  const output = await api.advice()
  // final url: https://api.adviceslip.com/advice
  console.log({ output })
})()

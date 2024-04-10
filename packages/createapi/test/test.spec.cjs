/**
 * @author Kreisler Ramirez Sierra
 * @file 
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES


// » IMPORT MODULES
const { createApi } = require('../dist/index.js');

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


(async () => {
  const api = createApi('https://www3.animeflv.net')
  const res = await api['kudasai.php']()
  console.log({ res })
})();
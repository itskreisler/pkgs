/**
 * @author Kreisler Ramirez Sierra
 * @file
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
const { describe, it } = require('node:test')
const assert = require('node:assert')

// » IMPORT MODULES
const { malApi } = require('../dist/jikan.services.cjs')

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('createApi', () => {
  it('should return a function', () => {
    malApi.anime(111).then((res) => {
      assert.strictEqual(typeof res, 'object')
    })
  })
})

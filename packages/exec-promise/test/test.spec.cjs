/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
const { describe, it } = require('node:test')
const assert = require('node:assert')

// » IMPORT MODULES
const { execPromise } = require('../dist/index.cjs')

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('TESTING', async () => {
  it('Hello World', async () => {
    const { stderr, stdout: result } = await execPromise('echo "Hello World!"')
    assert.strictEqual(result.trim(), '"Hello World!"')
  })
})

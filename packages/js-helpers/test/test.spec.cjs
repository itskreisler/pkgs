/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
const { describe, it } = require('node:test')
const assert = require('node:assert')

// » IMPORT MODULES
const { normalize } = require('../dist/index.js')

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('TESTING', async () => {
  it('normalize', async () => {
    assert.strictEqual(normalize('  Hello   World  '), 'Hello World')
    assert.strictEqual(normalize('  Hello   World  ', true), 'Hello World')
    assert.strictEqual(normalize('  Hello   World  ', false), '  Hello   World  ')
    assert.strictEqual(normalize('  Hello   World  ', true, true), 'Hello World')
    assert.strictEqual(normalize('  Hello   World  ', false, true), '  Hello   World  ')
  })
})

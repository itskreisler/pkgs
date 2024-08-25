/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
// @ts-expect-error
import { describe, it } from 'node:test'
// @ts-expect-error
import assert from 'node:assert'

// » IMPORT MODULES
import { helloWorld } from '@/lib/helloworld'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('TESTING', async () => {
  it('Hello World', async () => {
    const result = helloWorld
    assert.strictEqual(result, 'Hello World!')
    assert.strictEqual(result.length, 'Hello World!'.length)
    assert.strictEqual('string', typeof result)
  })
})

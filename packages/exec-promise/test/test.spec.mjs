/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
import { describe, it } from 'node:test'
import assert from 'node:assert'

// » IMPORT MODULES
import { execPromise } from '../dist/index.js'


// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('TESTING', async () => {
  it('Hello World', async () => {
    const { stderr, stdout: result } = await execPromise('echo "Hello World!"')
    assert.strictEqual(result.trim(), '"Hello World!"')
  })
  it('Error', async () => {
    try {
      await execPromise('echo "Hello World!" && exit 1')
    } catch (error) {
      assert.strictEqual(error.code, 1)
    }
  })
  it('curl', async () => {
    const cmd = 'curl -s -X GET "https://jsonplaceholder.typicode.com/posts/1"'
    const { stderr, stdout: result } = await execPromise(cmd)
    assert.strictEqual(JSON.parse(result).id, 1)
    assert.strictEqual(JSON.parse(result).userId, 1)
    assert.strictEqual(JSON.parse(result).title, 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit')
  })
})

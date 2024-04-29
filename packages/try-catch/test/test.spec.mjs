/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
import { describe, it } from 'node:test'
import assert from 'node:assert'

// » IMPORT MODULES
import { tryCatch, tryCatchPromise } from '../dist/index.mjs'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('TESTING', async () => {
  it('should return a Error', async () => {
    const { parse } = JSON;
    const [error, result] = tryCatch(parse, 'hello');
    assert.strictEqual(error instanceof Error, true);
    assert.strictEqual(result, undefined);
  })
  it('should return 5', () => {
    const sum = (a, b) => a + b
    const [error, result] = tryCatch(sum, 2, 3)
    assert.strictEqual(result, 5)
  })
  it('should return a Stringify', () => {
    const { stringify } = JSON
    const [error, result] = tryCatch(stringify, { hello: 'world' })
    assert.strictEqual(result, '{"hello":"world"}')
  })
  it('should return a Request', async () => {
    const [error, result] = await tryCatchPromise(globalThis.fetch, 'https://jsonplaceholder.typicode.com/todos/1')
    assert.strictEqual(error, null)
    const data = await result.json()
    assert.strictEqual(data.userId, 1)
    assert.strictEqual(data.id, 1)
    assert.strictEqual(data.title, 'delectus aut autem')
    assert.strictEqual(data.completed, false)
  })
})

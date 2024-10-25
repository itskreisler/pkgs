/**
 * @author Kreisler Ramirez Sierra
 * @file
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
import { describe, it } from 'node:test'
import assert from 'node:assert'

// » IMPORT MODULES
import { animeByGenres, animeByState, downloadLinksByEpsId, getAnimeCharacters, getAnimeInfo } from '../dist/index.js'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('createApi', () => {
  it('should return a function', () => {
    assert.strictEqual(typeof createApi, 'function')
  })
  it('should return an object', () => {
    const api = createApi()
    assert.strictEqual(typeof api, 'object')
  })
  it('should return an object with a get method', () => {
    const api = createApi()
    assert.strictEqual(typeof api.get, 'function')
  })
  it('should return Promise', () => {
    const api = createApi('https://postman-echo.com')
    const response = api.get({ foo: 'bar' })
    assert.strictEqual(response.constructor.name, 'Promise')
  })
  it('should return Debug mode', async () => {
    const api = createApi('https://postman-echo.com', { x_debug: true })
    /**
     * {
        prop: 'get',
        path: 'https://postman-echo.com/get?foo=bar',
        id: { foo: 'bar' },
        params: undefined,
        args: { x_debug: true },
        target: {},
        receiver: {}
      }
     */
    /**
     * @typedef {Object} DebugMode
     * @property {string} prop
     * @property {string} path
     * @property {Record<string, any>} id
     * @property {Record<string, any>} params
     * @property {Record<string, any>} args
     * @property {Record<string, any>} target
     * @property {Record<string, any>} receiver
     */
    /**
     * @type {DebugMode}
     */
    const response = await api.get({ foo: 'bar' })
    assert.strictEqual(response.prop, 'get')
    assert.strictEqual(response.path, 'https://postman-echo.com/get?foo=bar')
    assert.strictEqual(response.id.foo, 'bar')
    assert.strictEqual(response.params, undefined)
    assert.strictEqual(response.args.debug, true)
    assert.strictEqual(typeof response.target, 'object')
    assert.strictEqual(typeof response.receiver, 'object')
  })
  it('api avanzada', async () => {
    /**
     * @typedef {Object} PostmanResponse
     * @property {string} url
     * @property {Record<string, string>} headers
     */
    /**
     * @typedef {Object} PostmanEcho
     * @property {function(any, any, RequestInit): Promise<PostmanResponse>} post
     */
    /**
     * @type {PostmanEcho}
     */
    const api = createApi('https://postman-echo.com')
    const response = await api.post(null, null, {
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' }),
      headers: { 'Content-Type': 'application/json' }

    })
    assert.strictEqual(response.url, 'https://postman-echo.com/post')
  })
})

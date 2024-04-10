export interface TypesArgs extends RequestInit {
  debug?: boolean | undefined // Debug mode
}

export type APIResponse = Record<string, any>

export type API = Record<string, (id: string | number | object, params?: object) => Promise<APIResponse>>

/**
 * @typedef {object} TypesArgs
 * @property {boolean} [debug=false] - Debug mode
 */
/**
 * @name createApi
 * @description Create an API instance for the specified URL
 * @param {string} url - API URL
 * @param {RequestInit|TypesArgs} args - RequestInit
 * @returns {object} API response
 * @example
 * const api = createApi('https://nekobot.xyz/api')
 * const res = await api.image({ type: 'neko' })
 * const res2 = await api['kudasai.php']() # alternative
 * console.log({ res, res2})
 *
 *
 */
export const createApi = (url: 'https://nekobot.xyz/api' | 'https://www3.animeflv.net/kudasai.php', args?: TypesArgs): API => {
  return new Proxy({}, {
    get: function (target, prop: string, receiver) {
      return async (id: string | number | object, params?: string | string[][]) => {
        let query: string[] | undefined
        let path = [url, prop].join('/')

        const typeOfId = typeof id
        if (typeOfId === 'object') {
          query = typeof typeOfId !== 'undefined' ? ['?', new URLSearchParams(id as URLSearchParams).toString()] : []
          path = path.concat(...query)
        }
        if (['string', 'number'].some(tof => typeOfId === tof) || typeof params !== 'undefined') {
          query = typeof params !== 'undefined' ? ['?', new URLSearchParams(params).toString()] : []
          path = [path, id].join('/').concat(...query)
        }

        if ((args?.debug) === true) return { prop, path, id, params, args }

        const res = await globalThis.fetch(path, args)
        try {
          return await res.json()
        } catch (error) {
          try {
            return await res.text()
          } catch (error) {
            throw new Error(error as string)
          }
        }
      }
    }
  })
}
export default createApi


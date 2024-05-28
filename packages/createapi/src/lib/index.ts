export interface TypesArgs extends RequestInit {
  debug?: boolean | undefined // Debug mode
}

export type ExampleUrl = 'https://nekobot.xyz/api' | 'https://pokeapi.co/api/v2' | 'https://postman-echo.com' /* get,post */ | 'https://www3.animeflv.net/' // kudasai.php

/**
 * @typedef {object} TypesArgs
 * @property {boolean} [debug=false] - Debug mode
 */
/**
 * @name createApi
 * @description Create an API instance for the specified URL
 * @param {ExampleUrl | URL | String} url - API URL
 * @param {TypesArgs | RequestInit} args - RequestInit
 * @returns {Object} API response
 * @example
 * const api = createApi('https://nekobot.xyz/api')
 * const res = await api.image({ type: 'neko' })
 * const res2 = await api['kudasai.php']() # alternative
 * console.log({ res, res2})
 *
 *
 */
export const createApi = (url: Required<ExampleUrl | URL | String>, args?: TypesArgs): { [key: string]: any } => {
  return new Proxy({}, {
    get: function (target, prop: string, receiver) {
      return async (id?: string | number | object | undefined | null, params?: string | string[][] | undefined, extraparams?: RequestInit) => {
        let query: string[] | undefined
        let path = [url, prop].join('/')

        const typeOfId = typeof id
        if (typeOfId === 'object' && id !== null) {
          query = typeof typeOfId !== 'undefined' ? ['?', new URLSearchParams(id as URLSearchParams).toString()] : []
          path = path.concat(...query)
        }
        if (['string', 'number'].some(tof => typeOfId === tof) || (typeof params !== 'undefined' && params !== null)) {
          query = typeof params !== 'undefined' ? ['?', new URLSearchParams(params).toString()] : []
          path = [path, id].join('/').concat(...query)
        }

        if ((args?.debug) === true) return { prop, path, id, params, args: { ...args, ...extraparams }, target, receiver }

        const res = await globalThis.fetch(path, { ...args, ...extraparams })
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

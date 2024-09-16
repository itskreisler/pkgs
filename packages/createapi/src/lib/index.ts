/**
 * @typedef {object} TypesArgs
 * @property {boolean} [debug=false] - Debug mode
 */
export interface TypesArgs extends RequestInit {
  /** debug mode */
  debug?: boolean | undefined
  /** force json() text() response */
  force?: boolean | undefined
  /** globalThis.encodeURIComponent */
  encodeURI?: Function | undefined
  /** globalThis.decodeURIComponent */
  decodeURI?: Function | undefined
}
export enum DemoUrlsEnum {
  NEKOBOT = 'https://nekobot.xyz/api',
  POKEAPI = 'https://pokeapi.co/api/v2',
  POSTMAN = 'https://postman-echo.com', /* /get,/post */
  ANIMEFLV_KUDASAI = 'https://www3.animeflv.net', // /kudasai.php
  FRASEDELDIA = 'https://frasedeldia.azurewebsites.net/api', // /phrase
  ADVICE = 'https://api.adviceslip.com' // /advice
}

// Tipo que obtiene los valores de DemoUrls
export type ExampleUrl = 'https://nekobot.xyz/api' | 'https://pokeapi.co/api/v2' | 'https://postman-echo.com' /* get,post */ | 'https://www3.animeflv.net' // kudasai.php
const TRUE: boolean = true as const
const FALSE: boolean = false as const

/**
 * @name createApi
 * @description Create an API instance for the specified URL
 * @param {ExampleUrl | URL | String} url - API URL
 * @param {TypesArgs | RequestInit} args - RequestInit
 * @returns {Object} API response
 * @example // Example usage of createApi
 * const nekobot = createApi('https://nekobot.xyz/api')
 * const response = await nekobot.image({ type: 'neko' })
 * console.log({ response }) // { "success": true, "message": "https://i0.nekobot.xyz/2/6/1/197f86b7789ad7db7ebbda6b3d7cf.jpg", "color": 15521502, "version": "2021070801" }
 *
 * @example
 * interface YameteResponse {
 * 'kudasai.php': () => Promise<Array<{
 *  title: string
 *  image: string
 *  slug: string
 *  date: string
 *  category: {
 *    name: string
 *    slug: string
 *   }
 *  }>>
 * }
 * const yamete: YameteResponse  = createApi('https://www3.animeflv.net')
 * yamete['kudasai.php']().then(data => console.log(data.map(x => x.title)))
 */
export const createApi = <D>(url: Partial<ExampleUrl & Partial< URL | String | string>>, args?: Partial<TypesArgs>): D => {
  return new Proxy({}, {
    get: function (target, prop: string, receiver) {
      return async (id?: string | number | object | undefined | null, params?: string | string[][] | undefined, extraparams?: RequestInit): Promise<Response | string | any> => {
        let query: string[] | undefined
        let path = [url, prop].join('/')
        let queryParams: string = ''
        const typeOfId = typeof id
        if (typeOfId === 'object' && id !== null) {
          queryParams = new URLSearchParams(id as URLSearchParams).toString()
          if (typeof args?.decodeURI !== 'undefined') {
            queryParams = args?.decodeURI(queryParams)
          }
          query = typeof typeOfId !== 'undefined' ? ['?', queryParams] : []
          path = path.concat(...query)
        }
        const hasParams = typeof params !== 'undefined' && params !== null
        if (['string', 'number'].some(tof => typeOfId === tof) || hasParams) {
          queryParams = new URLSearchParams(params).toString()
          if (typeof args?.decodeURI !== 'undefined') {
            queryParams = args?.decodeURI(queryParams)
          }
          query = typeof params !== 'undefined' ? ['?', queryParams] : []
          path = [path, id].join('/').concat(...query)
        }
        // debug mode
        if ((args?.debug) === TRUE) return { prop, path, id, params, args: { ...args, ...extraparams }, target, receiver }
        const response = await globalThis.fetch(path, { ...args, ...extraparams })
        // no force json() text() response
        if ((args?.force) === FALSE) return response as D
        try {
          if (response.ok) return await response.json() as D
        } catch (errorJson) {
          try {
            return await response.text() as D
          } catch (errorText) {
            throw new Error('Error parsing response')
          }
        }
      }
    }
  }) as D
}

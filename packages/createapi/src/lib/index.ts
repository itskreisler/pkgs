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
export type ExampleUrl = 'https://nekobot.xyz/api' | 'https://pokeapi.co/api/v2' | 'https://postman-echo.com' /* get,post */ | 'https://www3.animeflv.net' // kudasai.php
const TRUE: boolean = true as const
const FALSE: boolean = false as const
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
 * @example // Example usage of createApi
 * const api = createApi('https://nekobot.xyz/api')
 * const res = await api.image({ type: 'neko' })
 * console.log({ res})
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
 *  }
 * }>>
 * }
 * const yamete = createApi('https://www3.animeflv.net') as YameteResponse
 * yamete['kudasai.php']().then(data => console.log(data.map(x => x.title)))
 */
export const createApi = (url: Required<ExampleUrl | URL | String | string>, args?: Partial<TypesArgs>): { [key: string]: any } => {
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
        if ((args?.force) === FALSE) return response
        try {
          return await response.json()
        } catch (errorJson) {
          try {
            return await response.text()
          } catch (errorText) {
            throw new Error('Error parsing response')
          }
        }
      }
    }
  })
}
/*
async function r34API(tag: string[], limit: number): Promise<{ preview_url: string, sample_url: string, file_url: string } | 'no résult found'> {
  const tags = tag.join(' ')
  const r34 = createApi('https://api.rule34.xxx') as { ['index.php']: (params: { tags: string, page: 'dapi', s: 'post', q: 'index', limit: number, pid: number, json: 1 }) => Promise<Array<{ preview_url: string, sample_url: string, file_url: string }> | []> }
  const data = await r34['index.php']({
    tags,
    page: 'dapi',
    s: 'post',
    q: 'index',
    limit,
    pid: 1,
    json: 1
  })
  if (data.length < 1) return 'no résult found'
  const n = Math.floor(Math.random() * data.length)
  // if (n === 0) return await r34API(tag)
  return data[n]
}
async function getPic() {
  const image = await r34API(['hu_tao_(genshin_impact)'], 1000)
  console.log(image)
}
// getPic()

async function getTags(query: string) {
  const r34 = createApi('https://ac.rule34.xxx') as { ['autocomplete.php']: (params: { q: string }) => Promise<Array<{ label: string, value: string, type: 'character' | 'general' }> | []> }
  const data = await r34['autocomplete.php']({ q: query })
  return data
}
getTags('hu_tao').then(([{ label, value: tag }]) => {
  const count = label.match(/([\d]+)/gm)
  if (count != null) {
    const limit = parseInt(count[0])
    r34API([tag], limit).then(console.log)
  }
})
*/
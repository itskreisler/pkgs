/**
 * @typedef {object} ArgsCreateApi
 * @property {boolean} [debug=false] - Debug mode
 * @property {boolean} [json=false] - Force json() response
 * @property {boolean} [text=false] - Force text() response
 * @property {boolean} [response=false] - Force response
 */
export interface ArgsCreateApi extends RequestInit {
  /** debug mode */
  x_debug?: boolean | undefined
  /** force json() response */
  x_json?: boolean | undefined
  /** force text() response */
  x_text?: boolean | undefined
  /** force response */
  x_response?: boolean | undefined
}
export interface DebugResponse {
  prop: string
  path: string
  id: string | number | object | undefined | null
  params: string | string[][] | undefined
  args: ArgsCreateApi
  target: object
  receiver: object
}

export enum DemoUrlsEnum {
  NEKOBOT = 'https://nekobot.xyz/api',
  POKEAPI = 'https://pokeapi.co/api/v2',
  POSTMAN = 'https://postman-echo.com', /* /get,/post */
  ANIMEFLV_KUDASAI = 'https://www3.animeflv.net', // /kudasai.php
  FRASEDELDIA = 'https://frasedeldia.azurewebsites.net/api', // /phrase
  ADVICE = 'https://api.adviceslip.com', // /advice
  DECAPI = 'https://decapi.me' // /twitch
}

// Tipo que obtiene los valores de DemoUrls
export type ExampleUrl = 'https://nekobot.xyz/api' | 'https://pokeapi.co/api/v2' | 'https://postman-echo.com' /* get,post */ | 'https://www3.animeflv.net' // kudasai.php
const TRUE: boolean = true as const

/**
 * @example
 * interface POKEAPI {
 * pokemon: {
 *  (options: { limit: number, offset: number }): Promise<{ count: number, next: string, previous: string, results: Array<{ name: string, url: string }> }>
 *  (name: string): Promise<{ name: string, id: number }>
 * }
 * 'pokemon-species': (name: string) => Promise<{ name: string, id: number }>
 * type: (id: number) => Promise<{ name: string, id: number }>
 * }
 * const pokeapi: POKEAPI = createApi(DemoUrlsEnum.POKEAPI)
 * pokeapi.pokemon('pikachu').then(console.log)
 * @example
 * interface PostMan {
 *  get: (id?: string | number | object | undefined | null, params?: object, extraparams?: RequestInit) => Promise<{args: object, headers: object, url: string}>
 *  post: (id?: string | number | object | undefined | null, params?: object, extraparams?: RequestInit) => Promise<{args: object, headers: object, url: string}>
 * }
 * const postMan: PostMan = createApi(DemoUrlsEnum.POSTMAN)
 * const get = await postMan.get()
 * const post = await postMan.post()
 * console.log(get, post)
 * @example
 * // https://via.assets.so/img.jpg?w=400&h=150&tc=blue&bg=#cecece&t=Create%20API
 * (async function () {
 * const imageplaceholder = createApi<{
 *  'img.jpg': (options: { w: number, h: number, tc: string, bg: string, t: string }, _: null, __: ArgsCreateApi) => Promise<Response>
 * }>('https://via.assets.so')
 * const data = await imageplaceholder['img.jpg']({ w: 400, h: 150, tc: 'blue', bg: '#cecece', t: 'Create API' }, null, { x_response: true })
 * const buffer = await data.arrayBuffer()
 * const writeFile = (await import('fs')).promises.writeFile
 * await writeFile('img.jpg', Buffer.from(buffer), { encoding: 'binary' })
 * })()
 * @name createApi
 * @description Create an API instance for the specified URL
 * @param {ExampleUrl | URL | String} url - API URL
 * @param {ArgsCreateApi | RequestInit} args - RequestInit
 */
export const createApi = <I>(
  url: Partial<ExampleUrl & Partial<URL | String | string>>,
  args?: Partial<ArgsCreateApi>
): I => {
  return new Proxy({}, {
    get: function (target, prop: string, receiver) {
      return async (id?: string | number | object | undefined | null, params?: string | string[][] | undefined, extraparams?: ArgsCreateApi) => {
        let query: string[] | undefined
        let path = [url, prop].join('/')
        let queryParams: string = ''
        const typeOfId = typeOfAny(id)
        const typeOfParams = typeOfAny(params)

        // si id es un objeto y no es nulo
        if (typeOfId === 'object' && id !== null) {
          queryParams = new URLSearchParams(id as URLSearchParams).toString()
          query = ['?', queryParams]
          path = path.concat(...query)
        }

        const hasParams: boolean = typeof params !== 'undefined' && params !== null
        const hasStrNumber: boolean = strNumber(typeOfParams)
        // si id es un string o un número o tiene parámetros
        if (strNumber(typeOfId) || hasParams) {
          queryParams = new URLSearchParams(params as unknown as URLSearchParams).toString()
          query = hasStrNumber ? ['/', params as string] : hasParams ? ['?', queryParams] : []
          path = [path, id].join('/').concat(...query)
        }

        // modo debug
        if (args?.x_debug === TRUE || extraparams?.x_debug === TRUE) {
          // Retornar solo la información de depuración
          return await Promise.resolve<DebugResponse>({
            prop,
            path,
            id,
            params,
            args: { ...args, ...extraparams },
            target,
            receiver
          })
        }

        // obtener respuesta
        const response = await globalThis.fetch(path, { ...args, ...extraparams })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}: ${response.statusText}`)
        }

        try {
          // no forzar json() o respuesta de texto
          if (args?.x_response === TRUE || extraparams?.x_response === TRUE) return response

          // forzar respuesta de texto
          if (args?.x_text === TRUE || extraparams?.x_text === TRUE) return await response.text()
          return await response.json()
        } catch (errorJson) {
          throw new Error('Error parsing response')
        }
      }
    }
  }) as I
}
function typeOfAny (o: any) { return typeof o }
function strNumber (o: string): boolean { return ['string', 'number'].some(tof => o === tof) }

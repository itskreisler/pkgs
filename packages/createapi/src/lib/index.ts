/**
 * @typedef {object} TypesArgs
 * @property {boolean} [debug=false] - Debug mode
 */
export interface TypesArgs extends RequestInit {
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
  args: TypesArgs
  target: object
  receiver: object
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

/**
 * @example
 * interface PostMan {
 *  get: (id?: string | number | object | undefined | null, params?: object, extraparams?: RequestInit) => Promise<{args: object, headers: object, url: string}>
 *  post: (id?: string | number | object | undefined | null, params?: object, extraparams?: RequestInit) => Promise<{args: object, headers: object, url: string}>
 * }
 * const postMan: PostMan = createApi(DemoUrlsEnum.POSTMAN)
 * const get = await postMan.get()
 * const post = await postMan.post()
 * console.log(get, post)
 * @name createApi
 * @description Create an API instance for the specified URL
 * @param {ExampleUrl | URL | String} url - API URL
 * @param {TypesArgs | RequestInit} args - RequestInit
 */
export const createApi = <I>(
  url: Partial<ExampleUrl & Partial<URL | String | string>>,
  args?: Partial<TypesArgs>
): I => {
  return new Proxy({}, {
    get: function (target, prop: string, receiver) {
      return async (id?: string | number | object | undefined | null, params?: string | string[][] | undefined, extraparams?: TypesArgs) => {
        let query: string[] | undefined
        let path = [url, prop].join('/')
        let queryParams: string = ''
        const typeOfId = typeof id

        // si id es un objeto y no es nulo
        if (typeOfId === 'object' && id !== null) {
          queryParams = new URLSearchParams(id as URLSearchParams).toString()
          query = ['?', queryParams]
          path = path.concat(...query)
        }

        const hasParams = typeof params !== 'undefined' && params !== null
        const hasParamsString = typeof params === 'string'
        // si id es un string o un número o tiene parámetros
        if (['string', 'number'].some(tof => typeOfId === tof) || hasParams) {
          queryParams = new URLSearchParams(params).toString()
          query = hasParamsString ? ['/', params] : hasParams ? ['?', queryParams] : []
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

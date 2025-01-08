import cloudscraper, { type OptionsWithUrl } from 'cloudscraper'
import { JSDOM } from 'jsdom'

export const jQuery = (data: string) => {
  const dom = new JSDOM(data)
  return {
    $: (selector: string) => dom.window.document.querySelector(selector),
    $$: (selector: string) => dom.window.document.querySelectorAll(selector)
  }
}

export enum URIS {
  FLV_BASE_URL = 'https://animeflv.net',
  FLV_ANIME_VIDEO_URL = 'https://animeflv.net/ver/',

  FLV_BROWSE_URL = 'https://animeflv.net/browse?',
  FLV_SEARCH_URL = 'https://animeflv.net/browse?q=',
  FLV_BASE_EPISODE_IMG_URL = 'https://cdn.animeflv.net/screenshots/',

  LAT_BASE_URL = 'https://latanime.org',
  LAT_ANIME_VIDEO_URL = 'https://latanime.org/ver/',

  TIO_ANIME_BASE_URL = 'https://tioanime.com',
  TIO_ANIME_VIDEO_URL = 'https://tioanime.com/ver/',
}

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Cache-Control': 'private',
  Referer: 'https://www.google.com/search?q=anime',
  Connection: 'keep-alive'
}

export interface IEpisodeAdded {
  id: string
  title: string
  poster64?: `data:image/png;base64,${string}`
  poster: string
  episode: number
  servers: WatchDownload
}
export interface IServer {
  server: string
  title: string
  ads?: number
  url?: string
  allow_mobile?: boolean
  code: string
}
export async function ScraperService(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response> {
  return await globalThis.fetch(input, init)
}
ScraperService.fetchData = async (options: OptionsWithUrl & RequestInit): Promise<string> => {
  try {
    const response = await cloudscraper(options)
    return response
  } catch (error) {
    console.error('Error en fetch:', error)
    return ''
  }
}
interface WatchDownload {
  watchOnline: IServer[]
  download: IServer[]
}

// Interfaz que debe implementar cada scraper
interface ScraperInterface {
  latestEpisodesAdded?: () => Promise<IEpisodeAdded[]>
  AnimeServers?: (id: string) => Promise<WatchDownload>
  latestAnimeAdded?: () => Promise<any[]>
  // Otros métodos necesarios
}
export class LatAnimeScraper implements ScraperInterface {
  async latestEpisodesAdded(): Promise<IEpisodeAdded[]> {
    const data = await ScraperService.fetchData({ url: URIS.LAT_BASE_URL, headers: DEFAULT_HEADERS })
    const { $$ } = jQuery(data)
    const promises = [...$$('.col-6.col-md-6.col-lg-3.mb-3')].map(async ($element) => {
      // const type = $element.querySelector('div.info_cap span')?.textContent?.trim() ?? ''
      const id = $element.querySelector('a')?.getAttribute('href')?.split('/ver/').pop() ?? ''
      const title = $element.querySelector('h2')?.textContent?.split(' - ')[1] ?? ''
      const episode = Number($element.querySelector('h2')?.textContent?.split(' - ')[0] ?? 0)
      const poster = $element.querySelector('div.imgrec img')?.getAttribute('data-src') ?? ''
      const servers = await this.AnimeServers(id)
      return {
        id,
        title,
        poster,
        episode,
        servers
      }
    })

    return await Promise.all(promises)
  }

  AnimeServers = async (id: string) => {
    const res = await ScraperService.fetchData({ url: URIS.LAT_ANIME_VIDEO_URL.concat(id) })
    const { $$ } = jQuery(res)
    // Link para ver online
    const watchOnline = [...$$('.cap_repro.d-flex.flex-wrap .play-video')].reduce<IServer[]>((accumulatedServers, $element) => {
      const base64 = $element.getAttribute('data-player') ?? ''
      const title = $element.textContent?.trim() ?? ''
      accumulatedServers.push({
        title,
        server: title,
        code: globalThis.atob(base64)
      })
      return accumulatedServers
    }, [])
    // Links para descargar
    const download = [...$$('.descarga2 div .direct-link')].reduce<IServer[]>((accumulatedServers, $element) => {
      const code = $element.getAttribute('href')?.trim() ?? ''
      const server = $element.querySelector('span')?.textContent?.trim() ?? ''
      accumulatedServers.push({ code, server, title: server })
      return accumulatedServers
    }, [])
    return {
      watchOnline,
      download
    }
  }
}
export class AnimeFLVScraper implements ScraperInterface {
  async latestEpisodesAdded(): Promise<IEpisodeAdded[]> {
    const data = await ScraperService.fetchData({ url: URIS.FLV_BASE_URL, headers: DEFAULT_HEADERS })
    const { $$ } = jQuery(data)
    const promises = [...$$('div.Container ul.ListEpisodios li')].map(async ($element) => {
      const id = $element.querySelector('a')?.getAttribute('href')?.replace('/ver/', '').trim() ?? ''
      const title = $element.querySelector('a strong.Title')?.textContent ?? ''
      const poster = URIS.FLV_BASE_URL.concat($element?.querySelector('a span.Image img')?.getAttribute('src') ?? '')
      const cap = $element?.querySelector('a span.Capi')?.textContent?.match(/\d+/g)?.shift() ?? ''
      const episode = parseInt(cap, 10) ?? 0
      const servers = await this.AnimeServers(id)
      return {
        id,
        title,
        poster,
        episode,
        servers
      }
    })

    return await Promise.all(promises)
  }

  AnimeServers: ((id: string) => Promise<WatchDownload>) = async (id: string) => {
    const res = await ScraperService.fetchData({ url: URIS.FLV_ANIME_VIDEO_URL.concat(id) })
    const { $$ } = jQuery(res)
    const $scripts = $$('script')
    // Buscamos el script que contiene los servidores
    const watchOnline: IServer[] = [...$scripts].reduce<IServer[]>((accumulatedServers, $script) => {
      const contents = $script.textContent ?? ''
      if (contents.includes('var videos = {') === true) {
        const videos = contents.split('var videos = ')[1].split(';')[0]
        const data: { SUB: IServer[] } = JSON.parse(videos)
        const serverList = data.SUB

        // Acumulamos los servidores en el array
        accumulatedServers.push(...serverList)
      }
      return accumulatedServers // Si no tiene videos, mantenemos el acumulado
    }, [])

    const download: IServer[] = [...$$('table.RTbl.Dwnl tbody tr')].reduce<IServer[]>((accumulatedServers, $element) => {
      const server = $element.querySelector('td')?.textContent?.trim() ?? ''
      const code = $element.querySelector('a')?.getAttribute('href')?.trim() ?? ''
      accumulatedServers.push({ code, server, title: server })
      return accumulatedServers
    }, [])
    return {
      watchOnline,
      download
    }
  }
}

/**
 * Scraper de TioAnime
 */
export class TioAnime implements ScraperInterface {
  async latestEpisodesAdded(): Promise<IEpisodeAdded[]> {
    const req = await ScraperService('https://apius.reqbin.com/api/v1/requests', {
      headers: {
        accept: '*/*',
        'accept-language': 'es-US,es-ES;q=0.9,es-CO;q=0.8,es-419;q=0.7,es;q=0.6,en;q=0.5,fr;q=0.4',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'content-type': 'application/json',
        expires: '0',
        pragma: 'no-cache',
        priority: 'u=1, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
        'x-authorized': '',
        'x-devid': 'e9788ed2-c50c-4627-a8ab-794749f1579aR',
        'x-sesid': '1736371181622',
        'x-token': ''
      },
      referrerPolicy: 'same-origin',
      body: JSON.stringify({
        id: '7342',
        parentId: '',
        histKey: '',
        name: '',
        changed: true,
        errors: '',
        json: JSON.stringify({
          method: 'GET',
          url: 'https://tioanime.com',
          apiNode: 'US',
          contentType: '',
          headers: 'Accept: application/json',
          errors: '',
          curlCmd: '',
          codeCmd: '',
          jsonCmd: '',
          xmlCmd: '',
          lang: '',
          auth: {
            auth: 'noAuth',
            bearerToken: '',
            basicUsername: '',
            basicPassword: '',
            customHeader: '',
            encrypted: ''
          },
          compare: false,
          idnUrl: 'https://tioanime.com/'
        }),
        sessionId: 1736371181622,
        deviceId: 'e9788ed2-c50c-4627-a8ab-794749f1579aR'
      }),
      method: 'POST'
    })
    const text = await req.text()
    const data = JSON.parse(text) as { Content: string }
    const { $$ } = jQuery(data.Content)
    const promises = [...$$('.episodes .episode')].map(async ($element) => {
      const id = $element.querySelector('a[href^="/ver/"]')?.getAttribute('href')?.replace('/ver/', '') ?? ''
      const title = $element.textContent?.trim()?.replace(/(\d+)$/, '')?.trim() ?? ''
      const poster = URIS.TIO_ANIME_BASE_URL.concat($element?.querySelector('img')?.getAttribute('src') ?? '')
      const episode = Number($element.textContent?.trim().match(/(\d+)$/)?.pop())
      const servers = {
        watchOnline: [],
        download: []
      }
      return {
        id,
        title,
        episode,
        servers,
        poster
      }
    })
    return await Promise.all(promises)
  }

  AnimeServers: ((id: string) => Promise<WatchDownload>) = async (id: string) => {
    const res = await ScraperService('https://apius.reqbin.com/api/v1/requests', {
      headers: {
        accept: '*/*',
        'accept-language': 'es-US,es-ES;q=0.9,es-CO;q=0.8,es-419;q=0.7,es;q=0.6,en;q=0.5,fr;q=0.4',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'content-type': 'application/json',
        expires: '0',
        pragma: 'no-cache',
        priority: 'u=1, i',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
        'x-authorized': '',
        'x-devid': 'e9788ed2-c50c-4627-a8ab-794749f1579aR',
        'x-sesid': '1736371181622',
        'x-token': ''
      },
      referrerPolicy: 'same-origin',
      body: JSON.stringify({
        id: '7342',
        parentId: '',
        histKey: '',
        name: '',
        changed: true,
        errors: '',
        json: JSON.stringify({
          method: 'GET',
          url: URIS.TIO_ANIME_VIDEO_URL.concat(id),
          apiNode: 'US',
          contentType: '',
          headers: 'Accept: application/json',
          errors: '',
          curlCmd: '',
          codeCmd: '',
          jsonCmd: '',
          xmlCmd: '',
          lang: '',
          auth: {
            auth: 'noAuth',
            bearerToken: '',
            basicUsername: '',
            basicPassword: '',
            customHeader: '',
            encrypted: ''
          },
          compare: false,
          idnUrl: URIS.TIO_ANIME_VIDEO_URL.concat(id)
        }),
        sessionId: 1736371181622,
        deviceId: 'e9788ed2-c50c-4627-a8ab-794749f1579aR'
      }),
      method: 'POST'
    })
    const text = await res.text()
    const data = JSON.parse(text) as { Content: string }
    const { $$ } = jQuery(data.Content)
    const $scripts = $$('script')

    const watchOnline: IServer[] = [...$scripts].reduce<IServer[]>((accumulatedServers, $script) => {
      const contents = $script.textContent ?? ''
      if (contents.includes('var videos = [') === true) {
        const videos = contents.split('var videos = ')[1].split(';')[0]
        const data: Array<[string, string, number, number]> = JSON.parse(videos)
        const serverList: IServer[] = data.map(([title, code]) => ({ server: title, title, code }))
        accumulatedServers.push(...serverList)
      }
      return accumulatedServers
    }, [])

    const listDownload = [...$$('.table-downloads tbody tr')].map(e => [...e.querySelectorAll('td')])
    const download: IServer[] = listDownload.reduce<IServer[]>((accumulatedServers, $element) => {
      const server = $element[0]?.textContent?.trim() ?? ''
      const code = $element[2]?.querySelector('a')?.getAttribute('href')?.trim() ?? ''
      accumulatedServers.push({ server, title: server, code })
      return accumulatedServers
    }, [])

    return {
      watchOnline,
      download
    }
  }
}

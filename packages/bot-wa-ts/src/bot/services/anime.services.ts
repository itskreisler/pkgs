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
  FLV_BROWSE_URL = 'https://animeflv.net/browse?',
  FLV_SEARCH_URL = 'https://animeflv.net/browse?q=',
  FLV_ANIME_VIDEO_URL = 'https://animeflv.net/ver/',
  FLV_BASE_EPISODE_IMG_URL = 'https://cdn.animeflv.net/screenshots/',
  LAT_BASE_URL = 'https://latanime.org/',
  LAT_ANIME_VIDEO_URL = 'https://latanime.org/ver/',
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
export function ScraperService() {
  return globalThis.fetch
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

/* const x = [...document.querySelectorAll('.episodes .episode')].map((e: HTMLElement) => ({
  episode: Number(e.innerText?.trim().match(/(\d+)$/).pop()),
  title: e.innerText?.trim().replace(/(\d+)$/, '').trim()
})) */

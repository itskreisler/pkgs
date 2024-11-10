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
  LAT_BASE_URL = 'https://latanime.org/'
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
  servers: IServer[]
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

}
ScraperService.fetchData = async (options: OptionsWithUrl): Promise<string> => {
  try {
    const response = await cloudscraper(options)
    return response
  } catch (error) {
    console.error('Error en fetch:', error)
    return ''
  }
}

// Interfaz que debe implementar cada scraper
interface ScraperInterface {
  latestEpisodesAdded?: () => Promise<IEpisodeAdded[]>
  AnimeServers?: (id: string) => Promise<IServer[]>
  latestAnimeAdded?: () => Promise<any[]>
  // Otros métodos necesarios
}
export class LatAnimeScraper implements ScraperInterface {
  async latestEpisodesAdded(): Promise<IEpisodeAdded[]> {
    const data = await ScraperService.fetchData({ uri: URIS.LAT_BASE_URL, headers: DEFAULT_HEADERS })
    const { $$ } = jQuery(data)
    const promises = [...$$('.col-6.col-md-6.col-lg-3.mb-3')].map(async ($element) => {
      const title = $element.querySelector('h2')?.textContent?.split(' - ')[1] ?? ''

      return {
        title
      }
    })

    return await Promise.all(promises)
  }
}
export class AnimeFLVScraper implements ScraperInterface {
  async latestEpisodesAdded(): Promise<IEpisodeAdded[]> {
    const data = await ScraperService.fetchData({ uri: URIS.FLV_BASE_URL, headers: DEFAULT_HEADERS })
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

  async AnimeServers (id: string): Promise<IServer[]> {
    const res = await cloudscraper(URIS.FLV_ANIME_VIDEO_URL.concat(id))
    const { $$ } = jQuery(res)
    const $scripts = $$('script')
    const servers: IServer[] = [...$scripts].reduce<IServer[]>((accumulatedServers, $script) => {
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
    return servers
  }
}
console.log('Hola mundo!!!!!!!!')
new LatAnimeScraper().latestEpisodesAdded().then(data => {
  console.log(JSON.stringify(data, null, 2))
})

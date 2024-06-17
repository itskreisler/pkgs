import { Iurls } from '@/interfaces/interfaces'

const BASE_JIKA_API = 'https://api.jikan.moe/v4/'
export const URLS: Iurls = {
  BASE_URL: 'https://animeflv.net',
  BROWSE_URL: 'https://animeflv.net/browse?',
  SEARCH_URL: 'https://animeflv.net/browse?q=',
  ANIME_VIDEO_URL: 'https://animeflv.net/ver/',
  BASE_EPISODE_IMG_URL: 'https://cdn.animeflv.net/screenshots/',
  BASE_JIKA_URL: `${BASE_JIKA_API}anime?q=`,
  BASE_JIKA_API,
  BASE_MYANIME_LIST_URL: 'https://myanimelist.net/character/'
}

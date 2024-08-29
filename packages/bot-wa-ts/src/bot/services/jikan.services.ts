import { createApi } from '@kreisler/createapi'
import JsGoogleTranslateFree from '@kreisler/js-google-translate-free'
export const en2es = async (text: string) => {
  let translation
  try {
    translation = await JsGoogleTranslateFree.translate({
      from: 'en',
      to: 'es',
      text
    })
  } catch {
    translation = ''
  }
  return translation
}
//
export const JIKAN_MOE_API_URL = 'https://api.jikan.moe/v4'
/** Enum: "tv","movie" "ova" "special" "ona" "music" "cm" "pv" "tv_special" */
export enum JikanApiTypes {
  'tv',
  'movie',
  'ova',
  'special',
  'ona',
  'music',
  'cm',
  'pv',
  'tv_special'
}
/**
 * Enum: "g" "pg" "pg13" "r17" "r" "rx"
 * Available Anime audience ratings
 * Ratings:
 * G - All Ages
 * PG - Children
 * PG-13 - Teens 13 or older
 * R - 17+ (violence & profanity)
 * R+ - Mild Nudity
 * Rx - Hentai
 */
export enum JikanApiStatus {
  'g',
  'pg',
  'pg13',
  'r17',
  'r',
  'rx'
}

export enum JikanApiOrderBy {
  'mal_id',
  'title',
  'start_date',
  'end_date',
  'episodes',
  'score',
  'scored_by',
  'rank',
  'popularity',
  'members',
  'favorites'
}
export enum JikanApiRandomTypes {
  anime = 'anime',
  manga = 'manga',
  characters = 'characters',
  people = 'people',
  users = 'users'
}
export type JikanApiRandomStr = keyof typeof JikanApiRandomTypes
export interface JikanApiParams {
  unapproved?: boolean
  page?: number
  limit?: number
  readonly q: string
  type?: keyof typeof JikanApiTypes
  score?: number
  min_score?: number
  max_score?: number
  status?: keyof typeof JikanApiStatus
  sfw?: boolean
  genres?: string // comma separated
  genres_exclude?: string // comma separated
  order_by?: keyof typeof JikanApiOrderBy
  sort?: 'desc' | 'asc'
  letter?: string
  producers?: string // comma separated
  /** Format: YYYY-MM-DD. e.g 2022, 2005-05, 2005-01-01 */
  start_date?: string
  /** Format: YYYY-MM-DD. e.g 2022, 2005-05, 2005-01-01 */
  end_date?: string
}
export interface JikanApi {
  anime: {
    (idfull: string): Promise<JikanResponseById>
    (id: number): Promise<JikanResponseById>
    (parametros: JikanApiParams): Promise<JikanResponse>
  }
  random: (type?: JikanApiRandomStr) => Promise<JikanResponseById>
}
export const jikanMoeApi: JikanApi = createApi(JIKAN_MOE_API_URL)
export const getAnimeSearch = async (q: string, limit: number = 10) => await jikanMoeApi.anime({ q, limit })
export const getAnimeById = async (id: number) => await jikanMoeApi.anime(id)
export const getAnimeFullById = async (id: number) => await jikanMoeApi.anime(id.toString().concat('/full'))
export const getRandom = async (type: JikanApiRandomStr = 'anime') => await jikanMoeApi.random(type)
//
export interface JikanResponseById {
  data: Daum
  status?: 404
  type?: 'BadResponseException'
  message?: 'Resource does not exist'
  error?: '404 on https://myanimelist.net/anime/12324/'
}
export interface JikanResponse {
  data: Daum[]
  pagination: Pagination
}

export interface Daum {
  mal_id: number
  url: string
  images: Images
  trailer: Trailer
  approved: boolean
  titles: Title[]
  title: string
  title_english: string
  title_japanese: string
  title_synonyms: string[]
  type: string
  source: string
  episodes: number
  status: string
  airing: boolean
  aired: Aired
  duration: string
  rating: string
  score: number
  scored_by: number
  rank: number
  popularity: number
  members: number
  favorites: number
  synopsis: string
  background: string
  season: string
  year: number
  broadcast: Broadcast
  producers: Producer[]
  licensors: Licensor[]
  studios: Studio[]
  genres: Genre[]
  explicit_genres: ExplicitGenre[]
  themes: Theme[]
  demographics: Demographic[]
}

export interface Images {
  jpg: MediaUrl
  webp: MediaUrl
}

export interface MediaUrl {
  image_url: string
  small_image_url: string
  large_image_url: string
}

export interface Trailer {
  youtube_id: string
  url: string
  embed_url: string
}

export interface Title {
  type: string
  title: string
}

export interface Aired {
  from: string
  to: string
  prop: Prop
}

export interface Prop {
  from: From
  to: To
  string: string
}

export interface From {
  day: number
  month: number
  year: number
}

export interface To {
  day: number
  month: number
  year: number
}

export interface Broadcast {
  day: string
  time: string
  timezone: string
  string: string
}

export interface Producer {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Licensor {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Studio {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Genre {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface ExplicitGenre {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Theme {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Demographic {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Pagination {
  last_visible_page: number
  has_next_page: boolean
  items: Items
}

export interface Items {
  count: number
  total: number
  per_page: number
}

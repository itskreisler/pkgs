export interface Iurls {
  BASE_URL: string
  BROWSE_URL: string
  SEARCH_URL: string
  ANIME_VIDEO_URL: string
  BASE_EPISODE_IMG_URL: string
  BASE_JIKA_URL: string
  BASE_JIKA_API: string
  BASE_MYANIME_LIST_URL: string
}
export interface IFlvFiltros {
  'genre[]': 'comedia'
  'year[]': number
  'type[]': 'tv' | 'movie'
  'status[]': number
  order: 'updated' | 'added'
  page: string
}
export type IFlvFiltrosPicked = Pick<IFlvFiltros, 'genre[]' | 'order' | 'page'>
export type IFlvFiltrosRecord = Record<keyof IFlvFiltrosPicked, IFlvFiltrosPicked[keyof IFlvFiltrosPicked]>
export interface IFlvFiltrosParams {
  genre: IFlvFiltros['genre[]']
  order: IFlvFiltros['order']
  page: IFlvFiltros['page']
}

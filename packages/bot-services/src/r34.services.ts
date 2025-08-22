import { createApi } from '@kreisler/createapi'
//
export enum R34Const {
  BASE = 'https://rule34.xxx',
  API = 'https://api.rule34.xxx',
  AUTOCOMPLETE = 'https://ac.rule34.xxx'
}
export interface R34APIValues {
  DAPI: 'dapi'
  POST: 'post'
  VIEW: 'view'
  COMMENT: 'comment'
  TAG: 'tag'
  LiST: 'list'
  INDEX: 'index'
}
interface R34APIParams {
  tags?: string
  page?: Extract<R34APIValues[keyof R34APIValues], R34APIValues['DAPI'] | R34APIValues['POST']>
  s?: Extract<R34APIValues[keyof R34APIValues], R34APIValues['POST'] | R34APIValues['VIEW'] | R34APIValues['COMMENT'] | R34APIValues['LiST']>
  q?: Extract<R34APIValues[keyof R34APIValues], R34APIValues['INDEX']>
  /** 1000 */
  limit?: number
  /** 0,1,2,3... */
  pid?: number
  json?: 1 | 0
  id?: number
  deleted?: 'show',
  api_key?: string
  user_id?: string
}
// Constante con valores predeterminados
const DEFAULT_R34_OPTIONS: R34APIParams = {
  page: 'dapi',
  s: 'post',
  q: 'index',
  json: 1,
  api_key: globalThis.atob('ZmEwN2YyMTA2ZTU3MTllMmJmYmIxYWUzODk0MjIzOGUwYWM4MjNiMDYwODhlNWNlZTZiNmFjNzg5ZjY5YzFlMDNhMzA0ZDhlMDM0ZGVmZWQ1ZWM3NjZlZTgyZjkwMWQwMTA5ZDA4YmEwNWVlZWZjYTI5MWFiMmIyZDM4MWVlNzQ='),
  user_id: '5265148'
}
export async function r34API(tag: string[], options: R34APIParams = {}): Promise<R34Response[]> {
  const { page, s, q, json, limit, pid, api_key, user_id } = { ...DEFAULT_R34_OPTIONS, ...options }

  const tags = tag.join(' ')
  const r34: R34API = createApi(R34Const.API)

  const data = await r34['index.php']({ tags, page, s, q, json, limit, pid, api_key, user_id })
  if (data.length < 1) return []
  return data
}
export function r34RandomPic(pics: R34Response[]): R34Response {
  const n = Math.floor(Math.random() * pics.length)
  return pics[n]
}
export async function r34Tags(query: string) {
  if (query.length === 0) return []
  const data = await globalThis.fetch(`https://ac.rule34.xxx/autocomplete.php?q=${query}`, {
    headers: {
      accept: '*/*',
      'accept-language': 'es-US,es-ES;q=0.9,es-CO;q=0.8,es-419;q=0.7,es;q=0.6,en;q=0.5,fr;q=0.4',
      priority: 'u=1, i',
      'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site'
    },
    referrer: 'https://rule34.xxx/',
    body: null,
    method: 'GET',
    mode: 'cors',
    credentials: 'omit'
  })
  return await data.json()
}
export async function _r34Tags(query: string) {
  if (query.length === 0) return []
  const r34: R34AC = createApi(R34Const.AUTOCOMPLETE)
  const data = await r34['autocomplete.php']({ q: query })
  return data
}
/* r34Tags('xilonen').then(async (tags) => {
  console.log(tags.map(t => t.label))
  if (tags.length < 1) return
  const [first] = tags
  const { label, value: tag } = first
  const count = label.match(/([\d]+)/gm)
  if (count != null && tag != null) {
    const limit = Number(count[0]) - 1
    console.log({ limit })
    const result = await r34API([tag], { limit })
    const random = r34RandomPic(result)
    console.log(random)
  }
}) */
//
export interface R34Response {
  preview_url: string
  sample_url: string
  file_url: string
  directory: number
  hash: string
  width: number
  height: number
  id: number
  image: string
  change: number
  owner: string
  parent_id: number
  rating: string
  sample: boolean
  sample_height: number
  sample_width: number
  score: number
  tags: string
  source: string
  status: string
  has_notes: boolean
  comment_count: number
}

interface R34API {
  'index.php': (params: R34APIParams) => Promise<R34Response[]>
}
export interface R34Tags { label: string, value: string, type: string }
interface R34AC {
  'autocomplete.php': (params: { q: string }) => Promise<R34Tags[]>
}

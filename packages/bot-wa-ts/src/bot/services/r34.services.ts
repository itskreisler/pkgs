import { createApi } from '@kreisler/createapi'
//
export enum R34Const {
  API = 'https://api.rule34.xxx',
  AUTOCOMPLETE = 'https://ac.rule34.xxx'
}
interface R34APIParams {
  tags?: string
  page?: 'dapi'
  s?: 'post'
  q?: 'index'
  limit?: number
  pid?: number
  json?: 1 | 0
}
export async function r34API(tag: string[], options: R34APIParams = {
  page: 'dapi',
  s: 'post',
  q: 'index'
}): Promise<R34Response[]> {
  const {
    page = 'dapi',
    s = 'post',
    q = 'index',
    json = 1
    // limit = 1000,
    // pid = 0,
  } = options
  const tags = tag.join(' ')
  const r34: R34API = createApi(R34Const.API)
  const data = await r34['index.php']({ tags, page, s, q, json, ...options })
  if (data.length < 1) return []
  return data
}
export function r34RandomPic(pics: R34Response[]): R34Response {
  const n = Math.floor(Math.random() * pics.length)
  return pics[n]
}

export async function r34Tags(query: string) {
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
  'index.php': (params: { tags: string, page: string, s: string, q: string, limit?: number, pid?: number, json: number }) => Promise<R34Response[]>
}
export interface R34Tags { label: string, value: string, type: string }
interface R34AC {
  'autocomplete.php': (params: { q: string }) => Promise<R34Tags[]>
}

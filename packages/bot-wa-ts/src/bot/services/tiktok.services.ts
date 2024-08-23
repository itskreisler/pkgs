const { fetch: fetchUrl } = globalThis

export enum TikTokTypes {
  DOMAIN = 'https://www.tikwm.com',
  PLAY = '/video/media/play/',
  WMPLAY = '/video/media/wmplay/',
  HDPLAY = '/video/media/hdplay/',
  COVER = '/video/cover/',
  MUSIC = '/video/music/'
}
export interface TikTokResponse {
  code: -1 | 0
  msg: 'success' | 'Url parsing is failed! Please check url.'
  processed_time: number
  data?: Data
  domain: TikTokTypes.DOMAIN
}

export interface Data {
  id: string
  region: string
  title: string
  cover: string
  duration: number
  play: string
  wmplay: string
  hdplay: string
  size: number | null
  wm_size: null | number
  hd_size: number | null
  music: string
  music_info: MusicInfo
  play_count: number
  digg_count: number
  comment_count: number
  share_count: number
  download_count: number
  collect_count: number
  create_time: number
  anchors: null
  anchors_extras: string
  is_ad: boolean
  commerce_info: CommerceInfo
  commercial_video_info: string
  item_comment_settings: number
  author: Author
  images?: string[]
}

export interface MusicInfo {
  id: string
  title: string
  play: string
  author: string
  original: boolean
  duration: number
  album: string
}

export interface CommerceInfo {
  adv_promotable: boolean
  auction_ad_invited: boolean
  bc_label_test_text?: string
  brand_organic_type?: number
  branded_content_type: number
  with_comment_filter_words: boolean
}

export interface Author {
  id: string
  unique_id: string
  nickname: string
  avatar: string
}

export const tikwm = async (
  url: string,
  op = {
    domain: TikTokTypes.DOMAIN,
    body: {
      url,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1
    }
  }
): Promise<TikTokResponse> => {
  return await new Promise((resolve, reject) => {
    const bodyParsed = new URLSearchParams(op.body as unknown as Record<string, string>).toString()
    fetchUrl(
            `${op.domain}/api/?${bodyParsed}`).then(async response => {
      if (response.ok) {
        return await response.text()
      }
      reject(new Error('Failed to fetch is not ok'))
    }).then((body) => {
      try {
        const data: TikTokResponse = { ...JSON.parse(body as string), domain: op.domain }
        resolve(data)
      } catch (error) {
        reject(new Error('Failed to parse JSON'))
      }
    }).catch(reject)
  })
}
export default () => {
  return {
    tikwm
  }
}

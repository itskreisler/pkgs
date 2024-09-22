import CryptoJS from 'crypto-js'

function encryptUrl (input: any): string {
  const key = CryptoJS.enc.Utf8.parse('qwertyuioplkjhgf')
  const iv = CryptoJS.lib.WordArray.random(16)

  const encrypted = CryptoJS.AES.encrypt(input, key, {
    iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })

  const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex)
  return encryptedHex
}
export interface InstaVideoData {
  video: Array<{ video: string, thumbnail: string }>
  image: string[]
  fetch?: boolean
  restricted?: boolean
  n?: boolean
  snapsave: boolean
}
export interface InstaVideoResult {
  resultsNumber: number
  urlList: string[]
  type: InstaVideoTypes
}
export type InstaVideoTypes = 'video' | 'thumbnail' | 'image'
export async function instagramGetUrl (urlMedia: string): Promise<InstaVideoResult> {
  // eslint-disable-next-line no-async-promise-executor
  return await new Promise(async (resolve, reject) => {
    try {
      const BASE_URL = 'https://backend.instavideosave.com/allinone'
      const headers = {
        url: encryptUrl(urlMedia)
      }
      const response = await globalThis.fetch(BASE_URL, {
        method: 'GET',
        headers
      })

      let data: InstaVideoData | null
      try {
        data = await response.json()
      } catch (err) {
        data = null
      }

      if (data === null) {
        reject(new Error('No se pudo obtener la información'))
        return
      }
      const urlList: string[] = []
      let type: InstaVideoTypes = 'video'
      if ('video' in data && data.video !== null) {
        data.video.forEach((infovideo: { video: string, thumbnail: string }) => {
          if (infovideo.video != null) {
            urlList.push(infovideo.video)
            type = 'video'
          } else {
            urlList.push(infovideo.thumbnail)
            type = 'thumbnail'
          }
        })
      }

      if ('image' in data && data.image !== null) {
        data.image.forEach((image: string) => {
          urlList.push(image)
        })
        type = 'image'
      }

      resolve({ resultsNumber: urlList.length, urlList, type })
    } catch (err) {
      reject(err)
    }
  })
}

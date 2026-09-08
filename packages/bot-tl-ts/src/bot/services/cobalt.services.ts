export interface CobaltOptions {
  apiUrl?: string
  videoQuality?: 'max' | '1080' | '720' | '480' | '360'
  audioFormat?: 'mp3' | 'opus' | 'ogg' | 'wav'
  downloadMode?: 'auto' | 'audio' | 'mute'
}

export interface CobaltPickerItem {
  type: 'photo' | 'video' | 'gif'
  url: string
  thumb?: string
}

export interface CobaltResponse {
  status: 'stream' | 'redirect' | 'picker' | 'error'
  url?: string
  filename?: string
  picker?: CobaltPickerItem[]
  audio?: string
  error?: {
    code: string
  }
}

export class CobaltService {
  private apiUrl: string

  constructor(apiUrl = 'https://api.cobalt.tools/') {
    this.apiUrl = apiUrl
  }

  async download(url: string, options: Omit<CobaltOptions, 'apiUrl'> = {}): Promise<CobaltResponse> {
    const body = {
      url,
      videoQuality: options.videoQuality ?? 'max',
      audioFormat: options.audioFormat ?? 'mp3',
      downloadMode: options.downloadMode ?? 'auto'
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`Cobalt API error: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as CobaltResponse
  }
}

import https from 'https'
import { Readable } from 'stream'
import fs, { type PathOrFileDescriptor } from 'fs'
import { type FileExtension, type MimeType, type FileTypeResult } from 'file-type'
//
export const fileTypeFromBuffer = async (args: Uint8Array | ArrayBuffer) => await import('file-type').then(async ({ fileTypeFromBuffer }) => await fileTypeFromBuffer(args))
//
export const saveFile = (filename: PathOrFileDescriptor, buffer: string | NodeJS.ArrayBufferView) => fs.writeFileSync(filename, buffer, { encoding: 'binary' })
//
export type FetchBuffer = Promise<{
  buffer: Buffer
  fileType: FileTypeResult | undefined
}>
//
export async function fetchBuffer(url: https.RequestOptions | string | URL): FetchBuffer {
  return await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks: Uint8Array[] = []
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks)
        const fileType = await fileTypeFromBuffer(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength))
        if (fileType === undefined) {
          const mimeType = res.headers['content-type'] ?? 'application/octet-stream'
          const mime = mimeType.split(';') as ['text/html', 'charset=UTF-8']
          const [, subtype] = mime[0].split('/') as ['text', 'html']
          resolve({ buffer, fileType: { ext: subtype as FileExtension, mime: mime[0] as MimeType } })
        }
        resolve({ buffer, fileType })
      })
    }).on('error', (error) => {
      reject(error)
    })
  })
}
export const nodeFetchBuffer = async (url: URL | RequestInfo): FetchBuffer => {
  const response = await globalThis.fetch(url)
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  const fileType = await fileTypeFromBuffer(arrayBuffer)
  const buffer = Buffer.from(arrayBuffer)
  if (fileType === undefined) {
    const mimeType = response.headers.get('Content-Type') ?? 'application/octet-stream'
    console.log({ mimeType })
    const mime = mimeType.split(';') as ['text/html', 'charset=UTF-8']
    const [, subtype] = mime[0].split('/') as ['text', 'html']
    return await Promise.resolve({ buffer, fileType: { ext: subtype as FileExtension, mime: mime[0] as MimeType } })
  }
  return await Promise.resolve({ buffer, fileType })
}
enum FileSizeUnit {
  'kilobyte' = 'kilobyte',
  'megabyte' = 'megabyte'
}
export const formatter = (size: number, { unit = 'kilobyte' }: {
  unit: keyof typeof FileSizeUnit
}) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'unit',
    unit,
    unitDisplay: 'short', // Otras opciones: 'long', 'narrow'
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(FileSizeUnit.kilobyte === unit ? (size / 1024) : (size / 1024 / 1024))
}

//
export async function getStreamFromUrl(url: string) {
  const response = await globalThis.fetch(url)

  if (!response.ok) {
    throw new Error(`Error al obtener la URL: ${response.statusText}`)
  }

  // Convertimos el ReadableStream de la respuesta a un Readable de Node.js
  const nodeReadableStream = (response.body != null) ? Readable.from(response.body) : null

  return nodeReadableStream as Readable
}

//
export const sleep = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms))
/*
globalThis.fetch('https://www.tikwm.com/video/media/play/7407636590996114693.mp4')
  .then(async r => await r.arrayBuffer())
  .then(async (data) => {
    console.log(data)
    const fileType = await fileTypeFromBuffer(data)
    console.log(fileType)
    const buffer = Buffer.from(data)
    saveFile(Date.now().toString().concat('.', fileType?.ext), buffer)
  })
*/

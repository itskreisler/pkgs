import https from 'https'
import { Readable } from 'stream'
import fs, { type PathOrFileDescriptor } from 'fs'
import { type FileExtension, type MimeType, type FileTypeResult } from 'file-type'
//
export const fileTypeFromBuffer = async (args: Uint8Array | ArrayBuffer): Promise<FileTypeResult | undefined> => await import('file-type').then(async ({ fileTypeFromBuffer }) => await fileTypeFromBuffer(args))
//
export const saveFile = (filename: PathOrFileDescriptor, buffer: string | NodeJS.ArrayBufferView): void => fs.writeFileSync(filename, buffer, { encoding: 'binary' })
//
export type FetchBuffer = Promise<{
  buffer: Buffer
  fileType: FileTypeResult | undefined
}>
//
export function bufferToUint8Array (buffer: Buffer): Uint8Array {
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}
export async function fetchBuffer (url: https.RequestOptions | string | URL): FetchBuffer {
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
export async function getStreamFromUrl (url: string): Promise<Readable> {
  const response = await globalThis.fetch(url)

  if (!response.ok) {
    throw new Error(`Error al obtener la URL: ${response.statusText}`)
  }

  // Convertimos el ReadableStream de la respuesta a un Readable de Node.js
  const nodeReadableStream = (response.body != null) ? Readable.from(response.body) : null

  return nodeReadableStream as Readable
}
export async function convertStreamToBuffer (stream: Readable): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    stream.on('data', (chunk) => {
      chunks.push(chunk)
    })
    stream.on('end', async () => {
      const buffer = Buffer.concat(chunks)
      resolve(buffer)
    })
    stream.on('error', async (error) => {
      reject(error)
    })
  })
}
//
export class Cadena extends String {
  endsWithV2 (searchString: string[]) {
    return searchString.some((search) => this.endsWith(search))
  }

  startsWithV2 (searchString: string[]) {
    return searchString.some((search) => this.startsWith(search))
  }
}

//
export const sleep = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms))

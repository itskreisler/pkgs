import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { debounce } from '@kreisler/debounce'
import type {
  ExtendedStateStorage,
  JsonStorageOptions,
  StorageData
} from '@/types'

/**
 * Crea un sistema de almacenamiento persistente basado en archivos JSON con soporte para TTL (Time To Live),
 * compresión y debouncing para optimizar el rendimiento.
 * 
 * @param {string} file_path - Ruta del archivo JSON donde se almacenarán los datos.
 *   Ejemplos: './storage.json', './tmp/cache/data.json', '../../config.json'
 * @param {JsonStorageOptions} options - Opciones de configuración para el almacenamiento
 * @param {number} [options.debounceMs=1000] - Tiempo de debounce en milisegundos para agrupar escrituras (0 para desactivar)
 * @param {boolean} [options.useCompression=true] - Activar compresión gzip para ahorrar espacio en disco
 * 
 * @returns {ExtendedStateStorage} Un objeto que implementa StateStorage con métodos adicionales
 * 
 * @example
 * ```typescript
 * // Uso básico
 * const storage = jsonStorage('./my-app-data.json')
 * 
 * // Con opciones personalizadas
 * const fastStorage = jsonStorage('./cache.json', {
 *   debounceMs: 500,     // Escribir más frecuentemente
 *   useCompression: false // Sin compresión para mejor rendimiento
 * })
 * 
 * // Uso con Zustand
 * import { createJSONStorage } from 'zustand/middleware'
 * 
 * const store = create(
 *   persist(stateCreator, {
 *     name: 'my-store',
 *     storage: createJSONStorage(() => jsonStorage('./store.json'))
 *   })
 * )
 * ```
 * 
 * @since 1.0.0
 */
export function jsonStorage(file_path = './storage.json', options: JsonStorageOptions = {}): ExtendedStateStorage {
  const { debounceMs = 1000, useCompression = true } = options
  // Asegúrate de que el archivo exista
  const filePath = file_path.endsWith('.json') ? file_path : file_path.concat('.json')
  // Crear directorios de forma recursiva si se para un ./tmp/a/b/c.json
  const dirPath = path.dirname(filePath)
  fs.mkdirSync(dirPath, { recursive: true })
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}))
  }

  const readStorage = (): StorageData => {
    try {
      const data = fs.readFileSync(filePath, 'utf-8')
      if (data.trim() === '') return {}
      // Soporte para datos no comprimidos (legacy) y comprimidos
      try {
        const buffer = Buffer.from(data, 'base64')
        const decompressed = zlib.gunzipSync(buffer).toString()
        return JSON.parse(decompressed)
      } catch {
        return JSON.parse(data)
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
      console.error('Failed to read or parse storage file:', error)
      return {}
    }
  }

  const _writeStorage = (data: StorageData) => {
    let content = JSON.stringify(data, null, 2)
    if (useCompression) {
      content = zlib.gzipSync(content).toString('base64')
    }
    fs.writeFileSync(filePath, content)
  }

  const writeStorage = debounceMs > 0
    ? debounce(_writeStorage, debounceMs) as (data: StorageData) => void
    : _writeStorage

  return {
    getItem(key: string): string | null {
      const storage = readStorage()
      if (Object.hasOwn(storage, key)) {
        const item = storage[key]
        if (item.expire === null || item.expire > Date.now()) {
          return item.value
        }
        // Item has expired, remove it
        this.removeItem(key)
        return null
      }
      return null
    },

    setItem(key: string, value: string): void {
      const storage = readStorage()
      storage[key] = { value, expire: null }
      writeStorage(storage)
    },

    setItemWithTTL(key: string, value: string, ttl?: number): void {
      const storage = readStorage()
      const expire = ttl ? Date.now() + ttl * 1000 : null
      storage[key] = { value, expire }
      writeStorage(storage)
    },

    removeItem(key: string): void {
      const storage = readStorage()
      if (Object.hasOwn(storage, key) === true) {
        const newStorage = { ...storage }
        Reflect.deleteProperty(newStorage, key)
        writeStorage(newStorage)
      }
    },

    getRawStore: () => readStorage(),

    clear: () => {
      writeStorage({})
    }
  }
}

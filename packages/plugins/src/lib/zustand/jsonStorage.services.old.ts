import fs from 'fs'
import path from 'path'

/**
 * 
 * @param {string} file_path - ejemplo: './storage.json' o './tmp/a/b/c.json' o '../../storage.json'
 * @returns 
 */
export function jsonStorageLegacy(file_path = './storage.json') {
  // Asegúrate de que el archivo exista
  const filePath = file_path.endsWith('.json') ? file_path : file_path.concat('.json')
  // Crear directorios de forma recursiva si se para un ./tmp/a/b/c.json
  const dirPath = path.dirname(filePath)
  fs.mkdirSync(dirPath, { recursive: true })
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}))
  }

  const readStorage = (): Record<string, string> => {
    const data = fs.readFileSync(filePath, 'utf-8')
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }

  const writeStorage = (data: Record<string, string>) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  }

  return {
    get length() {
      return Object.keys(readStorage()).length
    },

    clear() {
      writeStorage({})
    },

    getItem(key: string): string | null {
      const storage = readStorage()
      return Object.hasOwn(storage, key) === true ? storage[key] : null
    },

    key(index: number): string | null {
      const keys = Object.keys(readStorage())
      return keys[index] ?? null
    },

    removeItem(key: string): void {
      const storage = readStorage()
      if (Object.hasOwn(storage, key) === true) {
        // delete storage[key]
        // writeStorage(storage)
        const { [key]: _, ...newStorage } = storage
        writeStorage(newStorage)
      }
    },

    setItem(key: string, value: string): void {
      const storage = readStorage()
      storage[key] = value
      writeStorage(storage)
    },
    setItems(items: Record<string, string>) {
      const storage = readStorage()
      for (const key in items) {
        storage[key] = items[key]
      }
      writeStorage(storage)
    }

  }
}

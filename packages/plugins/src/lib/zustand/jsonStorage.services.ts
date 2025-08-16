import fs from 'fs'
import path from 'path'

/**
 * 
 * @param {string} file_path - ejemplo: './storage.json' o './tmp/a/b/c.json' o '../../storage.json'
 * @returns 
 */
export function jsonStorage(file_path = './storage.json') {
  // Asegúrate de que el archivo exista
  const filePath = file_path.endsWith('.json') ? file_path : file_path.concat('.json')
  // Crear directorios de forma recursiva si se para un ./tmp/a/b/c.json
  const dirPath = path.dirname(filePath)
  fs.mkdirSync(dirPath, { recursive: true })
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}))
  }

  type StorageData = Record<string, { value: string; expire: number | null }>;

  const readStorage = (): StorageData => {
    const data = fs.readFileSync(filePath, 'utf-8')
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }

  const writeStorage = (data: StorageData) => {
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
      if (Object.hasOwn(storage, key)) {
          const item = storage[key];
          if (item.expire === null || item.expire > Date.now()) {
              return item.value;
          }
          // Item has expired, remove it
          this.removeItem(key);
          return null;
      }
      return null
    },

    key(index: number): string | null {
      const keys = Object.keys(readStorage())
      return keys[index] ?? null
    },

    removeItem(key: string): void {
      const storage = readStorage()
      if (Object.hasOwn(storage, key) === true) {
        const { [key]: _, ...newStorage } = storage
        writeStorage(newStorage)
      }
    },

    setItem(key: string, value: string, expire: number | null = null): void {
      const storage = readStorage()
      storage[key] = { value, expire }
      writeStorage(storage)
    },

    setItems(items: Record<string, string>, expire: number | null = null) {
      const storage = readStorage()
      for (const key in items) {
        storage[key] = { value: items[key], expire }
      }
      writeStorage(storage)
    },

    getRawStore: () => readStorage()
  }
}

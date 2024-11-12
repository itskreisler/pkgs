import fs from 'fs'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
export function jsonStorage(filePath: string = './storage.json') {
  // Asegúrate de que el archivo exista
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
    }
  }
}
//
export const useFishStore = create(
  persist<{
    fishes: number
    addAFish: () => void
  }>((set, get) => ({
        fishes: 0,
        addAFish: () => set({ fishes: get().fishes + 1 })
      }),
      {
        name: 'news-storage',
        storage: createJSONStorage(() => jsonStorage('./fishes.json'))
      }
      ))

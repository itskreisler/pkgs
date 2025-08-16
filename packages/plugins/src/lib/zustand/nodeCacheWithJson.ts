import NodeCache from 'node-cache'
import { jsonStorage } from './jsonStorage.services'
import { nodeCacheStorage } from './nodeCache'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore as create, type StateCreator } from 'zustand/vanilla'

export function nodeCacheWithJson(
  options: NodeCache.Options,
  file_path: string
) {
  const myCache = new NodeCache(options)
  const json = jsonStorage(file_path)

  // Rehidratar desde JSON al iniciar
  const allData = json.getRawStore()
  for (const key in allData) {
    const item = allData[key]
    if (item.expire === null) {
      myCache.set(key, item.value)
    } else {
      const remainingTtl = (item.expire - Date.now()) / 1000
      if (remainingTtl > 0) {
        myCache.set(key, item.value, remainingTtl)
      } else {
        // Si ya expiró, bórralo del JSON
        json.removeItem(key)
      }
    }
  }

  // Escuchar el evento de expiración para borrar del JSON
  myCache.on('expired', (key) => {
    json.removeItem(key)
    console.log(`Key '${key}' expired and was removed from jsonStorage.`);
  });


  return {
    getItem: (name: string): string | null => {
      const value = myCache.get<string>(name)
      if (value) {
        return value
      }
      // No es necesario volver a consultar el JSON aquí porque ya está todo en la caché
      return null
    },
    setItem: (name: string, value: string, ttl?: number) => {
      const newTtl = ttl ?? options.stdTTL
      myCache.set(name, value, newTtl)
      const expire = newTtl ? Date.now() + newTtl * 1000 : null
      json.setItem(name, value, expire)
    },
    removeItem: (name: string) => {
      myCache.del(name)
      json.removeItem(name)
    }
  }
}

export const useNodeCacheWithJson = <S>(
  config: {
      nameStorage: string
      initialState: StateCreator<S>
      replacer?: (key: string, value: any) => any
      reviver?: (key: string, value: any) => any
  }
) => create(
  persist<S>(config.initialState, {
      name: config.nameStorage,
      storage: createJSONStorage(() => nodeCacheWithJson({ stdTTL: 3600 }, config.nameStorage), {
          replacer: config.replacer,
          reviver: config.reviver
      })
  })
)

import NodeCache from 'node-cache'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore as create, type StateCreator } from 'zustand/vanilla'
import type { PersistentStorage } from './storage'
import NodeCache from 'node-cache'

export function nodeCacheWithJson(
  options: NodeCache.Options,
  persistentStorage: PersistentStorage
) {
  const myCache = new NodeCache(options)

  // Rehidratar desde el almacenamiento persistente al iniciar
  Promise.resolve(persistentStorage.getRawStore()).then(allData => {
    for (const key in allData) {
      const item = allData[key]
      if (item.expire === null) {
        myCache.set(key, item.value)
      } else {
        const remainingTtl = (item.expire - Date.now()) / 1000
        if (remainingTtl > 0) {
          myCache.set(key, item.value, remainingTtl)
        } else {
          // Si ya expiró, bórralo del almacenamiento persistente
          persistentStorage.removeItem(key)
        }
      }
    }
  })

  // Escuchar el evento de expiración para borrar del almacenamiento persistente
  myCache.on('expired', (key) => {
    persistentStorage.removeItem(key as string)
    console.log(`Key '${key}' expired and was removed from persistent storage.`);
  });


  return {
    getItem: (name: string): string | null => {
      return myCache.get<string>(name) ?? null
    },
    setItem: (name: string, value: string, ttl?: number) => {
      const newTtl = ttl ?? options.stdTTL
      myCache.set(name, value, newTtl)
      const expire = newTtl ? Date.now() + newTtl * 1000 : null
      // El setItem del storage persistente ahora es "fire and forget" en el contexto de la caché
      Promise.resolve(persistentStorage.setItem(name, value, expire)).catch(err => {
        console.error("Failed to write to persistent storage:", err)
      })
    },
    removeItem: (name: string) => {
      myCache.del(name)
      Promise.resolve(persistentStorage.removeItem(name)).catch(err => {
        console.error("Failed to remove from persistent storage:", err)
      })
    }
  }
}

export const useNodeCacheWithJson = <S>(
  config: {
      nameStorage: string
      initialState: StateCreator<S>
      storage: PersistentStorage
      replacer?: (key: string, value: any) => any
      reviver?: (key: string, value: any) => any
  }
) => create(
  persist<S>(config.initialState, {
      name: config.nameStorage,
      storage: createJSONStorage(() => nodeCacheWithJson({ stdTTL: 3600 }, config.storage), {
          replacer: config.replacer,
          reviver: config.reviver
      })
  })
)

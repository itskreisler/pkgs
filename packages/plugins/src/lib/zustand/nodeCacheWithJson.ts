import NodeCache from 'node-cache'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore as create, type StateCreator } from 'zustand/vanilla'
import type { ExtendedStateStorage, NodeCacheWithJsonConfig } from '@/types'

export function nodeCacheWithJson(
  options: NodeCache.Options,
  persistentStorage: ExtendedStateStorage
) {
  const myCache = new NodeCache(options)

  // Rehidratar desde el almacenamiento persistente al iniciar
  if (persistentStorage.getRawStore) {
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
  }

  // Escuchar el evento de expiración para borrar del almacenamiento persistente
  myCache.on('expired', (key) => {
    persistentStorage.removeItem(key as string)
    console.log(`Key '${key}' expired and was removed from persistent storage.`)
  })

  return {
    getItem: (name: string): string | null => {
      return myCache.get<string>(name) ?? null
    },
    setItem: (name: string, value: string, ttl?: number) => {
      const newTtl = ttl ?? options.stdTTL
      if (newTtl !== undefined) {
        myCache.set(name, value, newTtl)
      } else {
        myCache.set(name, value)
      }
      const expire = newTtl !== undefined ? Date.now() + newTtl * 1000 : null
      // El setItem del storage persistente ahora es "fire and forget" en el contexto de la caché
      if (persistentStorage.setItemWithTTL && expire !== null) {
        Promise.resolve(persistentStorage.setItemWithTTL(name, value, newTtl)).catch(err => {
          console.error('Failed to write to persistent storage:', err)
        })
      } else {
        Promise.resolve(persistentStorage.setItem(name, value)).catch(err => {
          console.error('Failed to write to persistent storage:', err)
        })
      }
    },
    removeItem: (name: string) => {
      myCache.del(name)
      Promise.resolve(persistentStorage.removeItem(name)).catch(err => {
        console.error('Failed to remove from persistent storage:', err)
      })
    }
  }
}

export const useNodeCacheWithJson = <S>(
  config: NodeCacheWithJsonConfig & { initialState: StateCreator<S> }
) => create(
  persist<S>(config.initialState, {
    name: config.nameStorage,
    storage: createJSONStorage(() => nodeCacheWithJson({ stdTTL: 3600 }, config.storage), {
      replacer: config.replacer,
      reviver: config.reviver
    })
  })
)


import NodeCache from 'node-cache'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore as create, type StateCreator } from 'zustand/vanilla'
import type { ExtendedStateStorage, NodeCacheWithJsonConfig } from '@/types'

/**
 * Crea un sistema de almacenamiento híbrido que combina una caché en memoria rápida (NodeCache) 
 * con almacenamiento persistente en disco. Proporciona el mejor rendimiento para lecturas frecuentes
 * mientras mantiene la persistencia de datos.
 * 
 * @param {NodeCache.Options} options - Configuración para la caché en memoria
 * @param {number} [options.stdTTL] - Tiempo de vida por defecto en segundos para elementos en caché
 * @param {number} [options.checkperiod] - Período de verificación para limpiar elementos expirados
 * @param {ExtendedStateStorage} persistentStorage - Sistema de almacenamiento persistente (ej: jsonStorage)
 * 
 * @returns {StateStorage} Un objeto compatible con StateStorage que maneja caché + persistencia
 * 
 * @example
 * ```typescript
 * import { jsonStorage } from './jsonStorage.services'
 * 
 * // Crear almacenamiento híbrido
 * const hybridStorage = nodeCacheWithJson(
 *   { stdTTL: 3600 }, // Caché de 1 hora
 *   jsonStorage('./persistent-data.json')
 * )
 * 
 * // Uso directo
 * hybridStorage.setItem('user:123', JSON.stringify(userData))
 * const cached = hybridStorage.getItem('user:123') // Muy rápido desde RAM
 * 
 * // Uso con Zustand
 * const store = create(
 *   persist(stateCreator, {
 *     name: 'fast-store',
 *     storage: createJSONStorage(() => hybridStorage)
 *   })
 * )
 * ```
 * 
 * @since 1.0.0
 */
export function nodeCacheWithJson(
  options: NodeCache.Options,
  persistentStorage: ExtendedStateStorage
) {
  const myCache = new NodeCache(options)

  // Rehidratar desde el almacenamiento persistente al iniciar (SINCRONO)
  if (persistentStorage.getRawStore) {
    console.log('🔄 Iniciando rehidratación SINCRÓNICA desde almacenamiento persistente...')
    try {
      // jsonStorage.getRawStore() es sincrónico, no devuelve Promise
      const allData = persistentStorage.getRawStore()

      console.log('📦 Datos encontrados en almacenamiento persistente:', allData)
      for (const key in allData) {
        const item = allData[key]
        console.log(`🔑 Procesando clave '${key}':`, { expire: item.expire, hasValue: !!item.value })
        if (item.expire === null) {
          myCache.set(key, item.value)
          console.log(`✅ Clave '${key}' cargada sin expiración`)
        } else {
          const remainingTtl = (item.expire - Date.now()) / 1000
          console.log(`⏰ TTL restante para '${key}': ${remainingTtl}s`)
          if (remainingTtl > 0) {
            myCache.set(key, item.value, remainingTtl)
            console.log(`✅ Clave '${key}' cargada con TTL ${remainingTtl}s`)
          } else {
            // Si ya expiró, bórralo del almacenamiento persistente
            persistentStorage.removeItem(key)
            console.log(`❌ Clave '${key}' expirada, eliminada del almacenamiento`)
          }
        }
      }
      console.log('🎉 Rehidratación SINCRÓNICA completada. Claves en caché:', myCache.keys())
    } catch (err) {
      console.error('💥 Error durante rehidratación sincrónica:', err)
    }
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

/**
 * Hook de conveniencia que crea una store de Zustand con almacenamiento híbrido
 * (caché en memoria + persistencia en disco) preconfigurado.
 * 
 * @template S - Tipo del estado de la store
 * @param {NodeCacheWithJsonConfig & { initialState: StateCreator<S> }} config - Configuración del hook
 * @param {string} config.nameStorage - Nombre único para el almacenamiento persistente
 * @param {StateCreator<S>} config.initialState - Función que define el estado inicial y acciones
 * @param {ExtendedStateStorage} config.storage - Sistema de almacenamiento persistente
 * @param {function} [config.replacer] - Función personalizada para serializar JSON
 * @param {function} [config.reviver] - Función personalizada para deserializar JSON
 * 
 * @returns {StoreApi<S>} Una store de Zustand con persistencia híbrida
 * 
 * @example
 * ```typescript
 * import { jsonStorage } from './jsonStorage.services'
 * 
 * // Definir la store con estado tipado
 * const useUserStore = useNodeCacheWithJson({
 *   nameStorage: 'user-store',
 *   storage: jsonStorage('./user-data.json'),
 *   initialState: (set, get) => ({
 *     users: [],
 *     currentUser: null,
 *     addUser: (user) => set((state) => ({ 
 *       users: [...state.users, user] 
 *     })),
 *     setCurrentUser: (userId) => set((state) => ({
 *       currentUser: state.users.find(u => u.id === userId)
 *     }))
 *   })
 * })
 * 
 * // Usar en componentes
 * const Component = () => {
 *   const { users, addUser } = useUserStore()
 *   // Datos se cargan automáticamente desde el almacenamiento
 *   // y se guardan automáticamente en cada cambio
 * }
 * ```
 * 
 * @since 1.0.0
 */
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


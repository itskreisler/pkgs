import { createStore as create, type StateCreator } from 'zustand/vanilla'
// import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { nodeCacheWithJson } from '@/lib/zustand/nodeCacheWithJson'
import type { ExtendedStateStorage } from '@/types'
import { jsonStorageLegacy } from '@/lib/zustand/jsonStorage.services.old'
import { nodeCacheStorage } from '@/lib/zustand/nodeCache'

/**
 * Hook simplificado para crear stores de Zustand con persistencia automática usando
 * almacenamiento híbrido (memoria + disco). Proporciona una API sencilla para casos de uso comunes.
 * 
 * @template S - Tipo del estado de la store
 * @param {Object} config - Configuración de la store persistente
 * @param {string} config.nameStorage - Nombre único para identificar el almacenamiento
 * @param {StateCreator<S>} config.initialState - Función que define el estado inicial y las acciones
 * @param {function} [config.replacer] - Función para personalizar la serialización JSON
 * @param {function} [config.reviver] - Función para personalizar la deserialización JSON
 * 
 * @returns {StoreApi<S>} Store de Zustand con persistencia híbrida preconfigurada
 * 
 * @example
 * ```typescript
 * // Store simple de contador
 * const useCounterStore = usePersist<{
 *   count: number
 *   increment: () => void
 *   decrement: () => void
 *   reset: () => void
 * }>({
 *   nameStorage: 'counter',
 *   initialState: (set) => ({
 *     count: 0,
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *     decrement: () => set((state) => ({ count: state.count - 1 })),
 *     reset: () => set({ count: 0 })
 *   })
 * })
 * 
 * // Store de configuración de usuario
 * const useSettingsStore = usePersist<{
 *   theme: 'light' | 'dark'
 *   language: string
 *   notifications: boolean
 *   updateSetting: (key: string, value: any) => void
 * }>({
 *   nameStorage: 'user-settings',
 *   initialState: (set) => ({
 *     theme: 'light',
 *     language: 'es',
 *     notifications: true,
 *     updateSetting: (key, value) => set({ [key]: value })
 *   })
 * })
 * 
 * // Usar en componentes React
 * const Counter = () => {
 *   const { count, increment, decrement } = useCounterStore()
 *   return (
 *     <div>
 *       <span>{count}</span>
 *       <button onClick={increment}>+</button>
 *       <button onClick={decrement}>-</button>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @since 1.0.0
 */
export const usePersist = <S>(
    config: {
        nameStorage: string
        initialState: StateCreator<S>
        replacer?: (key: string, value: any) => any
        reviver?: (key: string, value: any) => any
    }
) => create(
    persist<S>(config.initialState, {
        name: config.nameStorage,
        storage: createJSONStorage(() => jsonStorageLegacy(config.nameStorage), {
            replacer: config.replacer,
            reviver: config.reviver
        })
    })
)
//
export const useNodeCacheWithJson = <S>(
    config: {
        nameStorage: string
        initialState: StateCreator<S>
        storage: ExtendedStateStorage
        replacer?: (key: string, value: any) => any
        reviver?: (key: string, value: any) => any
    }
) => create(
    persist<S>(config.initialState, {
        name: config.nameStorage,
        storage: createJSONStorage(() => nodeCacheWithJson({ stdTTL: 3600, checkperiod: 60 }, config.storage), {
            replacer: config.replacer,
            reviver: config.reviver
        })
    })
)
//
export const useNodeCache = <S>(
    config: {
        nameStorage: string
        initialState: StateCreator<S>
    }
) => create(
    persist<S>(config.initialState, {
        name: config.nameStorage,
        storage: createJSONStorage(() => nodeCacheStorage({ stdTTL: 10, checkperiod: 2 }))
    })
)

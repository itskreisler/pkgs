import { createStore as create, type StateCreator } from 'zustand/vanilla'
// import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { jsonStorage } from '@/lib/zustand/jsonStorage.services'
import { nodeCacheWithJson } from '@/lib/zustand/nodeCacheWithJson'
import type { ExtendedStateStorage, PersistConfig } from '@/types'
import { jsonStorageLegacy } from './jsonStorage.services.old'

/**
 * 
 * @example
 * export const useCounterStore = usePersist<{
 * count: number
 * increment: () => void
 * decrement: () => void
 * reset: () => void
 * updateField: (field: string, value: any) => void
 * }>({
 *    nameStorage: 'counter',
 *    initialState: (set) => ({
 *      count: 0,
 *      increment: () => set((state) => ({ count: state.count + 1 })),
 *      decrement: () => set((state) => ({ count: state.count - 1 })),
 *      reset: () => set({ count: 0 }),
 *      updateField: (field, value) => set({ [field]: value })
 *    })
 *  })
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
        storage: createJSONStorage(() => nodeCacheWithJson({ stdTTL: 3600 }, config.storage), {
            replacer: config.replacer,
            reviver: config.reviver
        })
    })
)

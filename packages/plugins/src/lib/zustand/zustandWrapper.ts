import { createStore as create, type StateCreator } from 'zustand/vanilla'
// import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { jsonStorage } from '@/lib/zustand/jsonStorage.services'
/**
 * 
 * @example
 * export const useCounterStore = useStore<{
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
        storage: createJSONStorage(() => jsonStorage(config.nameStorage), {
            replacer: config.replacer,
            reviver: config.reviver
        })
    })
)

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES

import { describe, it, afterEach, before, after, beforeEach } from 'node:test'

import assert from 'node:assert'

// » IMPORT MODULES
import { jsonStorage } from '@/index'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// borrar los archivos json
import fs from 'fs'
import { usePersist } from '@/lib/zustand/zustandWrapper'
const TEMP_STORAGE_PATH = 'temp-large-test'
const storage = jsonStorage(TEMP_STORAGE_PATH)

const LARGE_DATASET_SIZE = 10_000 // puedes subir a 100_000 si quieres ponerlo a sudar uwu
const TEST_KEYS = Array.from({ length: LARGE_DATASET_SIZE }, (_, i) => `key_${i}`)
const TEST_DATA = Object.fromEntries(TEST_KEYS.map(k => [k, `value_for_${k}`]))
before(() => {
    // limpiar archivo si ya existe
    if (fs.existsSync(TEMP_STORAGE_PATH)) {
        fs.unlinkSync(TEMP_STORAGE_PATH)
    }
})

after(() => {
    // limpiar archivo después del test
    if (fs.existsSync(TEMP_STORAGE_PATH)) {
        fs.unlinkSync(TEMP_STORAGE_PATH)
    }
    const files = ['./counter.json', './user.json']
    files.forEach((file) => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
    })
})

describe('usePersist', () => {
    it('should return state counter', () => {
        const useCounterStore = usePersist<{
            count: number
            increment: () => void
            decrement: () => void
            reset: () => void
        }>({
            nameStorage: 'counter',
            initialState: (set) => ({
                count: 0,
                increment: () => set((state) => ({ count: state.count + 1 })),
                decrement: () => set((state) => ({ count: state.count - 1 })),
                reset: () => set({ count: 0 })
            })
        })
        const { getState } = useCounterStore
        getState().increment()
        assert.strictEqual(getState().count, 1)
        getState().increment()
        assert.strictEqual(getState().count, 2)
        getState().decrement()
        assert.strictEqual(getState().count, 1)
        getState().reset()
        assert.strictEqual(getState().count, 0)

    })
    it('should return state user', () => {
        const useUserStore = usePersist<{
            id: number
            name: string
            email: string
            isActive: boolean
            setUser: (user: { id: number; name: string; email: string }) => void
        }>({
            nameStorage: 'user',
            initialState: (set) => ({
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                isActive: true,
                setUser: (user) => set(() => ({ ...user }))

            })
        })
        const { getState } = useUserStore
        assert.strictEqual(getState().id, 1)
        assert.strictEqual(getState().name, 'John Doe')
        getState().setUser({
            id: 2,
            name: 'Jane Doe',
            email: 'jane.doe@example.com'
        })
        assert.strictEqual(getState().id, 2)
        assert.strictEqual(getState().name, 'Jane Doe')
    })

    it('should set a large number of items efficiently (batch)', () => {
        console.time('setItems_batch')
        storage.setItems(TEST_DATA)
        console.timeEnd('setItems_batch')

        const sampleKey = 'key_5000'
        const value = storage.getItem(sampleKey)
        assert.strictEqual(value, TEST_DATA[sampleKey], 'Batch insert failed for key_5000')
    })

    it('should remove items correctly', () => {
        storage.removeItem('key_5000')
        const removed = storage.getItem('key_5000')
        assert.strictEqual(removed, null, 'Item should have been removed')
    })

    it('should return correct length', () => {
        const expectedLength = Object.keys(TEST_DATA).length - 1 // porque borramos uno uwu
        assert.strictEqual(storage.length, expectedLength, 'Storage length is incorrect')
    })

    it('should clear all items', () => {
        storage.clear()
        assert.strictEqual(storage.length, 0, 'Storage should be empty after clear')
    })

})


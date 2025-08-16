import { describe, it, after, before, beforeEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs'
import zlib from 'zlib'
import { jsonStorage } from '../src/lib/zustand/jsonStorage.services'
import { usePersist } from '../src/lib/zustand/zustandWrapper'

const COUNTER_FILE = './counter.json'
const USER_FILE = './user.json'

describe('usePersist', () => {
    beforeEach(() => {
        if (fs.existsSync(COUNTER_FILE)) fs.unlinkSync(COUNTER_FILE)
        if (fs.existsSync(USER_FILE)) fs.unlinkSync(USER_FILE)
    })

    after(() => {
        if (fs.existsSync(COUNTER_FILE)) fs.unlinkSync(COUNTER_FILE)
        if (fs.existsSync(USER_FILE)) fs.unlinkSync(USER_FILE)
    })

    it('should return state counter', (t, done) => {
        const useCounterStore = usePersist({
            nameStorage: COUNTER_FILE,
            initialState: (set) => ({
                count: 0,
                increment: () => set((state) => ({ count: state.count + 1 })),
            })
        })
        useCounterStore.getState().increment()
        assert.strictEqual(useCounterStore.getState().count, 1)
        done()
    })

    it('should persist state to json file', (t, done) => {
        const useUserStore = usePersist<{
            id: number;
            name: string;
            setUser: (user: { id: number; name: string; }) => void
        }>({
            nameStorage: USER_FILE,
            initialState: (set) => ({
                id: 1,
                name: 'John Doe',
                setUser: (user) => set(user)
            })
        })
        useUserStore.getState().setUser({ id: 2, name: 'Jane Doe' })

        setTimeout(() => {
            const fileContent = fs.readFileSync(USER_FILE, 'utf-8')
            const decompressed = zlib.gunzipSync(Buffer.from(fileContent, 'base64')).toString()
            const rawData = JSON.parse(decompressed)
            const storedValue = JSON.parse(rawData[USER_FILE].value)
            assert.deepStrictEqual(storedValue.state, { id: 2, name: 'Jane Doe' })
            done()
        }, 1200) // wait for default debounce
    })
});

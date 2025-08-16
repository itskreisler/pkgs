import { describe, it, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs'
import { nodeCacheWithJson, useNodeCacheWithJson } from '../src/lib/zustand/nodeCacheWithJson'
import { jsonStorage } from '../src/lib/zustand/jsonStorage.services'
import type { PersistentStorage } from '../src/lib/zustand/storage'

const TEST_FILE = 'test-storage.json'
const TEST_KEY = 'test-key'
const TEST_VALUE = 'test-value'

describe('nodeCacheWithJson', () => {
    beforeEach(() => {
        if (fs.existsSync(TEST_FILE)) {
            fs.unlinkSync(TEST_FILE)
        }
    })

    after(() => {
        if (fs.existsSync(TEST_FILE)) {
            fs.unlinkSync(TEST_FILE)
        }
    })

    it('should initialize with data from a persistent storage', (t, done) => {
        const initialData = { 'initial-key': { value: 'initial-value', expire: null } }
        fs.writeFileSync(TEST_FILE, JSON.stringify(initialData))
        const persistentStorage = jsonStorage(TEST_FILE, { debounceMs: 0 })
        const storage = nodeCacheWithJson({ stdTTL: 10 }, persistentStorage)

        setTimeout(() => {
            const value = storage.getItem('initial-key')
            assert.strictEqual(value, 'initial-value')
            done()
        }, 100)
    })

    it('should set item to both cache and persistent storage', (t, done) => {
        const persistentStorage = jsonStorage(TEST_FILE, { debounceMs: 100 })
        const storage = nodeCacheWithJson({ stdTTL: 10 }, persistentStorage)
        storage.setItem(TEST_KEY, TEST_VALUE)

        setTimeout(() => {
            const cacheValue = storage.getItem(TEST_KEY)
            const jsonRaw = (persistentStorage as any).getRawStore()
            const jsonValue = jsonRaw[TEST_KEY].value
            assert.strictEqual(cacheValue, TEST_VALUE)
            assert.strictEqual(jsonValue, TEST_VALUE)
            done()
        }, 200)
    })

    it('should remove expired item from persistent storage', (t, done) => {
        const persistentStorage = jsonStorage(TEST_FILE, { debounceMs: 0 })
        const storage = nodeCacheWithJson({ stdTTL: 1, checkperiod: 1 }, persistentStorage)
        storage.setItem(TEST_KEY, TEST_VALUE)

        setTimeout(() => {
            const cacheValue = storage.getItem(TEST_KEY)
            const jsonRaw = (persistentStorage as any).getRawStore()
            assert.strictEqual(cacheValue, null)
            assert.strictEqual(jsonRaw[TEST_KEY], undefined)
            done()
        }, 2000)
    })

    it('should work with useNodeCacheWithJson hook and a persistent storage', (t, done) => {
        const persistentStorage = jsonStorage(TEST_FILE, { debounceMs: 100 })
        const useTestStore = useNodeCacheWithJson<{
            value: string;
            setValue: (val: string) => void;
        }>({
            nameStorage: 'test-store',
            initialState: (set) => ({
                value: 'initial',
                setValue: (val) => set({ value: val }),
            }),
            storage: persistentStorage
        });

        const store = useTestStore;
        store.getState().setValue('new-value');

        setTimeout(() => {
            assert.strictEqual(store.getState().value, 'new-value');
            const rawData = (persistentStorage as any).getRawStore();
            const storedValue = JSON.parse(rawData['test-store'].value);
            assert.deepStrictEqual(storedValue.state, { value: 'new-value' });
            done();
        }, 200)
    })

    it('should compress data in json file', (t, done) => {
        const storage = jsonStorage(TEST_FILE, { debounceMs: 100, useCompression: true })
        storage.setItem('uncompressed-key', 'this is a test value')

        setTimeout(() => {
            const fileContent = fs.readFileSync(TEST_FILE, 'utf-8')
            try {
                JSON.parse(fileContent)
                assert.fail('File content should be compressed, not plain JSON.')
            } catch (e) {
                assert.ok(e instanceof SyntaxError, 'Parsing plain JSON should fail.')
            }
            const isBase64 = /^[a-zA-Z0-9+/]*={0,2}$/.test(fileContent);
            assert.ok(isBase64, 'File content should be a base64 encoded string.');
            done()
        }, 200)
    });
});

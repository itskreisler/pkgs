import { describe, it, after, before, beforeEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs'
import { nodeCacheWithJson, useNodeCacheWithJson } from '../src/lib/zustand/nodeCacheWithJson'
import { jsonStorage } from '../src/lib/zustand/jsonStorage.services'

const TEST_FILE = 'test-storage.json'
const TEST_KEY = 'test-key'
const TEST_VALUE = 'test-value'
const TEST_VALUE_2 = 'test-value-2'

describe('nodeCacheWithJson', () => {
    beforeEach(() => {
        // Limpiar antes de cada prueba
        if (fs.existsSync(TEST_FILE)) {
            fs.unlinkSync(TEST_FILE)
        }
    })

    after(() => {
        // Limpiar después de todas las pruebas
        if (fs.existsSync(TEST_FILE)) {
            fs.unlinkSync(TEST_FILE)
        }
    })

    it('should initialize with data from jsonStorage', () => {
        // 1. Arrange: Crear un archivo JSON con datos iniciales
        const initialData = { 'initial-key': { value: 'initial-value', expire: null } }
        fs.writeFileSync(TEST_FILE, JSON.stringify(initialData))

        // 2. Act: Crear una instancia del almacenamiento combinado
        const storage = nodeCacheWithJson({ stdTTL: 10 }, TEST_FILE)

        // 3. Assert: Verificar que los datos iniciales están en el almacenamiento
        const value = storage.getItem('initial-key')
        assert.strictEqual(value, 'initial-value')
    })

    it('should perform a cache hit', () => {
        // 1. Arrange
        const storage = nodeCacheWithJson({ stdTTL: 10 }, TEST_FILE)
        storage.setItem(TEST_KEY, TEST_VALUE) // Esto lo pone en la caché y en el JSON

        // Espiar el jsonStorage para ver si se llama
        const json = jsonStorage(TEST_FILE)
        let jsonGetItemCalled = false
        const originalGetItem = json.getItem
        json.getItem = (key: string) => {
            jsonGetItemCalled = true
            return originalGetItem(key)
        }

        // 2. Act
        const value = storage.getItem(TEST_KEY) // Debería obtenerlo de la caché

        // 3. Assert
        assert.strictEqual(value, TEST_VALUE)
        assert.strictEqual(jsonGetItemCalled, false, "jsonStorage.getItem should not be called on a cache hit")
    })

    it('should perform a cache miss and read from json', () => {
        // 1. Arrange: Poner datos solo en el JSON
        const jsonData = { [TEST_KEY]: { value: TEST_VALUE, expire: null } }
        fs.writeFileSync(TEST_FILE, JSON.stringify(jsonData))

        const storage = nodeCacheWithJson({ stdTTL: 10 }, TEST_FILE)

        // 2. Act
        const value = storage.getItem(TEST_KEY) // No está en caché, debería leer del JSON

        // 3. Assert
        assert.strictEqual(value, TEST_VALUE)
    })

    it('should set item to both cache and json', () => {
        // 1. Arrange
        const storage = nodeCacheWithJson({ stdTTL: 10 }, TEST_FILE)
        const json = jsonStorage(TEST_FILE)

        // 2. Act
        storage.setItem(TEST_KEY, TEST_VALUE)

        // 3. Assert
        const cacheValue = storage.getItem(TEST_KEY) // Debería estar en la caché
        const jsonRaw = json.getRawStore()
        const jsonValue = jsonRaw[TEST_KEY].value
        assert.strictEqual(cacheValue, TEST_VALUE)
        assert.strictEqual(jsonValue, TEST_VALUE)
    })

    it('should remove expired item from json', (t, done) => {
        // 1. Arrange
        const storage = nodeCacheWithJson({ stdTTL: 1, checkperiod: 1 }, TEST_FILE)
        storage.setItem(TEST_KEY, TEST_VALUE)

        // 2. Act
        setTimeout(() => {
            // 3. Assert
            const cacheValue = storage.getItem(TEST_KEY)
            const json = jsonStorage(TEST_FILE)
            const jsonValue = json.getItem(TEST_KEY)
            assert.strictEqual(cacheValue, null, "Cache value should be null after expiration")
            assert.strictEqual(jsonValue, null, "JSON value should be null after expiration")
            done()
        }, 2000) // Esperar 2 segundos para que expire
    })

    it('should rehydrate from json with remaining ttl', () => {
        // 1. Arrange: Crear un archivo JSON con un item que expira en el futuro
        const expire = Date.now() + 5000 // Expira en 5 segundos
        const initialData = { [TEST_KEY]: { value: TEST_VALUE, expire } }
        fs.writeFileSync(TEST_FILE, JSON.stringify(initialData))

        // 2. Act
        const storage = nodeCacheWithJson({ stdTTL: 10 }, TEST_FILE)

        // 3. Assert
        const value = storage.getItem(TEST_KEY)
        assert.strictEqual(value, TEST_VALUE, "Value should be rehydrated from JSON")

        // Opcional: verificar el TTL en node-cache (esto es más complejo)
        // No hay una forma directa de obtener el TTL de una clave en node-cache
        // pero podemos inferirlo esperando y viendo si expira.
    })

    it('should remove item from both cache and json', () => {
        // 1. Arrange
        const storage = nodeCacheWithJson({ stdTTL: 10 }, TEST_FILE)
        storage.setItem(TEST_KEY, TEST_VALUE)

        // 2. Act
        storage.removeItem(TEST_KEY)

        // 3. Assert
        const cacheValue = storage.getItem(TEST_KEY)
        const json = jsonStorage(TEST_FILE)
        const jsonValue = json.getItem(TEST_KEY)
        assert.strictEqual(cacheValue, null)
        assert.strictEqual(jsonValue, null)
    })

    it('should work with useNodeCacheWithJson hook', () => {
        // 1. Arrange
        const useTestStore = useNodeCacheWithJson<{
            value: string;
            setValue: (val: string) => void;
        }>({
            nameStorage: 'test-store.json',
            initialState: (set) => ({
                value: 'initial',
                setValue: (val) => set({ value: val }),
            }),
        });

        // 2. Act
        const store = useTestStore;
        store.getState().setValue(TEST_VALUE_2);

        // 3. Assert
        assert.strictEqual(store.getState().value, TEST_VALUE_2);

        // Verificar que el valor también se guardó en el archivo
        const fileContent = fs.readFileSync('test-store.json', 'utf-8');
        const parsedContent = JSON.parse(fileContent);
        const stateFromFile = JSON.parse(parsedContent['test-store.json'].value);
        assert.deepStrictEqual(stateFromFile.state, { value: TEST_VALUE_2 });

        // Limpiar
        fs.unlinkSync('test-store.json');
    });

    it('should handle per-key ttl', (t, done) => {
        // 1. Arrange
        const storage = nodeCacheWithJson({ stdTTL: 10, checkperiod: 1 }, TEST_FILE)
        storage.setItem('key1', 'value1', 1) // 1 segundo TTL
        storage.setItem('key2', 'value2', 3) // 3 segundos TTL

        // 2. Act & Assert
        setTimeout(() => {
            const val1 = storage.getItem('key1')
            const val2 = storage.getItem('key2')
            assert.strictEqual(val1, null, "key1 should be expired after 2 seconds")
            assert.strictEqual(val2, 'value2', "key2 should not be expired after 2 seconds")
        }, 2000)

        setTimeout(() => {
            const val2 = storage.getItem('key2')
            assert.strictEqual(val2, null, "key2 should be expired after 4 seconds")
            done()
        }, 4000)
    });
});

import NodeCache from 'node-cache'

/**
 * Crea un sistema de almacenamiento basado únicamente en memoria RAM utilizando NodeCache.
 * Ideal para datos temporales que no necesitan persistir entre reinicios de la aplicación.
 * 
 * @param {NodeCache.Options} options - Configuración para NodeCache
 * @param {number} [options.stdTTL] - Tiempo de vida por defecto en segundos para todos los elementos
 * @param {number} [options.checkperiod] - Intervalo en segundos para verificar elementos expirados
 * @param {number} [options.maxKeys] - Número máximo de claves que puede almacenar la caché
 * 
 * @returns {StateStorage & { entries(): [string, string][] }} Objeto compatible con StateStorage + método adicional
 * 
 * @example
 * ```typescript
 * // Crear caché en memoria con TTL de 5 minutos
 * const memoryStorage = nodeCacheStorage({ 
 *   stdTTL: 300,      // 5 minutos
 *   checkperiod: 60   // Verificar cada minuto
 * })
 * 
 * // Uso directo
 * memoryStorage.setItem('session:abc123', JSON.stringify(sessionData))
 * const session = memoryStorage.getItem('session:abc123')
 * 
 * // Obtener todas las entradas
 * const allEntries = memoryStorage.entries() // [['key1', 'value1'], ['key2', 'value2']]
 * 
 * // Uso con Zustand para datos temporales
 * const store = create(
 *   persist(stateCreator, {
 *     name: 'temp-store',
 *     storage: createJSONStorage(() => memoryStorage)
 *   })
 * )
 * ```
 * 
 * @since 1.0.0
 */
export function nodeCacheStorage(options: NodeCache.Options) {
    const myCache = new NodeCache(options)

    return {
        get length() {
            return myCache.keys().length
        },

        clear() {
            myCache.flushAll()
        },

        getItem(key: string): string | null {
            const value = myCache.get<string>(key)
            return value ?? null
        },

        key(index: number): string | null {
            const keys = myCache.keys()
            return keys[index] ?? null
        },

        removeItem(key: string): void {
            myCache.del(key)
        },

        setItem(key: string, value: string): void {
            myCache.set(key, value)
        },
        entries(): [string, string][] {
            const keys = myCache.keys()
            return keys.reduce((acc, key) => {
                const value = myCache.get<string>(key)
                if (value) {
                    acc.push([key, value as string])
                }
                return acc
            }, [] as [string, string][])
        }

    }
}

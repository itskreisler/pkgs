import NodeCache from 'node-cache'

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
/*
const tiempoDeVida = 10
const cache = nodeCacheStorage({
    stdTTL: tiempoDeVida,
    checkperiod: tiempoDeVida + 10
}) as Storage

console.log('cache', cache.length)
// añadir varios datos de prueba
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
for (let i = 0; i < 10; i++) {
    await sleep(1000)
    cache.setItem(`key${i}`, `value${i}`)

}
console.log('cache', cache.length)
let i = 0
const intervalId = setInterval(() => {
    for (const [key, value] of Object.entries(cache.entries())) {
        console.log(key, value)
    }
    console.log('length', cache.length, i)
    i++
    if (i > 10) {
        clearInterval(intervalId)
    }
}, 1000)
*/

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

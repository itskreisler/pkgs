export interface Serializer {
    type: string
    is: (value: any) => boolean
    serialize: (value: any) => any
    deserialize: (value: any) => any
}

export const setHandler: Serializer = {
    type: 'Set',
    is: (v): v is Set<any> => v instanceof Set,
    serialize: (v: Set<any>) => Array.from(v.values()),
    deserialize: (v) => new Set(v)
}

export const mapHandler: Serializer = {
    type: 'Map',
    is: (v): v is Map<any, any> => v instanceof Map,
    serialize: (v: Map<any, any>) => Array.from(v.entries()),
    deserialize: (v) => new Map(v)
}

/**
 * @example
 * const { replacer, reviver } = createDynamicJSONHandlers([mapHandler])
 */
export function createDynamicJSONHandlers(handlers: Serializer[]) {
    const replacer = (key: string, value: any) => {

        for (const handler of handlers) {
            if (handler.is(value)) {
                return { __type: handler.type, value: handler.serialize(value) }
            }
        }
        return value
    }

    const reviver = (key: string, value: any) => {
        if (value && typeof value === 'object' && '__type' in value) {
            const handler = handlers.find((h) => h.type === value.__type)
            if (handler) return handler.deserialize(value.value)
        }
        return value
    }

    return { replacer, reviver }
}

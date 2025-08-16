import type { StateStorage } from 'zustand/middleware'

/**
 * Extensión de StateStorage que agrega métodos útiles para almacenamiento avanzado
 * manteniendo compatibilidad completa con StateStorage de Zustand
 */
export interface ExtendedStateStorage extends StateStorage {
    /** Método estándar de StateStorage - setItem sin TTL */
    setItem(name: string, value: string): void | Promise<void>

    /** Método adicional - setItem con soporte para TTL (Time To Live) */
    setItemWithTTL?(name: string, value: string, ttl?: number): void | Promise<void>

    /** Método adicional - obtener todo el almacenamiento raw para hidratación */
    getRawStore?(): any | Promise<any>

    /** Método adicional - limpiar todo el almacenamiento */
    clear?(): void | Promise<void>
}

/**
 * Configuración para el hook useNodeCacheWithJson
 */
export interface NodeCacheWithJsonConfig {
    nameStorage: string
    initialState: any // StateCreator<S> se infiere desde el contexto
    storage: ExtendedStateStorage
    replacer?: (key: string, value: any) => any
    reviver?: (key: string, value: any) => any
}

/**
 * Configuración para la función usePersist
 */
export interface PersistConfig {
    nameStorage: string
    initialState: any // StateCreator<S> se infiere desde el contexto  
    replacer?: (key: string, value: any) => any
    reviver?: (key: string, value: any) => any
}

/**
 * Opciones para la configuración de jsonStorage
 */
export interface JsonStorageOptions {
    /** Tiempo de debounce en milisegundos para optimizar escrituras (0 para desactivar) */
    debounceMs?: number
    /** Activar/desactivar compresión gzip de los datos */
    useCompression?: boolean
}

/**
 * Estructura interna de datos para jsonStorage
 * @internal
 */
export interface StorageDataItem {
    value: string
    expire: number | null
}

/**
 * Estructura interna de datos para jsonStorage
 * @internal  
 */
export type StorageData = Record<string, StorageDataItem>

// ============================================================================
// TIPOS LEGACY - MANTENER PARA COMPATIBILIDAD HACIA ATRÁS
// ============================================================================

/**
 * @deprecated Use ExtendedStateStorage instead
 * This interface is kept for backwards compatibility only
 */
export interface PersistentStorageLegacy {
    length: number | (() => number) | (() => Promise<number>);
    getItem: (name: string) => string | null | Promise<string | null>;
    setItem: (name: string, value: string, ttl?: number) => void | Promise<void>;
    setItems?: (items: Record<string, string>, expire?: number | null) => void | Promise<void>;
    removeItem: (name: string) => void | Promise<void>;
    key: (index: number) => string | null | Promise<string | null>;
    getRawStore: () => any | Promise<any>;
    clear: (() => void) | (() => Promise<void>);
}

# @kreisler/plugins

[![npm version](https://badge.fury.io/js/@kreisler%2Fplugins.svg)](https://badge.fury.io/js/@kreisler%2Fplugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Una librería completa de almacenamiento persistente y utilidades avanzadas para Zustand con soporte para caché híbrida (RAM + disco), compresión, TTL y serialización de tipos complejos.

## 🚀 Características

- **Almacenamiento híbrido**: Combina caché en memoria (RAM) con persistencia en disco
- **Compresión automática**: Reduce el tamaño de archivos usando gzip
- **TTL (Time To Live)**: Soporte para expiración automática de datos
- **Debouncing**: Optimiza las escrituras en disco agrupándolas
- **Serialización avanzada**: Soporte para Map, Set y otros tipos complejos
- **API simple**: Hooks de conveniencia para casos de uso comunes
- **TypeScript**: Completamente tipado para mejor experiencia de desarrollo

## 📦 Instalación

```bash
npm install @kreisler/plugins zustand
```

## 🏗️ Arquitectura

La librería está diseñada para ser modular. El componente principal es `nodeCacheWithJson`, que proporciona una caché en memoria (RAM) y delega la persistencia a un motor de almacenamiento secundario. Esto permite cambiar fácilmente el mecanismo de almacenamiento persistente sin cambiar la lógica de la caché.

### Interfaz `ExtendedStateStorage`

Los motores de almacenamiento implementan esta interfaz extendida:

```typescript
export interface ExtendedStateStorage {
  getItem: (name: string) => string | null | Promise<string | null>
  setItem: (name: string, value: string, ttl?: number) => void | Promise<void>
  removeItem: (name: string) => void | Promise<void>
  getRawStore: () => any | Promise<any>
}
```

## 📚 Uso Rápido

### Hook Simplificado `usePersist`

El hook más sencillo para crear stores con persistencia automática:

```typescript
import { usePersist } from '@kreisler/plugins'

// Store simple de contador
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

// Usar en tu aplicación
const { count, increment, decrement } = useCounterStore.getState()
```

### Hook con Caché Híbrida `useNodeCacheWithJson`

Para aplicaciones que requieren alto rendimiento con persistencia:

```typescript
import { useNodeCacheWithJson, jsonStorage } from '@kreisler/plugins'

const useUserStore = useNodeCacheWithJson({
  nameStorage: 'user-data',
  initialState: (set) => ({
    users: [],
    currentUser: null,
    addUser: (user) => set((state) => ({ users: [...state.users, user] })),
    setCurrentUser: (user) => set({ currentUser: user })
  }),
  nodeCache: { stdTTL: 3600, checkperiod: 600 }, // TTL de 1 hora
  storage: jsonStorage('./data/users.json', {
    debounceMs: 500,
    useCompression: true
  })
})
```

## 🛠️ Motores de Almacenamiento Disponibles

### `jsonStorage` - Almacenamiento en Archivo JSON

Motor de almacenamiento persistente con características avanzadas:

```typescript
import { jsonStorage } from '@kreisler/plugins'

const storage = jsonStorage('./my-data.json', {
  debounceMs: 1000,      // Agrupar escrituras por 1 segundo
  useCompression: true   // Comprimir datos con gzip
})
```

**Características:**
- ✅ **Compresión gzip**: Reduce significativamente el tamaño de archivos
- ✅ **Debouncing**: Optimiza rendimiento agrupando escrituras
- ✅ **TTL automático**: Limpieza automática de datos expirados
- ✅ **Creación de directorios**: Crea automáticamente la estructura de carpetas
- ✅ **Compatibilidad legacy**: Lee archivos no comprimidos existentes

### `nodeCache` - Caché Solo en Memoria

Para casos donde solo necesitas caché temporal:

```typescript
import { useNodeCache } from '@kreisler/plugins'

const useTempStore = useNodeCache({
  nameStorage: 'temp-data',
  initialState: (set) => ({ /* tu estado */ }),
  nodeCache: { 
    stdTTL: 600,        // 10 minutos
    checkperiod: 120    // Verificar cada 2 minutos
  }
})
```

## 🔧 Serialización Avanzada

### Soporte para Tipos Complejos

La librería incluye polyfills para serializar tipos que JSON no soporta nativamente:

```typescript
import { createDynamicJSONHandlers, mapHandler, setHandler } from '@kreisler/plugins'

// Configurar serialización para Map y Set
const { replacer, reviver } = createDynamicJSONHandlers([mapHandler, setHandler])

const useComplexStore = usePersist({
  nameStorage: 'complex-data',
  initialState: (set) => ({
    userRoles: new Map([['admin', new Set(['read', 'write', 'delete'])]]),
    tags: new Set(['typescript', 'zustand', 'react']),
    updateRoles: (role, permissions) => set((state) => {
      const newRoles = new Map(state.userRoles)
      newRoles.set(role, new Set(permissions))
      return { userRoles: newRoles }
    })
  }),
  replacer,
  reviver
})
```

### Crear Serializadores Personalizados

```typescript
import { Serializer, createDynamicJSONHandlers } from '@kreisler/plugins'

// Serializador para Date
const dateHandler: Serializer = {
  type: 'Date',
  is: (v): v is Date => v instanceof Date,
  serialize: (v: Date) => v.toISOString(),
  deserialize: (v: string) => new Date(v)
}

// Serializador para RegExp
const regexHandler: Serializer = {
  type: 'RegExp',
  is: (v): v is RegExp => v instanceof RegExp,
  serialize: (v: RegExp) => ({ source: v.source, flags: v.flags }),
  deserialize: (v) => new RegExp(v.source, v.flags)
}

const { replacer, reviver } = createDynamicJSONHandlers([
  dateHandler, 
  regexHandler, 
  mapHandler, 
  setHandler
])
```

## 📋 Ejemplos Completos

### Aplicación de Configuración de Usuario

```typescript
import { usePersist } from '@kreisler/plugins'

interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  preferences: Map<string, any>
}

const useSettingsStore = usePersist<UserSettings & {
  updateTheme: (theme: UserSettings['theme']) => void
  updateLanguage: (lang: string) => void
  toggleNotification: (type: keyof UserSettings['notifications']) => void
  setPreference: (key: string, value: any) => void
}>({
  nameStorage: 'user-settings',
  initialState: (set) => ({
    theme: 'auto',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      desktop: false
    },
    preferences: new Map(),
    
    updateTheme: (theme) => set({ theme }),
    updateLanguage: (language) => set({ language }),
    toggleNotification: (type) => set((state) => ({
      notifications: {
        ...state.notifications,
        [type]: !state.notifications[type]
      }
    })),
    setPreference: (key, value) => set((state) => {
      const newPrefs = new Map(state.preferences)
      newPrefs.set(key, value)
      return { preferences: newPrefs }
    })
  }),
  ...createDynamicJSONHandlers([mapHandler])
})
```

### Sistema de Caché de API con TTL

```typescript
import { useNodeCacheWithJson, jsonStorage } from '@kreisler/plugins'

interface ApiCache {
  data: Map<string, any>
  lastFetch: Map<string, number>
  errors: Set<string>
  fetchData: (endpoint: string) => Promise<any>
  clearExpired: () => void
}

const useApiCache = useNodeCacheWithJson<ApiCache>({
  nameStorage: 'api-cache',
  initialState: (set, get) => ({
    data: new Map(),
    lastFetch: new Map(),
    errors: new Set(),
    
    fetchData: async (endpoint) => {
      const state = get()
      const cached = state.data.get(endpoint)
      const lastFetch = state.lastFetch.get(endpoint) || 0
      const now = Date.now()
      
      // Usar caché si es menor a 5 minutos
      if (cached && (now - lastFetch) < 300000) {
        return cached
      }
      
      try {
        const response = await fetch(endpoint)
        const data = await response.json()
        
        set((state) => {
          const newData = new Map(state.data)
          const newLastFetch = new Map(state.lastFetch)
          const newErrors = new Set(state.errors)
          
          newData.set(endpoint, data)
          newLastFetch.set(endpoint, now)
          newErrors.delete(endpoint)
          
          return { 
            data: newData, 
            lastFetch: newLastFetch, 
            errors: newErrors 
          }
        })
        
        return data
      } catch (error) {
        set((state) => ({
          errors: new Set(state.errors).add(endpoint)
        }))
        throw error
      }
    },
    
    clearExpired: () => set((state) => {
      const now = Date.now()
      const newData = new Map()
      const newLastFetch = new Map()
      
      for (const [endpoint, timestamp] of state.lastFetch) {
        if ((now - timestamp) < 300000) {
          newData.set(endpoint, state.data.get(endpoint))
          newLastFetch.set(endpoint, timestamp)
        }
      }
      
      return { data: newData, lastFetch: newLastFetch }
    })
  }),
  nodeCache: { 
    stdTTL: 300,      // 5 minutos en memoria
    checkperiod: 60   // Verificar cada minuto
  },
  storage: jsonStorage('./cache/api-data.json', {
    debounceMs: 2000,
    useCompression: true
  }),
  ...createDynamicJSONHandlers([mapHandler, setHandler])
})
```

## 📖 API Reference

### Hooks Principales

#### `usePersist<T>(config)`
Hook simplificado para stores con persistencia básica.

**Parámetros:**
- `nameStorage: string` - Identificador único del almacenamiento
- `initialState: StateCreator<T>` - Estado inicial y acciones
- `replacer?: (key: string, value: any) => any` - Función de serialización personalizada
- `reviver?: (key: string, value: any) => any` - Función de deserialización personalizada

#### `useNodeCacheWithJson<T>(config)`
Hook para stores con caché híbrida RAM + disco.

**Parámetros:**
- `nameStorage: string` - Identificador único
- `initialState: StateCreator<T>` - Estado inicial y acciones
- `nodeCache: NodeCacheOptions` - Configuración de caché en memoria
- `storage: ExtendedStateStorage` - Motor de almacenamiento persistente
- `replacer?: (key: string, value: any) => any` - Serialización personalizada
- `reviver?: (key: string, value: any) => any` - Deserialización personalizada

#### `useNodeCache<T>(config)`
Hook para stores solo en memoria.

**Parámetros:**
- `nameStorage: string` - Identificador único
- `initialState: StateCreator<T>` - Estado inicial y acciones
- `nodeCache: NodeCacheOptions` - Configuración de caché

### Motores de Almacenamiento

#### `jsonStorage(filePath, options?)`
Crea un motor de almacenamiento basado en archivos JSON.

**Parámetros:**
- `filePath: string` - Ruta del archivo JSON
- `options.debounceMs?: number` - Tiempo de debounce en ms (default: 1000)
- `options.useCompression?: boolean` - Activar compresión gzip (default: true)

### Utilidades de Serialización

#### `createDynamicJSONHandlers(serializers)`
Crea funciones replacer/reviver para tipos complejos.

**Serializadores incluidos:**
- `mapHandler` - Soporte para Map
- `setHandler` - Soporte para Set

## ⚙️ Configuración Avanzada

### Opciones de NodeCache

```typescript
interface NodeCacheOptions {
  stdTTL?: number          // TTL por defecto en segundos
  checkperiod?: number     // Período de verificación de expiración
  useClones?: boolean      // Clonar objetos al obtenerlos
  deleteOnExpire?: boolean // Eliminar automáticamente items expirados
  enableLegacyCallbacks?: boolean
  maxKeys?: number         // Máximo número de claves
}
```

### Opciones de JsonStorage

```typescript
interface JsonStorageOptions {
  debounceMs?: number      // Tiempo de debounce (0 = desactivado)
  useCompression?: boolean // Usar compresión gzip
}
```

## 🔍 Diagnóstico y Debugging

### Acceso a Datos Internos

```typescript
// Acceder al store crudo para debugging
const rawData = storage.getRawStore()
console.log('Estado completo:', rawData)

// Verificar expiración manual
const item = storage.getItem('mi-clave')
if (item === null) {
  console.log('Item expirado o no existe')
}
```

### Monitoreo de Rendimiento

```typescript
// Configurar logging para operaciones de escritura
const storage = jsonStorage('./data.json', {
  debounceMs: 1000,
  useCompression: true
})

// Las escrituras se agruparán automáticamente
storage.setItem('key1', 'value1')
storage.setItem('key2', 'value2')
storage.setItem('key3', 'value3')
// Solo se escribirá una vez al disco después de 1 segundo
```

## 🚨 Consideraciones de Rendimiento

### Mejores Prácticas

1. **Usa debouncing** para aplicaciones con escrituras frecuentes
2. **Activa compresión** para datos grandes
3. **Configura TTL apropiado** según tu caso de uso
4. **Usa caché híbrida** para datos que se leen frecuentemente
5. **Minimiza serializadores personalizados** para mejor rendimiento

### Comparación de Estrategias

| Estrategia | Velocidad Lectura | Velocidad Escritura | Persistencia | Memoria |
|------------|-------------------|---------------------|--------------|---------|
| `usePersist` | Media | Media | ✅ | Baja |
| `useNodeCache` | Alta | Alta | ❌ | Media |
| `useNodeCacheWithJson` | Alta | Media | ✅ | Alta |

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🔗 Enlaces

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Node-Cache Documentation](https://github.com/node-cache/node-cache)
- [npm Package](https://www.npmjs.com/package/@kreisler/plugins)

---

Desarrollado con ❤️ por [@kreisler](https://github.com/itskreisler)

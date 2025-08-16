# Almacenamiento Persistente y Utilidades para Zustand

Este directorio contiene implementaciones de almacenamiento personalizadas y utilidades para el middleware `persist` de Zustand.

## Arquitectura

La librería está diseñada para ser modular. El componente principal es `nodeCacheWithJson`, que proporciona una caché en memoria (RAM) y delega la persistencia a un motor de almacenamiento secundario. Esto permite cambiar fácilmente el mecanismo de almacenamiento persistente (por ejemplo, de un archivo JSON a `localStorage` en el navegador) sin cambiar la lógica de la caché.

### Interfaz `PersistentStorage`

Cualquier motor de almacenamiento que se quiera usar con `nodeCacheWithJson` debe implementar la siguiente interfaz:

```typescript
export interface PersistentStorage {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string, ttl?: number) => void | Promise<void>;
  removeItem: (name: string) => void | Promise<void>;
  getRawStore: () => any | Promise<any>;
}
```

## Motores de Almacenamiento Disponibles

### `jsonStorage`

Es el motor de almacenamiento por defecto. Guarda el estado en un archivo JSON en el disco.

**Características:**
- **Compresión:** Comprime los datos usando `zlib` para ahorrar espacio. (Configurable)
- **Debouncing:** Optimiza las escrituras en disco agrupándolas para evitar escrituras excesivas. (Configurable)
- **Persistencia en disco.**
- **Soporte para TTL.**

**Uso:**
```typescript
import { jsonStorage } from './jsonStorage.services';

const myJsonStorage = jsonStorage('my-storage.json', {
  debounceMs: 500,       // Tiempo de debounce en ms (0 para desactivar)
  useCompression: true,  // Activar/desactivar compresión
});
```

## Caché en Memoria

### `nodeCacheWithJson`

Combina una caché en memoria (`node-cache`) con un motor de almacenamiento persistente.

**Uso:**
```typescript
import { nodeCacheWithJson } from './nodeCacheWithJson';
import { jsonStorage } from './jsonStorage.services';

const persistentStorage = jsonStorage('my-cached-store.json');
const cachedStorage = nodeCacheWithJson({ stdTTL: 3600 }, persistentStorage);
```

## Hooks de Conveniencia

### `useNodeCacheWithJson`

Un hook para crear una tienda Zustand que usa la estrategia combinada de RAM y disco.

**Uso:**
```typescript
import { useNodeCacheWithJson } from './nodeCacheWithJson';
import { jsonStorage } from './jsonStorage.services';

const useMyCachedStore = useNodeCacheWithJson({
  nameStorage: 'my-cached-store',
  initialState: (set) => ({ ... }),
  storage: jsonStorage('my-cached-store.json'),
});
```

## Utilidades Adicionales

### `polyfill.ts` - Manejadores Dinámicos de JSON

Permite serializar y deserializar tipos de datos complejos como `Map` y `Set`.

**Uso:**
```typescript
import { createDynamicJSONHandlers, mapHandler, setHandler } from './polyfill';
import { createJSONStorage } from 'zustand/middleware';

const { replacer, reviver } = createDynamicJSONHandlers([mapHandler, setHandler]);

// ... usar replacer y reviver en la configuración de persistencia
```

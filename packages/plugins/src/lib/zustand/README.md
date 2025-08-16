# Almacenamiento Persistente y Utilidades para Zustand

Este directorio contiene implementaciones de almacenamiento personalizadas y utilidades para el middleware `persist` de Zustand.

## Opciones de Almacenamiento

### 1. `jsonStorage`

`jsonStorage` es una implementación de almacenamiento que guarda el estado de Zustand en un archivo JSON en el disco. Es útil para persistencia de datos a largo plazo.

**Características:**
- Persistencia en disco.
- Soporte para TTL (Time To Live) en los datos almacenados.

### 2. `nodeCacheStorage`

`nodeCacheStorage` es un wrapper para `node-cache` que proporciona una interfaz compatible con el `Storage` API de Zustand. Este almacenamiento es volátil y reside únicamente en la memoria RAM.

**Características:**
- Almacenamiento en memoria RAM.
- Alto rendimiento.
- Soporte para todas las opciones de `node-cache`, incluyendo TTL.

### 3. `nodeCacheWithJson`

`nodeCacheWithJson` es una solución de almacenamiento avanzada que combina `nodeCacheStorage` (RAM) y `jsonStorage` (Disco).

**Estrategia de Caché:**
- **RAM (node-cache):** Los datos se guardan en RAM con un TTL configurable para acceso rápido.
- **Disco (jsonStorage):** Los datos también se guardan en un archivo JSON para persistencia.
- **Inicialización:** Al iniciar, la caché de RAM se rehidrata desde el archivo JSON.
- **Expiración:** Cuando un dato expira en RAM, se elimina automáticamente del JSON.

## Hooks de Conveniencia

### `usePersist`

Un hook para crear una tienda Zustand persistente usando `jsonStorage`.

**Uso:**
```typescript
import { usePersist } from './zustandWrapper';

const useMyStore = usePersist({
  nameStorage: 'my-store.json',
  initialState: (set) => ({ ... }),
});
```

### `useNodeCacheWithJson`

Un hook para crear una tienda Zustand persistente usando la estrategia combinada de RAM y disco.

**Uso:**
```typescript
import { useNodeCacheWithJson } from './nodeCacheWithJson';

const useMyCachedStore = useNodeCacheWithJson({
  nameStorage: 'my-cached-store.json',
  initialState: (set) => ({ ... }),
});
```
#### Configuración de TTL por Clave
El método `setItem` en `nodeCacheWithJson` permite especificar un TTL por clave:
```typescript
// storage.setItem(key, value, ttl_en_segundos)
```

## Utilidades Adicionales

### `polyfill.ts` - Manejadores Dinámicos de JSON

Esta utilidad permite serializar y deserializar tipos de datos complejos como `Map` y `Set` que no son soportados nativamente por `JSON.stringify` y `JSON.parse`.

**Uso:**
Se puede usar junto con `createJSONStorage` para extender la capacidad de serialización de Zustand.

```typescript
import { createDynamicJSONHandlers, mapHandler, setHandler } from './polyfill';
import { createJSONStorage } from 'zustand/middleware';

const { replacer, reviver } = createDynamicJSONHandlers([mapHandler, setHandler]);

const storage = createJSONStorage(() => myStorage, {
  replacer,
  reviver,
});
```

# @kreisler/i18n

Una librería de internacionalización (i18n) simple y potente para TypeScript con seguridad de tipos.

## Características

- ✅ **Seguridad de tipos completa** - IntelliSense y verificación de tipos en tiempo de compilación
- ✅ **Interpolación de parámetros** - Soporte para parámetros posicionales y nombrados
- ✅ **Anidación de traducciones** - Organiza tus traducciones en estructuras anidadas
- ✅ **Fallback automático** - Vuelve al idioma por defecto si una traducción no existe
- ✅ **Dot notation** - Accede a traducciones anidadas usando notación de puntos
- ✅ **Zero dependencies** - Sin dependencias externas

## Instalación

```bash
npm install @kreisler/i18n
```

## Uso

### Versión v1 - i18n con dot notation

```typescript
import { i18n } from '@kreisler/i18n/v1'

const { useTranslations } = i18n({
  defaultLocale: 'es',
  messages: {
    es: {
      greeting: 'Hola {0}',
      farewell: 'Adiós {0}',
      nested: {
        welcome: 'Bienvenido {0}',
        goodbye: 'Hasta luego {0}'
      }
    },
    en: {
      greeting: 'Hello {0}',
      farewell: 'Goodbye {0}',
      nested: {
        welcome: 'Welcome {0}',
        goodbye: 'See you later {0}'
      }
    }
  }
})

const t = useTranslations('es')

console.log(t('greeting', 'Juan'))           // "Hola Juan"
console.log(t('nested.welcome', 'María'))    // "Bienvenido María"
console.log(t('farewell', 'Pedro'))          // "Adiós Pedro"
```

### Versión v2 - i18nStrict con tipado estricto

```typescript
import { i18nStrict } from '@kreisler/i18n/v2'

const { useTranslations } = i18nStrict({
  defaultLocale: 'es',
  messages: {
    es: {
      simple: 'Mensaje simple',
      saludo: 'Hola {nombre}, tienes {cantidad} mensajes',
      lista: 'Elemento 1: {0}, Elemento 2: {1}',
      resumen: 'Usuario: {user}, Edad: {edad}, País: {pais}',
      bienvenido: '¡Bienvenido!',
      mixto: 'Hola {0}, tu usuario es {user}',
      numeros: 'Suma: {0} + {1} = {2}',
      contact: 'Mi dirección es {address}'
    },
    en: {
      simple: 'Simple message',
      saludo: 'Hello {nombre}, you have {cantidad} messages',
      lista: 'Item 1: {0}, Item 2: {1}',
      resumen: 'User: {user}, Age: {edad}, Country: {pais}',
      bienvenido: 'Welcome!',
      mixto: 'Hello {0}, your username is {user}',
      numeros: 'Sum: {0} + {1} = {2}',
      contact: 'My address is {address}'
    }
  }
} as const)

const t = useTranslations('es')

// Mensajes sin parámetros
console.log(t('simple'))        // "Mensaje simple"
console.log(t('bienvenido'))    // "¡Bienvenido!"

// Parámetros nombrados
console.log(t('saludo', { nombre: 'Ana', cantidad: 5 }))
// "Hola Ana, tienes 5 mensajes"

console.log(t('resumen', { user: 'juan123', edad: 25, pais: 'España' }))
// "Usuario: juan123, Edad: 25, País: España"

// Parámetros posicionales
console.log(t('lista', ['manzana', 'naranja']))
// "Elemento 1: manzana, Elemento 2: naranja"

console.log(t('numeros', [10, 5, 15]))
// "Suma: 10 + 5 = 15"

// Parámetros mixtos
console.log(t('mixto', ['Carlos', { user: 'carlos_dev' }]))
// "Hola Carlos, tu usuario es carlos_dev"
```

## API

### i18n (v1)

#### Configuración

```typescript
interface I18nConfig {
  defaultLocale: string;
  messages: Record<string, any>;
  interpolation?: {
    prefix: string;
    suffix: string;
  };
}
```

#### Métodos

- `useTranslations<Locale>(lang: Locale)` - Crea una función de traducción para el idioma especificado
- `t(key: string, ...params: (string | number)[])` - Traduce una clave con parámetros opcionales

### i18nStrict (v2)

#### Configuración

```typescript
interface I18nConfig<T extends Messages> {
  defaultLocale: keyof T;
  messages: T;
}
```

#### Características especiales

- **Tipado estricto**: IntelliSense completo para claves de traducción
- **Validación de parámetros**: Verificación automática del tipo y número de parámetros
- **Soporte para parámetros nombrados**: `{nombre}` y posicionales `{0}`

## Interpolación de parámetros

### Parámetros posicionales
```typescript
// Traducción: "Hola {0}, tienes {1} años"
t('mensaje', ['Juan', 25])  // "Hola Juan, tienes 25 años"
```

### Parámetros nombrados
```typescript
// Traducción: "Hola {nombre}, tienes {edad} años"
t('mensaje', { nombre: 'Juan', edad: 25 })  // "Hola Juan, tienes 25 años"
```

### Configuración personalizada de interpolación (v1)
```typescript
const { useTranslations } = i18n({
  defaultLocale: 'es',
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  },
  messages: {
    es: {
      greeting: 'Hola {{0}}'  // Usando delimitadores personalizados
    }
  }
})
```

## Fallbacks

Si una traducción no existe, la librería:

1. Intenta buscar en el idioma por defecto
2. Si tampoco existe, devuelve la clave original
3. Emite una advertencia en la consola (v2)

## TypeScript

Ambas versiones ofrecen soporte completo para TypeScript:

- **v1**: Utiliza dot notation tipada para traducciones anidadas
- **v2**: Ofrece tipado estricto de parámetros y validación en tiempo de compilación

## Licencia

MIT
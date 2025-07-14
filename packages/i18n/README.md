# @kreisler/i18n

Sistema de internacionalización moderno y seguro para TypeScript con soporte completo de tipos.

## 🚀 Características

- 🔒 **100% Type-Safe** - Inferencia completa de tipos con autocompletado inteligente
- 🎯 **Sin `as const`** - Funciona sin anotaciones de tipo adicionales
- 🔗 **Notación de puntos** - Acceso a traducciones anidadas con `nested.key`
- 📦 **Interpolación avanzada** - Parámetros posicionales `{0}` y nombrados `{nombre}`
- 🎨 **Parámetros mixtos** - Combina posicionales y nombrados en una sola traducción
- 🔄 **Fallback automático** - Recurre al idioma por defecto automáticamente
- 📝 **JSDoc completo** - Documentación integrada con ejemplos
- 🪶 **Zero dependencies** - Sin dependencias externas
- ⚡ **Dos versiones** - `i18n` (v1) simple y `createI18n` (v2) con tipos estrictos

## 📦 Instalación

```bash
npm install @kreisler/i18n
```

## 🎯 Inicio Rápido

### Versión Simple (v1)

```typescript
import { i18n } from '@kreisler/i18n'

const { useTranslations } = i18n({
  defaultLocale: 'es',
  messages: {
    es: {
      greeting: '¡Hola {0}!',
      nested: {
        welcome: 'Bienvenido {0} al sistema'
      }
    },
    en: {
      greeting: 'Hello {0}!',
      nested: {
        welcome: 'Welcome {0} to the system'
      }
    }
  }
})

const t = useTranslations('es')
console.log(t('greeting', 'Juan'))           // "¡Hola Juan!"
console.log(t('nested.welcome', 'María'))    // "Bienvenido María al sistema"
```

### Versión Avanzada (v2) - Recomendada

```typescript
import { createI18n } from '@kreisler/i18n'

// ✨ No necesita 'as const' - funciona automáticamente
const i18n = createI18n({
  defaultLocale: 'es',
  messages: {
    es: {
      simple: 'Mensaje simple',
      greeting: 'Hola {nombre}, tienes {cantidad} mensajes',
      position: 'Item {0}: {1}',
      mixed: 'Hola {0}, tu usuario es {user}',
      calculator: 'Resultado: {0} + {1} = {2}',
      profile: {
        info: 'Usuario: {name}, Edad: {age}',
        nested: {
          address: 'Dirección: {street} #{number}'
        }
      }
    },
    en: {
      simple: 'Simple message',
      greeting: 'Hello {nombre}, you have {cantidad} messages',
      position: 'Item {0}: {1}',
      mixed: 'Hello {0}, your username is {user}',
      calculator: 'Result: {0} + {1} = {2}',
      profile: {
        info: 'User: {name}, Age: {age}',
        nested: {
          address: 'Address: {street} #{number}'
        }
      }
    }
  }
})

const t = i18n.useTranslations('es')

// 🎯 Autocompletado completo para todas las claves
t('simple')                                    // ✅ "Mensaje simple"
t('greeting', { nombre: 'Ana', cantidad: 5 }) // ✅ "Hola Ana, tienes 5 mensajes"
t('position', 'Primero', 'Segundo')           // ✅ "Item Primero: Segundo"
t('mixed', 'Carlos', { user: 'carlos_dev' })  // ✅ "Hola Carlos, tu usuario es carlos_dev"
t('calculator', 10, 5, 15)                    // ✅ "Resultado: 10 + 5 = 15"

// 🔗 Notación de puntos para objetos anidados
t('profile.info', { name: 'Juan', age: 30 })                    // ✅ "Usuario: Juan, Edad: 30"
t('profile.nested.address', { street: 'Main St', number: 123 }) // ✅ "Dirección: Main St #123"
```

## 📚 Guía Completa

### 🔄 Tipos de Parámetros

#### 1. Sin Parámetros
```typescript
const messages = {
  es: { welcome: '¡Bienvenido!' }
}
t('welcome') // "¡Bienvenido!"
```

#### 2. Parámetros Posicionales `{0}, {1}, {2}...`
```typescript
const messages = {
  es: { list: 'Items: {0}, {1}, {2}' }
}
t('list', 'Manzana', 'Pera', 'Uva') // "Items: Manzana, Pera, Uva"
```

#### 3. Parámetros Nombrados `{nombre}`
```typescript
const messages = {
  es: { user: 'Usuario: {name}, Email: {email}' }
}
t('user', { name: 'Juan', email: 'juan@email.com' }) 
// "Usuario: Juan, Email: juan@email.com"
```

#### 4. Parámetros Mixtos - ¡Lo Mejor de Ambos!
```typescript
const messages = {
  es: { report: 'Reporte {0}: Usuario {user} procesó {1} elementos' }
}
t('report', 'Diario', 150, { user: 'admin' })
// "Reporte Diario: Usuario admin procesó 150 elementos"
```

### 🏗️ Estructura Anidada

```typescript
const messages = {
  es: {
    auth: {
      login: {
        success: 'Bienvenido {username}',
        error: 'Credenciales incorrectas'
      },
      register: {
        form: {
          validation: 'El campo {field} es requerido'
        }
      }
    }
  }
}

// Acceso con notación de puntos
t('auth.login.success', { username: 'Juan' })
t('auth.login.error')
t('auth.register.form.validation', { field: 'email' })
```

### 🔧 Versión sin `as const`

Si prefieres evitar completamente `as const`:

```typescript
import { createI18n, defineMessages } from '@kreisler/i18n'

// ✨ Define mensajes sin 'as const'
const messages = defineMessages({
  es: {
    greeting: 'Hola {name}',
    count: 'Tienes {0} elementos'
  },
  en: {
    greeting: 'Hello {name}',
    count: 'You have {0} items'
  }
})

// ✨ Crea i18n sin 'as const'
const i18n = createI18n({
  defaultLocale: 'es',
  messages
})
```

### 🛡️ Manejo de Errores

```typescript
// Clave no encontrada - devuelve la clave original
t('clave.inexistente') // "clave.inexistente"

// Parámetros faltantes - mantiene placeholders
t('greeting', { name: 'Juan' }) // Si falta {edad}: "Hola Juan, tienes {edad} años"

// Locale no encontrado - usa defaultLocale automáticamente
const tFr = i18n.useTranslations('fr') // Usa 'es' como fallback
```

## 📖 API Completa

### `i18n(config)` - Versión Simple

```typescript
interface I18nConfig {
  defaultLocale: string
  messages: Record<string, any>
  interpolation?: {
    prefix: string    // default: '{'
    suffix: string    // default: '}'
  }
}

const { useTranslations } = i18n(config)
const t = useTranslations('locale')
```

### `createI18n(config)` - Versión Avanzada

```typescript
interface I18nStrictConfig<Messages, DefaultLocale> {
  defaultLocale: DefaultLocale
  messages: Messages
}

const i18n = createI18n(config)
const t = i18n.useTranslations('locale')
const locales = i18n.getAvailableLocales()
const defaultLoc = i18n.getDefaultLocale()
```

### Funciones Auxiliares

```typescript
// Para configuración manual
const config = createI18nConfig({ defaultLocale: 'es', messages })
const i18n = i18nStrict(config)

// Para mensajes sin 'as const'
const messages = defineMessages({ es: { hello: 'Hola' } })
```

## 🎨 Ejemplos Avanzados

### Aplicación Multiidioma Completa

```typescript
import { createI18n } from '@kreisler/i18n'

const i18n = createI18n({
  defaultLocale: 'es',
  messages: {
    es: {
      nav: {
        home: 'Inicio',
        about: 'Acerca de',
        contact: 'Contacto'
      },
      forms: {
        validation: {
          required: 'El campo {field} es obligatorio',
          email: 'Email inválido: {email}',
          length: 'Debe tener entre {min} y {max} caracteres'
        }
      },
      notifications: {
        success: '¡Operación {0} completada exitosamente!',
        error: 'Error en {operation}: {message}',
        progress: 'Procesando {0} de {1} elementos...'
      }
    },
    en: {
      nav: {
        home: 'Home',
        about: 'About',
        contact: 'Contact'
      },
      forms: {
        validation: {
          required: 'Field {field} is required',
          email: 'Invalid email: {email}',
          length: 'Must be between {min} and {max} characters'
        }
      },
      notifications: {
        success: 'Operation {0} completed successfully!',
        error: 'Error in {operation}: {message}',
        progress: 'Processing {0} of {1} items...'
      }
    }
  }
})

// Uso en componentes
function FormComponent() {
  const t = i18n.useTranslations('es')
  
  return {
    validateEmail: (email: string) => 
      t('forms.validation.email', { email }),
    
    validateLength: (min: number, max: number) =>
      t('forms.validation.length', { min, max }),
    
    showProgress: (current: number, total: number) =>
      t('notifications.progress', current, total)
  }
}
```

### Integración con React/Vue/Angular

```typescript
// Hook personalizado para React
function useI18n(locale: string) {
  return i18n.useTranslations(locale)
}

// En tu componente
function MyComponent() {
  const t = useI18n('es')
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('notifications.success', 'guardado')}</p>
    </div>
  )
}
```

## 🔍 Comparación de Versiones

| Característica | v1 (`i18n`) | v2 (`createI18n`) |
|---------------|-------------|-------------------|
| Type Safety | ✅ Básico | ✅ Completo |
| Autocompletado | ✅ Claves | ✅ Claves + Parámetros |
| Parámetros | Solo posicionales | Posicionales + Nombrados |
| Notación puntos | ✅ | ✅ |
| Sin `as const` | ❌ | ✅ |
| Validación tipos | Básica | Estricta |
| JSDoc | Básico | Completo |

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Añade tests para nuevas funcionalidades
4. Asegúrate de que todos los tests pasen
5. Envía un Pull Request

## 📄 Licencia

MIT © [@kreisler](https://github.com/itskreisler)

---

<div align="center">
  <p>¿Te gusta este proyecto? ⭐ ¡Dale una estrella en GitHub!</p>
</div>
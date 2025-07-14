// Utility types for extracting parameters from translation strings
type ExtractVariables<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
    ? Param extends `${number}`
    ? [Param, ...ExtractVariables<Rest>]
    : [Param, ...ExtractVariables<Rest>]
    : []

// Extract positional parameters (numeric indices)
type ExtractPositionalParams<T extends string[]> = {
    [K in keyof T]: T[K] extends `${infer N extends number}` ? N : never
}[number]

// Extract named parameters (non-numeric)
type ExtractNamedParams<T extends string[]> = {
    [K in keyof T]: T[K] extends `${number}` ? never : T[K]
}[number]

// Create the parameter object type for named parameters
type CreateNamedParamsObject<T extends string> = ExtractNamedParams<ExtractVariables<T>> extends never
    ? object
    : Record<ExtractNamedParams<ExtractVariables<T>>, string | number>

// Get the highest positional index
type GetMaxPositionalIndex<T extends string[]> = ExtractPositionalParams<T> extends never
    ? -1
    : ExtractPositionalParams<T>

// Create tuple type for positional parameters
type CreatePositionalParamsTuple<T extends string, Max extends number = GetMaxPositionalIndex<ExtractVariables<T>>> =
    Max extends -1
    ? []
    : Max extends 0
    ? [string | number]
    : Max extends 1
    ? [string | number, string | number]
    : Max extends 2
    ? [string | number, string | number, string | number]
    : Max extends 3
    ? [string | number, string | number, string | number, string | number]
    : (string | number)[]

// Deep key paths for nested objects - ONLY for string leaf nodes
type DeepKeyPaths<T> = T extends object
    ? {
        [K in keyof T]: K extends string
        ? T[K] extends string
        ? `${K}`  // This is a string leaf, include it
        : T[K] extends object
        ? `${K}.${DeepKeyPaths<T[K]>}`  // This is an object, recurse but don't include the intermediate path
        : never
        : never
    }[keyof T]
    : never

// Get value at deep path
type DeepValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
    ? DeepValue<T[Key], Rest>
    : never
    : P extends keyof T
    ? T[P]
    : never

// Translation function signature
type TranslationFunction<Messages, Locale extends keyof Messages> = <
    Key extends DeepKeyPaths<Messages[Locale]>
>(
    key: Key,
    ...args: DeepValue<Messages[Locale], Key> extends string
        ? [
            ...CreatePositionalParamsTuple<DeepValue<Messages[Locale], Key>>,
            ...(keyof CreateNamedParamsObject<DeepValue<Messages[Locale], Key>> extends never
                ? []
                : [CreateNamedParamsObject<DeepValue<Messages[Locale], Key>>])
        ]
        : never[]
) => string

// Main i18n configuration interface
export interface I18nConfig<Messages extends Record<string, any>, DefaultLocale extends keyof Messages> {
    defaultLocale: DefaultLocale
    messages: Messages
}

// Return type for the i18n hook
export interface I18nStrict<Messages extends Record<string, any>, DefaultLocale extends keyof Messages> {
    useTranslations: <Locale extends keyof Messages>(locale: Locale) => TranslationFunction<Messages, Locale>
    getAvailableLocales: () => (keyof Messages)[]
    getDefaultLocale: () => DefaultLocale
}

//

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Helper function to replace variables in translation strings
function interpolateString(
    template: string,
    positionalArgs: (string | number)[],
    namedArgs: Record<string, string | number>
): string {
    let result = template

    // Replace named variables first
    Object.entries(namedArgs).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g')
        result = result.replace(regex, String(value))
    })

    // Replace positional variables
    positionalArgs.forEach((value, index) => {
        const regex = new RegExp(`\\{${index}\\}`, 'g')
        result = result.replace(regex, String(value))
    })

    return result
}

// Helper function to create config with proper type inference
export function createI18nConfig<
    const Messages extends Record<string, any>,
    DefaultLocale extends keyof Messages & string
>(config: {
    defaultLocale: DefaultLocale
    messages: Messages
}): I18nConfig<Messages, DefaultLocale> {
    return config
}

// Main i18n function
export function i18nStrict<
    Messages extends Record<string, any>,
    DefaultLocale extends keyof Messages
>(config: I18nConfig<Messages, DefaultLocale>): I18nStrict<Messages, DefaultLocale> {

    const useTranslations = <Locale extends keyof Messages>(locale: Locale) => {
        return (key: string, ...args: any[]): string => {
            const messages = config.messages[locale] || config.messages[config.defaultLocale]
            const template = getNestedValue(messages, key)

            if (typeof template !== 'string') {
                console.warn(`Translation key '${key}' not found for locale '${String(locale)}'`)
                return key
            }

            // Separate positional and named arguments
            const namedArgs = args.find(arg => typeof arg === 'object' && arg !== null && !Array.isArray(arg)) || {}
            const positionalArgs = args.filter(arg => typeof arg !== 'object' || arg === null || Array.isArray(arg))

            return interpolateString(template, positionalArgs, namedArgs)
        }
    }

    const getAvailableLocales = () => Object.keys(config.messages)
    const getDefaultLocale = () => config.defaultLocale

    return {
        useTranslations,
        getAvailableLocales,
        getDefaultLocale
    }
}

// Convenience function that combines both steps
export function createI18n<
    const Messages extends Record<string, any>,
    DefaultLocale extends keyof Messages & string
>(config: {
    defaultLocale: DefaultLocale
    messages: Messages
}): I18nStrict<Messages, DefaultLocale> {
    return i18nStrict(createI18nConfig(config))
}
// Versión completamente sin 'as const' - usando función de definición
export function defineMessages<const T extends Record<string, Record<string, any>>>(messages: T): T {
    return messages
}
/*
const messagesWithoutAsConst = defineMessages({
    es: {
        simple: 'Mensaje simple',
        saludo: 'Hola {nombre}, tienes {cantidad} mensajes',
        lista: 'Elemento 1: {0}, Elemento 2: {1}',
        resumen: 'Usuario: {user}, Edad: {edad}, País: {pais}',
        bienvenido: '¡Bienvenido!',
        numeros: 'Suma: {0} + {1} = {2}',
        eco: 'Eco: {palabra}, otra vez: {palabra}',
        contact: 'Mi direccion es {address} {numero}',
        subNivel: {
            numeros: 'Suma: {0} + {1} = {2}',
            anotherLevel: {
                lista: 'Elemento 1: {uno}, Elemento 2: {dos}',
                mixto: 'Hola {0}, tu usuario es {user} y tienes {1} de edad'
            }
        }
    },
    en: {
        simple: 'Simple message',
        saludo: 'Hello {nombre}, you have {cantidad} messages',
        lista: 'Item 1: {0}, Item 2: {1}',
        resumen: 'User: {user}, Age: {edad}, Country: {pais}',
        bienvenido: 'Welcome!',
        numeros: 'Sum: {0} + {1} = {2}',
        eco: 'Echo: {palabra}, again: {palabra}',
        contact: 'My address is {address} {numero}',
        subNivel: {
            numeros: 'Sum: {0} + {1} = {2}',
            anotherLevel: {
                lista: 'Item 1: {uno}, Item 2: {dos}',
                mixto: 'Hello {0}, your user is {user} and you are {1} years old'
            }
        }
    }
})

const messages = {
    es: {
        simple: 'Mensaje simple',
        saludo: 'Hola {nombre}, tienes {cantidad} mensajes',
        lista: 'Elemento 1: {0}, Elemento 2: {1}',
        resumen: 'Usuario: {user}, Edad: {edad}, País: {pais}',
        bienvenido: '¡Bienvenido!',
        numeros: 'Suma: {0} + {1} = {2}',
        eco: 'Eco: {palabra}, otra vez: {palabra}',
        contact: 'Mi direccion es {address} {numero}',
        subNivel: {
            numeros: 'Suma: {0} + {1} = {2}',
            anotherLevel: {
                lista: 'Elemento 1: {uno}, Elemento 2: {dos}',
                mixto: 'Hola {0}, tu usuario es {user} y tienes {1} de edad'
            }
        }
    },
    en: {
        simple: 'Simple message',
        saludo: 'Hello {nombre}, you have {cantidad} messages',
        lista: 'Item 1: {0}, Item 2: {1}',
        resumen: 'User: {user}, Age: {edad}, Country: {pais}',
        bienvenido: 'Welcome!',
        numeros: 'Sum: {0} + {1} = {2}',
        eco: 'Echo: {palabra}, again: {palabra}',
        contact: 'My address is {address} {numero}',
        subNivel: {
            numeros: 'Sum: {0} + {1} = {2}',
            anotherLevel: {
                lista: 'Item 1: {uno}, Item 2: {dos}',
                mixto: 'Hello {0}, your user is {user} and you are {1} years old'
            }
        }
    }
} as const
// Ejemplo 1: Configuration usando la nueva función helper (no 'as const' needed!)
export const usei18nStrict = createI18n({
    defaultLocale: 'es',
    messages
})

// Ejemplo 2: Configuración completamente sin 'as const' usando defineMessages
export const usei18nStrictNoAsConst = createI18n({
    defaultLocale: 'es',
    messages: messagesWithoutAsConst
})

const tEs = usei18nStrictNoAsConst.useTranslations('es')
const examples = {
    spanish: {
        simple: tEs('simple'),
        saludo: tEs('saludo', { nombre: 'Juan', cantidad: 5 }),
        lista: tEs('lista', 'Primero', 'Segundo'),
        resumen: tEs('resumen', { user: 'Juan', edad: 30, pais: 'España' }),
        bienvenido: tEs('bienvenido'),
        numeros: tEs('numeros', 3, 4, 7),
        eco: tEs('eco', { palabra: 'Hola' }),
        contact: tEs('contact', { address: 'Calle Falsa 123', numero: '#456' }),
        // Nested examples
        subNivelNumeros: tEs('subNivel.numeros', 5, 3, 8),
        anotherLevelLista: tEs('subNivel.anotherLevel.lista', { uno: 'Alpha', dos: 'Beta' }),
        // The complex mixed example you provided
        mixto: tEs('subNivel.anotherLevel.mixto', 'Mundo', 34, { user: 'Juan' })
    }
}
console.log(
    examples.spanish
)
*/

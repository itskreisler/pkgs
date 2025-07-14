/**
 * Extrae variables de plantillas de cadenas de traducción.
 * Encuentra todas las variables encerradas en llaves {} y devuelve un array con sus nombres.
 * 
 * @template T - El tipo de cadena a analizar
 * @example
 * ```typescript
 * // Devuelve ["nombre", "edad"]
 * type Variables = ExtractVariables<"Hola {nombre}, tienes {edad} años">
 * ```
 */
type ExtractVariables<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
    ? Param extends `${number}`
    ? [Param, ...ExtractVariables<Rest>]
    : [Param, ...ExtractVariables<Rest>]
    : []

/**
 * Extrae parámetros posicionales (índices numéricos) de un array de variables.
 * Filtra solo las variables que son números para parámetros posicionales como {0}, {1}, etc.
 * 
 * @template T - Array de nombres de variables extraídas
 * @example
 * ```typescript
 * // Devuelve 0 | 1
 * type PositionalParams = ExtractPositionalParams<["0", "nombre", "1"]>
 * ```
 */
type ExtractPositionalParams<T extends string[]> = {
    [K in keyof T]: T[K] extends `${infer N extends number}` ? N : never
}[number]

/**
 * Extrae parámetros nombrados (no numéricos) de un array de variables.
 * Filtra solo las variables que no son números para parámetros nombrados como {nombre}, {edad}, etc.
 * 
 * @template T - Array de nombres de variables extraídas
 * @example
 * ```typescript
 * // Devuelve "nombre" | "edad"
 * type NamedParams = ExtractNamedParams<["0", "nombre", "edad", "1"]>
 * ```
 */
type ExtractNamedParams<T extends string[]> = {
    [K in keyof T]: T[K] extends `${number}` ? never : T[K]
}[number]

/**
 * Crea el tipo de objeto para parámetros nombrados.
 * Si no hay parámetros nombrados, devuelve un objeto vacío.
 * Si los hay, crea un Record con las claves siendo los nombres de parámetros.
 * 
 * @template T - La cadena de plantilla a analizar
 * @example
 * ```typescript
 * // Devuelve Record<"nombre" | "edad", string | number>
 * type ParamsObject = CreateNamedParamsObject<"Hola {nombre}, tienes {edad} años">
 * ```
 */
type CreateNamedParamsObject<T extends string> = ExtractNamedParams<ExtractVariables<T>> extends never
    ? object
    : Record<ExtractNamedParams<ExtractVariables<T>>, string | number>

/**
 * Obtiene el índice posicional más alto de las variables extraídas.
 * Útil para determinar cuántos parámetros posicionales se necesitan.
 * 
 * @template T - Array de nombres de variables extraídas
 * @example
 * ```typescript
 * // Devuelve 2
 * type MaxIndex = GetMaxPositionalIndex<["0", "nombre", "2", "1"]>
 * ```
 */
type GetMaxPositionalIndex<T extends string[]> = ExtractPositionalParams<T> extends never
    ? -1
    : ExtractPositionalParams<T>

/**
 * Crea un tipo tupla para parámetros posicionales basado en el índice máximo.
 * Genera una tupla con la cantidad correcta de elementos string | number.
 * 
 * @template T - La cadena de plantilla a analizar
 * @template Max - El índice máximo posicional (calculado automáticamente)
 * @example
 * ```typescript
 * // Devuelve [string | number, string | number, string | number]
 * type PositionalTuple = CreatePositionalParamsTuple<"Item {0}: {1}, Total: {2}">
 * ```
 */
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

/**
 * Genera rutas de claves profundas para objetos anidados.
 * Solo incluye rutas que terminan en nodos de cadena (string).
 * Soporta notación de puntos para acceso a propiedades anidadas.
 * 
 * @template T - El tipo de objeto a analizar
 * @example
 * ```typescript
 * type Messages = {
 *   user: { name: string, age: string }
 *   simple: string
 * }
 * // Devuelve "user.name" | "user.age" | "simple"
 * type Paths = DeepKeyPaths<Messages>
 * ```
 */
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

/**
 * Obtiene el valor en una ruta profunda de un objeto.
 * Navega por las propiedades anidadas usando notación de puntos.
 * 
 * @template T - El tipo de objeto
 * @template P - La ruta como string con notación de puntos
 * @example
 * ```typescript
 * type Messages = { user: { name: string } }
 * // Devuelve string
 * type Value = DeepValue<Messages, "user.name">
 * ```
 */
type DeepValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
    ? DeepValue<T[Key], Rest>
    : never
    : P extends keyof T
    ? T[P]
    : never

/**
 * Firma de función para traducciones con tipos estrictos.
 * Proporciona autocompletado y validación de tipos para las claves de traducción
 * y sus parámetros correspondientes.
 * 
 * @template Messages - El objeto de mensajes completo
 * @template Locale - El tipo de locale específico
 * @example
 * ```typescript
 * const t: TranslationFunction<Messages, 'es'> = useTranslations('es')
 * t('user.name', { name: 'Juan' }) // Tipo seguro
 * ```
 */
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

/**
 * Interfaz de configuración principal para el sistema i18n.
 * Define la estructura requerida para configurar las traducciones.
 * 
 * @template Messages - Objeto que contiene todos los mensajes por locale
 * @template DefaultLocale - El locale por defecto que debe existir en Messages
 * @example
 * ```typescript
 * const config: I18nConfig<typeof messages, 'es'> = {
 *   defaultLocale: 'es',
 *   messages: {
 *     es: { hello: 'Hola' },
 *     en: { hello: 'Hello' }
 *   }
 * }
 * ```
 */
export interface I18nConfig<Messages extends Record<string, any>, DefaultLocale extends keyof Messages> {
    /** El locale por defecto a usar cuando una traducción no está disponible */
    defaultLocale: DefaultLocale
    /** Objeto que contiene los mensajes organizados por locale */
    messages: Messages
}

/**
 * Tipo de retorno del sistema i18n que proporciona acceso a las funciones de traducción.
 * Incluye métodos para obtener traducciones, locales disponibles y el locale por defecto.
 * 
 * @template Messages - Objeto que contiene todos los mensajes por locale
 * @template DefaultLocale - El locale por defecto
 * @example
 * ```typescript
 * const i18n: I18nStrict<typeof messages, 'es'> = createI18n(config)
 * const t = i18n.useTranslations('es')
 * ```
 */
export interface I18nStrict<Messages extends Record<string, any>, DefaultLocale extends keyof Messages> {
    /** 
     * Obtiene una función de traducción para el locale especificado.
     * @param locale - El locale para el cual obtener las traducciones
     * @returns Función de traducción con tipos estrictos
     */
    useTranslations: <Locale extends keyof Messages>(locale: Locale) => TranslationFunction<Messages, Locale>

    /** 
     * Obtiene una lista de todos los locales disponibles.
     * @returns Array con las claves de todos los locales disponibles
     */
    getAvailableLocales: () => (keyof Messages)[]

    /** 
     * Obtiene el locale por defecto configurado.
     * @returns El locale por defecto
     */
    getDefaultLocale: () => DefaultLocale
}

/**
 * Función auxiliar para obtener valores anidados de un objeto usando notación de puntos.
 * Navega por las propiedades del objeto siguiendo la ruta especificada.
 * 
 * @param obj - El objeto del cual extraer el valor
 * @param path - La ruta usando notación de puntos (ej: "user.profile.name")
 * @returns El valor encontrado en la ruta o undefined si no existe
 * @example
 * ```typescript
 * const obj = { user: { name: 'Juan' } }
 * getNestedValue(obj, 'user.name') // 'Juan'
 * getNestedValue(obj, 'user.age') // undefined
 * ```
 */
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Función auxiliar para reemplazar variables en cadenas de traducción.
 * Procesa tanto parámetros posicionales ({0}, {1}) como nombrados ({nombre}, {edad}).
 * Los parámetros nombrados se procesan primero para evitar conflictos.
 * 
 * @param template - La cadena plantilla con variables a reemplazar
 * @param positionalArgs - Array de valores para parámetros posicionales
 * @param namedArgs - Objeto con valores para parámetros nombrados
 * @returns La cadena con todas las variables reemplazadas
 * @example
 * ```typescript
 * interpolateString(
 *   'Hola {nombre}, tienes {0} mensajes',
 *   [5],
 *   { nombre: 'Juan' }
 * ) // 'Hola Juan, tienes 5 mensajes'
 * ```
 */
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

/**
 * Función auxiliar para crear configuración i18n con inferencia de tipos adecuada.
 * Utiliza el modificador `const` para preservar los tipos literales sin necesidad de `as const`.
 * 
 * @template Messages - Objeto de mensajes con inferencia constante
 * @template DefaultLocale - Tipo del locale por defecto
 * @param config - Configuración con defaultLocale y messages
 * @returns Configuración tipada para usar con i18nStrict
 * @example
 * ```typescript
 * const config = createI18nConfig({
 *   defaultLocale: 'es',
 *   messages: {
 *     es: { hello: 'Hola {nombre}' },
 *     en: { hello: 'Hello {nombre}' }
 *   }
 * }) // No necesita 'as const'
 * ```
 */
export function createI18nConfig<
    const Messages extends Record<string, any>,
    DefaultLocale extends keyof Messages & string
>(config: {
    defaultLocale: DefaultLocale
    messages: Messages
}): I18nConfig<Messages, DefaultLocale> {
    return config
}

/**
 * Función principal del sistema i18n que proporciona traducciones con tipos estrictos.
 * Crea un sistema de traducción completo con validación de tipos en tiempo de compilación.
 * 
 * @template Messages - Objeto que contiene todos los mensajes por locale
 * @template DefaultLocale - El locale por defecto
 * @param config - Configuración i18n que incluye defaultLocale y messages
 * @returns Sistema i18n con métodos para traducciones y gestión de locales
 * @example
 * ```typescript
 * const i18n = i18nStrict({
 *   defaultLocale: 'es',
 *   messages: {
 *     es: { greeting: 'Hola {nombre}' },
 *     en: { greeting: 'Hello {nombre}' }
 *   }
 * })
 * 
 * const t = i18n.useTranslations('es')
 * t('greeting', { nombre: 'Juan' }) // 'Hola Juan'
 * ```
 */
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

/**
 * Función de conveniencia que combina la creación de configuración y inicialización del sistema i18n.
 * Simplifica el proceso de configuración eliminando la necesidad de llamar a ambas funciones por separado.
 * Utiliza inferencia de tipos automática sin requerir `as const`.
 * 
 * @template Messages - Objeto de mensajes con inferencia constante
 * @template DefaultLocale - Tipo del locale por defecto
 * @param config - Configuración con defaultLocale y messages
 * @returns Sistema i18n completamente configurado y listo para usar
 * @example
 * ```typescript
 * // Uso simple sin 'as const'
 * const i18n = createI18n({
 *   defaultLocale: 'es',
 *   messages: {
 *     es: { 
 *       greeting: 'Hola {nombre}',
 *       count: 'Tienes {0} mensajes' 
 *     },
 *     en: { 
 *       greeting: 'Hello {nombre}',
 *       count: 'You have {0} messages' 
 *     }
 *   }
 * })
 * 
 * const t = i18n.useTranslations('es')
 * t('greeting', { nombre: 'Ana' }) // 'Hola Ana'
 * t('count', 5) // 'Tienes 5 mensajes'
 * ```
 */
export function createI18n<
    const Messages extends Record<string, any>,
    DefaultLocale extends keyof Messages & string
>(config: {
    defaultLocale: DefaultLocale
    messages: Messages
}): I18nStrict<Messages, DefaultLocale> {
    return i18nStrict(createI18nConfig(config))
}

/**
 * Función para definir mensajes con inferencia de tipos constantes.
 * Alternativa completamente libre de `as const` para definir objetos de mensajes.
 * Preserva los tipos literales automáticamente usando el modificador `const`.
 * 
 * @template T - Tipo del objeto de mensajes con inferencia constante
 * @param messages - Objeto que contiene los mensajes organizados por locale
 * @returns El mismo objeto de mensajes con tipos preservados
 * @example
 * ```typescript
 * // Completamente sin 'as const'
 * const messages = defineMessages({
 *   es: {
 *     welcome: 'Bienvenido {usuario}',
 *     items: 'Tienes {0} elementos'
 *   },
 *   en: {
 *     welcome: 'Welcome {usuario}',
 *     items: 'You have {0} items'
 *   }
 * })
 * 
 * // Usar con createI18n
 * const i18n = createI18n({
 *   defaultLocale: 'es',
 *   messages
 * })
 * ```
 */
export function defineMessages<const T extends Record<string, Record<string, any>>>(messages: T): T {
    return messages
}

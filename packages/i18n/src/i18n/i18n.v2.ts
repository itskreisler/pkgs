// ============================================================================
// NUEVA ITERACIÓN: i18nStrict limpio y funcional
// ============================================================================

// Tipos básicos
interface NestedTranslations {
    [key: string]: string | NestedTranslations;
}

type DotNotation<T> = T extends object
    ? {
        [K in keyof T]: T[K] extends string
        ? K
        : T[K] extends object
        ? `${K & string}.${DotNotation<T[K]> & string}`
        : never;
    }[keyof T]
    : never;

// Tipo para extraer parámetros nombrados de un string (simplificado)
type ExtractNamedParams<T extends string> =
    T extends `${string}{${infer ParamName}}${infer Rest}`
    ? ParamName extends `${number}`
    ? ExtractNamedParams<Rest>
    : { [K in ParamName]: string | number } & ExtractNamedParams<Rest>
    : Record<string, never>;

// Tipo helper exportado para crear parámetros nombrados desde un string
export type NamedParams<T extends string> = ExtractNamedParams<T> extends Record<string, never>
    ? Record<string, never>
    : ExtractNamedParams<T>;

interface I18nStrictConfig<T extends Record<string, NestedTranslations>> {
    defaultLocale: keyof T;
    messages: T;
}

// Función helper para obtener valores anidados
const getNestedValue = (obj: Record<string, any>, path: string): string => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) as unknown as string
}

// Función de interpolación que soporta múltiples tipos de parámetros
const interpolateParams = (text: string, params?: (string | number | Record<string, any>)[]): string => {
    if (!params || params.length === 0) return text

    // Caso especial: si hay un solo parámetro y es un array, usar interpolación posicional
    if (params.length === 1 && Array.isArray(params[0])) {
        return params[0].reduce((result: string, param, index) => {
            const placeholder = `{${index}}`
            return result.replace(placeholder, String(param))
        }, text)
    }

    // Separar parámetros posicionales de objetos
    const positionalParams: (string | number)[] = []
    let namedParams: Record<string, any> = {}

    params.forEach(param => {
        if (typeof param === 'object' && !Array.isArray(param) && param !== null) {
            // Es un objeto, agregar a parámetros nombrados
            namedParams = { ...namedParams, ...param }
        } else {
            // Es un primitivo, agregar a parámetros posicionales
            positionalParams.push(param as string | number)
        }
    })

    let result = text

    // Reemplazar parámetros posicionales primero
    positionalParams.forEach((param, index) => {
        result = result.replace(new RegExp(`\\{${index}\\}`, 'g'), String(param))
    })

    // Luego reemplazar parámetros nombrados
    result = result.replace(/\{([^{}]+)\}/g, (_, name) => {
        if (/^\d+$/.test(name)) {
            return `{${name}}` // Mantener parámetros posicionales no encontrados
        }
        return name in namedParams ? String(namedParams[name]) : `{${name}}`
    })

    return result
}

/**
 * Versión strict de i18n con autocompletado de keys y soporte para múltiples tipos de parámetros
 * 
 * @example 
 * const { useTranslations } = i18nStrict({
 *   defaultLocale: 'es',
 *   messages: {
 *     es: {
 *       simple: 'Mensaje simple',
 *       saludo: 'Hola {nombre}',               // Named params
 *       numeros: 'Suma: {0} + {1} = {2}',     // Positional params
 *       mixto: 'Hola {0}, tu usuario es {user}' // Mixed params
 *     }
 *   }
 * })
 */
export function i18nStrict<const T extends Record<string, NestedTranslations>>(
    userConfig: I18nStrictConfig<T>
) {
    function useTranslations<Locale extends keyof T>(lang: Locale) {
        /**
         * Función de traducción con autocompletado de keys
         */
        return function t(
            key: DotNotation<T[Locale]>,
            ...params: (string | number | Record<string, any>)[]
        ): string {
            const langTranslations = userConfig.messages[lang] || userConfig.messages[userConfig.defaultLocale] || {}
            const translation = getNestedValue(langTranslations as Record<string, any>, key as string)
                || `{${key.toString()}}`

            // Si no hay parámetros, devolver la traducción tal como está
            if (params.length === 0) {
                return translation
            }

            return interpolateParams(translation, params)
        }
    }

    return { useTranslations }
}

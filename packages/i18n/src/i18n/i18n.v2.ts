type Messages = Record<string, Record<string, string>>;

// Extract placeholder names from a translation string
type ExtractPlaceholders<S extends string> =
    S extends `${string}{${infer Param}}${infer Rest}`
    ? Param | ExtractPlaceholders<Rest>
    : never;

// Count numbered placeholders in a string
type CountPlaceholders<S extends string, Count extends any[] = []> =
    S extends `${string}{${Count['length']}}${infer Rest}`
    ? CountPlaceholders<Rest, [...Count, any]>
    : Count['length'];

// Helper type to build a tuple of the required length
type BuildTuple<Length extends number, T = any, Acc extends any[] = []> =
    Acc['length'] extends Length
    ? Acc
    : BuildTuple<Length, T, [...Acc, T]>;

// Type for positional parameters based on the translation string
type PositionalParams<S extends string> =
    BuildTuple<CountPlaceholders<S>>;

// Type for named parameters based on the translation string
type NamedParams<S extends string> = {
    [K in ExtractPlaceholders<S> extends never ? never : ExtractPlaceholders<S>]:
    K extends `${number}` ? never : string | number;
};

// Type to determine the parameter type based on the translation string
type ParamType<S extends string> =
    S extends `${string}{${number}}${string}`
    ? PositionalParams<S>
    : S extends `${string}{${string}}${string}`
    ? NamedParams<S>
    : undefined;

// Get message type for a specific key
type GetMessage<T extends Messages, L extends keyof T, K extends keyof T[L]> = T[L][K];

// Check if a string has placeholders
type HasPlaceholders<S extends string> = S extends `${string}{${string}}${string}` ? true : false;

// Translation function with overloads
interface TranslationFunction<T extends Messages, L extends keyof T> {
    // No parameters needed (when string has no placeholders)
    <K extends keyof T[L]>(
        key: K
    ): HasPlaceholders<GetMessage<T, L, K>> extends false ? string : never;

    // With parameters (when string has placeholders)
    <K extends keyof T[L]>(
        key: K,
        params: ParamType<GetMessage<T, L, K>>
    ): HasPlaceholders<GetMessage<T, L, K>> extends true ? string : never;
}

interface I18nConfig<T extends Messages> {
    defaultLocale: keyof T;
    messages: T;
}
/**
 * 
 * @example
 * const i18n = i18nLite({
 * 
 * 
 */
export function i18nLite<
    const T extends Record<string, Record<string, string>>
>(config: I18nConfig<T>) {
    function useTranslations<L extends keyof T>(locale: L): TranslationFunction<T, L> {
        const messages = config.messages[locale]

        if (!messages) {
            console.warn(`Locale "${String(locale)}" not found, falling back to "${String(config.defaultLocale)}"`)
            return ((key: string) => key) as TranslationFunction<T, L>
        }

        const translationFunction = (key: keyof T[L], params?: any): string => {
            const message = messages[key] as string

            if (!message) {
                console.warn(`Translation key "${String(key)}" not found in locale "${String(locale)}"`)
                return String(key)
            }

            // If no params, return the translation string as is
            if (params === undefined) {
                return message
            }

            // Handle named parameters (object)
            if (typeof params === 'object' && !Array.isArray(params)) {
                return message.replace(/\{([^{}]+)\}/g, (_, name) => {
                    return name in params ? String(params[name]) : `{${name}}`
                })
            }

            // Handle positional parameters (array)
            if (Array.isArray(params)) {
                return message.replace(/\{(\d+)\}/g, (_, index) => {
                    const paramIndex = Number(index)
                    return paramIndex < params.length ? String(params[paramIndex]) : `{${index}}`
                })
            }

            return message
        }

        return translationFunction as TranslationFunction<T, L>
    }

    return { useTranslations }
}
//
/* 
const { useTranslations } = i18nLite({
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
            eco: 'Eco: {palabra}, otra vez: {palabra}',
            contact: 'Mi direccion es {address}'

        },
        en: {
            simple: 'hola'
        }
    }
})
const lang = 'es'
const t = useTranslations(lang)
console.log({
    simple: t('simple'),
    saludo: t('saludo', { nombre: 'Klei', cantidad: 3 }),
    lista: t('lista', ['papas', 'peraz']),
    numeros: t('numeros', [5, 4, ((a, b) => a + b)(5, 4)]),
    contact: t('contact', { address: String(Math.PI) })
})
 */

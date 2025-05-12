interface I18nConfig {
    defaultLocale: string;
    messages: Record<string, any>;
    interpolation?: {
        prefix: string;
        suffix: string;
    };
}

const defaultConfig: I18nConfig = {
    defaultLocale: 'en',
    messages: {},
    interpolation: {
        prefix: '{{',
        suffix: '}}'
    }
}

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

const getNestedValue = (obj: Record<string, any>, path: string): string => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) as unknown as string
}

const interpolateParams = (text: string, params?: (string | number)[]): string => {
    if (!params || params.length === 0) return text
    return params.reduce((result: string, param, index) => {
        const placeholder = `{${index}}`
        return result.replace(placeholder, String(param))
    }, text)
}
/**
 * 
 * @example 
 * const { useTranslations } = createI18n({
 * defaultLocale: 'es',
 * messages: {
 *    es: {
 *       test: 'Hola {0}',
 *      world: 'Mundo'
 *   }
 * }
 * })
 */
export function createI18n<T extends Record<string, NestedTranslations>>(userConfig: Partial<I18nConfig> & { messages: T }) {
    const config: I18nConfig = {
        ...defaultConfig,
        ...userConfig,
        messages: {
            ...defaultConfig.messages,
            ...(userConfig.messages || {})
        }
    }

    function useTranslations<Locale extends keyof T>(lang: Locale) {
        return function t(key: DotNotation<T[Locale]>, ...params: (string | number)[]): string {
            const langTranslations = config.messages[lang as string] || config.messages[config.defaultLocale] || {}
            const translation = getNestedValue(langTranslations, key as string) || '{'.concat(key as string, '}')
            return interpolateParams(translation, params)
        }
    }

    return { useTranslations, config }
}
/*
export const messages = {
    es: {
        name: 'Jose'
    }
} as const

const { useTranslations } = createI18n({
    defaultLocale: 'es',
    messages: {
        es: {
            test: 'Hola {0}',
            world: 'Mundo'

        }
    }
})

const t = useTranslations('es')

// Ahora el autocompletado funciona con la nueva estructura
const title = t('test', 'world')
console.log({
    title
})
*/

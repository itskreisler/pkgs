interface I18nConfig {
    defaultLocale: string;
    messages: Record<string, any>;
    interpolation?: {
        prefix: string;
        suffix: string;
    };
}
const defaultInterpolation = {
    prefix: '{',
    suffix: '}'
}
const defaultConfig: I18nConfig = {
    defaultLocale: 'en',
    messages: {},
    interpolation: defaultInterpolation
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

const interpolateParams = (text: string, params?: (string | number)[], interpolation?: {
    prefix: string;
    suffix: string;
}): string => {
    if (!params || params.length === 0) return text
    if (!interpolation) return text
    return params.reduce((result: string, param, index) => {
        const placeholder = String().concat(
            interpolation?.prefix,
            index.toString(),
            interpolation?.suffix
        )
        return result.replace(placeholder, String(param))
    }, text)
}
/**
 * 
 * @example 
 * const { useTranslations } = i18n({
 * defaultLocale: 'es',
 * messages: {
 *    es: {
 *       test: 'Hola {0}',
 *       world: 'Mundo',
 *       subNivel: {
 *           numeros: 'Suma: {0} + {1} = {2}',
 *           anotherLevel: {
 *              lista: 'Elemento 1: {0}, Elemento 2: {1}'
 *           }
 *       }
 *   },
 *    en: {
 *       test: 'Hello {0}',
 *       world: 'World'
 *   }
 * }
 * })
 */
export function i18n<T extends Record<string, NestedTranslations>>(userConfig: Partial<I18nConfig> & { messages: T }) {
    const config: I18nConfig = {
        ...defaultConfig,
        ...userConfig,
        messages: {
            ...defaultConfig.messages,
            ...(userConfig.messages || {})
        }
    }
    function useTranslations<Locale extends keyof T>(lang: Locale) {
        /**
         * @param {DotNotation<T[Locale]>} key - The key of the translation to retrieve.
         * @param {...(string | number)[]} params - The parameters to interpolate in the translation.
         * @returns {string} - The translated string with interpolated parameters.
         */
        return function t(key: DotNotation<T[Locale]>, ...params: (string | number)[]): string {
            const langTranslations = config.messages[lang as string] || config.messages[config.defaultLocale] || {}
            const translation = getNestedValue(langTranslations, key as string)
                || String().concat(
                    config.interpolation?.prefix ?? defaultInterpolation.prefix,
                    key.toString(),
                    config.interpolation?.suffix ?? defaultInterpolation.suffix)
            return interpolateParams(translation, params, config.interpolation)
        }
    }

    return { useTranslations, config }
};
/*
const messages = {
    en: {
        test: 'Hello {0}',
        world: 'World'
    }
}

const { useTranslations, config } = i18n({
    defaultLocale: 'en',
    messages
})
*/

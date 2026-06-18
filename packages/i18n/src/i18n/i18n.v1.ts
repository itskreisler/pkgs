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

type TemplatePart = { type: 'text'; value: string } | { type: 'placeholder'; index: number }

const parseTemplate = (text: string, interpolation: { prefix: string; suffix: string }): TemplatePart[] => {
    const parts: TemplatePart[] = []
    const prefix = interpolation.prefix
    const suffix = interpolation.suffix
    // escape special regex characters in prefix and suffix
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`${esc(prefix)}(\\d+)${esc(suffix)}`, 'g')

    let lastIndex = 0
    let match
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', value: text.substring(lastIndex, match.index) })
        }
        parts.push({ type: 'placeholder', index: parseInt(match[1], 10) })
        lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) {
        parts.push({ type: 'text', value: text.substring(lastIndex) })
    }
    return parts
}

const interpolateParams = (parts: TemplatePart[], params?: (string | number)[]): string => {
    if (!params || params.length === 0) {
        return parts.reduce((acc, part) => acc + (part.type === 'text' ? part.value : ''), '')
    }

    return parts.reduce((result: string, part) => {
        if (part.type === 'text') {
            return result + part.value
        } else {
            return result + (params[part.index] !== undefined ? String(params[part.index]) : `{${part.index}}`)
        }
    }, '')
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
    const cache = new Map<string, Map<string, TemplatePart[]>>()

    function useTranslations<Locale extends keyof T>(lang: Locale) {
        const langStr = lang as string
        let langCache = cache.get(langStr)
        if (!langCache) {
            langCache = new Map()
            cache.set(langStr, langCache)
        }
        const currentLangCache = langCache

        /**
         * @param {DotNotation<T[Locale]>} key - The key of the translation to retrieve.
         * @param {...(string | number)[]} params - The parameters to interpolate in the translation.
         * @returns {string} - The translated string with interpolated parameters.
         */
        return function t(key: DotNotation<T[Locale]>, ...params: (string | number)[]): string {
            const keyStr = key as string
            let cached = currentLangCache.get(keyStr)

            if (!cached) {
                const langTranslations = config.messages[langStr] || config.messages[config.defaultLocale] || {}
                const translation = getNestedValue(langTranslations, keyStr)

                if (!translation) {
                    const fallback = String().concat(
                        config.interpolation?.prefix ?? defaultInterpolation.prefix,
                        key.toString(),
                        config.interpolation?.suffix ?? defaultInterpolation.suffix)
                    return fallback
                }

                cached = parseTemplate(translation, config.interpolation || defaultInterpolation)
                currentLangCache.set(keyStr, cached)
            }

            return interpolateParams(cached, params)
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

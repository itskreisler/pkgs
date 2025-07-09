// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES

import { describe, it } from 'node:test'

import assert from 'node:assert'

// » IMPORT MODULES
import { i18n, i18nLite } from '@/index'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('tset', () => {
    it('should return message', () => {
        const result = i18n({ defaultLocale: 'es', messages: { es: { hello: 'hola mundo' } } }).useTranslations('es')('hello')
        assert.strictEqual(result, 'hola mundo')
    })
    it('should return message with params', () => {
        const result = i18nLite({ defaultLocale: 'es', messages: { es: { hello: 'hola {name}' } } })
            .useTranslations('es')('hello', { name: 'mundo' })
        assert.strictEqual(result, 'hola mundo')
    })
})

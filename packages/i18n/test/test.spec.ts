// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES

import { describe, it } from 'node:test'

import assert from 'node:assert'

// » IMPORT MODULES
import { i18n, i18nStrict } from '@/index'

const t = i18nStrict({
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

        }
    }
})
// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('test', () => {
    it('should return message', () => {
        const result = i18n({ defaultLocale: 'es', messages: { es: { hello: 'hola mundo' } } }).useTranslations('es')('hello')
        assert.strictEqual(result, 'hola mundo')
    })
    it('should return message with params', () => {
        const result = i18nStrict({ defaultLocale: 'es', messages: { es: { hello: 'hola {name}' } } })
            .useTranslations('es')('hello', { name: 'mundo' })
        assert.strictEqual(result, 'hola mundo')
    })
})
describe('testLite', () => {
    it('should return simple message', () => {
        const result = t.useTranslations('es')('simple')
        assert.strictEqual(result, 'Mensaje simple')
    })

    it('should return message with multiple params', () => {
        const result = t.useTranslations('es')('saludo', { nombre: 'Juan', cantidad: 5 })
        assert.strictEqual(result, 'Hola Juan, tienes 5 mensajes')
    })

    it('should return message with array params', () => {
        const result = t.useTranslations('es')('lista', ['Elemento 1', 'Elemento 2'])
        assert.strictEqual(result, 'Elemento 1: Elemento 1, Elemento 2: Elemento 2')
    })

    it('should return message with object params', () => {
        const result = t.useTranslations('es')('resumen', { user: 'Juan', edad: 30, pais: 'España' })
        assert.strictEqual(result, 'Usuario: Juan, Edad: 30, País: España')
    })

    it('should return welcome message without params', () => {
        const result = t.useTranslations('es')('bienvenido')
        assert.strictEqual(result, '¡Bienvenido!')
    })

    it('should return mixed message with array and object params', () => {
        const result = t.useTranslations('es')('mixto', ['Mundo', { user: 'Juan' }])
        assert.strictEqual(result, 'Hola Mundo, tu usuario es Juan')
    })

    it('should return message with numeric calculations', () => {
        const result = t.useTranslations('es')('numeros', [3, 4, 7])
        assert.strictEqual(result, 'Suma: 3 + 4 = 7')
    })

    it('should return eco message with repeated word', () => {
        const result = t.useTranslations('es')('eco', { palabra: 'eco' })
        assert.strictEqual(result, 'Eco: eco, otra vez: eco')
    })

    it('should return contact address message with object param', () => {
        const result = t.useTranslations('es')('contact', { address: 'Calle Falsa 123' })
        assert.strictEqual(result, 'Mi direccion es Calle Falsa 123')
    })
})

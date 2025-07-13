// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES

import { describe, it } from 'node:test'

import assert from 'node:assert'

// » IMPORT MODULES
import { i18n, i18nStrict } from '@/index'

const usei18nStrict = i18nStrict({
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
const tStrict = usei18nStrict.useTranslations('es')
// 
const usei18n = i18n({
    defaultLocale: 'es', messages: {
        es: {
            hello: 'hola mundo',
            wellcome: '¡Bienvenido {0} {1}!',
            subNivel: {
                numeros: 'Suma: {0} + {1} = {2}',
                anotherLevel: {
                    lista: 'Elemento 1: {0}, Elemento 2: {1}'
                }
            }
        }
    }
})
const t = usei18n.useTranslations('es')
// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('testNormal', () => {
    it('should return message', () => {
        const result = t('hello')
        assert.strictEqual(result, 'hola mundo')
    })
    it('should return message with params', () => {
        const result = t('wellcome', 'Kreisler', 'Dev')
        assert.strictEqual(result, '¡Bienvenido Kreisler Dev!')
    })
    it('should return message with sub-level', () => {
        const result = t('subNivel.numeros', 3, 4, 7)
        assert.strictEqual(result, 'Suma: 3 + 4 = 7')
    })
    it('should return message with sub-level and another level', () => {
        const result = t('subNivel.anotherLevel.lista', 'Elemento 1', 'Elemento 2')
        assert.strictEqual(result, 'Elemento 1: Elemento 1, Elemento 2: Elemento 2')
    })

})
describe('testStrict', () => {
    it('should return message with params', () => {
        const result = i18nStrict({ defaultLocale: 'es', messages: { es: { hello: 'hola {name}' } } })
            .useTranslations('es')('hello', { name: 'mundo' })
        assert.strictEqual(result, 'hola mundo')
    })
    it('should return simple message', () => {
        const result = tStrict('simple')
        assert.strictEqual(result, 'Mensaje simple')
    })

    it('should return message with multiple params', () => {
        const result = tStrict('saludo', { nombre: 'Juan', cantidad: 5 })
        assert.strictEqual(result, 'Hola Juan, tienes 5 mensajes')
    })

    it('should return message with array params', () => {
        const result = tStrict('lista', ['Elemento 1', 'Elemento 2'])
        assert.strictEqual(result, 'Elemento 1: Elemento 1, Elemento 2: Elemento 2')
    })

    it('should return message with object params', () => {
        const result = tStrict('resumen', { user: 'Juan', edad: 30, pais: 'España' })
        assert.strictEqual(result, 'Usuario: Juan, Edad: 30, País: España')
    })

    it('should return welcome message without params', () => {
        const result = tStrict('bienvenido')
        assert.strictEqual(result, '¡Bienvenido!')
    })

    it('should return mixed message with array and object params', () => {
        const result = tStrict('mixto', ['Mundo', { user: 'Juan' }])
        assert.strictEqual(result, 'Hola Mundo, tu usuario es Juan')
    })

    it('should return message with numeric calculations', () => {
        const result = tStrict('numeros', [3, 4, 7])
        assert.strictEqual(result, 'Suma: 3 + 4 = 7')
    })

    it('should return eco message with repeated word', () => {
        const result = tStrict('eco', { palabra: 'eco' })
        assert.strictEqual(result, 'Eco: eco, otra vez: eco')
    })

    it('should return contact address message with object param', () => {
        const result = tStrict('contact', { address: 'Calle Falsa 123' })
        assert.strictEqual(result, 'Mi direccion es Calle Falsa 123')
    })
})

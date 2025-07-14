// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES

import { describe, it } from 'node:test'

import assert from 'node:assert'

// » IMPORT MODULES
import { i18n, createI18n as i18nStrict } from '@/index'

const usei18nStrict = i18nStrict({
    defaultLocale: 'es',
    messages: {
        es: {
            simple: 'Mensaje simple',
            saludo: 'Hola {nombre}, tienes {cantidad} mensajes',
            lista: 'Elemento 1: {0}, Elemento 2: {1}',
            resumen: 'Usuario: {user}, Edad: {edad}, País: {pais}',
            bienvenido: '¡Bienvenido!',
            mixto: 'Hola {0}, tu usuario es {user} y tengo {1} años',
            numeros: 'Suma: {0} + {1} = {2}',
            eco: 'Eco: {palabra}, otra vez: {palabra}',
            contact: 'Mi direccion es {address}',
            subNivel: {
                numeros: 'Suma: {0} + {1} = {2}',
                anotherLevel: {
                    lista: 'Elemento 1: {uno}, Elemento 2: {dos}'
                }
            }
        },
        en: {
            simple: 'Simple message'
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

    it('should return message with named params', () => {
        const result = tStrict('saludo', { nombre: 'Juan', cantidad: 5 })
        assert.strictEqual(result, 'Hola Juan, tienes 5 mensajes')
    })

    it('should return message with positional params', () => {
        const result = tStrict('lista', 'Elemento 1', 'Elemento 2')
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

    it('should return mixed message with positional and named params', () => {
        // mixto: 'Hola {0}, tu usuario es {user} y tengo {1} años'
        // Requiere: parámetro 0, parámetro 1, y {user} el orden es el siguiente: primero los posicionales(0,1,etc), luego los nombrados({key: value})
        const result = tStrict('mixto', 'Mundo', 24, { user: 'Juan' })
        assert.strictEqual(result, 'Hola Mundo, tu usuario es Juan y tengo 24 años')
    })

    it('should return message with numeric calculations', () => {
        const result = tStrict('numeros', 3, 4, 7)
        assert.strictEqual(result, 'Suma: 3 + 4 = 7')
    })

    it('should return eco message with repeated word', () => {
        const result = tStrict('eco', { palabra: 'hellooo' })
        assert.strictEqual(result, 'Eco: hellooo, otra vez: hellooo')
    })

    it('should return contact address message', () => {
        const result = tStrict('contact', { address: 'Calle Falsa 123' })
        assert.strictEqual(result, 'Mi direccion es Calle Falsa 123')
    })

    it('should work with nested keys', () => {
        const result = tStrict('subNivel.numeros', 3, 4, 7)
        assert.strictEqual(result, 'Suma: 3 + 4 = 7')
    })

    it('should work with deep nested keys', () => {
        const result = tStrict('subNivel.anotherLevel.lista', { uno: 'Primero', dos: 'Segundo' })
        assert.strictEqual(result, 'Elemento 1: Primero, Elemento 2: Segundo')
    })

    it('should demonstrate NamedParams type helper', () => {
        // mixto: 'Hola {0}, tu usuario es {user} y tengo {1} años'
        // Uso directo con todos los parámetros necesarios
        const result = tStrict('mixto', 'Mundo', 25, { user: 'Juan' })
        assert.strictEqual(result, 'Hola Mundo, tu usuario es Juan y tengo 25 años')
    })

    it('should handle array as single parameter', () => {
        const result = tStrict('lista', 'Elemento A', 'Elemento B')
        assert.strictEqual(result, 'Elemento 1: Elemento A, Elemento 2: Elemento B')
    })

    // Tests adicionales para verificar funcionalidades específicas
    it('should handle missing translation keys gracefully', () => {
        // @ts-expect-error - Testing with invalid key for runtime behavior
        const result = tStrict('keyInexistente')
        assert.strictEqual(result, 'keyInexistente')
    })

    it('should handle missing parameters gracefully', () => {
        // Caso donde faltan parámetros - debería mantener los placeholders
        const result = tStrict('numeros', 3, 4) // Falta el tercer parámetro
        assert.strictEqual(result, 'Suma: 3 + 4 = {2}')
    })

    it('should work with different locales', () => {
        const tEn = usei18nStrict.useTranslations('en')
        const result = tEn('simple')
        assert.strictEqual(result, 'Simple message')
    })

    it('should handle numbers and strings equally in parameters', () => {
        const result1 = tStrict('numeros', 3, 4, 7)
        const result2 = tStrict('numeros', '3', '4', '7')
        assert.strictEqual(result1, 'Suma: 3 + 4 = 7')
        assert.strictEqual(result2, 'Suma: 3 + 4 = 7')
    })

    it('should handle nested object access correctly', () => {
        const result1 = tStrict('subNivel.numeros', 10, 20, 30)
        const result2 = tStrict('subNivel.anotherLevel.lista', { uno: 'First', dos: 'Second' })
        assert.strictEqual(result1, 'Suma: 10 + 20 = 30')
        assert.strictEqual(result2, 'Elemento 1: First, Elemento 2: Second')
    })

    it('should handle repeated parameter names correctly', () => {
        const result = tStrict('eco', { palabra: 'test123' })
        assert.strictEqual(result, 'Eco: test123, otra vez: test123')
    })

})

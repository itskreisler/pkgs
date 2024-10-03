/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
// @ts-expect-error
import { describe, it, afterEach, beforeEach } from 'node:test'
// @ts-expect-error
import assert from 'node:assert'

// » IMPORT MODULES
import { JsCron } from '@/lib/main'
// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Opciones predeterminadas para la inicialización de JsCron
const defaultOptions = { timezone: 'America/Bogota' }

let cron: JsCron

// `beforeEach` se ejecuta antes de cada prueba individual.
beforeEach(() => {
  // Inicializamos una nueva instancia de JsCron antes de cada test
  cron = new JsCron(defaultOptions)
})

// `afterEach` se ejecuta después de cada prueba individual.
afterEach(() => {
  // Limpiar todas las tareas programadas después de cada prueba
  cron.getTasks().forEach((task, name) => cron.destroyTask(name))
})

describe('JsCron - Constructor', () => {
  it('Debería inicializar con las opciones proporcionadas', () => {
    // @ts-expect-error
    assert.deepStrictEqual(cron.config, defaultOptions, 'La configuración no se inicializó correctamente.')
  })
  it('should return true if task exists', () => {
    cron.createTask('testTask', '* * * * * *', () => console.log('Test Task'))
    assert.strictEqual(cron.hasTask('testTask'), true, 'La tarea debería existir.')
  })

  it('should return false if task does not exist', () => {
    assert.strictEqual(cron.hasTask('nonExistentTask'), false, 'La tarea no debería existir.')
  })
})

describe('JsCron - createTask', () => {
  it('Debería crear una tarea con una expresión cron válida', () => {
    const result = cron.createTask('tarea1', '* * * * * *', () => console.log('Hola'))
    assert.strictEqual(result.success, true, 'La tarea no se creó correctamente.')
    assert.strictEqual(result.message, 'Tarea "tarea1" creada con éxito.', 'Mensaje de éxito incorrecto.')
    assert.ok(result.task, 'La tarea no fue retornada correctamente.')
  })

  it('No debería crear una tarea con una expresión cron inválida', () => {
    const result = cron.createTask('tarea2', 'expresión-inválida', () => console.log('Hola'))
    assert.strictEqual(result.success, false, 'Se creó la tarea a pesar de tener una expresión inválida.')
    assert.strictEqual(result.message, 'La expresión "expresión-inválida" no es válida.', 'Mensaje de error incorrecto.')
  })

  it('No debería permitir crear tareas con nombres duplicados', () => {
    cron.createTask('tarea3', '* * * * * *', () => console.log('Hola'))
    const result = cron.createTask('tarea3', '* * * * * *', () => console.log('Hola'))
    assert.strictEqual(result.success, false, 'Permitió crear una tarea con nombre duplicado.')
    assert.strictEqual(result.message, 'La tarea "tarea3" ya existe.', 'Mensaje de error por duplicación incorrecto.')
  })
})

describe('JsCron - destroyTask', () => {
  it('Debería destruir una tarea existente', () => {
    cron.createTask('tarea4', '* * * * * *', () => console.log('Hola'))
    const result = cron.destroyTask('tarea4')
    assert.strictEqual(result.success, true, 'No se destruyó la tarea existente.')
    assert.strictEqual(result.message, 'Tarea "tarea4" destruida con éxito.', 'Mensaje de éxito incorrecto.')
  })

  it('No debería destruir una tarea inexistente', () => {
    const result = cron.destroyTask('tarea5')
    assert.strictEqual(result.success, false, 'Se intentó destruir una tarea inexistente.')
    assert.strictEqual(result.message, 'La tarea "tarea5" no existe.', 'Mensaje de error incorrecto para tarea inexistente.')
  })
})

describe('JsCron - pauseTask & resumeTask', () => {
  it('Debería pausar una tarea existente', () => {
    cron.createTask('tarea6', '* * * * * *', () => console.log('Hola'))
    const resultPause = cron.pauseTask('tarea6')
    assert.strictEqual(resultPause.success, true, 'No se pausó la tarea correctamente.')
    assert.strictEqual(resultPause.message, 'Tarea "tarea6" pausada.', 'Mensaje de pausa incorrecto.')
  })

  it('No debería pausar una tarea inexistente', () => {
    const result = cron.pauseTask('tarea7')
    assert.strictEqual(result.success, false, 'Se intentó pausar una tarea inexistente.')
    assert.strictEqual(result.message, 'La tarea "tarea7" no esta definida.', 'Mensaje de error incorrecto para tarea inexistente.')
  })

  it('Debería reanudar una tarea existente', () => {
    cron.createTask('tarea8', '* * * * * *', () => console.log('Hola'))
    cron.pauseTask('tarea8') // Pausar la tarea antes de reanudarla

    const resultResume = cron.resumeTask('tarea8')
    assert.strictEqual(resultResume.success, true, 'No se reanudó la tarea correctamente.')
    assert.strictEqual(resultResume.message, 'Tarea "tarea8" reanudada.', 'Mensaje de reanudación incorrecto.')
  })
})

describe('JsCron - Size Validation', () => {
  it('Debería iniciar sin tareas creadas', () => {
    // Validar que inicialmente no haya ninguna tarea en el mapa
    assert.strictEqual(cron.getTasks().size, 0, 'No debería haber ninguna tarea inicial.')
  })

  it('Debería aumentar el tamaño al agregar tareas', () => {
    cron.createTask('tarea1', '* * * * * *', () => console.log('Tarea 1'))
    cron.createTask('tarea2', '* * * * * *', () => console.log('Tarea 2'))
    // Validar que el tamaño sea 2 después de agregar dos tareas
    assert.strictEqual(cron.getTasks().size, 2, 'El tamaño del mapa no coincide con las tareas agregadas.')
  })

  it('Debería disminuir el tamaño al destruir tareas', () => {
    cron.createTask('tarea1', '* * * * * *', () => console.log('Tarea 1'))
    cron.createTask('tarea2', '* * * * * *', () => console.log('Tarea 2'))
    cron.destroyTask('tarea1') // Eliminar una tarea
    // Validar que el tamaño sea 1 después de eliminar una tarea
    assert.strictEqual(cron.getTasks().size, 1, 'El tamaño del mapa no disminuyó correctamente al eliminar la tarea.')
  })

  it('No debería cambiar el tamaño al intentar destruir una tarea inexistente', () => {
    cron.createTask('tarea1', '* * * * * *', () => console.log('Tarea 1'))
    cron.createTask('tarea2', '* * * * * *', () => console.log('Tarea 2'))
    cron.createTask('tarea1', '* * * * * *', () => console.log('Tarea 1')) // Crear una tarea con nombre duplicado
    cron.destroyTask('tareaInexistente') // Intentar destruir una tarea que no existe
    // Validar que el tamaño permanezca en 2
    assert.strictEqual(cron.getTasks().size, 2, 'El tamaño del mapa cambió al intentar eliminar una tarea inexistente.')
  })
})

/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
import { describe, it } from 'node:test'
import assert from 'node:assert'

// » IMPORT MODULES
import { JsCron } from '../dist/index.mjs'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('TESTING', async () => {
  it('Comprobando si crea un tarea correctamente', async () => {
    const cron = new JsCron()
    const newTask = cron.createTask('tarea', '*/1 * * * * *', () => 'Hello World!')
    assert.strictEqual(newTask.success, true)
    assert.strictEqual(newTask.message, 'Tarea "tarea" creada con éxito.')
    setTimeout(() => {
      cron.destroyTask('tarea')
    }, 1000)
  })
  it('Comprobando para ver si la tarea ya existe', () => {
    const cron = new JsCron()
    const newTask = cron.createTask('tarea', '*/1 * * * * *', () => 'Hello World!')
    assert.strictEqual(newTask.success, true)
    assert.strictEqual(newTask.message, 'Tarea "tarea" creada con éxito.')
    const newTask2 = cron.createTask('tarea', '*/1 * * * * *', () => 'Hello World!')
    assert.strictEqual(newTask2.success, false)
    assert.strictEqual(newTask2.message, 'La tarea "tarea" ya existe.')
    setTimeout(() => {
      cron.destroyTask('tarea')
    }, 1000)
  })
  it('Comprobando si expresion cron no es valida', () => {
    const cron = new JsCron()
    const newTask = cron.createTask('tarea', '*/1 *', () => 'Hello World!')
    assert.strictEqual(newTask.success, false)
    assert.strictEqual(newTask.message, 'La expresión "*/1 *" no es válida.')
  })
  it('Comprobando la destruccion de un tarea', () => {
    const cron = new JsCron()
    const newTask = cron.createTask('tarea', '*/1 * * * * *', () => 'Hello World!')
    assert.strictEqual(newTask.success, true)
    assert.strictEqual(newTask.message, 'Tarea "tarea" creada con éxito.')
    const destroyTask = cron.destroyTask('tarea')
    assert.strictEqual(destroyTask.success, true)
    assert.strictEqual(destroyTask.message, 'Tarea "tarea" destruida con éxito.')
  })
  it('Comprobando si una tarea al ser destruida no existe', () => {
    const cron = new JsCron()
    const newTask = cron.createTask('tarea', '*/1 * * * * *', () => 'Hello World!')
    assert.strictEqual(newTask.success, true)
    assert.strictEqual(newTask.message, 'Tarea "tarea" creada con éxito.')
    const destroyTask = cron.destroyTask('tarea2')
    assert.strictEqual(destroyTask.success, false)
    assert.strictEqual(destroyTask.message, 'La tarea "tarea2" no existe.')
    setTimeout(() => {
      cron.destroyTask('tarea')
    }, 1000)
  })
})

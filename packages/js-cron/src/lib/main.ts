/**
 * @class JsCron
 * @description Clase para crear tareas programadas usando node-cron
 * @example
 * // Crear una tarea que se ejecute cada 10 segundos
 * const cron = new JsCron({ timezone: 'America/Bogota' })
 * cron.createTask('tarea', '*\/10 * * * * *', () => console.log('Hola'))
 */
import cron, { type ScheduleOptions, type ScheduledTask } from 'node-cron'
const FALSE = false
const TRUE = true
class JsCron {
  // Objeto que almacenará las tareas
  private readonly tasks: Map<string, ScheduledTask> = new Map()
  // Configuración por defecto
  private readonly config: ScheduleOptions = {}
  /**
   *
   * @param {import("node-cron").ScheduleOptions} options
   * */
  constructor(
    options: ScheduleOptions = {
      timezone: 'America/Bogota',
      runOnInit: TRUE
    }
  ) {
    this.config = options
  }

  /**
       * @description Función para crear una tarea
       * @param {string} taskName Nombre de la tarea
       * @param {string} cronExpression Expresión de cron
       * @param {Function} callback Función a ejecutar
       * @returns {Object<{success: boolean, message: string}>}
       * @example
       * // Ejecutar cada 10 segundos
       * createTask('tarea', '*\/10 * * * * *', () => console.log('Hola'))
       * @example
       * // Ejecutar cada 15 minutos entre las 6:00 y las 23:00
       * createTask('tarea', '0 *\/15 6-23 * * * *', () => console.log('Hola'))
       */
  createTask(taskName: string, cronExpression: string, callback: () => void): { success: boolean, message: string } {
    // Verificar si la expresión de cron es válida
    if (cron.validate(cronExpression) === FALSE) {
      const message = `La expresión "${cronExpression}" no es válida.`
      return { success: FALSE, message }
    }
    // Verificar si ya existe una tarea con ese nombre
    if (this.tasks.has(taskName)) {
      const message = `La tarea "${taskName}" ya existe.`
      return { success: FALSE, message }
    }
    // Crear la tarea usando node-cron
    const task = cron.schedule(cronExpression, callback, { name: taskName, ...this.config })

    // Almacenar la tarea en el objeto de tareas
    this.tasks.set(taskName, task)
    const message = `Tarea "${taskName}" creada con éxito.`
    return { success: TRUE, message }
  }

  /**
       * Función para destruir una tarea
       * @param {string} taskName Nombre de la tarea
       * @returns {Object<{success: boolean, message: string}>}
       * @example
       * destroyTask('tarea')
       */
  destroyTask(taskName: string): { success: boolean, message: string } {
    // Verificar si la tarea existe
    const hasTask: boolean = this.tasks.has(taskName)
    if (!hasTask) {
      const message = `La tarea "${taskName}" no existe.`
      return { success: FALSE, message }
    }

    // Detener y eliminar la tarea
    this.tasks.get(taskName)?.stop()
    // Eliminar la tarea de node-cron
    const hasDelete: boolean = cron.getTasks().delete(taskName)
    // delete this.tasks[taskName]
    // Eliminar la tarea del objeto de tareas
    if (hasDelete) this.tasks.delete(taskName)
    const message = `Tarea "${taskName}" destruida con éxito.`
    return { success: TRUE, message }
  }

  pauseTask(taskName: string): { success: boolean, message: string } {
    const task = this.tasks.get(taskName)
    if (task == null) return { success: FALSE, message: `La tarea "${taskName}" no existe.` }

    task.stop()
    return { success: TRUE, message: `Tarea "${taskName}" pausada.` }
  }

  resumeTask(taskName: string): { success: boolean, message: string } {
    const task = this.tasks.get(taskName)
    if (task == null) return { success: FALSE, message: `La tarea "${taskName}" no existe.` }

    task.start()
    return { success: TRUE, message: `Tarea "${taskName}" reanudada.` }
  }

  /**
   *
   * @returns {Map<string, cron.ScheduledTask>}
   */
  getTasks(): Map<string, cron.ScheduledTask> {
    return this.tasks
  }

  getNodeTasks(): Map<string, cron.ScheduledTask> {
    return cron.getTasks()
  }

  /**
   *
   * @param {string} taskName
   * @returns {cron.ScheduledTask | undefined}
   */
  getTask(taskName: string): cron.ScheduledTask | undefined {
    return this.tasks.get(taskName)
  }

  getNodeTask(taskName: string): cron.ScheduledTask | undefined {
    return cron.getTasks().get(taskName)
  }
}
export {
  JsCron
}

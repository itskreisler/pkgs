/**
 * @class JsCron
 * @description Clase para crear tareas programadas usando node-cron
 * @example
 * // Crear una tarea que se ejecute cada 10 segundos
 * const cron = new JsCron({ timezone: 'America/Bogota' })
 * cron.createTask('tarea', '0 *\/15 6-23 * * * *', () => console.log('Hola'))
 */
import cron, { type ScheduleOptions, type ScheduledTask } from 'node-cron'
class JsCron {
  // Configuración por defecto
  private readonly config: ScheduleOptions = {}
  /**
   *
   * @param {import("node-cron").ScheduleOptions} options
   * */
  constructor(
    options: Partial<ScheduleOptions> = {
      timezone: 'America/Bogota',
      runOnInit: true
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
  createTask(taskName: string, cronExpression: string, callback: () => void): { success: boolean, message: string, task?: ScheduledTask } {
    const cronExpressionValid: boolean = cron.validate(cronExpression)
    // Verificar si la expresión de cron es válida
    if (!cronExpressionValid) return { success: cronExpressionValid, message: `La expresión "${cronExpression}" no es válida.` }

    const hasGetTask: boolean = this.hasTask(taskName)
    // Verificar si ya existe una tarea con ese nombre
    if (hasGetTask) return { success: !hasGetTask, message: `La tarea "${taskName}" ya existe.` }

    // Crear la tarea usando node-cron
    const task = cron.schedule(cronExpression, callback, { name: taskName, ...this.config })
    return { success: !hasGetTask, message: `Tarea "${taskName}" creada con éxito.`, task }
  }

  /**
       * Función para destruir una tarea
       * @param {string} taskName Nombre de la tarea
       * @returns {Object<{success: boolean, message: string}>}
       * @example
       * destroyTask('tarea')
       */
  destroyTask(taskName: string): { success: boolean, message: string } {
    try {
      // Verificar si la tarea existe
      const hasTask: boolean = this.hasTask(taskName)
      if (!hasTask) return { success: hasTask, message: `La tarea "${taskName}" no existe.` }

      // Detener la tarea
      this.getTasks().get(taskName)?.stop()
      // Eliminar la tarea de node-cron
      const hasDelete: boolean = this.getTasks().delete(taskName)
      // delete this.tasks[taskName]

      // Eliminar la tarea del objeto de tareas
      if (hasDelete) return { success: hasDelete, message: `Tarea "${taskName}" destruida con éxito.` }
      return { success: false, message: `Error al destruir la tarea "${taskName}".` }
    } catch (error) {
      // Retornar un mensaje de error
      return { success: false, message: `Error al destruir la tarea "${taskName}": ${(error as Error).message}` }
    }
  }

  pauseTask(taskName: string): { success: boolean, message: string } {
    const isTaskUndefined: boolean = typeof this.getTask(taskName) === 'undefined'
    if (isTaskUndefined) return { success: !isTaskUndefined, message: `La tarea "${taskName}" no esta definida.` }

    this.getTask(taskName)?.stop()
    return { success: !isTaskUndefined, message: `Tarea "${taskName}" pausada.` }
  }

  resumeTask(taskName: string): { success: boolean, message: string } {
    const isTaskUndefined: boolean = typeof this.getTask(taskName) === 'undefined'
    if (isTaskUndefined) return { success: !isTaskUndefined, message: `La tarea "${taskName}" no esta definida.` }

    this.getTask(taskName)?.start()
    return { success: !isTaskUndefined, message: `Tarea "${taskName}" reanudada.` }
  }

  /**
   *
   * @returns {Map<string, cron.ScheduledTask>}
   */
  getTasks(): Map<string, cron.ScheduledTask> {
    return cron.getTasks()
  }

  /**
   *
   * @param {string} taskName
   * @returns {cron.ScheduledTask | undefined}
   */
  getTask(taskName: string): cron.ScheduledTask | undefined {
    return cron.getTasks().get(taskName)
  }

  /**
 * Verifica si existe una tarea con el nombre dado
 * @param {string} taskName Nombre de la tarea a verificar
 * @returns {boolean} True si la tarea existe, False si no
 */
  hasTask(taskName: string): boolean {
    return this.getTasks().has(taskName)
  }
}
export {
  JsCron
}

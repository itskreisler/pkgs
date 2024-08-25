import { exec, type ExecException } from 'child_process'
/**
 * @example
 * const { stdout, stderr } = await execPromise('echo %PATH%')
 * console.log({stdout, stderr})
 *
 * @param {String} comando - Comando a ejecutar
 * @returns {Promise<{stdout: String, stderr: String}|ExecException>}
 */
export const execPromise = async (comando: string): Promise<{ stdout: string, stderr: string }> => {
  return await new Promise((resolve, reject) => {
    exec(comando, (error: Terror, stdout: string, stderr: string) => {
      if (error != null) { return reject(error) }
      resolve({ stdout, stderr })
    })
  })
}
export type Terror = ExecException | null

import { exec, type ExecException } from 'child_process'
/**
 * @example
 * const { stdout, stderr } = await execPromise('echo %PATH%')
 * console.log({stdout, stderr})
 *
 * @param {String} comando
 * @returns {Promise<{stdout: String, stderr: String}|ExecException>}
 */
export const execPromise = (comando: string): Promise<{ stdout: string, stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(comando, (error: Terror, stdout: string, stderr: string) => {
      if (error) { return reject(error) }
      resolve({ stdout, stderr })
    })
  })
}
export type Terror = ExecException | null
import { exec } from 'child_process'
import { type ExecException } from 'child_process'
/**
 * @example
 * const { stdout, stderr } = await execPromise('echo %PATH%')
 *
 * @param {String} comando
 * @returns {Promise<{stdout: String, stderr: String}|ExecException>}
 */
export const execPromise = (comando: string): Promise<{ stdout: string, stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(comando, (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) { return reject(error) }
      resolve({ stdout, stderr })
    })
  })
}
console.log("HOLA!!!!!!!!!");
export type Terror = ExecException | null
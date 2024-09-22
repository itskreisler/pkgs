import { type Tfn } from './types'
function check(fn: Tfn) {
  if (typeof fn !== 'function') { throw Error('fn should be a function!') }
}
/**
 * @example
 * const [error, result] = await tryCatchPromise(globalThis.fetch, 'https://jsonplaceholder.typicode.com/todos/1');
 * if (error) console.error(error.message);
 * else console.log(result.json());
 * @template D - Tipo del valor de retorno de la función `fn`.
 * @template P - Tipos de los parámetros que acepta la función `fn`.
 *
 * @param {(...args: P) => Promise<D> | D} fn - La función a ejecutar, que puede ser asíncrona o síncrona.
 * @param {...P} args - Los parámetros que se pasarán a la función `fn`.
 *
 * @returns {Promise<[null, D] | [Error]>} Una promesa que resuelve a un array con dos posibles valores:
 * - `[null, D]` si la función se ejecuta con éxito, donde `D` es el resultado de la función `fn`.
 * - `[Error]` si ocurre un error, donde el primer elemento es el error capturado.
 */
export async function tryCatchPromise<D, P extends any[]>(
  fn: (...args: P) => Promise<D> | D, // fn acepta cualquier función que reciba los mismos args y retorne D o una promesa de D
  ...args: P
): Promise<[null, D] | [Error]> {
  check(fn)
  try {
    const temp = await fn(...args)
    return [null, temp]
  } catch (e) {
    return [e as Error]
  }
}
/**
 * @example
 * const [error, result] = tryCatch(() => { throw Error('error') });
 * if (error) console.error(error.message);
 * else console.log(result);
 * @example
 * const [error, result] = tryCatch(() => { return 'result' });
 * if (error) console.error(error.message);
 * else console.log(result);
 * @template D - Tipo del valor de retorno de la función `fn`.
 * @template P - Tipos de los parámetros que acepta la función `fn`.
 *
 * @param {(...args: P) => Promise<D> | D} fn - La función a ejecutar, que puede ser asíncrona o síncrona.
 * @param {...P} args - Los parámetros que se pasarán a la función `fn`.
 *
 * @returns {Promise<[null, D] | [Error]>} Una promesa que resuelve a un array con dos posibles valores:
 * - `[null, D]` si la función se ejecuta con éxito, donde `D` es el resultado de la función `fn`.
 * - `[Error]` si ocurre un error, donde el primer elemento es el error capturado.
 */
export function tryCatch<D, P extends any[]>(
  fn: (...args: P) => D,
  ...args: P
): [null, D] | [Error] {
  check(fn)
  try {
    const temp = fn(...args)
    return [null, temp]
  } catch (error) {
    return [error as Error]
  }
}

import { type T, type Tfn, type TtryCatch, type TtryCatchPromise } from './types'
function check(fn: Tfn) {
  if (typeof fn !== 'function') { throw Error('fn should be a function!') }
}
/**
 * @example
 * const [error, result] = await tryCatchPromise(globalThis.fetch, 'https://jsonplaceholder.typicode.com/todos/1');
 * if (error) console.error(error.message);
 * else console.log(result.json());
 * @param {Function} fn function to be executed
 * @param {...any} args arguments to be passed to the function
 * @returns {Promise<[Error | null, any]>} [error: Error, result?: any]
 */
export const tryCatchPromise = async (fn: Tfn, ...args: T[]): TtryCatchPromise => {
  check(fn)

  try {
    return [null, await fn(...args)]
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
 * @param {Function} fn function to be executed
 * @param {...any} args arguments to be passed to the function
 * @returns {[Error | null, any]} [error: Error, result?: any]
 * @throws {Error} if fn is not a function
 */
export const tryCatch = (fn: Tfn, ...args: T[]): TtryCatch => {
  check(fn)

  try {
    return [null, fn(...args)]
  } catch (e) {
    return [e]
  }
}

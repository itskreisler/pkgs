function check(fn: Tfn) {
  if (typeof fn !== 'function')
    throw Error('fn should be a function!');
}
/**
 * 
 * @param {Function} fn function to be executed
 * @param {...any} args arguments to be passed to the function
 * @returns {Promise<[Error | null, any]>} [error: Error, result?: any]
 */
export const tryCatchPromise = async (fn: Tfn, ...args: T[]): TtryCatchPromise => {
  check(fn);

  try {
    return [null, await fn(...args)];
  } catch (e) {
    return [e as Error];
  }
}
/**
 * 
 * @param {Function} fn function to be executed
 * @param {...any} args arguments to be passed to the function
 * @returns {[Error | null, any]} [error: Error, result?: any]
 * @throws {Error} if fn is not a function
 * @example
 * const [error, result] = tryCatch(() => { throw Error('error') });
 * if (error) console.error(error.message);
 * else console.log(result);
 * @example
 * const [error, result] = tryCatch(() => { return 'result' });
 * if (error) console.error(error.message);
 * else console.log(result);
 */
export const tryCatch = (fn: Tfn, ...args: T[]): TtryCatch => {
  check(fn);

  try {
    return [null, fn(...args)];
  } catch (e) {
    return [e];
  }
}
//declare function tryCatch(fn: Tfn, ...args: T[]): [error: Error, result?: any];
//declare function tryCatchPromise(fn: Tfn, ...args: T[]): Promise<[error: Error, result?: any]>;
type TtryCatchPromise = Promise<TtryCatch>;
type TtryCatch = [error: Error | null | unknown, result?: T];
type Tfn = (...args: any[]) => any;
type T = any;
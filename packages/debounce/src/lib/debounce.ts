export type T = any
export type TArrowFunction = (...args: T[]) => T
export interface TFns {
  immediate: boolean
  onCall: Function
  onComplete: Function
  flood: number
  onFlood: Function
}
/**
 * @typedef {Object} Fns
 * @property {boolean} [immediate] If true, function will be called immediately
 * @property {Function} [onCall] Function to call when debounce function is called
 * @property {Function} [onComplete] Function to call when debounce function is completed
 * @property {number} [flood] Number of calls to make before calling onFlood function
 * @property {Function} [onFlood] Function to call when flood limit is reached
 */

/**
 * @description Function to create a debounce function
 * @example
 * const consoleLogDebounced = debounce(console.log, 1000, {
 *  immediate: true,
 *  onCall: (...args) => console.log('Calling debounce function'),
 *  onComplete: (...args) => console.log('Debounce function completed'),
 *  flood: 7,
 *  onFlood: (...args) => console.log('Flood limit reached')
 * })
 * @param {Function} func Function to debounce
 * @param {number} msWait Number of milliseconds to wait before calling function
 * @param {TFns} fns Object with functions to call
 * @returns {Function} Debounce function
 */
export function debounce(
  func: Required<Function>,
  msWait: Required<number>,
  fns: Partial<TFns> = {
    immediate: undefined,
    onCall: undefined,
    onComplete: undefined,
    flood: undefined,
    onFlood: undefined
  }
): Function {
  let timeout: NodeJS.Timeout
  let callCount: number = 0
  const { onCall, onComplete, flood, onFlood, immediate } = fns
  //
  const isFunction = (fn: T): boolean => typeof fn === 'function'
  // const isNotUndefined = (val: T): boolean => typeof val !== 'undefined'
  //
  return function (...args: T) {
    const context = this // as unknown as ThisParameterType<typeof _>
    clearTimeout(timeout)

    if (Boolean(immediate) && callCount === 0) {
      func.apply(context, args)
      callCount++
    } else {
      if ((onCall != null) && isFunction(onCall)) {
        onCall.apply(context, args)
      }

      callCount++

      if (Boolean(flood) &&
        typeof flood !== 'undefined' &&
        callCount % flood === 0 &&
        (onFlood != null) &&
        isFunction(onFlood)) {
        onFlood.apply(context, args)
      }

      timeout = setTimeout(() => {
        func.apply(context, args)
        callCount = 0 // callCount % flood

        if ((onComplete != null) && isFunction(onComplete)) {
          onComplete.apply(context, args)
        }
      }, msWait)
    }
  }
}

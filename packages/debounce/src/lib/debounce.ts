export type T = any
export type Tfn = (...args: T[]) => T;
export type TFns = {
  immediate: boolean
  onCall: Tfn
  onComplete: Tfn
  flood: number
  onFlood: Tfn
}
/**
 * @typedef {Object} Fns
 * @property {boolean} immediate If true, function will be called immediately
 * @property {Function} onCall Function to call when debounce function is called
 * @property {Function} onComplete Function to call when debounce function is completed
 * @property {number} flood Number of calls to make before calling onFlood function
 * @property {Function} onFlood Function to call when flood limit is reached
 */

/**
 * Function to create a debounce function
 * @param {Function} func Function to debounce
 * @param {number} msWait Number of milliseconds to wait before calling function
 * @param {Fns} fns Object with functions to call
 * @returns {Function} Debounce function
 */
export function debounce(
  func: Tfn,
  msWait: number = 1000,
  fns: TFns = {
    onCall: function () { },
    onComplete: function () { },
    onFlood: function () { },
    immediate: false,
    flood: 7
  }
): Tfn {
  let timeout: NodeJS.Timeout
  let callCount = 0
  const { onCall, onComplete, flood, onFlood, immediate } = fns

  return function (...args: T) {
    const context: T = this
    clearTimeout(timeout)

    if (immediate && callCount === 0) {
      func.apply(context, args)
      callCount++
    } else {
      if (onCall && typeof onCall === 'function') {
        onCall.apply(context, args)
      }

      callCount++

      if (callCount % flood === 0 && onFlood && typeof onFlood === 'function') {
        onFlood.apply(context, args)
      }

      timeout = setTimeout(() => {
        func.apply(context, args)
        callCount = 0 // callCount % flood

        if (onComplete && typeof onComplete === 'function') {
          onComplete.apply(context, args)
        }
      }, msWait)
    }
  }
}
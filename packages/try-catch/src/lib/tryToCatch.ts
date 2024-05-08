/**
 * @example
 * const result = tryCatch(
 * () => {
 * // Try something...
 * },
 * ex => {
 * // Return a default value or re-throw the exception.
 * }
 * );
 * @param {Function} tryFunction 
 * @param {Function} catchFunction 
 * @returns 
 */

const tryToCatch = function <TTryResult, TCatchResult>(
  tryFunction: () => TTryResult,
  catchFunction: (ex: unknown) => TCatchResult
): TTryResult | TCatchResult {
  try {
    return tryFunction();
  } catch (ex: unknown) {
    return catchFunction(ex);
  }
};

export { tryToCatch };
/**
 * @example
 * const result = tryCatchFinally(
 * () => {
 * // Try something...
 * },
 * ex => {
 * // Return a default value or re-throw the exception.
 * },
 * () => {
 * // Clean up.
 * }
 * );
 * @param {Function} tryFunction 
 * @param {Function} catchFunction 
 * @param {Function} finallyFunction 
 * @returns 
 */
const tryCatchFinally = function <TTryResult, TCatchResult>(
  tryFunction: () => TTryResult,
  catchFunction: (ex: unknown) => TCatchResult,
  finallyFunction: () => void
): TTryResult | TCatchResult {
  let result;

  try {
    result = tryFunction();
  } catch (ex: unknown) {
    result = catchFunction(ex);
  } finally {
    finallyFunction();
  }

  return result;
};

export { tryCatchFinally };
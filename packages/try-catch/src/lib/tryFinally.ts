/**
 * @example
 * const result = tryFinally(
 * () => {
 * // Try something...
 * },
 * () => {
 * // Clean up.
 * }
 * );
 * @param tryFunction
 * @param finallyFunction
 * @returns
 */
const tryFinally = function <TTryResult>(
  tryFunction: () => TTryResult,
  finallyFunction: () => void
): TTryResult | undefined {
  let result

  try {
    result = tryFunction()
  } finally {
    finallyFunction()
  }

  return result
}

export { tryFinally }

/**
 * Kelvin to Fahrenheit
 * @param k
 * @param precision
 * @returns {number}
 */
export function kToF(k: number, precision = 0): number {
  return round(((k - 273.15) * 9) / 5 + 32, precision)
}

/**
 * Kelvin to Celsius
 * @param {number} k
 * @param {number} precision
 * @returns {number}
 */
export function kToC(k: number, precision: number = 0): number {
  return round(k - 273.15, precision)
}

/**
 * m/s to mph
 * @param {number} speed
 * @param {number} precision
 * @returns {number}
 */
export function msToMph(speed: number, precision: number = 0): number {
  // speed * seconds per hour / meters per mile
  return round((speed * 3600) / 1609.34, precision)
}

/**
 * m/s to kmh
 * @param {number} speed
 * @param {number} precision
 * @returns {number}
 */
export function msToKmh(speed: number, precision: number = 0): number {
  // speed * seconds per hour / meters per km
  return round((speed * 3600) / 1000, precision)
}

/**
 * https://stackoverflow.com/a/47151941/2649697
 * @param {number} value
 * @param {number} precision
 * @returns {number}
 */
function round(value: number, precision: number): number {
  if (Number.isInteger(precision)) {
    const shift = 10 ** precision
    return Math.round(value * shift) / shift
  } else {
    return Math.round(value)
  }
}

/**
import { abbreviateNumber } from './abbreviateNumber';
 *
 * @param {number} number
 * @returns {string}
 * @example
 * abbreviateNumber(1000) => '1k'
 * abbreviateNumber(1000000) => '1M'
 * abbreviateNumber(1000000000) => '1B'
 * abbreviateNumber(1000000000000) => '1T'
 */
export const abbreviateNumber = (number: Required<number>): string => {
  const abbreviations = ['k', 'M', 'B', 'T']
  for (let i = abbreviations.length - 1; i >= 0; i--) {
    const abbreviation = abbreviations[i]
    const abbreviationValue = Math.pow(10, (i + 1) * 3)
    if (number >= abbreviationValue) {
      return `${(number / abbreviationValue).toFixed(1)}${abbreviation}`
    }
  }
  return number.toString()
}
/**
 *
 * @param {number} size
 * @param {number} decimal
 * @returns {string}
 * @example
 *
 */
export const bytes2Kb = (size: Required<number>, decimal: number = 2): string => {
  return (size / 1024).toFixed(decimal)
}

/**
 *
 * @param {number} size
 * @returns {string}
 * @example
 * bytes2Mb(1967917) => '1.88' + 'MB'
 */
export const bytes2Mb = (size: Required<number>, decimal: number = 2): string => {
  return (size / 1024 / 1024).toFixed(decimal)
}
/**
 *
 * @param {number} size
 * @param {number} decimal
 * @returns {string}
 * @example
 *
 */
export const bytes2Gb = (size: Required<number>, decimal: number = 2): string => {
  return (size / 1024 / 1024 / 1024).toFixed(decimal)
}

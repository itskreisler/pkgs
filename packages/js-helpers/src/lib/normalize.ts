export type T = any

/**
 * Normalize a string
 * @param str string to normalize
 * @param urls if true, it will replace special characters with a dash, otherwise it will remove them
 * @returns normalized string
 * @example
 * const str = 'ÁÉÍÓÚáéíóú'
 * normalize(str) // 'AEIOUaeiou'
 *
 *
 */
export const normalize = (function () {
  const from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç!¡¿?#$%&|´´`ªº^Ç*+/¨¨=(){}[].,;:_°>\\<\"'"
  const to = 'AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc'
  const mapping: Record<string, string> | { [key: string]: string } = {}
  for (let i = 0, j = from.length; i < j; i++) { mapping[from.charAt(i)] = to.charAt(i) };

  return function (str: string, urls = true) {
    const ret = []
    for (let i = 0, j = str.length; i < j; i++) {
      const c = str.charAt(i)
      const hasChartProp = Object.prototype.hasOwnProperty.call(mapping, c) // mapping.hasOwnProperty(str.charAt(i))
      if (hasChartProp) { ret.push(mapping[c]) } else { ret.push(c) };
    }
    return (urls) ? ret.join('') : ret.join('').replace(/[^-A-Za-z0-9]+/g, '-').toLowerCase()
  }
})()

/**
 * @param {string} str
 * @returns {string}
 * @example
 * const str = '       Hello World!        \n\n\n   Welcome to the world of programming.   '
 * trimText(str) // 'Hello World! Welcome to the world of programming.'
 */
export const trimText = (str: string): string => str.replace(/^\s*\n/gm, '').replace(/^\s*|\s*$|\s+(?=\s)/gm, '')

/**
 * @description calculate the levenshtein distance between two strings
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      )
    }
  }

  return matrix[b.length][a.length]
}

/**
 * @description calculate the similarity between two titles (0.8 is a good threshold)
 * @param {string} title1 Current title
 * @param {string} title2 Title to compare
 * @returns {number}
 * @example titleSimilarity('hola', '') // 0
 * @example titleSimilarity('hola', 'hola') // 1
 * @example titleSimilarity('hola mundo como estan', 'hola mundo estan muy bien') // 0.52
 */
export function titleSimilarity(title1: string, title2: string): number {
  if (title1.length === 0 || title2.length === 0) return 0
  const cleanTitle1 = title1.toLowerCase().replace(/[^a-z0-9\s]/g, '')
  const cleanTitle2 = title2.toLowerCase().replace(/[^a-z0-9\s]/g, '')
  const distance = levenshteinDistance(cleanTitle1, cleanTitle2)
  const maxLength = Math.max(cleanTitle1.length, cleanTitle2.length)
  return 1 - distance / maxLength
}

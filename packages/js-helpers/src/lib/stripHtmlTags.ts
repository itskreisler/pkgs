/**
 *
 * @param {string} str
 * @param {RegExp} exp
 * @returns {string}
 * @example
 * stripHtmlTags('<p>hello</p>') // 'hello'
 */
export const stripHtmlTags = (str: string, exp: RegExp = /<[^>]*>/g): string => {
  if ((str === null) || (str === '') || typeof str === 'undefined') { return String('') } else { str = str.toString() }
  return str.replace(exp, '')
}

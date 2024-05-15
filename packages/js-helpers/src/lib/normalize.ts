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

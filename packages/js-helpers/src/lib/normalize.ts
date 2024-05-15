type T = any;

export const normalize = (function () {
  const from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç!¡¿?#$%&|´´`ªº^Ç*+/¨¨=(){}[].,;:_°>\\<\"'"
  const to = 'AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc'
  const mapping: Record<string, string> = {}

  for (let i = 0, j = from.length; i < j; i++) { mapping[from.charAt(i)] = to.charAt(i) }

  return function (str: string, urls = true) {
    const ret = []
    for (let i = 0, j = str.length; i < j; i++) {
      const c = str.charAt(i)
      if (mapping.hasOwnProperty(str.charAt(i))) { ret.push(mapping[c]) } else { ret.push(c) }
    }
    return (urls) ? ret.join('') : ret.join('').replace(/[^-A-Za-z0-9]+/g, '-').toLowerCase()
  }
})()
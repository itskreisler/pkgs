// const utf8Tob64 = (str) => globalThis.btoa(unescape(encodeURIComponent(str)))
/**
 * The function converts a UTF-8 string to base64 encoding.
 * @param {string} str - The parameter `str` is a string that represents the UTF-8 encoded text that needs to be
 * converted to base64 format. The function `utf8Tob64` takes this string as input and returns the
 * base64 encoded string.
 * @returns {string} The function returns a string that represents the base64 encoded text.
 */
export const utf8Tob64 = (str: string): string => globalThis.btoa(decodeURIComponent(encodeURIComponent(str)))
// const b64Toutf8 = (str) => decodeURIComponent(escape(globalThis.atob(str)))
/**
 * The function decodes a Base64 string into a UTF-8 string.
 * @param {string} str - The parameter `str` is a string encoded in base64 format that needs to be converted to
 * UTF-8 format. The function `b64Toutf8` takes this string as input and returns the decoded UTF-8
 * string.
 * @returns {string} The function returns a string that represents the UTF-8 encoded text.
 */
export const b64Toutf8 = (str: string): string => decodeURIComponent(globalThis.atob(str))

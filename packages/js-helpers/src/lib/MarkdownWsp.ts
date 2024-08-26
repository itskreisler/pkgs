type TBulletPoint = '-' | '*'
const initialValue = 1
/**
 * https://faq.whatsapp.com/539178204879377
 * @description
 * WhatsApp supports basic text formatting:
 * - Italic: `_text_`
 * - Bold: `*text*`
 * - Strikethrough: `~text~`
 * - Monospace: ` ```text``` `
 * - Quote: `> text`
 * - Bulleted List: `- text` or `* text`
 * - Numbered List: `1. text`
 * - Inline Code: `text`
 *
 */
const MarkdownWsp = {
  /**
   *
   * @param {String} text
   * @returns {String}
   * @example
   * Italic('Hola mundo') // _Hola mundo_
   */
  Italic: (text: string): string => `_${text}_`,
  /**
   *
   * @param {String} text
   * @returns {String}
   * @example
   * Bold('Hola mundo') // *Hola mundo*
   */
  Bold: (text: string): string => `*${text}*`,
  /**
   *
   * @param {String} text
   * @returns {String}
   * @example
   * Strikethrough('Hola mundo') // ~Hola mundo~
   */
  Strikethrough: (text: string): string => `~${text}~`,
  /**
   *
   * @param {String} text
   * @returns {String}
   * @example
   * Monospace('Hola mundo') // ```Hola mundo```
   */
  Monospace: (text: string): string => `\`\`\`${text}\`\`\``,
  /**
   *
   * @param {String} text
   * @returns {String}
   * @example
   * Quote('Hola mundo') // > Hola mundo
   */
  Quote: (text: string): string => `> ${text}`,
  /**
   *
   * @param {Array|String} text
   * @param {String} [bulletPoint='-']
   * @returns {String}
   * @example
   * BulletedList(['Hola', 'Mundo']) // - Hola\n- Mundo
   * BulletedList('Hola') // - Hola
   * BulletedList('Hola', '*') // * Hola
   * BulletedList('Hola', '-') // - Hola
   */
  BulletedList: (text: string[] | string, bulletPoint: TBulletPoint = '-'): string => Array.isArray(text) ? text.map((txt) => `${bulletPoint} ${txt}`).join('\n') : `${bulletPoint} ${text}`,
  /**
   *
   * @param {Array|String} text
   * @returns {String}
   * @example
   * NumberedLists(['Hola', 'Mundo']) // 1. Hola\n2. Mundo
   * NumberedLists('Hola') // 1. Hola
   */
  NumberedLists: (text: Required<string[] | string>): string => Array.isArray(text) ? text.map((t, i) => `${i + initialValue}. ${t}`).join('\n') : `${initialValue}. ${text}`,
  /**
   *
   * @param {String} text
   * @returns {String}
   * @example
   * InlineCode('Hola mundo') // `Hola mundo`
   */
  InlineCode: (text: string): string => `\`${text}\``
}
export {
  MarkdownWsp
}
export const Italic = MarkdownWsp.Italic
export const Bold = MarkdownWsp.Bold
export const Strikethrough = MarkdownWsp.Strikethrough
export const Monospace = MarkdownWsp.Monospace
export const Quote = MarkdownWsp.Quote
export const BulletedList = MarkdownWsp.BulletedList
export const NumberedLists = MarkdownWsp.NumberedLists
export const InlineCode = MarkdownWsp.InlineCode

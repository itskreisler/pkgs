export enum CONSOLE_COLORS {
  blue = '\x1b[34m',
  green = '\x1b[32m',
  red = '\x1b[31m',
  white = '\x1b[37m',
  yellow = '\x1b[33m'
}
export enum CONSOLE_COLORS_OUTLINE {
  purple = 105
}
export const ASD = {
  purple: (message: string) => console.log(`\x1b[38;5;105m${message}\x1b[0m`)
}
/**
   * Prints a value in the console if the app is running in development mode.
   *
   * @param {*} message
   * @param {String} type Accepts one of: 'blue', 'green', 'red', 'yellow', 'white'. (Default is 'white').
   */
export const printLog = (message: any, type: keyof typeof CONSOLE_COLORS = 'white') => {
  // if (process.env.NODE_ENV === 'development') {
  console.log(`${CONSOLE_COLORS[type]}%s\x1b[0m`, message)
  // }
}

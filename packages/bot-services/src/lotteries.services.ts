import { createApi } from '@kreisler/createapi'

export enum LotteryConst {
  API = 'https://api-resultadosloterias.com/api'
}
export interface LotteryResponse { status: string }

export type LotteryResults = LotteryResponse & {
  data: LotteryData[]
}
export type LotteryInfo = LotteryResponse & {
  data: LotteriesData[]
}
export interface LotteriesData {
  name: string
  slug: string
}

export interface LotteryData {
  lottery: string
  slug: string
  date: string
  result: string
  series: string
}

interface LotteryAPI {
  results: // (): Promise<LotteryResults>
  (date?: string) => Promise<LotteryResults>
  lotteries: () => Promise<LotteryInfo>
}
export const lotteryApi: LotteryAPI = createApi(LotteryConst.API)

//
/**
 * Returns a formatted date string in the format 'YYYY-MM-DD'.
 *
 * @param {Object} [options] - Options for formatting the date.
 * @param {number} [options.daysOffset=0] - Number of days to offset from the current date.
 * @returns {string} The formatted date string.
 */
export function getFormattedDate({ daysOffset = 0 }: { daysOffset?: number } = {}): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset) // Agregar o restar días
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
/*
console.log('lotteries', getFormattedDate({ daysOffset: -1 })) // 2024-12-09
*/
/* lotteryApi.results(getFormattedDate({ daysOffset: 0 })).then(loteria => {
  const sinuano = loteria.data.filter(name => name.slug.startsWith('sinuano')).map(({ slug, result }) => ({ slug, result }))
  console.log({ sinuano })
})
 */
/* lotteryApi.results().then(lotteries => {
  console.log(JSON.stringify(lotteries, null, 2))
})*/

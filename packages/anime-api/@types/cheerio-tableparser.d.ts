import { type CheerioAPI } from 'cheerio'

declare module 'cheerio-tableparser' {

  function cheerioTableparser($: CheerioAPI): void
  export = cheerioTableparser
}

declare module 'cheerio' {
  interface Cheerio {
    parsetable: (dupCols?: boolean, dupRows?: boolean, textMode?: boolean) => string[][]
  }
}

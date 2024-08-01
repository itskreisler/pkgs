declare module 'cloudscraper' {

  // Declara los tipos correctos para el módulo
  export interface OptionsWithUrl extends RequestInit {
    method?: string
    uri?: string
    encoding?: null
  }
  function get(uri: string): Promise<any>
  function cloudscraper(_options: string | OptionsWithUrl, options?: OptionsWithUrl): Promise<any>
  export { get }
  export = cloudscraper
}

import { createApi } from '@kreisler/createapi'
const yamete: IKudasaiApi = createApi('https://www3.animeflv.net')

export async function kudasaiApi() {
  return await yamete['kudasai.php']()
}

export interface IKudasaiApi {
  'kudasai.php': () => Promise<IKudasaiData[]>
}
export interface IKudasaiData {
  date: string
  image: string
  slug: string
  title: string
  category: {
    name: string
    slug: string
  }
}

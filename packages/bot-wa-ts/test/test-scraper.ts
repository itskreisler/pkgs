import { LatAnimeScraper } from '@kreisler/bot-services'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'

console.log('Test flujo completo del scraper...')

const scraper = new LatAnimeScraper()
const episodes = await scraper.latestEpisodesAdded()

console.log('Episodios obtenidos:', episodes.length)

for (let i = 0; i < Math.min(3, episodes.length); i++) {
  const ep = episodes[i]
  console.log(`\n--- Episodio ${i + 1}: ${ep.title} ---`)
  console.log('Poster:', ep.poster)
  
  try {
    const stream = await getStreamFromUrl(ep.poster)
    console.log('✅ Stream OK')
  } catch (err) {
    console.log('❌ Error:', err)
  }
}
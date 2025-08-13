/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
import { describe, it } from 'node:test'
import assert from 'node:assert'
// » IMPORT MODULES
import { AnimeFLVScraper, LatAnimeScraper } from '@kreisler/bot-services'
// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Anime Scrapers', () => {
  describe('LatAnimeScraper', () => {
    it('Debería obtener los últimos episodios añadidos correctamente', async () => {
      const scraper = new LatAnimeScraper()
      const episodes = await scraper.latestEpisodesAdded()
      assert.strictEqual(episodes.length, 36)
    })
  })
  describe('AnimeFLVScraper', () => {
    it('Debería obtener los últimos episodios añadidos correctamente', async () => {
      const scraper = new AnimeFLVScraper()
      const episodes = await scraper.latestEpisodesAdded()
      assert.strictEqual(episodes.length, 20)
    })
  })
})

import express, { type Router } from 'express'
import routes from '@/api/animeflv/routes/index'

const router: Router = express.Router()

router.get('/', (req, res) => {
  res.json({
    message: 'animeflv API 2.0 - 👋🌎🌍🌏',
    author: 'Kreisler Ramirez',
    entries: [
      {
        LatestAnimeAdded: '/api/v1/LatestAnimeAdded',
        LatestEpisodesAdded: '/api/v1/LatestEpisodesAdded',
        GetAnimeServers: '/api/v1/GetAnimeServers/:id',
        Genres: '/api/v1/Genres/:genre/:sortBy/:page',
        Movies: '/api/v1/Movies/:sortBy/:page',
        Special: '/api/v1/Special/:sortBy/:page',
        Ova: '/api/v1/Ova/:sortBy/:page',
        TV: '/api/v1/TV/:sortBy/:page',
        AnimeByState: '/api/v1/AnimeByState/:state/:order/:page',
        Search: '/api/v1/Search/:query',
        AnimeCharacters: '/api/v1/AnimeCharacters/:title',
        AnimeTrailers: '/api/v1/AnimeTrailers/:title',
        GetAnimeInfo: '/api/v1/GetAnimeInfo/:id/:title',
        DownloadLinksByEpsId: '/api/v1/DownloadLinksByEpsId/:epsId'
      }
    ]
  })
})

router.use('/', routes)

export default router

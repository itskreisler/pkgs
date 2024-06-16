import cheerio from 'cheerio'
import cheerioTableparser from 'cheerio-tableparser'
import cloudscraper from 'cloudscraper'
import decodeURL from 'urldecode'
import { MergeRecursive, urlify, decodeZippyURL, imageUrlToBase64 } from './utils/index'
const {
  BASE_URL, SEARCH_URL, BROWSE_URL,
  ANIME_VIDEO_URL, BASE_EPISODE_IMG_URL,
  BASE_JIKA_URL, BASE_MYANIME_LIST_URL, BASE_JIKA_API
} = require('../../constants/urls')

const animeExtraInfo = async (title) => {
  const res = await cloudscraper(`${BASE_JIKA_URL}${title}`, { method: 'GET' })
  const matchAnime = JSON.parse(res).results.filter(x => x.title === title)
  const malId = matchAnime[0].mal_id

  if (typeof matchAnime[0].mal_id === 'undefined') return null

  const animeDetails = `${BASE_JIKA_API}anime/${malId}`
  const data = await cloudscraper.get(animeDetails)
  const body = Array(JSON.parse(data))
  const promises = []

  body.map(doc => {
    promises.push({
      titleJapanese: doc.title_japanese,
      source: doc.source,
      totalEpisodes: doc.episodes,
      status: doc.status,
      aired: {
        from: doc.aired.from,
        to: doc.aired.to,
        string: doc.aired.string
      },
      duration: doc.duration,
      rank: doc.rank,
      popularity: doc.popularity,
      members: doc.members,
      favorites: doc.favorites,
      premiered: doc.premiered,
      broadcast: doc.broadcast,
      producers: {
        names: doc.producers.map(x => x.name)
      },
      licensors: {
        names: doc.licensors.map(x => x.name)
      },
      studios: {
        names: doc.studios.map(x => x.name)
      },
      openingThemes: doc.opening_themes,
      endingThemes: doc.ending_themes
    })
  })
  return await Promise.all(promises)
}

const downloadLinksByEpsId = async (id) => {
  const res = await cloudscraper(`${ANIME_VIDEO_URL}${id}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  cheerioTableparser($)
  const tempServerNames = $('table.RTbl').parsetable(true, true, true)[0]
  const serverNames = tempServerNames.filter(x => x !== 'SERVIDOR')
  const urls = []

  try {
    const table = $('table.RTbl').html()
    const data = await urlify(table).then(res => { return res })
    const tempUrls = []
    data.map(baseUrl => {
      const url = baseUrl.split('"')[0]
      tempUrls.push(url)
    })

    const urlDecoded = []
    tempUrls.map(url => {
      const urlFixed = decodeURL(url).toString().split('?s=')[1]
      urlDecoded.push(urlFixed)
    })

    Array.from({ length: tempUrls.length }, (v, k) => {
      urls.push({
        server: serverNames[k],
        url: urlDecoded[k]
      })
    })

    const zippyshareURL = urls.filter(doc => doc.server == 'Zippyshare')[0].url || null
    const zippyMP4 = await decodeZippyURL(zippyshareURL)

    for (const key in urls) {
      if (urls.hasOwnProperty(key)) {
        if (urls[key].server == 'Zippyshare') {
          urls[key].url = zippyMP4
        }
      }
    }
  } catch (err) {
    console.log(err)
  }

  return await Promise.all(urls)
}

const getAnimeChapterTitlesHelper = async (title) => {
  const res = await cloudscraper(`${BASE_JIKA_URL}${title}`, { method: 'GET' })
  const matchAnime = JSON.parse(res).results.filter(x => x.title === title)
  const malId = matchAnime[0].mal_id

  if (typeof matchAnime[0].mal_id === 'undefined') return null

  const jikanEpisodesURL = `${BASE_JIKA_API}anime/${malId}/episodes`
  const data = await cloudscraper.get(jikanEpisodesURL)
  const body = JSON.parse(data).episodes
  const promises = []

  body.map(doc => {
    const date = doc.aired.substring(0, doc.aired.lastIndexOf('T'))
    promises.push({
      episode: doc.episode_id,
      title: doc.title,
      date
    })
  })

  return await Promise.all(promises)
}

const getAnimeInfo = async (id, title) => {
  const promises = []
  try {
    promises.push(await animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: extra.animeExtraInfo[0].title || null,
      poster: await imageUrlToBase64(extra.animeExtraInfo[0].poster) || null,
      banner: extra.animeExtraInfo[0].banner || null,
      synopsis: extra.animeExtraInfo[0].synopsis || null,
      debut: extra.animeExtraInfo[0].debut || null,
      type: extra.animeExtraInfo[0].type || null,
      rating: extra.animeExtraInfo[0].rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null,
      moreInfo: await animeExtraInfo(title).then(info => {
        return (info != null) || null
      }),
      promoList: await getAnimeVideoPromo(title).then(promo => {
        return (promo != null) || null
      }),
      charactersList: await getAnimeCharacters(title).then(characters => {
        return (characters != null) || null
      })
    })))
  } catch (err) {
    console.log(err)
  }

  return await Promise.all(promises)
}

const getAnimeVideoPromo = async (title) => {
  const res = await cloudscraper(`${BASE_JIKA_URL}${title}`, { method: 'GET' })
  const matchAnime = JSON.parse(res).results.filter(x => x.title === title)
  const malId = matchAnime[0].mal_id

  if (typeof matchAnime[0].mal_id === 'undefined') return null

  const jikanCharactersURL = `${BASE_JIKA_API}anime/${malId}/videos`
  const data = await cloudscraper.get(jikanCharactersURL)
  const body = JSON.parse(data).promo
  const promises = []

  body.map(doc => {
    promises.push({
      title: doc.title,
      previewImage: doc.image_url,
      videoURL: doc.video_url
    })
  })

  return await Promise.all(promises)
}

const getAnimeCharacters = async (title) => {
  const res = await cloudscraper(`${BASE_JIKA_URL}${title}`, { method: 'GET' })
  const matchAnime = JSON.parse(res).results.filter(x => x.title === title)
  const malId = matchAnime[0].mal_id

  if (typeof matchAnime[0].mal_id === 'undefined') return null

  const jikanCharactersURL = `${BASE_JIKA_API}anime/${malId}/characters_staff`
  const data = await cloudscraper.get(jikanCharactersURL)
  const body = JSON.parse(data).characters

  if (typeof body === 'undefined') return null

  const charactersId = body.map(doc => {
    return doc.mal_id
  })
  const charactersNames = body.map(doc => {
    return doc.name
  })
  const charactersImages = body.map(doc => {
    return doc.image_url
  })
  const charactersRoles = body.map(doc => {
    return doc.role
  })

  const characters = []
  Array.from({ length: charactersNames.length }, (v, k) => {
    const id = charactersId[k]
    const name = charactersNames[k]
    const characterImg = charactersImages[k]
    const role = charactersRoles[k]
    characters.push({
      character: {
        id,
        name,
        image: characterImg,
        role
      }
    })
  })

  return await Promise.all(characters)
}

const search = async (query) => {
  const res = await cloudscraper(`${SEARCH_URL}${query}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []

  $('div.Container ul.ListAnimes li article').each((index, element) => {
    const $element = $(element)
    const id = $element.find('div.Description a.Button').attr('href').slice(1)
    const title = $element.find('a h3').text()
    const poster = $element.find('a div.Image figure img').attr('src') ||
      $element.find('a div.Image figure img').attr('data-cfsrc')
    const banner = poster.replace('covers', 'banners').trim()
    const type = $element.find('div.Description p span.Type').text()
    const synopsis = $element.find('div.Description p').eq(1).text().trim()
    const rating = $element.find('div.Description p span.Vts').text()
    const debut = $element.find('a span.Estreno').text().toLowerCase()
    promises.push(animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: title || null,
      // id: id || null,
      poster: await imageUrlToBase64(poster) || null,
      banner: banner || null,
      synopsis: synopsis || null,
      debut: extra.animeExtraInfo[0].debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises)
}

const animeByState = async (state, order, page) => {
  const res = await cloudscraper(`${BROWSE_URL}type%5B%5D=tv&status%5B%5D=${state}&order=${order}&page=${page}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []

  $('div.Container ul.ListAnimes li article').each((index, element) => {
    const $element = $(element)
    const id = $element.find('div.Description a.Button').attr('href').slice(1)
    const title = $element.find('a h3').text()
    const poster = $element.find('a div.Image figure img').attr('src')
    const banner = poster.replace('covers', 'banners').trim()
    const type = $element.find('div.Description p span.Type').text()
    const synopsis = $element.find('div.Description p').eq(1).text().trim()
    const rating = $element.find('div.Description p span.Vts').text()
    const debut = $element.find('a span.Estreno').text().toLowerCase()
    promises.push(animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: title || null,
      // id: id || null,
      poster: await imageUrlToBase64(poster) || null,
      banner: banner || null,
      synopsis: synopsis || null,
      debut: extra.animeExtraInfo[0].debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises)
}

const tv = async (order, page) => {
  const res = await cloudscraper(`${BROWSE_URL}type%5B%5D=tv&order=${order}&page=${page}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []

  $('div.Container ul.ListAnimes li article').each((index, element) => {
    const $element = $(element)
    const id = $element.find('div.Description a.Button').attr('href').slice(1)
    const title = $element.find('a h3').text()
    const poster = $element.find('a div.Image figure img').attr('src')
    const banner = poster.replace('covers', 'banners').trim()
    const type = $element.find('div.Description p span.Type').text()
    const synopsis = $element.find('div.Description p').eq(1).text().trim()
    const rating = $element.find('div.Description p span.Vts').text()
    const debut = $element.find('a span.Estreno').text().toLowerCase()
    promises.push(animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: title || null,
      // id: id || null,
      poster: await imageUrlToBase64(poster) || null,
      banner: banner || null,
      synopsis: synopsis || null,
      debut: extra.animeExtraInfo[0].debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises)
}

const ova = async (order, page) => {
  const res = await cloudscraper(`${BROWSE_URL}type%5B%5D=ova&order=${order}&page=${page}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []

  $('div.Container ul.ListAnimes li article').each((index, element) => {
    const $element = $(element)
    const id = $element.find('div.Description a.Button').attr('href').slice(1)
    const title = $element.find('a h3').text()
    const poster = $element.find('a div.Image.fa-play-circle-o figure img').attr('src')
    const banner = poster.replace('covers', 'banners').trim()
    const type = $element.find('div.Description p span.Type').text()
    const synopsis = $element.find('div.Description p').eq(1).text().trim()
    const rating = $element.find('div.Description p span.Vts').text()
    const debut = $element.find('a span.Estreno').text().toLowerCase()
    promises.push(animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: title || null,
      // id: id || null,
      poster: await imageUrlToBase64(poster) || null,
      banner: banner || null,
      synopsis: synopsis || null,
      debut: extra.animeExtraInfo[0].debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises)
}

const special = async (order, page) => {
  const res = await cloudscraper(`${BROWSE_URL}type%5B%5D=special&order=${order}&page=${page}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []

  $('div.Container ul.ListAnimes li article').each((index, element) => {
    const $element = $(element)
    const id = $element.find('div.Description a.Button').attr('href').slice(1)
    const title = $element.find('a h3').text()
    const poster = $element.find('a div.Image figure img').attr('src')
    const banner = poster.replace('covers', 'banners').trim()
    const type = $element.find('div.Description p span.Type').text()
    const synopsis = $element.find('div.Description p').eq(1).text().trim()
    const rating = $element.find('div.Description p span.Vts').text()
    const debut = $element.find('a span.Estreno').text().toLowerCase()
    promises.push(animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: title || null,
      // id: id || null,
      poster: await imageUrlToBase64(poster) || null,
      banner: banner || null,
      synopsis: synopsis || null,
      debut: extra.animeExtraInfo[0].debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises)
}

const movies = async (order, page) => {
  const res = await cloudscraper(`${BROWSE_URL}type%5B%5D=movie&order=${order}&page=${page}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []

  $('div.Container ul.ListAnimes li article').each((index, element) => {
    const $element = $(element)
    const id = $element.find('div.Description a.Button').attr('href').slice(1)
    const title = $element.find('a h3').text()
    const poster = $element.find('a div.Image figure img').attr('src')
    const banner = poster.replace('covers', 'banners').trim()
    const type = $element.find('div.Description p span.Type').text()
    const synopsis = $element.find('div.Description p').eq(1).text().trim()
    const rating = $element.find('div.Description p span.Vts').text()
    const debut = $element.find('a span.Estreno').text().toLowerCase()
    promises.push(animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: title || null,
      // id: id || null,
      poster: await imageUrlToBase64(poster) || null,
      banner: banner || null,
      synopsis: synopsis || null,
      debut: extra.animeExtraInfo[0].debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises)
}

const animeByGenres = async (genre, order, page) => {
  const res = await cloudscraper(`${BROWSE_URL}genre%5B%5D=${genre}&order=${order}&page=${page}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []

  $('div.Container ul.ListAnimes li article').each((index, element) => {
    const $element = $(element)
    const id = $element.find('div.Description a.Button').attr('href').slice(1)
    const title = $element.find('a h3').text()
    const poster = $element.find('a div.Image figure img').attr('src')
    const banner = poster.replace('covers', 'banners').trim()
    const type = $element.find('div.Description p span.Type').text()
    const synopsis = $element.find('div.Description p').eq(1).text().trim()
    const rating = $element.find('div.Description p span.Vts').text()
    const debut = $element.find('a span.Estreno').text().toLowerCase()
    promises.push(animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: title || null,
      // id: id || null,
      poster: await imageUrlToBase64(poster) || null,
      banner: banner || null,
      synopsis: synopsis || null,
      debut: extra.animeExtraInfo[0].debut || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises)
}

const latestEpisodesAdded = async () => {
  const res = await cloudscraper(`${BASE_URL}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []
  $('div.Container ul.ListEpisodios li').each((index, element) => {
    const $element = $(element)
    const id = $element.find('a').attr('href').replace('/ver/', '').trim()
    const title = $element.find('a strong.Title').text()
    const poster = BASE_URL + $element.find('a span.Image img').attr('src')
    const episode = parseInt($element.find('a span.Capi').text().match(/\d+/g), 10)
    promises.push(getAnimeServers(id).then(async servers => ({
      id: id || null,
      title: title || null,
      poster: await imageUrlToBase64(poster) || null,
      episode: episode || null,
      servers: servers || null
    })))
  })
  return await Promise.all(promises)
}

const latestAnimeAdded = async () => {
  const res = await cloudscraper(`${BASE_URL}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const promises = []
  $('div.Container ul.ListAnimes li article').each((index, element) => {
    const $element = $(element)
    const id = $element.find('div.Description a.Button').attr('href').slice(1)
    const title = $element.find('a h3').text()
    const poster = BASE_URL + $element.find('a div.Image figure img').attr('src')
    const banner = poster.replace('covers', 'banners').trim()
    const type = $element.find('div.Description p span.Type').text()
    const synopsis = $element.find('div.Description p').text().trim()
    const rating = $element.find('div.Description p span.Vts').text()
    const debut = $element.find('a span.Estreno').text().toLowerCase()
    promises.push(animeEpisodesHandler(id).then(async extra => ({
      id: id || null,
      title: title || null,
      poster: await imageUrlToBase64(poster) || null,
      banner: banner || null,
      synopsis: synopsis || null,
      debut: extra.animeExtraInfo[0].debut.toString() || null,
      type: type || null,
      rating: rating || null,
      genres: extra.genres || null,
      episodes: extra.listByEps || null
    })))
  })
  return await Promise.all(promises)
}

const animeEpisodesHandler = async (id) => {
  try {
    const res = await cloudscraper(`${BASE_URL}/${id}`, { method: 'GET' })
    const body = await res
    const $ = cheerio.load(body)
    const scripts = $('script')
    const anime_info_ids = []
    const anime_eps_data = []
    const animeExtraInfo = []
    const genres = []
    let listByEps

    const animeTitle = $('body div.Wrapper div.Body div div.Ficha.fchlt div.Container h2.Title').text()
    const poster = `${BASE_URL}` + $('body div div div div div aside div.AnimeCover div.Image figure img').attr('src')
    const banner = poster.replace('covers', 'banners').trim()
    const synopsis = $('body div div div div div main section div.Description p').text().trim()
    const rating = $('body div div div.Ficha.fchlt div.Container div.vtshr div.Votes span#votes_prmd').text()
    const debut = $('body div.Wrapper div.Body div div.Container div.BX.Row.BFluid.Sp20 aside.SidebarA.BFixed p.AnmStts').text()
    const type = $('body div.Wrapper div.Body div div.Ficha.fchlt div.Container span.Type').text()

    animeExtraInfo.push({
      title: animeTitle,
      poster,
      banner,
      synopsis,
      rating,
      debut,
      type
    })

    $('main.Main section.WdgtCn nav.Nvgnrs a').each((index, element) => {
      const $element = $(element)
      const genre = $element.attr('href').split('=')[1] || null
      genres.push(genre)
    })

    Array.from({ length: scripts.length }, (v, k) => {
      const $script = $(scripts[k])
      const contents = $script.html()
      if ((contents || '').includes('var anime_info = [')) {
        const anime_info = contents.split('var anime_info = ')[1].split(';')[0]
        const dat_anime_info = JSON.parse(anime_info)
        anime_info_ids.push(dat_anime_info)
      }
      if ((contents || '').includes('var episodes = [')) {
        const episodes = contents.split('var episodes = ')[1].split(';')[0]
        const eps_data = JSON.parse(episodes)
        anime_eps_data.push(eps_data)
      }
    })
    const AnimeThumbnailsId = anime_info_ids[0][0]
    const animeId = anime_info_ids[0][2]
    const nextEpisodeDate = anime_info_ids[0][3] || null
    const amimeTempList = []
    for (const [key, value] of Object.entries(anime_eps_data)) {
      const episode = anime_eps_data[key].map(x => x[0])
      const episodeId = anime_eps_data[key].map(x => x[1])
      amimeTempList.push(episode, episodeId)
    }
    const animeListEps = [{ nextEpisodeDate }]
    Array.from({ length: amimeTempList[1].length }, (v, k) => {
      const data = amimeTempList.map(x => x[k])
      const episode = data[0]
      const id = data[1]
      const imagePreview = `${BASE_EPISODE_IMG_URL}${AnimeThumbnailsId}/${episode}/th_3.jpg`
      const link = `${id}/${animeId}-${episode}`
      // @ts-expect-error
      animeListEps.push({
        episode,
        id: link,
        imagePreview
      })
    })

    listByEps = animeListEps

    return { listByEps, genres, animeExtraInfo }
  } catch (err) {
    console.error(err)
  }
}

// getAnimeInfo('anime/5226/tokyo-ghoul' , 'Tokyo Ghoul')
//  .then(doc =>{
//    console.log(JSON.stringify(doc , null , 2));
// })

const getAnimeServers = async (id) => {
  const res = await cloudscraper(`${ANIME_VIDEO_URL}${id}`, { method: 'GET' })
  const body = await res
  const $ = cheerio.load(body)
  const scripts = $('script')
  const servers = []

  Array.from({ length: scripts.length }, (v, k) => {
    const $script = $(scripts[k])
    const contents = $script.html()
    if ((contents || '').includes('var videos = {')) {
      const videos = contents.split('var videos = ')[1].split(';')[0]
      const data = JSON.parse(videos)
      const serverList = data.SUB
      servers.push(serverList)
    }
  })
  return servers[0]
}
export {
  latestAnimeAdded,
  latestEpisodesAdded,
  getAnimeVideoPromo,
  getAnimeCharacters,
  getAnimeServers,
  animeByGenres,
  animeByState,
  search,
  movies,
  special,
  ova,
  tv,
  getAnimeInfo,
  downloadLinksByEpsId
}
export default {
  latestAnimeAdded,
  latestEpisodesAdded,
  getAnimeVideoPromo,
  getAnimeCharacters,
  getAnimeServers,
  animeByGenres,
  animeByState,
  search,
  movies,
  special,
  ova,
  tv,
  getAnimeInfo,
  downloadLinksByEpsId
}

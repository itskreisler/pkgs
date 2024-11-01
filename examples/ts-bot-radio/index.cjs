const { Parser } = require('icecast-parser')
const fs = require('fs')

const radioUrl = 'https://radioanime.radioca.st/stream'
const currentSongURL = 'https://radioanime.radioca.st/currentsong'

const radioStation = new Parser({
  /* autoUpdate: true,
  emptyInterval: 5 * 60,
  errorInterval: 10 * 60,
  keepListen: false,
  metadataInterval: 5,
  notifyOnChangeOnly: false, */
  url: radioUrl
})

let currentSong = ''
let songBuffer = Buffer.from([])
let lastSong

radioStation.on('metadata', (metadata) => {
  const songInfo = metadata.get('StreamTitle') || 'unknown'
  if (songInfo !== currentSong) {
    currentSong = songInfo
    console.log(`Now Playing: ${currentSong}`)

    // Guardar la canción solo si el nombre cambió
    if (currentSong !== lastSong) {
      lastSong = currentSong
      saveSong(currentSong, songBuffer)
    }
  }
})

radioStation.on('error', (error) => console.error(error.message))
radioStation.on('empty', () => console.log('Stream is empty!'))
radioStation.on('stream', (stream) => {
  console.log('Stream connected!')

  // Escucha el evento 'data' para guardar la canción en tiempo real
  stream.on('data', (chunk) => {
    // Agrega el fragmento de audio al búfer de la canción
    songBuffer = Buffer.concat([songBuffer, chunk])
    console.log(`Buffer size: ${songBuffer.length}`)
    if (songBuffer.length > 10000000) {
      saveSong(currentSong, songBuffer)
      songBuffer = Buffer.from([])
    }
  })
  stream.on('close', () => console.log('Stream closed!'))
  stream.on('drain', () => console.log('Stream drain!'))
  stream.on('error', (err) => console.error(err.message))
  stream.on('finish', () => console.log('Stream finished!'))
  stream.on('pause', () => console.log('Stream paused!'))
  stream.on('pipe', (src) => console.log('Stream piped!'))
  // stream.on('readable', () => console.log('Stream readable!'))
  // stream.on('resume', () => console.log('Stream resumed!'))
  stream.on('unpipe', (src) => console.log('Stream unpiped!'))

  // Escucha el evento 'end' para finalizar la grabación de la canción
  stream.on('end', () => {
    console.log('Stream ended!')

    // Guarda el búfer de la canción en un archivo MP3
    if (songBuffer.length > 0) {
      // Verifica si el nombre cambió antes de guardar la canción
      if (currentSong !== lastSong) {
        lastSong = currentSong
        saveSong(currentSong, songBuffer)
      }
      songBuffer = Buffer.from([]) // Limpia el búfer de la canción
    }
  })
})

radioStation.on('end', () => {
  // Cuando se cierra el flujo de la estación de radio, guarda la última canción si es necesario
  if (currentSong !== '' && songBuffer.length > 0) {
    saveSong(currentSong, songBuffer)
  }
  console.log('Stream closed!')
})

function saveSong(songTitle, songData) {
  const outputFilePath = `./canciones/${songTitle}.mp3`
  fs.writeFileSync(outputFilePath, songData)
  console.log(`Canción grabada y guardada: ${songTitle}`)
}

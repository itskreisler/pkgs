const express = require('express')
const fs = require('fs')
const path = require('path')
const http = require('http')
const app = express()
const port = 3000

const songsFolder = './canciones' // Ruta a la carpeta con tus canciones
const songFiles = fs.readdirSync(songsFolder)

let currentSongIndex = 0

app.get('/', (req, res) => {
  // Mostrar detalles generales de la radio
  res.send(`<audio controls autoplay>
  <source src="/stream" type="audio/mpeg">
  Tu navegador no admite la reproducción de audio.
</audio>
`)
})

app.get('/stream', (req, res) => {
  const playNextSong = () => {
    if (currentSongIndex < songFiles.length) {
      const songFilePath = path.join(__dirname, 'canciones', songFiles[currentSongIndex])
      const stat = fs.statSync(songFilePath)

      const readStream = fs.createReadStream(songFilePath)

      readStream.on('error', (err) => {
        console.error(err)
        res.end() // Terminar la transmisión en caso de error
      })

      /* res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
      }) */
      // res.setHeader('Content-Type', 'audio/mpeg')
      // res.setHeader('icy-name', 'Nombre de tu estación de radio')

      readStream.pipe(res)

      readStream.on('data', (chunk) => {
        console.log(`Transmitiendo ${songFiles[currentSongIndex]} (${chunk.length} bytes)`)
      })
      readStream.on('close', () => console.log('Transmisión finalizada'))
      readStream.on('error', (err) => console.error(err))
      readStream.on('open', () => console.log('Transmisión iniciada'))
      readStream.on('ready', () => console.log('Transmisión lista'))
      readStream.on('pause', () => console.log('Transmisión pausada'))
      readStream.on('resume', () => console.log('Transmisión reanudada'))
      // readStream.on('readable', () => console.log('Transmisión finalizada'))

      readStream.on('end', () => {
        console.log('Transmisión finalizada')
        currentSongIndex++
        if (currentSongIndex < songFiles.length) {
          playNextSong()
        } else {
          res.end() // Terminar la transmisión cuando se reproduzcan todas las canciones
        }
      })
    }
  }

  playNextSong() // Comienza la transmisión de la primera canción
})

app.get('/currentsong', (req, res) => {
  // Mostrar el nombre de la canción actual en formato JSON
  const currentSong = songFiles[currentSongIndex]
  res.json({ currentSong, currentSongIndex })
})
const server = http.createServer(app)
server.listen(port, () => {
  console.log(`El servidor se ejecuta en el puerto->${port}`)
})

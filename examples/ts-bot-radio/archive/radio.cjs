const express = require('express')
const ffmpeg = require('fluent-ffmpeg')
const { StreamInput, StreamOutput } = require('fluent-ffmpeg-multistream')
const fs = require('fs')
const app = express()
const port = 3000

// Ruta para transmitir música infinitamente
app.get('/stream', (req, res) => {
  // Obtén la lista de canciones (puedes obtenerla de tu directorio de música)
  const songs = [
    './canciones/98 Sonido corto.mp3',
    './canciones/Aishitene Motto _ Aiko Kayou _ 14-47-24. Radio Anime Stream.mp3'
    // Agrega todas las canciones que desees transmitir
  ]

  // Crea un flujo de audio a partir de las canciones
  const audioStream = new StreamOutput(res)

  songs.forEach((songPath) => {
    const input = new StreamInput()
    input.url(songPath)
    ffmpeg(input).toFormat('mp3').pipe(audioStream, { end: false })
  })
})

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`)
})

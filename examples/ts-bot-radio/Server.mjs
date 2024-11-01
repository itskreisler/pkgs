import express from 'express'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import queue from './Queue.mjs'
const PORT = 3000
const app = express()
const server = http.createServer(app)
const io = new IOServer(server);

(async () => {
  await queue.loadTracks('canciones')
  queue.play()
  io.on('connection', (socket) => {
    console.log('New listener connected')
  })

  app.get('/stream', (req, res) => {
    const { id, client } = queue.addClient()

    res.set({
      'Content-Type': 'audio/mp3',
      'Transfer-Encoding': 'chunked'
    }).status(200)
    console.log({ queue })
    queue.stream.pipe(res)
    // client.pipe(res)

    req.on('close', () => {
      // queue.removeClient(id)
    })
  })

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
  })
})()

export { }

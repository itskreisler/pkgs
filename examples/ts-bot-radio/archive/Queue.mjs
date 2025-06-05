import { readdir } from 'fs/promises'
import { extname, join } from 'path'
import { ffprobe } from '@dropb/ffprobe'
import ffprobeStatic from 'ffprobe-static'
import { createReadStream } from 'fs'
import Throttle from 'throttle'
import { __dirname } from 'dirname-for-module'

console.log(__dirname) // outputs "/path/to/the"

ffprobe.path = ffprobeStatic.path
class Queue {
  constructor() {
    this.index = 0
    this.clients = new Map()
    this.tracks = []
  }

  broadcast(chunk) {
    this.clients.forEach((client) => {
      client.write(chunk)
    })
  }

  async loadTracks(dir) {
    let filenames = await readdir(dir)
    filenames = filenames.filter(
      (filename) => extname(filename) === '.mp3'
    )

    // Add directory name back to filenames

    const filepaths = filenames.map((filename) => join(__dirname, dir, filename))

    const promises = filepaths.map(async (filepath) => {
      const bitrate = await this.getTrackBitrate(filepath)
      console.log({ filepath })
      return { filepath, bitrate }
    })

    this.tracks = await Promise.all(promises)
    console.log(`Loaded ${this.tracks.length} tracks`)
  }

  async getTrackBitrate(filepath) {
    const data = await ffprobe(filepath)
    const bitrate = data?.format?.bit_rate

    return bitrate ? parseInt(bitrate) : 128000
  }

  getNextTrack() {
    // Loop back to the first track
    if (this.index >= this.tracks.length - 1) {
      this.index = 0
    }

    const track = this.tracks[this.index++]
    this.currentTrack = track

    return track
  }

  loadTrackStream() {
    const track = this.currentTrack
    if (!track) return

    console.log('Starting audio stream')
    this.stream = createReadStream(track.filepath)
  }

  async start() {
    const track = this.currentTrack
    if (!track) return

    this.playing = true
    this.throttle = new Throttle(track.bitrate / 8)

    this.stream
      .pipe(this.throttle)
      .on('data', (chunk) => this.broadcast(chunk))
      .on('end', () => this.play(true))
      .on('error', () => this.play(true))
  }

  pause() {
    if (!this.started() || !this.playing) return
    this.playing = false
    console.log('Paused')
    this.throttle.removeAllListeners('end')
    this.throttle.end()
  }

  started() {
    return this.stream && this.throttle && this.currentTrack
  }

  resume() {
    if (!this.started() || this.playing) return
    console.log('Resumed')
    this.start()
  }

  play(useNewTrack = false) {
    if (useNewTrack || !this.currentTrack) {
      console.log('Playing new track')
      this.getNextTrack()
      this.loadTrackStream()
      this.start()
    } else {
      this.resume()
    }
  }

  addClient() {
    return {
      id: 'string',
      client: 'PassThrough'
    }
  };
}

const queue = new Queue()
export default queue

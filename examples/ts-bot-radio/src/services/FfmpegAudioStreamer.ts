// examples/ts-bot-radio/src/services/FfmpegAudioStreamer.ts
import { IStreamer } from '../interfaces/Streamer';
import { IAudioTrack } from '../interfaces/AudioTrack';
import ffmpeg from 'fluent-ffmpeg';
import { Writable } from 'stream';
import EventEmitter from 'events';

/**
 * @class FfmpegAudioStreamer
 * @implements {IStreamer}
 * An audio streamer that uses FFmpeg to process and stream audio tracks.
 * It transcodes audio to MP3 format and pipes it to an output stream.
 * Emits events such as 'start', 'end', 'error', 'progress', and 'codecData'.
 */
export class FfmpegAudioStreamer implements IStreamer {
  /**
   * @public
   * @type {ffmpeg.FfmpegCommand | null}
   * Holds the active FFmpeg command instance. Null if no stream is active.
   */
  public command: ffmpeg.FfmpegCommand | null = null;

  /**
   * @private
   * @type {EventEmitter}
   * Used to emit events from the streamer (e.g., start, end, error).
   */
  private eventEmitter: EventEmitter = new EventEmitter();

  /**
   * Creates an instance of FfmpegAudioStreamer.
   */
  constructor() {}

  /**
   * Streams the specified audio track to the given output stream using FFmpeg.
   * The audio is transcoded to MP3 at 128k bitrate.
   * It reads the input at its native frame rate to simulate live streaming.
   * @param {IAudioTrack} track - The audio track to stream.
   * @param {Writable} outputStream - The writable stream to pipe the FFmpeg output to.
   * @emits error If the track is invalid or an FFmpeg error occurs.
   * @emits start When FFmpeg starts processing.
   * @emits codecData Information about the input audio codec.
   * @emits progress Streaming progress information.
   * @emits end When FFmpeg finishes streaming the track.
   */
  stream(track: IAudioTrack, outputStream: Writable): void {
    if (!track || !track.getFilePath()) {
        this.eventEmitter.emit('error', new Error('Invalid track provided for streaming.'));
        return;
    }

    const filePath = track.getFilePath();

    try {
      // Create a new FFmpeg command
      this.command = ffmpeg(filePath)
        .inputOptions(['-re']) // Process input at native frame rate, good for streaming
        .outputFormat('mp3')   // Output format
        .audioCodec('libmp3lame') // MP3 codec
        .audioBitrate('128k')   // Standard bitrate for streaming
        .on('start', (commandLine: string) => {
          console.log('Spawned Ffmpeg with command: ' + commandLine);
          this.eventEmitter.emit('start', commandLine);
        })
        .on('codecData', (data: any) => {
          // Provides information about the input audio stream (codec, duration, etc.)
          this.eventEmitter.emit('codecData', data);
        })
        .on('progress', (progress: any) => {
          // Provides progress information (e.g., current time, bytes processed)
          this.eventEmitter.emit('progress', progress);
        })
        .on('error', (err: Error) => {
          console.error('Ffmpeg Error:', err.message);
          // Additional details like err.stdout and err.stderr might be available on the error object
          // depending on @types/fluent-ffmpeg or how fluent-ffmpeg structures its errors.
          this.eventEmitter.emit('error', err);
          this.stop(); // Ensure FFmpeg process is killed on error
        })
        .on('end', () => {
          // This event signifies that FFmpeg has finished processing the input.
          console.log('Ffmpeg streaming finished.');
          this.eventEmitter.emit('end');
        });

      // Pipe the FFmpeg output to the provided writable stream (e.g., an HTTP response)
      this.command.pipe(outputStream, { end: true });

    } catch (error: any) {
        console.error('Error setting up Ffmpeg command:', error);
        this.eventEmitter.emit('error', error);
    }
  }

  /**
   * Registers an event listener for events emitted by this streamer.
   * @param {string} event - The name of the event ('start', 'end', 'error', 'progress', 'codecData').
   * @param {Function} listener - The callback function.
   * @returns {this} The FfmpegAudioStreamer instance for chaining.
   */
  on(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  /**
   * Stops the currently active FFmpeg streaming command.
   * If a command is active, it's killed, and a 'stop' event is emitted.
   */
  stop(): void {
    if (this.command) {
      this.command.kill('SIGKILL'); // Forcefully kill the FFmpeg process
      this.command = null; // Clear the command reference
      console.log('Ffmpeg streaming stopped.');
      this.eventEmitter.emit('stop');
    }
  }
}

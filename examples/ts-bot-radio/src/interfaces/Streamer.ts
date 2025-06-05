// examples/ts-bot-radio/src/interfaces/Streamer.ts
import { IAudioTrack } from './AudioTrack';
import { Writable } from 'stream';

/**
 * @interface IStreamer
 * Defines the contract for an audio streaming service.
 * Implementations are responsible for taking an audio track and streaming its content to an output.
 */
export interface IStreamer {
  /**
   * Streams the given audio track to the provided writable output stream.
   * @param {IAudioTrack} track - The audio track to be streamed.
   * @param {Writable} outputStream - The stream to pipe the audio data to (e.g., an HTTP response).
   */
  stream(track: IAudioTrack, outputStream: Writable): void;

  /**
   * Registers an event listener for streamer-specific events.
   * Common events might include 'start', 'end', 'error', 'progress'.
   * @param {string} event - The name of the event to listen for.
   * @param {Function} listener - The callback function to execute when the event is emitted.
   * @returns {this} The streamer instance, allowing for chaining.
   */
  on(event: string, listener: (...args: any[]) => void): this;

  /**
   * Stops the current streaming process.
   * This should halt any ongoing audio processing and clean up resources if necessary.
   */
  stop(): void;
}

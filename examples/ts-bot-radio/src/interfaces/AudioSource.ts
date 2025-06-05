// examples/ts-bot-radio/src/interfaces/AudioSource.ts
import { IAudioTrack } from './AudioTrack';

/**
 * @interface IAudioSource
 * Defines the contract for a source of audio tracks.
 * Implementations of this interface are responsible for discovering and providing audio tracks.
 */
export interface IAudioSource {
  /**
   * Asynchronously retrieves a list of audio tracks from the source.
   * @async
   * @returns {Promise<IAudioTrack[]>} A promise that resolves to an array of IAudioTrack objects.
   */
  getTracks(): Promise<IAudioTrack[]>;
}

// examples/ts-bot-radio/src/interfaces/AudioTrack.ts

/**
 * @interface IAudioTrack
 * Defines the contract for an audio track.
 * Represents a single audio file with its metadata.
 */
export interface IAudioTrack {
  /**
   * @property {string} filePath - The absolute or relative path to the audio file.
   */
  filePath: string;

  /**
   * @property {string} title - The title of the audio track.
   */
  title: string;

  /**
   * @property {string} artist - The artist of the audio track.
   */
  artist: string;

  /**
   * Retrieves the file path of the audio track.
   * @returns {string} The path to the audio file.
   */
  getFilePath(): string;

  /**
   * Retrieves the title of the audio track.
   * @returns {string} The title of the track.
   */
  getTitle(): string;

  /**
   * Retrieves the artist of the audio track.
   * @returns {string} The artist of the track.
   */
  getArtist(): string;
}

// examples/ts-bot-radio/src/models/Track.ts
import { IAudioTrack } from '../interfaces/AudioTrack';
import * as path from 'path';
import { stat } from 'fs/promises'; // fs/promises is ESM friendly

/**
 * @class Track
 * @implements {IAudioTrack}
 * Represents a single audio track, holding its metadata and file path.
 */
export class Track implements IAudioTrack {
  /**
   * The absolute or relative path to the audio file.
   * @public
   * @type {string}
   */
  public filePath: string;

  /**
   * The title of the audio track. Defaults to the filename if not provided.
   * @public
   * @type {string}
   */
  public title: string;

  /**
   * The artist of the audio track. Defaults to 'Unknown Artist' if not provided.
   * @public
   * @type {string}
   */
  public artist: string;

  /**
   * Creates an instance of Track.
   * @param {string} filePath - The path to the audio file.
   * @param {string} [title=''] - The title of the track. If empty, filename is used.
   * @param {string} [artist=''] - The artist of the track. If empty, 'Unknown Artist' is used.
   * @throws {Error} If filePath is not provided.
   */
  constructor(filePath: string, title: string = '', artist: string = '') {
    if (!filePath) {
      throw new Error('File path is required for a Track.');
    }
    this.filePath = filePath;
    // Set title: use provided title, or filename without extension, or default if filename is also empty (unlikely for a path)
    this.title = title || path.basename(filePath, path.extname(filePath)) || 'Unknown Title';
    this.artist = artist || 'Unknown Artist';
  }

  /**
   * Retrieves the file path of the audio track.
   * @returns {string} The path to the audio file.
   */
  getFilePath(): string {
    return this.filePath;
  }

  /**
   * Retrieves the title of the audio track.
   * @returns {string} The title of the track.
   */
  getTitle(): string {
    return this.title;
  }

  /**
   * Retrieves the artist of the audio track.
   * @returns {string} The artist of the track.
   */
  getArtist(): string {
    return this.artist;
  }

  /**
   * Asynchronously creates a Track instance from a given file path.
   * It checks if the path points to a valid file.
   * Metadata extraction (e.g., ID3 tags) could be added here in a real application.
   * @async
   * @static
   * @param {string} filePath - The path to the audio file.
   * @returns {Promise<Track | null>} A promise that resolves to a Track instance, or null if the file is invalid or an error occurs.
   */
  static async fromPath(filePath: string): Promise<Track | null> {
    try {
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        // Log a warning if the path is not a file (e.g., it's a directory).
        console.warn(`Path is not a file: ${filePath}`);
        return null;
      }
      // For now, use filename as title.
      // In a real application, you'd use a library like 'music-metadata' here to read ID3 tags.
      const title = path.basename(filePath, path.extname(filePath));
      return new Track(filePath, title);
    } catch (error) {
      // Log an error if 'stat' fails (e.g., file does not exist).
      console.error(`Error creating Track from path ${filePath}:`, error);
      return null;
    }
  }
}

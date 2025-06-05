// examples/ts-bot-radio/src/services/FileSystemAudioSource.ts
import { IAudioSource } from '../interfaces/AudioSource';
import { IAudioTrack } from '../interfaces/AudioTrack';
import { Track } from '../models/Track';
import { readdir } from 'fs/promises';
import * as path from 'path';

/**
 * @class FileSystemAudioSource
 * @implements {IAudioSource}
 * An audio source that reads tracks from a specified directory on the file system.
 * It filters for common audio file extensions (mp3, ogg, flac, wav).
 */
export class FileSystemAudioSource implements IAudioSource {
  /**
   * @private
   * @type {string}
   * The path to the directory from which audio tracks are loaded.
   */
  private directoryPath: string;

  /**
   * Creates an instance of FileSystemAudioSource.
   * @param {string} directoryPath - The path to the directory containing audio files.
   * @throws {Error} If directoryPath is not provided.
   */
  constructor(directoryPath: string) {
    if (!directoryPath) {
        throw new Error("Directory path is required for FileSystemAudioSource.");
    }
    this.directoryPath = directoryPath;
  }

  /**
   * Asynchronously retrieves a list of audio tracks from the configured directory.
   * It reads the directory, filters for supported audio file types,
   * and attempts to create Track objects for each valid file.
   * @async
   * @returns {Promise<IAudioTrack[]>} A promise that resolves to an array of IAudioTrack objects.
   * Returns an empty array if the directory cannot be read or contains no valid audio files.
   */
  async getTracks(): Promise<IAudioTrack[]> {
    try {
      // Read all file names in the specified directory
      const files = await readdir(this.directoryPath);

      // Filter for files with supported audio extensions and map them to Track creation promises
      const trackPromises = files
        .filter(file => {
          const extension = path.extname(file).toLowerCase();
          return ['.mp3', '.ogg', '.flac', '.wav'].includes(extension);
        })
        .map(file => Track.fromPath(path.join(this.directoryPath, file)));

      // Wait for all Track.fromPath promises to resolve
      const resolvedTracks = await Promise.all(trackPromises);

      // Filter out any null results (e.g., if Track.fromPath failed for a file)
      // and ensure the type system recognizes the filtered array as Track[] (which implements IAudioTrack).
      const tracks = resolvedTracks.filter((track): track is Track => track !== null);

      return tracks;
    } catch (error) {
      // Log an error if reading the directory fails (e.g., path does not exist, permissions issue).
      console.error(`Error reading tracks from directory ${this.directoryPath}:`, error);
      return []; // Return an empty array on error
    }
  }
}

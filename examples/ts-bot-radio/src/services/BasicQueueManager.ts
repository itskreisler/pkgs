// examples/ts-bot-radio/src/services/BasicQueueManager.ts
import { IQueueManager } from '../interfaces/QueueManager';
import { IAudioTrack } from '../interfaces/AudioTrack';

/**
 * @class BasicQueueManager
 * @implements {IQueueManager}
 * A basic implementation of a queue manager for audio tracks.
 * Manages an in-memory array of tracks and supports cycling through them.
 */
export class BasicQueueManager implements IQueueManager {
  /**
   * @private
   * @type {IAudioTrack[]}
   * Internal array to store the audio tracks.
   */
  private queue: IAudioTrack[] = [];

  /**
   * @private
   * @type {number}
   * Index of the currently playing or selected track. -1 indicates nothing is selected/playing or queue is empty.
   */
  private currentIndex: number = -1;

  /**
   * Creates an instance of BasicQueueManager.
   */
  constructor() {}

  /**
   * Adds a single audio track to the end of the queue.
   * Logs an error if the track is invalid.
   * @param {IAudioTrack} track - The audio track to add.
   */
  addTrack(track: IAudioTrack): void {
    // Basic validation for the track object
    if (!track || typeof track.getFilePath !== 'function') {
      console.error('Invalid track added (must be an object with getFilePath method):', track);
      return;
    }
    this.queue.push(track);
  }

  /**
   * Adds multiple audio tracks to the end of the queue.
   * Logs an error if the tracks list is not an array. Invalid tracks within the list are skipped.
   * @param {IAudioTrack[]} tracks - An array of audio tracks to add.
   */
  addTracks(tracks: IAudioTrack[]): void {
    if (!Array.isArray(tracks)) {
        console.error('Invalid tracks list provided (must be an array):', tracks);
        return;
    }
    tracks.forEach(track => this.addTrack(track));
  }

  /**
   * Retrieves the next audio track from the queue.
   * If the end of the queue is reached, it cycles back to the beginning.
   * @returns {IAudioTrack | null} The next audio track, or null if the queue is empty.
   */
  getNextTrack(): IAudioTrack | null {
    if (this.isEmpty()) {
      return null;
    }
    // Cycle through the queue
    this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    return this.queue[this.currentIndex];
  }

  /**
   * Retrieves the currently selected audio track.
   * This is the track that was last returned by `getNextTrack` or the first track if playback just started.
   * @returns {IAudioTrack | null} The current audio track, or null if the queue is empty or no track has been selected.
   */
  getCurrentTrack(): IAudioTrack | null {
    if (this.currentIndex === -1 || this.isEmpty() || this.currentIndex >= this.queue.length) {
      // Ensure currentIndex is valid and queue is not empty
      return null;
    }
    return this.queue[this.currentIndex];
  }

  /**
   * Checks if the queue currently contains no tracks.
   * @returns {boolean} True if the queue is empty, false otherwise.
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Retrieves a copy of the current queue of tracks.
   * Modifying the returned array will not affect the internal queue.
   * @returns {IAudioTrack[]} A new array containing all tracks in the queue.
   */
  getQueue(): IAudioTrack[] {
    return [...this.queue]; // Return a shallow copy
  }
}

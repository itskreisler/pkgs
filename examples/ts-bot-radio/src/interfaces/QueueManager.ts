// examples/ts-bot-radio/src/interfaces/QueueManager.ts
import { IAudioTrack } from './AudioTrack';

/**
 * @interface IQueueManager
 * Defines the contract for managing a queue of audio tracks.
 * Responsibilities include adding tracks, retrieving current/next tracks, and checking queue status.
 */
export interface IQueueManager {
  /**
   * Adds a single audio track to the queue.
   * @param {IAudioTrack} track - The audio track to add.
   */
  addTrack(track: IAudioTrack): void;

  /**
   * Adds multiple audio tracks to the queue.
   * @param {IAudioTrack[]} tracks - An array of audio tracks to add.
   */
  addTracks(tracks: IAudioTrack[]): void;

  /**
   * Retrieves the next audio track from the queue.
   * Implementations should handle queue looping or ending.
   * @returns {IAudioTrack | null} The next audio track, or null if the queue is empty or finished.
   */
  getNextTrack(): IAudioTrack | null;

  /**
   * Retrieves the currently active or selected audio track from the queue.
   * @returns {IAudioTrack | null} The current audio track, or null if nothing is selected or playing.
   */
  getCurrentTrack(): IAudioTrack | null;

  /**
   * Checks if the queue is currently empty.
   * @returns {boolean} True if the queue contains no tracks, false otherwise.
   */
  isEmpty(): boolean;

  /**
   * Retrieves a copy of the current queue.
   * This is typically for display or informational purposes and should not allow direct modification of the internal queue.
   * @returns {IAudioTrack[]} An array representing the current tracks in the queue.
   */
  getQueue(): IAudioTrack[];
}

// examples/ts-bot-radio/src/services/RadioService.ts
import { IQueueManager } from '../interfaces/QueueManager';
import { IStreamer } from '../interfaces/Streamer';
import { IAudioSource } from '../interfaces/AudioSource';
import { IAudioTrack } from '../interfaces/AudioTrack';
import { Request, Response } from 'express';
import { Writable } from 'stream';

/**
 * @class RadioService
 * Orchestrates the core radio functionalities.
 * It manages the audio queue, controls the streamer, and handles client requests for streaming.
 */
export class RadioService {
  private queueManager: IQueueManager;
  private streamer: IStreamer;

  /**
   * @private
   * @type {Writable | null}
   * Stores the current client's response stream to pipe audio data to.
   * This simple model assumes one active stream listener at a time for the `/stream` endpoint.
   */
  private currentClientResponse: Writable | null = null;

  /**
   * Creates an instance of RadioService.
   * @param {IQueueManager} queueManager - The queue manager instance.
   * @param {IStreamer} streamer - The streamer instance.
   */
  constructor(queueManager: IQueueManager, streamer: IStreamer) {
    this.queueManager = queueManager;
    this.streamer = streamer;

    // Listen for the 'end' event from the streamer
    // When a track finishes, try to play the next one if a client is still connected.
    this.streamer.on('end', () => {
      console.log('RadioService: Streamer finished current track.');
      if (this.currentClientResponse) {
        // If a client is connected, automatically play the next track.
        this.playNextTrackInternal();
      }
    });

    // Listen for 'error' events from the streamer
    this.streamer.on('error', (error: Error) => {
      console.error('RadioService: Streamer error:', error.message);
      // If there's an active client response stream and headers haven't been sent,
      // try to send an error status.
      if (this.currentClientResponse && !(this.currentClientResponse as any).headersSent) {
        (this.currentClientResponse as Response).status(500).send('Error during streaming.');
      }
      // Attempt to end the response stream if it exists and is a function (like for HTTP Response)
      if (this.currentClientResponse && typeof (this.currentClientResponse as any).end === 'function') {
        (this.currentClientResponse as any).end();
      }
      this.currentClientResponse = null; // Clear the client response reference
    });
  }

  /**
   * Loads tracks from the given audio source into the queue.
   * @async
   * @param {IAudioSource} audioSource - The audio source to load tracks from.
   */
  async loadTracks(audioSource: IAudioSource): Promise<void> {
    const tracks = await audioSource.getTracks();
    this.queueManager.addTracks(tracks);
    console.log(`RadioService: Loaded ${tracks.length} tracks into the queue.`);
  }

  /**
   * Handles a client request to start streaming audio.
   * If the queue is empty, it sends a 404 response.
   * If another client is already streaming, the old stream is stopped, and its connection is ended.
   * Sets up headers for audio streaming and pipes the track data from the streamer to the client.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  startStreaming(req: Request, res: Response): void {
    if (this.queueManager.isEmpty()) {
      res.status(404).send('Queue is empty. No tracks to play.');
      return;
    }

    // If there's an existing stream to a previous client, terminate it.
    if (this.currentClientResponse) {
        console.log('RadioService: New client connected, stopping stream for previous client.');
        this.streamer.stop();
        if (typeof (this.currentClientResponse as any).end === 'function') {
            (this.currentClientResponse as any).end();
        }
    }

    // Store the new client's response stream.
    // Note: Express Response object is a Writable stream.
    this.currentClientResponse = res as Writable;

    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Connection', 'keep-alive'); // Keep the connection open for streaming
    res.setHeader('Cache-Control', 'no-cache'); // Prevent caching of the stream

    // Handle client disconnection
    req.on('close', () => {
      console.log('RadioService: Client disconnected.');
      this.streamer.stop(); // Stop the streamer if the client disconnects
      this.currentClientResponse = null; // Clear client reference
    });

    // Get the current track or the next one if playback hasn't started
    let trackToPlay = this.queueManager.getCurrentTrack();
    if (!trackToPlay) {
        trackToPlay = this.queueManager.getNextTrack();
    }

    if (trackToPlay) {
      console.log(`RadioService: Starting stream for track: ${trackToPlay.getTitle()}`);
      this.streamer.stream(trackToPlay, this.currentClientResponse);
    } else {
      // This case should ideally be caught by queueManager.isEmpty(), but as a safeguard:
      res.status(404).send('Could not find a track to play.');
      this.currentClientResponse = null;
    }
  }

  /**
   * @private
   * Internal method to play the next track in the queue.
   * Used by the 'end' event handler of the streamer or by direct calls.
   */
  private playNextTrackInternal(): void {
    const nextTrack = this.queueManager.getNextTrack();
    if (nextTrack && this.currentClientResponse) {
      console.log(`RadioService: Playing next track: ${nextTrack.getTitle()}`);
      // streamer.stream should ideally handle stopping the current stream if one is active,
      // or ensure it can replace the ongoing stream. If not, an explicit streamer.stop() might be needed first.
      this.streamer.stream(nextTrack, this.currentClientResponse);
    } else if (this.currentClientResponse) {
      // No next track (queue might be empty or finished based on QueueManager logic)
      console.log('RadioService: Queue finished or no client response for next track.');
      if (!(this.currentClientResponse as any).headersSent) {
         (this.currentClientResponse as Response).status(200).send('Queue finished.');
      }
      if (typeof (this.currentClientResponse as any).end === 'function') {
        (this.currentClientResponse as any).end(); // End the HTTP response
      }
      this.currentClientResponse = null;
      this.streamer.stop(); // Ensure streamer is stopped
    }
  }

  /**
   * Handles a client request to play the next track.
   * This is typically called from a route handler.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object. (Note: res is not directly used here as StreamRoutes handles the immediate response)
   */
  public playNextTrack(req: Request, res: Response): void {
    console.log('RadioService: Received request to play next track.');
    this.playNextTrackInternal();
  }

  /**
   * Retrieves information about the currently playing track.
   * @returns {{ title: string; artist: string } | null} An object with title and artist, or null if no track is current.
   */
  public getCurrentTrackInfo(): { title: string; artist: string } | null {
    const track = this.queueManager.getCurrentTrack();
    return track ? { title: track.getTitle(), artist: track.getArtist() } : null;
  }

  /**
   * Retrieves information about all tracks currently in the queue.
   * @returns {{ title: string; artist: string; filePath: string }[]} An array of track information objects.
   */
  public getQueueInfo(): { title: string; artist: string; filePath: string }[] {
    return this.queueManager.getQueue().map(track => ({
        title: track.getTitle(),
        artist: track.getArtist(),
        filePath: track.getFilePath()
    }));
  }
}

// examples/ts-bot-radio/app.ts
import { HttpServer } from './src/services/HttpServer.js'; // Added .js
import { FileSystemAudioSource } from './src/services/FileSystemAudioSource.js'; // Added .js
import { BasicQueueManager } from './src/services/BasicQueueManager.js'; // Added .js
import { FfmpegAudioStreamer } from './src/services/FfmpegAudioStreamer.js'; // Added .js
import { RadioService } from './src/services/RadioService.js'; // Added .js
import { YoutubeDownloaderService } from './src/services/YoutubeDownloaderService.js'; // Added import and .js
import { StreamRoutes } from './src/routes/StreamRoutes.js'; // Added .js
import * as path from 'path';
import { fileURLToPath } from 'url';
import express, { Request, Response, Application as ExpressApplication } from 'express'; // Updated Express import for clarity

// --- Configuration ---

/**
 * Port number for the HTTP server.
 * Defaults to 3000 if not specified in environment variables.
 * @type {number}
 */
const PORT: number = parseInt(process.env.PORT || '3000', 10);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Path to the directory containing audio files.
 * @type {string}
 */
const AUDIO_DIRECTORY: string = path.join(__dirname, 'audio');

// --- Dependency Injection Setup ---

const httpServer = new HttpServer(PORT);
const audioSource = new FileSystemAudioSource(AUDIO_DIRECTORY);
const queueManager = new BasicQueueManager();
const streamer = new FfmpegAudioStreamer();
const radioService = new RadioService(queueManager, streamer);
const youtubeDownloaderService = new YoutubeDownloaderService(); // Instantiate YoutubeDownloaderService (uses default audio dir)
const streamRoutes = new StreamRoutes(radioService, youtubeDownloaderService); // Pass to StreamRoutes

/**
 * Main application function.
 * @async
 */
async function main() {
  // Attempt to download a default track (example)
  console.log("[App] Attempting to download default track (Kendrick Lamar - N95)...");
  const defaultUrl = "https://www.youtube.com/watch?v=zI383uEwA6Q"; // Example: Kendrick Lamar - N95
  const downloadResult = await youtubeDownloaderService.downloadAudio(defaultUrl);
  if (downloadResult.success && downloadResult.filePath) {
      console.log(`[App] Default track downloaded successfully: ${downloadResult.filePath}`);
      // Note: RadioService currently loads tracks at startup. For dynamically added tracks
      // to be available without restart, RadioService/FileSystemAudioSource would need a 'reloadTracks' or 'watch' mechanism.
  } else if (downloadResult.success) {
      console.log(`[App] Default track download initiated. It might take a moment to appear in '${AUDIO_DIRECTORY}'.`);
  } else {
      console.warn(`[App] Failed to download default track: ${downloadResult.message}. This might be due to missing yt-dlp or ffmpeg in PATH.`);
  }

  // Load audio tracks into the queue via the RadioService
  await radioService.loadTracks(audioSource);

  if (queueManager.isEmpty()) {
    console.warn(`[App] No tracks loaded from ${AUDIO_DIRECTORY}. The radio will not play anything.`);
    console.warn('[App] Please ensure the audio directory exists, contains supported audio files (mp3, ogg, flac, wav), or download some via the API.');
  } else {
    console.log(`[App] Loaded ${queueManager.getQueue().length} tracks. Ready to stream.`);
  }

  const app: ExpressApplication = httpServer.getApp();

  // Add express.json() middleware globally to parse JSON request bodies
  // This is important for the /api/download endpoint
  app.use(express.json());

  app.use('/api', streamRoutes.getRouter());

  app.get('/', (req: Request, res: Response) => {
    res.send(`Radio Bot is running! Stream available at /api/stream. Loaded tracks: ${queueManager.getQueue().length}. Try POST /api/download with { "url": "youtube_url" } to download a song.`);
  });

  httpServer.start(() => {
    console.log(`[App] Radio server started. Access stream at http://localhost:${PORT}/api/stream`);
  });
}

main().catch((error: Error) => {
  console.error("[App] Failed to start the radio service:", error);
  process.exit(1);
});

// examples/ts-bot-radio/src/services/YoutubeDownloaderService.ts
import { exec } from 'youtube-dl-exec';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Determine the project's audio directory
// This assumes app.ts or a similar entry point is in examples/ts-bot-radio/
// Adjust if your project structure for AUDIO_DIRECTORY is different
const __filename = fileURLToPath(import.meta.url); // Gets current file path
const __dirname = path.dirname(__filename); // Gets directory of current file (src/services)
// Navigate up to examples/ts-bot-radio/ and then to audio/
const outputDir = path.resolve(__dirname, '../../audio');

/**
 * @class YoutubeDownloaderService
 * @description Service for downloading audio from YouTube using yt-dlp (via youtube-dl-exec).
 */
export class YoutubeDownloaderService {
  /**
   * @private
   * @readonly
   * @type {object}
   * Configuration flags for yt-dlp.
   */
  private readonly ytFlags: any;

  /**
   * @constructor
   * @param {string} [customOutputDir] - Optional custom output directory for downloads. Defaults to 'audio' folder relative to project root.
   */
  constructor(customOutputDir?: string) {
    const effectiveOutputDir = customOutputDir || outputDir;
    console.log(`[YoutubeDownloaderService] Output directory set to: ${effectiveOutputDir}`);

    this.ytFlags = {
      audioQuality: 0, // Best audio quality
      extractAudio: true, // Extract audio track
      audioFormat: 'mp3', // Desired audio format
      output: `${effectiveOutputDir}/%(title)s.%(ext)s`, // Output template: title.mp3 in the specified directory
      addMetadata: true, // Add metadata to the file
      embedThumbnail: true, // Embed thumbnail (if available)
      noPlaylist: true, // Download only the specified video if URL is part of a playlist
      // ffmpegLocation: '/path/to/your/ffmpeg', // Uncomment and set if yt-dlp can't find ffmpeg in PATH
    };
  }

  /**
   * Downloads audio from a given YouTube URL using yt-dlp.
   * @async
   * @param {string} youtubeUrl - The URL of the YouTube video to download.
   * @returns {Promise<{success: boolean, message: string, filePath?: string}>} - Result of the download operation, including the potential file path.
   */
  async downloadAudio(youtubeUrl: string): Promise<{success: boolean, message: string, filePath?: string}> {
    if (!youtubeUrl) {
      return { success: false, message: 'YouTube URL is required.' };
    }
    console.log(`[YoutubeDownloaderService] Attempting to download audio from: ${youtubeUrl}`);

    try {
      // Execute yt-dlp with the specified URL and flags
      const result = await exec(youtubeUrl, this.ytFlags);

      let filePath: string | undefined = undefined;
      // Attempt to parse the file path from yt-dlp's stdout
      // yt-dlp often prints "[ExtractAudio] Destination: <filepath>" or "[download] Destination: <filepath>"
      if (result.stdout) {
          const match = result.stdout.match(/\[ExtractAudio\] Destination: (.*)/) || result.stdout.match(/\[download\] Destination: (.*)/);
          if (match && match[1]) {
              filePath = match[1].trim();
              console.log(`[YoutubeDownloaderService] Successfully downloaded: ${filePath}`);
          } else {
              // Fallback if specific "Destination:" line not found, but download may have succeeded if no error thrown
              console.log(`[YoutubeDownloaderService] Download process completed for ${youtubeUrl}. Output file should be in target directory. Stdout: ${result.stdout}`);
              // We might need a more robust way to determine the filename if not in stdout,
              // e.g. by using --get-filename with output template before actual download,
              // or by listing directory contents (less ideal).
              // For now, we'll rely on stdout parsing or assume user checks the directory.
          }
      } else {
         console.log(`[YoutubeDownloaderService] Download process for ${youtubeUrl} completed, but no stdout to parse for filepath.`);
      }

      return { success: true, message: `Successfully initiated download for ${youtubeUrl}.`, filePath };
    } catch (error: any) {
      // Log detailed error information from yt-dlp
      console.error(`[YoutubeDownloaderService] Error downloading audio from ${youtubeUrl}:`, error.message);
      if (error.stderr) { // yt-dlp often outputs useful error details to stderr
        console.error(`[YoutubeDownloaderService] yt-dlp stderr:`, error.stderr);
      }
      if (error.stdout) { // Sometimes stdout also contains error info or context
        console.error(`[YoutubeDownloaderService] yt-dlp stdout (on error):`, error.stdout);
      }
      return { success: false, message: `Error downloading audio: ${error.message}` };
    }
  }
}

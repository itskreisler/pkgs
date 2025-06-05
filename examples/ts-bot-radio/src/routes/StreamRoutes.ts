// examples/ts-bot-radio/src/routes/StreamRoutes.ts
import { Router, Request, Response, json as expressJson } from 'express'; // Import json
import { RadioService } from '../services/RadioService';
import { YoutubeDownloaderService } from '../services/YoutubeDownloaderService'; // Added import

/**
 * @class StreamRoutes
 * Manages the API routes related to audio streaming, queue interaction, and downloads.
 * It uses the RadioService and YoutubeDownloaderService to handle core logic.
 */
export class StreamRoutes {
  public router: Router;
  private radioService: RadioService;
  private youtubeDownloaderService: YoutubeDownloaderService; // Added property

  /**
   * Creates an instance of StreamRoutes.
   * @param {RadioService} radioService - The RadioService to be used by these routes.
   * @param {YoutubeDownloaderService} youtubeDownloaderService - The service for downloading YouTube audio.
   */
  constructor(radioService: RadioService, youtubeDownloaderService: YoutubeDownloaderService) { // Modified constructor
    this.router = Router();
    this.radioService = radioService;
    this.youtubeDownloaderService = youtubeDownloaderService; // Store service
    this.initRoutes();
  }

  /**
   * @private
   * Initializes all the routes for the streaming and download service.
   */
  private initRoutes(): void {
    // Existing GET routes
    this.router.get('/stream', (req: Request, res: Response) => {
      this.radioService.startStreaming(req, res);
    });

    this.router.get('/next', (req: Request, res: Response) => {
      this.radioService.playNextTrack(req, res);
      res.status(200).send('Skipping to next track. Player may need to handle stream interruption/reconnection if applicable.');
    });

    this.router.get('/current', (req: Request, res: Response) => {
      const currentTrack = this.radioService.getCurrentTrackInfo();
      if (currentTrack) {
        res.status(200).json(currentTrack);
      } else {
        res.status(404).send('No track currently playing.');
      }
    });

    this.router.get('/queue', (req: Request, res: Response) => {
        const queue = this.radioService.getQueueInfo();
        res.status(200).json(queue);
    });

    // New POST route for downloads
    // expressJson() middleware is used to parse JSON request bodies
    this.router.post('/download', expressJson(), this.handleDownloadRequest.bind(this));
  }

  /**
   * @async
   * @private
   * @description Handles requests to download audio from YouTube.
   * Expects a JSON body with a 'url' property.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   */
  private async handleDownloadRequest(req: Request, res: Response): Promise<void> {
    const { url } = req.body; // req.body requires a body-parsing middleware like express.json()
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, message: 'YouTube URL is required in the request body (e.g., {"url": "your_youtube_url_here"}).' });
      return;
    }

    console.log(`[StreamRoutes] Received download request for URL: ${url}`);
    const result = await this.youtubeDownloaderService.downloadAudio(url);

    if (result.success) {
      // Optionally, trigger a rescan of the audio directory in RadioService.
      // This would require RadioService to have such a method, e.g., this.radioService.rescanAudioDirectory();
      // For now, the new track will be picked up if the FileSystemAudioSource is re-queried (e.g. app restart or manual trigger)
      console.log(`[StreamRoutes] Download successful for URL: ${url}. File path: ${result.filePath || 'N/A (check logs)'}`);
      res.status(200).json(result);
    } else {
      console.error(`[StreamRoutes] Download failed for URL: ${url}. Reason: ${result.message}`);
      res.status(500).json(result);
    }
  }

  /**
   * Returns the configured Express Router instance.
   * @returns {Router} The Express router with all defined stream routes.
   */
  public getRouter(): Router {
    return this.router;
  }
}

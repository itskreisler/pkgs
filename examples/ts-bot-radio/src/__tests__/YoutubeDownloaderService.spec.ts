// examples/ts-bot-radio/src/__tests__/YoutubeDownloaderService.spec.ts
import { YoutubeDownloaderService } from '../../services/YoutubeDownloaderService.js'; // Import with .js for Node ESM
import { jest } from '@jest/globals';
import * as path from 'path';

// Mock 'youtube-dl-exec'
const mockYoutubeDLExec = jest.fn();

// This is the standard way to mock in ESM with Jest
jest.unstable_mockModule('youtube-dl-exec', () => ({
    exec: mockYoutubeDLExec,
}));

// Define a mock output directory for consistency in tests
const mockOutputDir = path.resolve(process.cwd(), 'examples/ts-bot-radio/audio_test_output');


describe('YoutubeDownloaderService', () => {
    let downloaderService: YoutubeDownloaderService;

    beforeEach(async () => {
        // Reset mocks before each test
        mockYoutubeDLExec.mockReset();

        // Dynamically import the service to use the mocked module
        const { YoutubeDownloaderService: DynamicService } = await import('../../services/YoutubeDownloaderService.js');
        downloaderService = new DynamicService(mockOutputDir);
    });

    it('should return success:false if youtubeUrl is not provided', async () => {
        const result = await downloaderService.downloadAudio('');
        expect(result.success).toBe(false);
        expect(result.message).toBe('YouTube URL is required.');
        expect(mockYoutubeDLExec).not.toHaveBeenCalled();
    });

    it('should call youtube-dl-exec with correct flags and URL', async () => {
        const youtubeUrl = 'https://www.youtube.com/watch?v=testVideo';
        const expectedFilePath = path.join(mockOutputDir, 'Test Video Title.mp3');

        mockYoutubeDLExec.mockResolvedValue({
            stdout: `[ExtractAudio] Destination: ${expectedFilePath}`,
            stderr: ''
        });

        await downloaderService.downloadAudio(youtubeUrl);

        expect(mockYoutubeDLExec).toHaveBeenCalledWith(youtubeUrl, {
            audioQuality: 0,
            extractAudio: true,
            audioFormat: 'mp3',
            output: `${mockOutputDir}/%(title)s.%(ext)s`,
            addMetadata: true,
            embedThumbnail: true,
            noPlaylist: true,
        });
    });

    it('should return success and filePath if download is successful and path is parsed', async () => {
        const youtubeUrl = 'https://www.youtube.com/watch?v=testVideo';
        const expectedFilePath = path.join(mockOutputDir, 'Test Video Title.mp3');
        mockYoutubeDLExec.mockResolvedValue({
            stdout: `[ExtractAudio] Destination: ${expectedFilePath}`,
            stderr: ''
        });

        const result = await downloaderService.downloadAudio(youtubeUrl);

        expect(result.success).toBe(true);
        expect(result.message).toContain('Successfully initiated download');
        expect(result.filePath).toBe(expectedFilePath);
    });

    it('should return success if download completes but filepath cannot be parsed from stdout', async () => {
        const youtubeUrl = 'https://www.youtube.com/watch?v=testVideoNoPath';
        mockYoutubeDLExec.mockResolvedValue({ stdout: 'Some other output without Destination line', stderr: '' });

        const result = await downloaderService.downloadAudio(youtubeUrl);

        expect(result.success).toBe(true);
        expect(result.message).toContain('Successfully initiated download');
        expect(result.filePath).toBeUndefined();
    });

    it('should return failure if youtube-dl-exec throws an error', async () => {
        const youtubeUrl = 'https://www.youtube.com/watch?v=errorVideo';
        const errorMessage = 'yt-dlp failed';
        const stderrMessage = 'Some detailed error from yt-dlp';
        const DLError = new Error(errorMessage) as any;
        DLError.stderr = stderrMessage;
        mockYoutubeDLExec.mockRejectedValue(DLError);

        const result = await downloaderService.downloadAudio(youtubeUrl);

        expect(result.success).toBe(false);
        expect(result.message).toBe(`Error downloading audio: ${errorMessage}`);
    });
});

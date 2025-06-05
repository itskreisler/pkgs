// examples/ts-bot-radio/src/__tests__/FfmpegAudioStreamer.spec.ts
import { Track } from '../../models/Track.js'; // Ensured .js
import { PassThrough, Writable } from 'stream';
import { jest } from '@jest/globals';
import type { FfmpegCommand } from 'fluent-ffmpeg';

interface MockFfmpegCommand {
  inputOptions: jest.Mock;
  outputFormat: jest.Mock;
  audioCodec: jest.Mock;
  audioBitrate: jest.Mock;
  on: jest.Mock;
  pipe: jest.Mock;
  kill: jest.Mock;
}

const mockFfmpegCommand: MockFfmpegCommand = {
  inputOptions: jest.fn().mockReturnThis(),
  outputFormat: jest.fn().mockReturnThis(),
  audioCodec: jest.fn().mockReturnThis(),
  audioBitrate: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  pipe: jest.fn().mockReturnThis(),
  kill: jest.fn(),
};

const mockFfmpeg = jest.fn((): FfmpegCommand => mockFfmpegCommand as any);

jest.unstable_mockModule('fluent-ffmpeg', () => ({
  __esModule: true,
  default: mockFfmpeg,
}));

let DynamicallyImportedStreamer: any;

describe('FfmpegAudioStreamer', () => {
  let streamer: any;
  let mockTrack: Track;
  let outputStream: Writable;

  beforeAll(async () => {
    const streamerModule = await import('../../services/FfmpegAudioStreamer.js'); // Ensured .js
    DynamicallyImportedStreamer = streamerModule.FfmpegAudioStreamer;
  });

  beforeEach(() => {
    streamer = new DynamicallyImportedStreamer();

    mockFfmpeg.mockClear();
    mockFfmpegCommand.inputOptions.mockClear().mockReturnThis();
    mockFfmpegCommand.outputFormat.mockClear().mockReturnThis();
    mockFfmpegCommand.audioCodec.mockClear().mockReturnThis();
    mockFfmpegCommand.audioBitrate.mockClear().mockReturnThis();
    mockFfmpegCommand.on.mockClear().mockReturnThis();
    mockFfmpegCommand.pipe.mockClear().mockReturnThis();
    mockFfmpegCommand.kill.mockClear();

    mockTrack = new Track('fakepath/track.mp3', 'Test Track');
    outputStream = new PassThrough();
  });

  it('should setup ffmpeg command with correct options and pipe to outputStream', () => {
    streamer.stream(mockTrack, outputStream);

    expect(mockFfmpeg).toHaveBeenCalledWith(mockTrack.getFilePath());
    expect(mockFfmpegCommand.inputOptions).toHaveBeenCalledWith(['-re']);
    expect(mockFfmpegCommand.outputFormat).toHaveBeenCalledWith('mp3');
    expect(mockFfmpegCommand.audioCodec).toHaveBeenCalledWith('libmp3lame');
    expect(mockFfmpegCommand.audioBitrate).toHaveBeenCalledWith('128k');
    expect(mockFfmpegCommand.pipe).toHaveBeenCalledWith(outputStream, { end: true });
    expect(mockFfmpegCommand.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(mockFfmpegCommand.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockFfmpegCommand.on).toHaveBeenCalledWith('end', expect.any(Function));
  });

  it('should emit "start" event when ffmpeg starts', () => {
    const startListener = jest.fn();
    streamer.on('start', startListener);
    streamer.stream(mockTrack, outputStream);

    const onCall = mockFfmpegCommand.on.mock.calls.find((call: any[]) => call[0] === 'start');
    const onStartCallback = onCall?.[1] as ((cmdLine: string) => void) | undefined;
    if (onStartCallback) {
      onStartCallback('ffmpeg command line');
    }

    expect(startListener).toHaveBeenCalledWith('ffmpeg command line');
  });

  it('should emit "error" event and stop command if ffmpeg emits error', () => {
    const errorListener = jest.fn();
    streamer.on('error', errorListener);
    streamer.stream(mockTrack, outputStream);

    const testError = new Error('ffmpeg failed');
    const onCall = mockFfmpegCommand.on.mock.calls.find((call: any[]) => call[0] === 'error');
    const onErrorCallback = onCall?.[1] as ((err: Error, stdout: string, stderr: string) => void) | undefined;
    if (onErrorCallback) {
      onErrorCallback(testError, '', '');
    }

    expect(errorListener).toHaveBeenCalledWith(testError);
    expect(mockFfmpegCommand.kill).toHaveBeenCalledWith('SIGKILL');
  });

  it('should emit "error" if track is invalid', () => {
    const errorListener = jest.fn();
    streamer.on('error', errorListener);

    streamer.stream(null, outputStream);
    expect(errorListener).toHaveBeenCalledWith(new Error('Invalid track provided for streaming.'));

    const invalidTrack = { getFilePath: () => null, getTitle: () => 'Test', getArtist: () => 'Test' };
    streamer.stream(invalidTrack as any, outputStream);
    expect(errorListener).toHaveBeenCalledWith(new Error('Invalid track provided for streaming.'));
  });

  it('should emit "end" event when ffmpeg ends', () => {
    const endListener = jest.fn();
    streamer.on('end', endListener);
    streamer.stream(mockTrack, outputStream);

    const onCall = mockFfmpegCommand.on.mock.calls.find((call: any[]) => call[0] === 'end');
    const onEndCallback = onCall?.[1] as (() => void) | undefined;
    if (onEndCallback) {
      onEndCallback();
    }

    expect(endListener).toHaveBeenCalled();
  });

  it('should stop the ffmpeg command and emit "stop" event', () => {
    const stopListener = jest.fn();
    streamer.on('stop', stopListener);

    streamer.stream(mockTrack, outputStream);
    streamer.stop();

    expect(mockFfmpegCommand.kill).toHaveBeenCalledWith('SIGKILL');
    expect(streamer.command).toBeNull();
    expect(stopListener).toHaveBeenCalled();
  });

  it('stop should do nothing if no command is active', () => {
    const stopListener = jest.fn();
    streamer.on('stop', stopListener);
    streamer.stop();
    expect(mockFfmpegCommand.kill).not.toHaveBeenCalled();
    expect(stopListener).not.toHaveBeenCalled();
  });
});

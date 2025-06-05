// examples/ts-bot-radio/src/__tests__/Track.spec.ts
import { Track } from '../../models/Track.js'; // Ensured .js
import * as path from 'path';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import * as os from 'os';

describe('Track', () => {
  let tempDir: string;
  let tempFile: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'track-test-'));
    tempFile = path.join(tempDir, 'test_song.mp3');
    await writeFile(tempFile, 'dummy audio content');
  });

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('should create a Track instance with filePath', () => {
    const track = new Track(tempFile);
    expect(track).toBeInstanceOf(Track);
    expect(track.getFilePath()).toBe(tempFile);
    expect(track.getTitle()).toBe('test_song');
    expect(track.getArtist()).toBe('Unknown Artist');
  });

  it('should create a Track instance with filePath, title, and artist', () => {
    const track = new Track(tempFile, 'Custom Title', 'Custom Artist');
    expect(track.getFilePath()).toBe(tempFile);
    expect(track.getTitle()).toBe('Custom Title');
    expect(track.getArtist()).toBe('Custom Artist');
  });

  it('should throw an error if filePath is not provided', () => {
    expect(() => new Track(undefined as any)).toThrow('File path is required for a Track.');
  });

  describe('Track.fromPath', () => {
    it('should create a Track from a valid file path', async () => {
      const track = await Track.fromPath(tempFile);
      expect(track).toBeInstanceOf(Track);
      if (track) {
        expect(track.getFilePath()).toBe(tempFile);
        expect(track.getTitle()).toBe('test_song');
      } else {
        throw new Error('Track.fromPath returned null for a valid file.');
      }
    });

    it('should return null if path is not a file (e.g., a directory)', async () => {
      const track = await Track.fromPath(tempDir);
      expect(track).toBeNull();
    });

    it('should return null for non-existent file', async () => {
      const nonExistentFile = path.join(tempDir, 'non_existent.mp3');
      const track = await Track.fromPath(nonExistentFile);
      expect(track).toBeNull();
    });
  });
});

// examples/ts-bot-radio/src/__tests__/FileSystemAudioSource.spec.ts
import { jest } from '@jest/globals';
import type { Stats } from 'fs';

const fsPromisesMocks = {
  readdir: jest.fn() as jest.Mock,
  stat: jest.fn() as jest.Mock,
};

jest.unstable_mockModule('fs/promises', () => ({
  readdir: fsPromisesMocks.readdir,
  stat: fsPromisesMocks.stat,
}));

let FileSystemAudioSource: any;
let Track: any;

describe('FileSystemAudioSource', () => {
  let audioSource: any;
  const mockDirectoryPath = '/test/audio/dir';

  beforeAll(async () => {
    const sourceModule = await import('../../services/FileSystemAudioSource.js'); // Ensured .js
    FileSystemAudioSource = sourceModule.FileSystemAudioSource;
    const trackModule = await import('../../models/Track.js'); // Ensured .js
    Track = trackModule.Track;
  });

  beforeEach(() => {
    fsPromisesMocks.readdir.mockReset();
    fsPromisesMocks.stat.mockReset();
    if (!FileSystemAudioSource) {
      throw new Error("FileSystemAudioSource class not loaded before tests.");
    }
    audioSource = new FileSystemAudioSource(mockDirectoryPath);
  });

  it('should throw an error if directoryPath is not provided', () => {
    expect(() => new FileSystemAudioSource(undefined as any)).toThrow('Directory path is required for FileSystemAudioSource.');
  });

  it('should return an empty array if readdir fails', async () => {
    fsPromisesMocks.readdir.mockRejectedValue(new Error('Failed to read directory'));
    const tracks = await audioSource.getTracks();
    expect(tracks).toEqual([]);
    expect(fsPromisesMocks.readdir).toHaveBeenCalledWith(mockDirectoryPath);
  });

  it('should return an empty array if directory contains no audio files', async () => {
    fsPromisesMocks.readdir.mockResolvedValue(['notes.txt', 'image.jpg']);
    const tracks = await audioSource.getTracks();
    expect(tracks).toEqual([]);
  });

  it('should correctly identify audio files and create Track objects', async () => {
    const mockFiles = ['song1.mp3', 'song2.ogg', 'document.txt', 'song3.flac'];
    fsPromisesMocks.readdir.mockResolvedValue(mockFiles);

    fsPromisesMocks.stat.mockImplementation(async (filePath: string): Promise<Partial<Stats>> => {
        if (filePath.endsWith('.mp3') || filePath.endsWith('.ogg') || filePath.endsWith('.flac')) {
            return { isFile: () => true } as Stats;
        }
        return { isFile: () => false } as Stats;
    });

    const tracks = await audioSource.getTracks();

    expect(tracks.length).toBe(3);
    expect(tracks[0]).toBeInstanceOf(Track);
    expect(tracks[0].getTitle()).toBe('song1');
    expect(tracks[1].getTitle()).toBe('song2');
    expect(tracks[2].getTitle()).toBe('song3');

    expect(fsPromisesMocks.readdir).toHaveBeenCalledWith(mockDirectoryPath);
    expect(fsPromisesMocks.stat).toHaveBeenCalledWith(expect.stringContaining('song1.mp3'));
    expect(fsPromisesMocks.stat).toHaveBeenCalledWith(expect.stringContaining('song2.ogg'));
    expect(fsPromisesMocks.stat).toHaveBeenCalledWith(expect.stringContaining('song3.flac'));
  });

  it('should filter out tracks for which Track.fromPath returns null (e.g., stat fails or not a file)', async () => {
    const mockFiles = ['valid_song.mp3', 'broken_link.mp3', 'directory_as_file.mp3'];
    fsPromisesMocks.readdir.mockResolvedValue(mockFiles);

    fsPromisesMocks.stat.mockImplementation(async (filePath: string): Promise<Partial<Stats>> => {
      if (filePath.includes('valid_song.mp3')) {
        return { isFile: () => true } as Stats;
      } else if (filePath.includes('broken_link.mp3')) {
        throw new Error('stat failed for broken_link.mp3');
      } else if (filePath.includes('directory_as_file.mp3')) {
        return { isFile: () => false } as Stats;
      }
      return { isFile: () => false } as Stats;
    });

    const tracks = await audioSource.getTracks();
    expect(tracks.length).toBe(1);
    expect(tracks[0].getTitle()).toBe('valid_song');
  });
});

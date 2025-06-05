// examples/ts-bot-radio/src/__tests__/BasicQueueManager.spec.ts
import { BasicQueueManager } from '../../services/BasicQueueManager.js'; // Ensured .js
import { IAudioTrack } from '../../interfaces/AudioTrack.js'; // Ensured .js

class MockTrack implements IAudioTrack {
    filePath: string;
    title: string;
    artist: string;

    constructor(filePath: string, title: string = 'Mock Title', artist: string = 'Mock Artist') {
        this.filePath = filePath;
        this.title = title;
        this.artist = artist;
    }
    getFilePath(): string { return this.filePath; }
    getTitle(): string { return this.title; }
    getArtist(): string { return this.artist; }
}

describe('BasicQueueManager', () => {
  let queueManager: BasicQueueManager;
  let track1: IAudioTrack;
  let track2: IAudioTrack;

  beforeEach(() => {
    queueManager = new BasicQueueManager();
    track1 = new MockTrack('path/to/song1.mp3', 'Song 1');
    track2 = new MockTrack('path/to/song2.mp3', 'Song 2');
  });

  it('should initialize with an empty queue', () => {
    expect(queueManager.isEmpty()).toBe(true);
    expect(queueManager.getQueue()).toEqual([]);
    expect(queueManager.getCurrentTrack()).toBeNull();
  });

  it('should add a single track to the queue', () => {
    queueManager.addTrack(track1);
    expect(queueManager.isEmpty()).toBe(false);
    expect(queueManager.getQueue()).toEqual([track1]);
  });

  it('should add multiple tracks to the queue', () => {
    queueManager.addTracks([track1, track2]);
    expect(queueManager.isEmpty()).toBe(false);
    expect(queueManager.getQueue()).toEqual([track1, track2]);
  });

  it('should not add invalid track (null or object not implementing IAudioTrack)', () => {
    queueManager.addTrack(null as any);
    queueManager.addTrack({} as any);
    expect(queueManager.isEmpty()).toBe(true);
  });

  it('should not add invalid tracks in addTracks', () => {
    queueManager.addTracks([track1, null as any, track2, {} as any]);
    expect(queueManager.getQueue()).toEqual([track1, track2]);
  });


  it('should get the next track and cycle through the queue', () => {
    queueManager.addTracks([track1, track2]);
    expect(queueManager.getNextTrack()).toBe(track1);
    expect(queueManager.getCurrentTrack()).toBe(track1);
    expect(queueManager.getNextTrack()).toBe(track2);
    expect(queueManager.getCurrentTrack()).toBe(track2);
    expect(queueManager.getNextTrack()).toBe(track1);
    expect(queueManager.getCurrentTrack()).toBe(track1);
  });

  it('getCurrentTrack should return null if queue is empty', () => {
    expect(queueManager.getCurrentTrack()).toBeNull();
  });

  it('getNextTrack should return null if queue is empty', () => {
    expect(queueManager.getNextTrack()).toBeNull();
  });

  it('getCurrentTrack should return the current track after getNextTrack', () => {
    queueManager.addTrack(track1);
    queueManager.getNextTrack();
    expect(queueManager.getCurrentTrack()).toBe(track1);
  });

  it('getQueue should return a copy of the queue', () => {
    queueManager.addTrack(track1);
    const q = queueManager.getQueue();
    q.push(track2);
    expect(queueManager.getQueue()).toEqual([track1]);
  });
});

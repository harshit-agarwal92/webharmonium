export interface Track {
  id?: string;
  name: string;
  artist: string;
  url?: string;
  source?: string;
  spotifyUri?: string;
}

export interface PlaybackProvider {
  name: string;
  initialize(audioElement: HTMLAudioElement): void;
  play(
    track: Track,
    onStateChange: (playing: boolean) => void,
    onEnded: () => void
  ): Promise<boolean>;
  stop(): void;
  setVolume(volume: number): void;
  seek(time: number): void;
  cleanup(): void;
}

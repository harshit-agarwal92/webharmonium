import { PlaybackProvider, Track } from './types';

export class PlaybackEngine {
  private audioElement: HTMLAudioElement;
  private providers: PlaybackProvider[];
  private currentProvider: PlaybackProvider | null = null;
  private activeTrack: Track | null = null;

  constructor(audioElement: HTMLAudioElement, providers: PlaybackProvider[]) {
    this.audioElement = audioElement;
    this.providers = providers;

    for (const provider of this.providers) {
      provider.initialize(this.audioElement);
    }
  }

  async play(
    track: Track,
    onStateChange?: (playing: boolean) => void,
    onEnded?: () => void
  ): Promise<boolean> {
    this.stop(); // Stops current provider and clears handlers
    this.activeTrack = track;

    console.log(`[PlaybackEngine] Initiating playback for: "${track.name}" by "${track.artist}"`);

    // Reset standard event handlers on the shared audio element
    this.audioElement.onplay = null;
    this.audioElement.onpause = null;
    this.audioElement.onended = null;

    // Try providers in sequence: Saavn -> Deezer -> YouTube
    for (const provider of this.providers) {
      try {
        console.log(`[PlaybackEngine] Trying provider: "${provider.name}"`);

        // Wrap state handlers to ensure callbacks only apply to the current active provider
        const wrappedStateChange = (playing: boolean) => {
          if (this.currentProvider === provider) {
            onStateChange?.(playing);
          }
        };

        const wrappedEnded = () => {
          if (this.currentProvider === provider) {
            console.log(`[PlaybackEngine] Track ended under provider: "${provider.name}"`);
            onStateChange?.(false);
            onEnded?.();
          }
        };

        const success = await provider.play(track, wrappedStateChange, wrappedEnded);
        
        if (success) {
          this.currentProvider = provider;
          console.log(`[PlaybackEngine] Success: Playback started successfully using provider: "${provider.name}"`);
          return true;
        } else {
          console.warn(`[PlaybackEngine] Failed: Provider "${provider.name}" returned false (could not play track).`);
        }
      } catch (err: any) {
        console.error(`[PlaybackEngine] Failed: Provider "${provider.name}" threw an exception:`, err.message || err);
      }
    }

    console.error(`[PlaybackEngine] Critical: All playback providers exhausted. Playback failed for "${track.name}"`);
    this.activeTrack = null;
    onStateChange?.(false);
    return false;
  }

  stop() {
    if (this.currentProvider) {
      console.log(`[PlaybackEngine] Stopping active provider: "${this.currentProvider.name}"`);
      this.currentProvider.stop();
    } else {
      this.audioElement.pause();
    }
    
    // Clear callbacks
    this.audioElement.onplay = null;
    this.audioElement.onpause = null;
    this.audioElement.onended = null;

    this.currentProvider = null;
    this.activeTrack = null;
  }

  setVolume(volume: number) {
    if (this.currentProvider) {
      this.currentProvider.setVolume(volume);
    } else {
      this.audioElement.volume = volume;
    }
  }

  seek(time: number) {
    if (this.currentProvider) {
      this.currentProvider.seek(time);
    } else {
      this.audioElement.currentTime = time;
    }
  }

  getAudioElement(): HTMLAudioElement {
    return this.audioElement;
  }

  getCurrentTrack(): Track | null {
    return this.activeTrack;
  }

  getCurrentProviderName(): string | null {
    return this.currentProvider ? this.currentProvider.name : null;
  }

  getCurrentProvider(): PlaybackProvider | null {
    return this.currentProvider;
  }

  cleanup() {
    this.stop();
    for (const provider of this.providers) {
      provider.cleanup();
    }
  }
}

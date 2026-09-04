import { PlaybackProvider, Track } from '../types';

export class DeezerPlaybackProvider implements PlaybackProvider {
  name = 'deezer';
  private audioElement: HTMLAudioElement | null = null;
  private onStateChangeCallback: ((playing: boolean) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  initialize(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
  }

  async play(
    track: Track,
    onStateChange: (playing: boolean) => void,
    onEnded: () => void
  ): Promise<boolean> {
    if (!this.audioElement) {
      console.warn('[DeezerPlaybackProvider] Audio element not initialized.');
      return false;
    }

    this.onStateChangeCallback = onStateChange;
    this.onEndedCallback = onEnded;

    let url = track.url;
    if (!url || !url.startsWith('http') || (!url.includes('deezer') && !url.includes('dzcdn'))) {
      url = (await this.resolveFreshUrl(track)) || undefined;
    }

    if (!url) {
      return false;
    }

    return this.attemptPlayback(url);
  }

  private async resolveFreshUrl(track: Track): Promise<string | null> {
    try {
      const queryTitle = encodeURIComponent(track.name || '');
      const queryArtist = encodeURIComponent(track.artist || '');
      const response = await fetch(`/api/stream/deezer?title=${queryTitle}&artist=${queryArtist}`).catch(() => null);
      if (!response || !response.ok) return null;
      const data = await response.json().catch(() => null);
      return data?.url || null;
    } catch (e) {
      return null;
    }
  }

  private async attemptPlayback(url: string): Promise<boolean> {
    if (!this.audioElement) return false;

    const isExternal = url.startsWith('http');
    const playerUrl = isExternal ? `/api/proxy-audio?url=${encodeURIComponent(url)}` : url;
    const audio = this.audioElement;

    return new Promise<boolean>((resolve) => {
      let isSettled = false;

      audio.onplay = () => this.onStateChangeCallback?.(true);
      audio.onpause = () => this.onStateChangeCallback?.(false);
      audio.onended = () => {
        this.onStateChangeCallback?.(false);
        this.onEndedCallback?.();
      };
      audio.onerror = () => {
        if (!isSettled) {
          isSettled = true;
          this.onStateChangeCallback?.(false);
          resolve(false);
        }
      };

      try {
        audio.src = playerUrl;
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!isSettled) {
                isSettled = true;
                this.onStateChangeCallback?.(true);
                resolve(true);
              }
            })
            .catch((err) => {
              if (err.name === 'AbortError') {
                resolve(true);
              } else {
                if (!isSettled) {
                  isSettled = true;
                  resolve(false);
                }
              }
            });
        } else {
          resolve(true);
        }
      } catch (err) {
        resolve(false);
      }
    });
  }

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.onplay = null;
      this.audioElement.onpause = null;
      this.audioElement.onended = null;
      this.audioElement.onerror = null;
    }
  }

  setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = volume;
    }
  }

  seek(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  cleanup() {
    this.stop();
    this.audioElement = null;
    this.onStateChangeCallback = null;
    this.onEndedCallback = null;
  }
}

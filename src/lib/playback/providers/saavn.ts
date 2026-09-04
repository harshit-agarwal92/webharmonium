import { PlaybackProvider, Track } from '../types';

export class SaavnPlaybackProvider implements PlaybackProvider {
  name = 'saavn';
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
      console.warn('[SaavnPlaybackProvider] Audio element not initialized.');
      return false;
    }

    this.onStateChangeCallback = onStateChange;
    this.onEndedCallback = onEnded;

    console.log(`[SaavnPlaybackProvider] Playing track: "${track.name}" by "${track.artist}" (ID: ${track.id})`);

    // 1. If track has direct working URL, try it immediately
    if (track.url && typeof track.url === 'string' && track.url.startsWith('http')) {
      console.log('[SaavnPlaybackProvider] Attempting direct URL playback...');
      const success = await this.attemptPlayback(track.url);
      if (success) return true;
      console.warn('[SaavnPlaybackProvider] Direct URL playback failed. Resolving fresh URL from JioSaavn...');
    }

    // 2. Resolve fresh URL from JioSaavn streaming resolver API
    const freshUrl = await this.resolveFreshUrl(track);
    if (freshUrl) {
      console.log('[SaavnPlaybackProvider] Fresh URL resolved:', freshUrl);
      const success = await this.attemptPlayback(freshUrl);
      if (success) return true;
    }

    console.warn(`[SaavnPlaybackProvider] Failed to play track: "${track.name}"`);
    return false;
  }

  private async resolveFreshUrl(track: Track): Promise<string | null> {
    try {
      const queryTitle = encodeURIComponent(track.name || '');
      const queryArtist = encodeURIComponent(track.artist || '');
      const queryId = encodeURIComponent(track.id || '');
      
      const response = await fetch(`/api/stream/saavn?title=${queryTitle}&artist=${queryArtist}&id=${queryId}`).catch((err) => {
        console.warn('[SaavnPlaybackProvider] Fetch error during stream resolution:', err);
        return null;
      });

      if (!response || !response.ok) {
        console.warn(`[SaavnPlaybackProvider] Stream resolver endpoint returned status ${response?.status}`);
        return null;
      }

      const data = await response.json().catch(() => null);
      return data?.url || null;
    } catch (e) {
      console.warn('[SaavnPlaybackProvider] Error resolving URL from API:', e);
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

      // Clean previous handlers
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;
      audio.onerror = null;

      const handlePlaying = () => {
        if (!isSettled) {
          isSettled = true;
          this.onStateChangeCallback?.(true);
          resolve(true);
        }
      };

      const handleFailed = (err?: any) => {
        if (!isSettled) {
          isSettled = true;
          this.onStateChangeCallback?.(false);
          resolve(false);
        }
      };

      // Set up persistent lifecycle handlers
      audio.onplay = () => {
        this.onStateChangeCallback?.(true);
      };
      audio.onpause = () => {
        this.onStateChangeCallback?.(false);
      };
      audio.onended = () => {
        console.log('[SaavnPlaybackProvider] Track ended -> Triggering onEnded autoplay');
        this.onStateChangeCallback?.(false);
        this.onEndedCallback?.();
      };
      audio.onerror = (e) => {
        console.warn('[SaavnPlaybackProvider] HTMLAudioElement error on source:', playerUrl, e);
        handleFailed(e);
      };

      try {
        audio.src = playerUrl;
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              handlePlaying();
            })
            .catch((err) => {
              if (err.name === 'AbortError') {
                console.log('[SaavnPlaybackProvider] Play aborted by user gesture or new selection.');
                handlePlaying();
              } else {
                console.warn('[SaavnPlaybackProvider] Audio play() promise rejected:', err.message);
                handleFailed(err);
              }
            });
        } else {
          handlePlaying();
        }
      } catch (err) {
        console.error('[SaavnPlaybackProvider] Playback initiation exception:', err);
        handleFailed(err);
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

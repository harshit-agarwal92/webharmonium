import { PlaybackProvider, Track } from '../types';

export class YouTubePlaybackProvider implements PlaybackProvider {
  name = 'youtube';
  private player: any = null;
  private containerId = 'youtube-provider-player-container';
  private onStateChangeCallback: ((playing: boolean) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private volume = 0.8;

  initialize(audioElement: HTMLAudioElement) {
    // YouTube player is separate from the HTMLAudioElement
  }

  async play(
    track: Track,
    onStateChange: (playing: boolean) => void,
    onEnded: () => void
  ): Promise<boolean> {
    this.onStateChangeCallback = onStateChange;
    this.onEndedCallback = onEnded;

    console.log(`[YouTubePlaybackProvider] Querying YouTube search resolver for: "${track.name}" by "${track.artist}"`);
    const videoId = await this.resolveVideoId(track);
    if (!videoId) {
      console.warn(`[YouTubePlaybackProvider] Failed: Could not resolve video ID for "${track.name}"`);
      return false;
    }

    console.log(`[YouTubePlaybackProvider] Resolved video ID: ${videoId}. Initializing player...`);

    return new Promise<boolean>(async (resolve) => {
      try {
        await this.ensureYTAPIReady();
        this.createOrUpdatePlayer(videoId, resolve);
      } catch (err) {
        console.error('[YouTubePlaybackProvider] Failed: Playback initialization failed:', err);
        resolve(false);
      }
    });
  }

  private async resolveVideoId(track: Track): Promise<string | null> {
    try {
      const queryTitle = encodeURIComponent(track.name || '');
      const queryArtist = encodeURIComponent(track.artist || '');
      const response = await fetch(`/api/stream/youtube?title=${queryTitle}&artist=${queryArtist}`).catch((err) => {
        console.warn('[YouTubePlaybackProvider] Fetch error resolving YouTube video ID:', err);
        return null;
      });
      if (!response || !response.ok) {
        return null;
      }
      const data = await response.json().catch(() => null);
      return data?.videoId || null;
    } catch (e) {
      console.warn('[YouTubePlaybackProvider] Error resolving YouTube ID:', e);
      return null;
    }
  }

  private ensureYTAPIReady(): Promise<void> {
    return new Promise((resolve) => {
      // @ts-ignore
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      if (!document.getElementById('youtube-iframe-api-script')) {
        console.log('[YouTubePlaybackProvider] Loading YouTube IFrame API script...');
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const checkInterval = setInterval(() => {
        // @ts-ignore
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          console.log('[YouTubePlaybackProvider] YouTube IFrame API ready.');
          resolve();
        }
      }, 100);
    });
  }

  private createOrUpdatePlayer(videoId: string, resolve: (success: boolean) => void) {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.style.position = 'fixed';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-9999';
      container.style.top = '0';
      container.style.left = '0';
      document.body.appendChild(container);
    }

    const playerDiv = document.createElement('div');
    playerDiv.id = `${this.containerId}-inner`;
    container.innerHTML = '';
    container.appendChild(playerDiv);

    console.log('[YouTubePlaybackProvider] Instantiating new YT.Player...');

    // @ts-ignore
    this.player = new window.YT.Player(playerDiv.id, {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1
      },
      events: {
        onReady: (event: any) => {
          console.log('[YouTubePlaybackProvider] Player Ready event fired.');
          event.target.setVolume(this.volume * 100);
          event.target.playVideo();
          resolve(true);
        },
        onStateChange: (event: any) => {
          // @ts-ignore
          // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
          if (event.data === 1) {
            console.log('[YouTubePlaybackProvider] Player State: PLAYING');
            this.onStateChangeCallback?.(true);
          } else if (event.data === 2) {
            console.log('[YouTubePlaybackProvider] Player State: PAUSED');
            this.onStateChangeCallback?.(false);
          } else if (event.data === 0) {
            console.log('[YouTubePlaybackProvider] Player State: ENDED');
            this.onStateChangeCallback?.(false);
            this.onEndedCallback?.();
          }
        },
        onError: (event: any) => {
          console.error('[YouTubePlaybackProvider] Player Error event fired. Code:', event.data);
          resolve(false);
        }
      }
    });
  }

  stop() {
    console.log('[YouTubePlaybackProvider] Stopping playback...');
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.error('[YouTubePlaybackProvider] Error pausing video:', e);
      }
    }
    this.onStateChangeCallback?.(false);
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.player && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(volume * 100);
      } catch (e) {}
    }
  }

  seek(time: number) {
    if (this.player && typeof this.player.seekTo === 'function') {
      try {
        console.log(`[YouTubePlaybackProvider] Seeking to: ${time}s`);
        this.player.seekTo(time, true);
      } catch (e) {}
    }
  }

  getCurrentTime(): number {
    if (this.player && typeof this.player.getCurrentTime === 'function') {
      try {
        return this.player.getCurrentTime();
      } catch (e) {}
    }
    return 0;
  }

  getDuration(): number {
    if (this.player && typeof this.player.getDuration === 'function') {
      try {
        return this.player.getDuration() || 0.1;
      } catch (e) {}
    }
    return 0.1;
  }

  cleanup() {
    console.log('[YouTubePlaybackProvider] Cleaning up...');
    this.stop();
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch (e) {}
    }
    this.player = null;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.remove();
    }
    this.onStateChangeCallback = null;
    this.onEndedCallback = null;
  }
}

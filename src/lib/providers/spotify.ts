import { SearchProvider, SongResult } from './types';
import fs from 'fs';
import path from 'path';

export const SPOTIFY_PLAYLIST_ID = '0Mm8BTdceIk3XJ1XlRisws';

export class SpotifyProvider implements SearchProvider {
  name = 'spotify';

  async search(query: string, isTrending: boolean = false): Promise<SongResult[]> {
    try {
      const playlistPath = path.join(process.cwd(), 'public', 'spotify_playlist.json');
      if (!fs.existsSync(playlistPath)) {
        return [];
      }

      const playlistSongs = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
      
      if (isTrending || !query) {
        // For trending or empty queries, just return the entire or a portion of the playlist
        return playlistSongs as SongResult[];
      }

      // Filter local songs
      const rawQuery = query.toLowerCase();
      const filtered = playlistSongs.filter((s: any) =>
        s.name.toLowerCase().includes(rawQuery) ||
        s.artist.toLowerCase().includes(rawQuery)
      );

      return filtered as SongResult[];
    } catch (e) {
      console.error("Failed to load spotify playlist songs in API:", e);
      return [];
    }
  }
}

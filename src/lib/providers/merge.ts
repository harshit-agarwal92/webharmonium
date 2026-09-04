import { SongResult } from './types';

function normalizeString(str: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getMatchKey(song: SongResult): string {
  const cleanName = normalizeString(song.name);
  const primaryArtist = song.artist ? song.artist.split(',')[0].split('&')[0] : '';
  const cleanArtist = normalizeString(primaryArtist);
  return `${cleanName}|${cleanArtist}`;
}

const SOURCE_PRIORITY: Record<string, number> = {
  saavn: 1,
  deezer: 2,
  spotify: 3,
};

function getPriority(source: string): number {
  return SOURCE_PRIORITY[source?.toLowerCase()] || 99;
}

export function mergeResults(resultsSets: SongResult[][]): SongResult[] {
  const combined = resultsSets.flat().filter(Boolean);
  
  const uniqueMap = new Map<string, SongResult>();

  for (const song of combined) {
    // If the song doesn't have a name, fallback to using its ID as the key
    const key = song.name ? getMatchKey(song) : String(song.id);
    const existing = uniqueMap.get(key);

    if (existing) {
      if (getPriority(song.source) < getPriority(existing.source)) {
        uniqueMap.set(key, song);
      }
    } else {
      uniqueMap.set(key, song);
    }
  }

  return Array.from(uniqueMap.values());
}

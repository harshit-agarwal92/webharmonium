import { SearchProvider, SongResult } from './types';

export async function searchDeezer(query: string) {
  if (!query) return [];
  try {
    const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl);

    if (!res.ok) {
      return [];
    }

    const searchData = await res.json();
    const songsList = searchData?.data || [];

    return songsList.map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      artist: item.artist?.name || 'Deezer Artist',
      album: item.album?.title || 'Single',
      image: item.album?.cover_xl || item.album?.cover_medium || item.album?.cover || 'https://e-cdns-images.dzcdn.net/images/cover//500x500.jpg',
      preview: item.preview,
      source: 'deezer'
    })).filter(Boolean);
  } catch (e) {
    console.error("Deezer API retrieval failed:", e);
    return [];
  }
}

export class DeezerProvider implements SearchProvider {
  name = 'deezer';

  async search(query: string, isTrending: boolean = false): Promise<SongResult[]> {
    const results = await searchDeezer(query);
    return results.map((item: any) => ({
      id: item.id,
      name: item.title,
      artist: item.artist,
      album: item.album,
      image: item.image,
      url: item.preview,
      source: item.source
    }));
  }
}

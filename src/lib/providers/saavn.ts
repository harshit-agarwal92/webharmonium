import { SearchProvider, SongResult } from './types';


export async function searchSaavn(query: string, limit: number = 50, page: number = 1): Promise<SongResult[]> {
  try {
    const searchUrl = `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.warn(`[Saavn API] Request failed with status: ${res.status}`);
      return [];
    }

    const searchData = await res.json();
    console.log('[Saavn API Raw Response]:', searchData);

    const songsList = searchData?.data?.results || searchData?.data || (Array.isArray(searchData) ? searchData : []);
    const totalCount = searchData?.data?.total || searchData?.total || songsList.length;

    const mappedSongs = songsList.map((item: any, index: number) => {
      // Pick highest quality download URL (usually 320kbps or 160kbps, checking both link and url properties)
      const downloadArr = item.downloadUrl || item.media_url || item.download_url;
      let bestAudioUrl = '';

      if (Array.isArray(downloadArr) && downloadArr.length > 0) {
        const bestAudioObj = downloadArr.find((u: any) => u.quality === '320kbps') 
          || downloadArr.find((u: any) => u.quality === '160kbps')
          || downloadArr[downloadArr.length - 1] 
          || downloadArr[0];
        bestAudioUrl = bestAudioObj?.link || bestAudioObj?.url || (typeof bestAudioObj === 'string' ? bestAudioObj : '');
      } else if (typeof downloadArr === 'string') {
        bestAudioUrl = downloadArr;
      } else if (item.url && (item.url.includes('saavncdn.com') || item.url.endsWith('.mp3') || item.url.endsWith('.m4a'))) {
        bestAudioUrl = item.url;
      }

      // Extract image URL safely (supporting quality 500x500, link/url properties)
      const imageArr = item.image;
      let bestImageUrl = 'https://www.jiosaavn.com/_i/3.0/artist-default-music.png';
      if (Array.isArray(imageArr) && imageArr.length > 0) {
        const bestImgObj = imageArr.find((i: any) => i.quality === '500x500') 
          || imageArr.find((i: any) => i.quality === '150x150')
          || imageArr[imageArr.length - 1] 
          || imageArr[0];
        bestImageUrl = bestImgObj?.link || bestImgObj?.url || (typeof bestImgObj === 'string' ? bestImgObj : bestImageUrl);
      } else if (typeof imageArr === 'string') {
        bestImageUrl = imageArr;
      }

      // Extract artist name dynamically
      let artistsName = 'JioSaavn Artist';
      if (item.artists && item.artists.primary && Array.isArray(item.artists.primary) && item.artists.primary.length > 0) {
        artistsName = item.artists.primary.map((a: any) => a.name).join(', ');
      } else if (item.primaryArtists) {
        artistsName = typeof item.primaryArtists === 'string' ? item.primaryArtists : (Array.isArray(item.primaryArtists) ? item.primaryArtists.map((a: any) => a.name || a).join(', ') : 'JioSaavn Artist');
      } else if (item.singers) {
        artistsName = typeof item.singers === 'string' ? item.singers : (Array.isArray(item.singers) ? item.singers.map((s: any) => s.name || s).join(', ') : 'JioSaavn Artist');
      } else if (item.artist) {
        artistsName = typeof item.artist === 'string' ? item.artist : item.artist?.name || 'JioSaavn Artist';
      }

      const songId = item.id || (bestAudioUrl ? `saavn-${bestAudioUrl.slice(-12)}` : `saavn-${index}-${Date.now()}`);

      const songObj: SongResult = {
        id: String(songId),
        name: item.name || item.title || item.song || 'Unknown Track',
        artist: artistsName,
        album: typeof item.album === 'object' ? (item.album?.name || 'Single') : (item.album || 'Single'),
        image: bestImageUrl,
        url: bestAudioUrl,
        source: 'saavn'
      };

      console.log('[Mapped Song Object]:', songObj);
      return songObj;
    }).filter((song: SongResult | null) => song !== null && Boolean(song.url)) as SongResult[];

    console.log(`[Saavn API] Total returned by API: ${totalCount}, Mapped songs count: ${mappedSongs.length}`);

    return mappedSongs;
  } catch (e) {
    console.error("Direct JioSaavn API retrieval failed:", e);
    return [];
  }
}

export class SaavnProvider implements SearchProvider {
  name = 'saavn';

  async search(query: string, isTrending: boolean = false, limit: number = 50, page: number = 1): Promise<SongResult[]> {
    return searchSaavn(query, limit, page);
  }
}


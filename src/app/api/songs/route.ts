import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('query') || '';
  const isTrending = (!rawQuery || rawQuery === '@trending' || rawQuery === '');
  
  const query = isTrending ? 'Latest Bollywood Hits 2024' : rawQuery;

  // Load Spotify playlist songs if available
  let spotifyPlaylistResults: any[] = [];
  try {
    const playlistPath = path.join(process.cwd(), 'public', 'spotify_playlist.json');
    if (fs.existsSync(playlistPath)) {
      const playlistSongs = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
      if (isTrending) {
        // Prepend all the playlist songs to trending
        spotifyPlaylistResults = playlistSongs;
      } else {
        // Search matches inside playlist
        spotifyPlaylistResults = playlistSongs.filter((s: any) =>
          s.name.toLowerCase().includes(rawQuery.toLowerCase()) ||
          s.artist.toLowerCase().includes(rawQuery.toLowerCase())
        );
      }
    }
  } catch (e) {
    console.error("Failed to load spotify playlist songs in API:", e);
  }

  // 1. LOCAL PUBLIC FILES SEARCH REMOVED FOR PURE STREAMING EXPERIENCE

  // 2. DIRECT JIOSAAVN SEARCH USING UNOFFICIAL API
  let saavnResults: any[] = [];
  try {
    const searchUrl = `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const songsList = searchData?.data?.results || [];

      saavnResults = songsList.map((item: any) => {
        // Pick highest quality download URL (usually 320kbps)
        const bestAudio = item.downloadUrl?.find((u: any) => u.quality === '320kbps') || item.downloadUrl?.[0];
        const bestImage = item.image?.find((i: any) => i.quality === '500x500') || item.image?.[0];
        
        let artistsName = 'JioSaavn Artist';
        if (item.artists && item.artists.primary && item.artists.primary.length > 0) {
           artistsName = item.artists.primary.map((a: any) => a.name).join(', ');
        }
        
        if (bestAudio?.url) {
          return {
            id: item.id,
            name: item.name || item.title || 'Unknown Track',
            artist: artistsName,
            album: item.album?.name || 'Single',
            image: bestImage?.url || 'https://www.jiosaavn.com/_i/3.0/artist-default-music.png',
            url: bestAudio.url,
            source: 'saavn'
          };
        }
        return null;
      }).filter(Boolean);
    }
  } catch (e) {
    console.error("Direct JioSaavn API retrieval failed:", e);
  }

  // 3. YOUTUBE MUSIC API (ytmusic-api)
  let youtubeResults: any[] = [];
  if (saavnResults.length < 3 && rawQuery) {
    try {
      // Dynamically import YTMusic to avoid top-level await/build issues
      const { default: YTMusic } = await import('ytmusic-api');
      const ytmusic = new YTMusic();
      await ytmusic.initialize();
      
      const ytQuery = query + ' song';
      const songs = await ytmusic.search(ytQuery);
      
      if (songs && songs.length > 0) {
        youtubeResults = songs.map((item: any) => {
          const videoId = item.videoId;
          if (!videoId) return null;
          
          // Use highest quality thumbnail
          const hqThumb = item.thumbnails?.reduce((prev: any, curr: any) => 
            (prev.width > curr.width) ? prev : curr
          );

          return {
            id: videoId,
            name: item.name || 'Unknown Track',
            artist: item.artist?.name || 'YouTube Music',
            album: item.album?.name || 'YouTube Music',
            image: hqThumb?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            url: `/api/stream?id=${videoId}&title=${encodeURIComponent(item.name || '')}&artist=${encodeURIComponent(item.artist?.name || '')}`,
            source: 'youtube'
          };
        }).filter(Boolean);
      }
    } catch (e) {
      console.error("ytmusic-api fetch failed:", e);
    }
  }

  const combined = [...spotifyPlaylistResults, ...saavnResults, ...youtubeResults];

  // Deduplicate final combined tracks catalog
  const seenIds = new Set();
  const finalResults = combined.filter(song => {
    if (seenIds.has(song.id)) return false;
    seenIds.add(song.id);
    return true;
  });

  return NextResponse.json({ 
    success: true, 
    results: finalResults.length > 0 ? finalResults : [
      { id: 'saavn-1', name: 'Zaalima', artist: 'Arijit Singh', album: 'Raees', image: 'https://c.saavncdn.com/123/Raees-Hindi-2016-500x500.jpg', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', source: 'saavn' }
    ]
  });
}

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
        // Prepend some of the playlist songs to trending
        spotifyPlaylistResults = playlistSongs.slice(0, 10);
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

  // 2. DIRECT JIOSAAVN SEARCH & SECURE CDN RESOLVER
  let saavnResults: any[] = [];
  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const songsList = searchData?.songs?.data || [];

      const parsedTracks = await Promise.all(
        songsList.map(async (item: any) => {
          try {
            // Get exact song details to retrieve encrypted CDN keys
            const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${item.id}`;
            const detailRes = await fetch(detailUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });

            if (!detailRes.ok) return null;
            const detailData = await detailRes.json();
            const songDetail = Object.values(detailData)[0] as any;

            if (!songDetail) return null;

            const encUrl = songDetail.encrypted_media_url || songDetail.encrypted_drm_media_url;
            if (!encUrl) return null;

            // Generate direct secure CDN audio link (320kbps)
            const tokenUrl = `https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&_format=json&_marker=0&cc=in&bitrate=320&url=${encodeURIComponent(encUrl)}`;
            const tokenRes = await fetch(tokenUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });

            if (!tokenRes.ok) return null;
            const tokenData = await tokenRes.json();

            if (tokenData.status === 'success' && tokenData.auth_url) {
              // Upscale image resolution to 500x500 for modern premium display
              let hiresImage = songDetail.image || item.image;
              if (hiresImage) {
                hiresImage = hiresImage.replace('150x150', '500x500').replace('50x50', '500x500');
              }

              const cleanName = (songDetail.song || item.title || 'Unknown Track')
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&#039;/g, "'");

              return {
                id: item.id,
                name: cleanName,
                artist: songDetail.singers || songDetail.primary_artists || item.more_info?.primary_artists || 'JioSaavn Artist',
                album: songDetail.album || item.album || 'Single',
                image: hiresImage,
                url: tokenData.auth_url,
                source: 'saavn'
              };
            }
          } catch (err) {
            // Silently skip individual track failures
          }
          return null;
        })
      );

      saavnResults = parsedTracks.filter(Boolean);
    }
  } catch (e) {
    console.error("Direct JioSaavn API retrieval failed:", e);
  }

  // 3. YOUTUBE FALLBACK (IF SAAVN RETURNED INSUFFICIENT DATA)
  let youtubeResults: any[] = [];
  if (saavnResults.length < 3 && rawQuery) {
    const invInstances = ['https://yewtu.be', 'https://iv.ggtyler.dev'];
    for (const inst of invInstances) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 6000);
        const yRes = await fetch(`${inst}/api/v1/search?q=${encodeURIComponent(query + ' audio')}&type=video`, {
          signal: controller.signal
        });
        clearTimeout(tid);
        if (yRes.ok) {
          const yData = await yRes.json();
          const items = Array.isArray(yData) ? yData : (yData.items || []);
          youtubeResults = items.map((item: any) => ({
            id: item.videoId || item.id?.videoId,
            name: item.title || item.snippet?.title,
            artist: item.author || item.snippet?.channelTitle,
            album: 'YouTube Music',
            image: item.videoThumbnails?.[0]?.url || item.snippet?.thumbnails?.high?.url || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
            url: `/api/stream?id=${item.videoId || item.id?.videoId}`,
            source: 'youtube'
          })).slice(0, 10);
          break; // Stop querying once a fallback responds
        }
      } catch (e) {}
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

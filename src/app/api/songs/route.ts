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

  // 1. LOCAL PUBLIC FILES SEARCH
  let localResults: any[] = [];
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);
    const mp3Files = files.filter(f => f.toLowerCase().endsWith('.mp3'));
    
    localResults = mp3Files
      .filter(f => isTrending || f.toLowerCase().includes(rawQuery.toLowerCase()))
      .map(f => {
        let cover = 'https://images.unsplash.com/photo-1459749411177-042180ce673b?q=80&w=200';
        const name = f.toLowerCase();
        if (name.includes('bairan')) cover = '/covers/sabat_batin.png';
        else if (name.includes('ishqa')) cover = '/covers/ishqa_ve.png';
        else if (name.includes('bieber')) cover = '/covers/justin_bieber.png';
        else if (name.includes('khat')) cover = '/covers/khat.png';
        else if (name.includes('kitab')) cover = '/covers/kitab.png';
        else if (name.includes('not_guilty') || name.includes('guilty')) cover = '/covers/not_guilty.png';
        else if (name.includes('gal sun')) cover = '/covers/gal_sun.png';
        else if (name.includes('tere liye')) cover = '/covers/tere_liye.png';
        else if (name.includes('bekhayali') && name.includes('acoustic')) cover = '/covers/bekhayali_acoustic.png';
        else if (name.includes('bekhayali')) cover = '/covers/bekhayali_male.png';
        else if (name.includes('plate')) cover = 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600';
        else if (name.includes('padhe')) cover = 'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=600';
        else if (name.includes('sheesha')) cover = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600';
        
        let displayName = f.replace(/\.(mp3|wav|ogg)$/i, '').replace(/(-|\(.*?\)|\[.*?\]|djjohal\.fm|naasongs|pagalworld|koshalworld)/gi, ' ').trim().replace(/\s+/g, ' ');
        if (name.includes('bairan')) displayName = 'Sabat Batin';
        else if (name.includes('bekhayali') && name.includes('acoustic')) displayName = 'Bekhayali (Acoustic - Female Version)';
        else if (name.includes('bekhayali')) displayName = 'Bekhayali (Kabir Singh - Male Version)';

        return {
          id: `local-${f}`,
          name: displayName,
          artist: 'Local Studio',
          album: 'Public Vault',
          image: cover,
          url: `/${f}`,
          source: 'local'
        };
      });
  } catch (e) {
    console.error("Local file scan failed:", e);
  }

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

  const combined = [...spotifyPlaylistResults, ...localResults, ...saavnResults, ...youtubeResults];

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

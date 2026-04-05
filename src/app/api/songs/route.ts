import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('query') || '';
  const isTrending = (!rawQuery || rawQuery === '@trending' || rawQuery === '');
  
  const query = isTrending ? 'Latest Bollywood Hits 2024' : rawQuery;

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

  // 2. JIOSAAVN SEARCH & TRENDING
  const saavnEndpoints = isTrending ? [
    `https://saavn.dev/api/search/songs?query=Trending&limit=20`,
    `https://saavn.sumit.co/api/search/songs?query=Latest&limit=20`,
    `https://saavn.dev/api/search/songs?query=Bollywood%20Hits&limit=20`
  ] : [
    `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`,
    `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`,
    `https://jio-saavn-api.vercel.app/api/search/songs?query=${encodeURIComponent(query)}`
  ];

  const fetchWithTimeout = async (url: string, timeout = 6000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(id);
      return await res.json();
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const parseSaavnResults = (json: any) => {
    const rawResults = json.data?.results || json.results || json.data || (Array.isArray(json) ? json : []);
    if (!rawResults || !Array.isArray(rawResults)) return [];
    
    return rawResults.map((s: any) => {
      const bestAudio = s.downloadUrl?.find((d: any) => d.quality === '320kbps') || 
                        s.downloadUrl?.reverse()[0] || 
                        s.url;
      const bestImage = s.image?.find((i: any) => i.quality === '500x500') || 
                        s.image?.reverse()[0]?.url || 
                        s.image;

      return {
        id: s.id,
        name: s.name || s.title,
        artist: s.primaryArtists || s.artist || 'JioSaavn Artist',
        album: s.album?.name || s.album || 'Single',
        image: typeof bestImage === 'string' ? bestImage : bestImage?.url,
        url: typeof bestAudio === 'string' ? bestAudio : bestAudio?.url,
        source: 'saavn'
      };
    });
  };

  let saavnResults: any[] = [];
  try {
    const allData = await Promise.allSettled(saavnEndpoints.map(url => fetchWithTimeout(url)));
    allData.forEach(res => {
        if (res.status === 'fulfilled') {
            const parsed = parseSaavnResults(res.value);
            saavnResults = [...saavnResults, ...parsed];
        }
    });
    // deduplicate by ID
    const seen = new Set();
    saavnResults = saavnResults.filter(s => {
        const isDuplicate = seen.has(s.id);
        seen.add(s.id);
        return !isDuplicate;
    }).slice(0, isTrending ? 30 : 15);
  } catch (e) {
    console.warn("[JioSaavn] Failed sources.");
  }

  // 3. YOUTUBE FALLBACK
  let youtubeResults: any[] = [];
  if (saavnResults.length < 5 && rawQuery) {
      const invInstances = ['https://yewtu.be', 'https://iv.ggtyler.dev'];
      try {
        const invData = await Promise.any(invInstances.map(inst => fetchWithTimeout(`${inst}/api/v1/search?q=${encodeURIComponent(query + ' audio')}&type=video`)));
        const items = Array.isArray(invData) ? invData : (invData.items || []);
        youtubeResults = items.map((item: any) => ({
          id: item.videoId || item.id?.videoId,
          name: item.title || item.snippet?.title,
          artist: item.author || item.snippet?.channelTitle,
          album: 'YouTube Music',
          image: item.videoThumbnails?.[0]?.url || item.snippet?.thumbnails?.high?.url || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
          url: `/api/stream?id=${item.videoId || item.id?.videoId}`,
          source: 'youtube'
        })).slice(0, 10);
      } catch (e) {}
  }

  const combined = [...localResults, ...saavnResults, ...youtubeResults];
  
  return NextResponse.json({ 
    success: true, 
    results: combined.length > 0 ? combined : [
        { id: 'saavn-1', name: 'Zaalima', artist: 'Arijit Singh', album: 'Raees', image: 'https://c.saavncdn.com/123/Raees-Hindi-2016-500x500.jpg', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', source: 'saavn' }
    ]
  });
}

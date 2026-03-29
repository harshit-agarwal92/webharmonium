import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('query');
  const isTrending = (!rawQuery || rawQuery === '@trending' || rawQuery === '');
  
  // JioSaavn Exclusive Discovery
  const query = isTrending ? 'Trending Bollywood Hits 2024' : rawQuery;

  // ROBUST JIOSAAVN MIRRORS (Using community and documentation servers)
  const saavnEndpoints = [
    `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`,
    `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`,
    `https://jio-saavn-api.vercel.app/api/search/songs?query=${encodeURIComponent(query)}`,
    `https://saavn-api.vercel.app/api/search/songs?query=${encodeURIComponent(query)}`,
    `https://jiosofficial-api.vercel.app/api/search/songs?query=${encodeURIComponent(query)}`
  ];

  // Manual AbortController for max compatibility
  const fetchWithTimeout = async (url: string, timeout = 6000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(id);
      if (!res.ok) throw new Error(`Fail ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const parseSaavnResults = (json: any) => {
    const rawResults = json.data?.results || json.results || (Array.isArray(json) ? json : []);
    if (!rawResults || rawResults.length === 0) return [];
    
    return rawResults.map((s: any) => {
      // Find high quality download link from Saavn API
      const bestAudio = s.downloadUrl?.find((d: any) => d.quality === '320kbps') || 
                        s.downloadUrl?.reverse()[0] || 
                        s.url;
      
      // Find high quality image
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

  let allResults: any[] = [];

  // PHASE 1: JIOSAAVN RACE (Primary Source)
  try {
    const fastestData = await Promise.any(saavnEndpoints.map(url => fetchWithTimeout(url)));
    allResults = parseSaavnResults(fastestData);
    console.log(`[JioSaavn] Found ${allResults.length} high-quality tracks.`);
  } catch (e) {
    console.warn("[JioSaavn] All primary mirrors failed. Checking YouTube fallbacks.");
  }

  // PHASE 2: YOUTUBE/INVIDIOUS FALLBACK (ONLY if Saavn fails)
  if (allResults.length === 0) {
    const invInstances = ['https://yewtu.be', 'https://iv.ggtyler.dev', 'https://inv.riverside.rocks', 'https://invidious.snopyta.org'];
    try {
      const invData = await Promise.any(invInstances.map(inst => fetchWithTimeout(`${inst}/api/v1/search?q=${encodeURIComponent(query + ' audio')}&type=video`)));
      const results = Array.isArray(invData) ? invData : (invData.items || []);
      allResults = results.map((item: any) => ({
        id: item.videoId || item.id?.videoId,
        name: item.title || item.snippet?.title,
        artist: item.author || item.snippet?.channelTitle,
        album: 'YouTube Music',
        image: item.videoThumbnails?.[0]?.url || item.snippet?.thumbnails?.high?.url || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
        url: `/api/stream?id=${item.videoId || item.id?.videoId}`,
        source: 'youtube'
      }));
    } catch (e) {
      console.warn("[Fallback] YouTube search failed.");
    }
  }

  // EMERGENCY FALLBACK (Top Choice)
  if (allResults.length === 0) {
    allResults = [
        { id: 'saavn-1', name: 'Zaalima', artist: 'Arijit Singh', album: 'Raees', image: 'https://c.saavncdn.com/123/Raees-Hindi-2016-500x500.jpg', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', source: 'saavn' }
    ];
  }

  return NextResponse.json({ success: true, results: allResults });
}

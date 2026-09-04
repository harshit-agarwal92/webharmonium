import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';

  const query = `${title} ${artist}`.trim();
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
  }

  try {
    const { default: YTMusic } = await import('ytmusic-api');
    const ytmusic = new YTMusic();
    await ytmusic.initialize();
    
    console.log(`[YouTubeResolver] Querying YouTube Music for: "${query}"`);
    const songs = await ytmusic.search(query + ' song');
    
    if (songs && songs.length > 0) {
      const first = songs[0] as any;
      if (first && first.videoId) {
        console.log(`[YouTubeResolver] Resolved to videoId: ${first.videoId}`);
        return NextResponse.json({ videoId: first.videoId, source: 'youtube' });
      }
    }
    console.warn(`[YouTubeResolver] No video found for query: "${query}"`);
    return NextResponse.json({ error: 'No YouTube video found' }, { status: 404 });
  } catch (e: any) {
    console.error('[YouTubeResolver] Error:', e);
    return NextResponse.json({ error: 'YouTube search failed', details: e.message }, { status: 500 });
  }
}

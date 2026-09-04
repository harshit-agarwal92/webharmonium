import { NextResponse } from 'next/server';
import { searchDeezer } from '@/lib/providers/deezer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';

  const query = `${title} ${artist}`.trim();
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
  }

  try {
    const results = await searchDeezer(query);
    if (results && results.length > 0) {
      const track = results[0];
      if (track.preview) {
        return NextResponse.json({ url: track.preview, source: 'deezer' });
      }
    }
    return NextResponse.json({ error: 'No Deezer stream URL found' }, { status: 404 });
  } catch (e: any) {
    console.error('[DeezerStreamResolver] Error:', e);
    return NextResponse.json({ error: 'Deezer stream resolution failed', details: e.message }, { status: 500 });
  }
}

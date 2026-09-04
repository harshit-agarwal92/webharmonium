import { NextResponse } from 'next/server';
import { searchSaavn } from '@/lib/providers/saavn';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || '').trim();
  const artist = (searchParams.get('artist') || '').trim();
  const id = (searchParams.get('id') || '').trim();

  // Search by title + artist as primary query, fallback to id or title
  const query = `${title} ${artist}`.trim() || title || id;
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
  }

  try {
    const results = await searchSaavn(query, 20);
    if (results && results.length > 0) {
      let track = id ? results.find((t: any) => t.id === id) : undefined;
      if (!track && title) {
        // Find best match by title substring
        track = results.find((t: any) => t.name?.toLowerCase().includes(title.toLowerCase()));
      }
      if (!track) track = results[0];

      if (track && track.url) {
        return NextResponse.json({ url: track.url, source: 'saavn', track });
      }
    }
    return NextResponse.json({ error: 'No JioSaavn stream URL found' }, { status: 404 });
  } catch (e: any) {
    console.error('[SaavnStreamResolver] Error:', e);
    return NextResponse.json({ error: 'JioSaavn stream resolution failed', details: e.message }, { status: 500 });
  }
}

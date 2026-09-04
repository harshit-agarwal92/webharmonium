import { NextResponse } from 'next/server';
import { SpotifyProvider } from '@/lib/providers/spotify';
import { SaavnProvider } from '@/lib/providers/saavn';
import { DeezerProvider } from '@/lib/providers/deezer';
import { mergeResults } from '@/lib/providers/merge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('query') || '';
  const limitParam = parseInt(searchParams.get('limit') || '50', 10);
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const isTrending = (!rawQuery || rawQuery === '@trending' || rawQuery === '');
  
  const query = isTrending ? 'Latest Bollywood Hits 2024' : rawQuery;

  // Initialize providers
  const spotify = new SpotifyProvider();
  const saavn = new SaavnProvider();
  const deezer = new DeezerProvider();

  // Execute providers concurrently
  const [spotifyResults, saavnResults, deezerResults] = await Promise.all([
    spotify.search(rawQuery, isTrending).catch((e) => { console.error(e); return []; }),
    saavn.search(query, isTrending, limitParam, pageParam).catch((e) => { console.error(e); return []; }),
    deezer.search(query, isTrending).catch((e) => { console.error(e); return []; })
  ]);

  // Merge results
  const finalResults = mergeResults([
    spotifyResults,
    saavnResults,
    deezerResults
  ]);

  return NextResponse.json({ 
    success: true, 
    results: finalResults.length > 0 ? finalResults : [
      { id: 'saavn-1', name: 'Zaalima', artist: 'Arijit Singh', album: 'Raees', image: 'https://c.saavncdn.com/123/Raees-Hindi-2016-500x500.jpg', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', source: 'saavn' }
    ]
  });
}

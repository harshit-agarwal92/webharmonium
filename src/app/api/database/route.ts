import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'trending';
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const letter = searchParams.get('letter') || '';

    const playlistPath = path.join(process.cwd(), 'public', 'spotify_playlist.json');
    if (!fs.existsSync(playlistPath)) {
      return NextResponse.json({ success: false, error: 'Database not found' }, { status: 404 });
    }

    let songs = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));

    // Apply filtering and sorting based on category
    switch (category) {
      case 'trending':
        // Sort by trendingScore descending
        songs.sort((a: any, b: any) => (b.trendingScore || 0) - (a.trendingScore || 0));
        break;
      
      case 'featured':
        // Simulating editors picks by high playCount and specific score
        songs = songs.filter((s: any) => (s.trendingScore || 0) > 5.0);
        songs.sort((a: any, b: any) => (b.artistPopularity || 0) - (a.artistPopularity || 0));
        break;
        
      case 'charts':
        // Sort by playCount descending
        songs.sort((a: any, b: any) => (b.playCount || 0) - (a.playCount || 0));
        break;
        
      case 'new':
        // Sort by uploadDate descending
        songs.sort((a: any, b: any) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime());
        break;
        
      case 'recently_added':
        // Assumes array is in chronological order of being added, reverse it
        songs = [...songs].reverse();
        break;
        
      case 'recommended':
        // Complex sort: playCount + trendingScore
        songs.sort((a: any, b: any) => {
          const scoreA = (a.playCount || 0) * (a.trendingScore || 1);
          const scoreB = (b.playCount || 0) * (b.trendingScore || 1);
          return scoreB - scoreA;
        });
        break;
        
      case 'artists':
        // Return 1 song per artist, sorted by artist popularity
        const seenArtists = new Set();
        songs = songs.filter((s: any) => {
          if (!s.artist) return false;
          if (seenArtists.has(s.artist)) return false;
          seenArtists.add(s.artist);
          return true;
        });
        songs.sort((a: any, b: any) => (b.artistPopularity || 0) - (a.artistPopularity || 0));
        break;
        
      case 'az':
        if (letter) {
          songs = songs.filter((s: any) => s.name?.toLowerCase().startsWith(letter.toLowerCase()));
          songs.sort((a: any, b: any) => a.name.localeCompare(b.name));
        } else {
          songs.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
        break;
        
      default:
        break;
    }

    // Apply pagination
    const paginated = songs.slice(offset, offset + limit);
    const hasMore = offset + limit < songs.length;

    return NextResponse.json({
      success: true,
      data: paginated,
      hasMore,
      total: songs.length
    });

  } catch (error) {
    console.error('Database API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

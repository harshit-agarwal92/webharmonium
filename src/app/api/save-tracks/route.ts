import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Handle CORS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(request: Request) {
  try {
    const tracks = await request.json();
    console.log(`Received ${tracks.length} tracks from Spotify scraper...`);
    
    // Save to public/spotify_playlist.json
    const filePath = path.join(process.cwd(), 'public', 'spotify_playlist.json');
    fs.writeFileSync(filePath, JSON.stringify(tracks, null, 2));
    
    console.log(`Successfully saved ${tracks.length} tracks to ${filePath}`);
    return NextResponse.json({ success: true, savedCount: tracks.length }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error: any) {
    console.error("Failed to save tracks:", error);
    return NextResponse.json({ success: false, error: error.message }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');
  const title = searchParams.get('title');
  const artist = searchParams.get('artist');

  if (!videoId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  try {
    // 1. Attempt native YouTube extraction
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    
    const mp4Formats = audioFormats.filter(f => f.container === 'mp4' || f.mimeType?.includes('mp4'));
    if (mp4Formats.length > 0) {
       audioFormats = mp4Formats;
    }
    
    if (audioFormats.length === 0) throw new Error('No audio formats found');
    
    const format = audioFormats.reduce((prev, current) => 
        (prev.audioBitrate || 0) > (current.audioBitrate || 0) ? prev : current
    );

    if (format.url) {
      return NextResponse.json({ url: format.url });
    }
    throw new Error('Format URL is missing due to decipher failure');
  } catch (err: any) {
    console.warn("YouTube stream extraction failed for video ID:", videoId, err.message);
    
    // 2. SILENT FALLBACK: Search the identical track on JioSaavn and serve its audio!
    if (title) {
      try {
        console.log(`Executing silent Saavn fallback for YouTube track: ${title} ${artist || ''}`);
        const searchUrl = `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(`${title} ${artist || ''}`)}`;
        const fallbackRes = await fetch(searchUrl, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const track = fallbackData?.data?.results?.[0];
          
          if (track) {
            const bestAudio = track.downloadUrl?.find((u: any) => u.quality === '320kbps') || track.downloadUrl?.[0];
            if (bestAudio?.url) {
              console.log("Successfully resolved YouTube track audio via Saavn CDN!");
              return NextResponse.json({ url: bestAudio.url });
            }
          }
        }
      } catch (fallbackErr) {
        console.error("Saavn audio fallback also failed:", fallbackErr);
      }
    }

    return NextResponse.json({ error: 'Failed to extract YouTube stream', details: err.message }, { status: 503 });
  }
}

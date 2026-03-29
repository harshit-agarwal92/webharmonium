import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const instances = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.hostux.net',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.astreaux.xyz',
    'https://piped-api.lunar.icu',
    'https://api.piped.dev',
    'https://pipedapi.moomoo.me',
    'https://inv.riverside.rocks',
    'https://iv.ggtyler.dev',
    'https://invidious.snopyta.org'
  ];

  const extractFromInstance = async (instance: string) => {
    try {
      // 1. Try Piped API Format
      const pipedRes = await fetch(`${instance}/streams/${videoId}`, { signal: AbortSignal.timeout(4000) });
      if (pipedRes.ok) {
        const data = await pipedRes.json();
        const best = data.audioStreams?.find((s: any) => s.extension === 'm4a') || 
                     data.audioStreams?.[0] || 
                     data.videoStreams?.[0];
        const urlToUse = typeof best === 'string' ? best : best?.url;
        if (urlToUse) return urlToUse;
      }

      // 2. Try Invidious API Fallback Format
      const invRes = await fetch(`${instance}/api/v1/videos/${videoId}`, { signal: AbortSignal.timeout(4000) });
      if (invRes.ok) {
        const invData = await invRes.json();
        const invBest = invData.adaptiveFormats?.find((f: any) => f.type.includes('audio/mp3')) || 
                        invData.adaptiveFormats?.find((f: any) => f.type.includes('audio/mp4')) || 
                        invData.adaptiveFormats?.find((f: any) => f.type.includes('audio'));
        if (invBest?.url) return invBest.url;
      }
      throw new Error('Instance Fail');
    } catch (e) {
      throw new Error('Instance Fail');
    }
  };

  try {
    // RACE multiple instances to find working audio stream as fast as possible
    const fastestUrl = await Promise.any(instances.map(extractFromInstance));
    return NextResponse.json({ url: fastestUrl });
  } catch (err) {
    console.error("All extraction mirrors failed for video ID:", videoId);
    return NextResponse.json({ error: 'Failed to extract stream from all available mirrors' }, { status: 503 });
  }
}

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get('url');

  if (!audioUrl) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

  try {
    const res = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.jiosaavn.com/',
        'Accept': '*/*'
      }
    });

    if (!res.ok) {
      console.warn(`Source response not OK: ${res.status} for ${audioUrl}`);
      throw new Error(`Source response not OK (${res.status})`);
    }

    const contentType = res.headers.get('Content-Type');
    const contentLength = res.headers.get('Content-Length');

    // Stream the audio response directly back to the client
    return new NextResponse(res.body, {
      headers: {
        'Content-Type': contentType || 'audio/mpeg',
        'Content-Length': contentLength || '',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes'
      }
    });
  } catch (err: any) {
    console.error("Audio Proxy Error:", err.message, "URL:", audioUrl);
    return NextResponse.json({ error: 'Failed to proxy audio', details: err.message }, { status: 502 });
  }
}

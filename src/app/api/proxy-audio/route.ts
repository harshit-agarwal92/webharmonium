import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get('url');

  if (!audioUrl) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
  }

  // Forward the Range request header from the browser to the audio source
  const rangeHeader = request.headers.get('Range');

  try {
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.jiosaavn.com/',
      'Accept': '*/*',
    };

    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    const res = await fetch(audioUrl, {
      headers: fetchHeaders
    });

    // Accept both 200 OK and 206 Partial Content as successful responses
    if (!res.ok && res.status !== 206) {
      console.warn(`Source response not OK: ${res.status} for ${audioUrl}`);
      throw new Error(`Source response not OK (${res.status})`);
    }

    const contentType = res.headers.get('Content-Type');
    const contentLength = res.headers.get('Content-Length');
    const contentRange = res.headers.get('Content-Range');

    // Build standard CORS and Byte-Range response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (contentType) responseHeaders.set('Content-Type', contentType);
    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    // Stream the audio response with matching status code (e.g. 206 for Partial Content chunks)
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders
    });
  } catch (err: any) {
    console.error("Audio Proxy Error:", err.message, "URL:", audioUrl);
    return NextResponse.json({ error: 'Failed to proxy audio', details: err.message }, { status: 502 });
  }
}

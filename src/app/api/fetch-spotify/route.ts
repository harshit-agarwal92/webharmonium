import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { SPOTIFY_PLAYLIST_ID } from '@/lib/providers/spotify';

export const dynamic = 'force-dynamic';

function fetchHttps(url: string, headers: any = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTPS Request failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function fetchHttpsJson(url: string, headers: any = {}): Promise<any> {
  const text = await fetchHttps(url, headers);
  return JSON.parse(text);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let token = searchParams.get('token');

    if (!token) {
      console.log("Next.js Server (Old endpoint route): No token parameter provided. Attempting automatic token generation...");
      try {
        const tokenUrl = "https://open.spotify.com/get_access_token?Reason=transport&productType=web_player";
        const tokenResText = await fetchHttps(tokenUrl, {
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          "App-Platform": "WebPlayer",
          "Spotify-App-Version": "1.2.22.0",
          "Origin": "https://open.spotify.com",
          "Referer": "https://open.spotify.com/"
        });
        const tokenData = JSON.parse(tokenResText);
        token = tokenData.accessToken;
        console.log("Next.js Server (Old endpoint route): Automatically retrieved Spotify token successfully!");
      } catch (tokenErr: any) {
        console.error("Next.js Server (Old endpoint route): Automatic token fetch failed:", tokenErr.message);
        return NextResponse.json({
          success: false,
          error: "Failed to automatically acquire Spotify token, and no manual token query parameter was supplied.",
          details: tokenErr.message
        }, { status: 200 });
      }
    }

    const playlistId = SPOTIFY_PLAYLIST_ID;
    console.log(`Next.js Server (Old endpoint route): Syncing playlist ${playlistId} using token...`);

    let allTracks: any[] = [];
    let offset = 0;
    const limit = 100;
    let total = Infinity;
    let page = 1;
    let fetchErrors = 0;

    while (offset < total && page <= 25) {
      console.log(`Next.js Server (Old endpoint route): Fetching Spotify tracks page ${page} (offset: ${offset})...`);
      
      const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&additional_types=track`;
      let apiData = null;
      let success = false;
      const retries = 3;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          apiData = await fetchHttpsJson(apiUrl, {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          });
          success = true;
          break;
        } catch (err: any) {
          console.warn(`Next.js Server (Old endpoint route) Warning: Page ${page} attempt ${attempt} failed: ${err.message}`);
          if (attempt === retries) {
            console.error(`Next.js Server (Old endpoint route) Error: Page ${page} failed completely after ${retries} attempts.`);
            fetchErrors++;
          } else {
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1))); // Exponential backoff
          }
        }
      }

      if (success && apiData && apiData.items) {
        total = apiData.total || total;
        console.log(`Next.js Server (Old endpoint route): Found ${apiData.items.length} tracks on page ${page} (Total items in playlist: ${total})`);

        const mappedPage = apiData.items
          .filter((item: any) => item.track && item.track.id)
          .map((item: any) => {
            const track = item.track;
            return {
              id: track.id,
              name: track.name,
              artist: track.artists.map((a: any) => a.name).join(", "),
              album: track.album?.name || 'Sad🥺❤️ Playlist',
              image: track.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500',
              url: track.preview_url || 'https://p.scdn.co/mp3-preview/a91df7976e107df6c41b8a5b28e6c5c56436a40a',
              duration: Math.round(track.duration_ms / 1000) || 180,
              source: 'spotify',
              spotifyUri: track.uri || `spotify:track:${track.id}`
            };
          });

        allTracks = [...allTracks, ...mappedPage];
        offset += limit;
        page++;
      } else {
        console.warn(`Next.js Server (Old endpoint route) Warning: Breaking loop on page ${page} to save already retrieved ${allTracks.length} tracks.`);
        break;
      }

      // Small throttle
      await new Promise(r => setTimeout(r, 100));
    }

    console.log(`Next.js Server (Old endpoint route): Extracted ${allTracks.length} tracks from Spotify API.`);

    if (allTracks.length === 0) {
      throw new Error("No tracks retrieved from Spotify API. Please verify token validity and network connection.");
    }

    // Deduplicate the Spotify API results by URI before merging
    const seenSpotifyUris = new Set();
    const uniqueSpotifyTracks: any[] = [];
    allTracks.forEach((track) => {
      if (!seenSpotifyUris.has(track.spotifyUri)) {
        seenSpotifyUris.add(track.spotifyUri);
        uniqueSpotifyTracks.push(track);
      }
    });

    console.log(`Next.js Server (Old endpoint route): Deduplicated into ${uniqueSpotifyTracks.length} unique Spotify tracks.`);

    // 3. Load current playlist and database to preserve any high fidelity URLs already resolved
    const playlistPath = path.join(process.cwd(), 'public', 'spotify_playlist.json');
    const existingSongsMap = new Map();

    if (fs.existsSync(playlistPath)) {
      try {
        const existingPlaylist = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
        existingPlaylist.forEach((song: any) => {
          if (song.spotifyUri) {
            existingSongsMap.set(song.spotifyUri, song);
          } else if (song.id && !song.id.startsWith('spotify_')) {
            existingSongsMap.set(`${song.name.toLowerCase().trim()}|${song.artist.toLowerCase().trim()}`, song);
          }
        });
      } catch (e) {
        console.warn("Could not load existing playlist:", e);
      }
    }

    const currentDbPath = path.join(process.cwd(), 'extracted_songs.json');
    if (fs.existsSync(currentDbPath)) {
      try {
        const dbSongs = JSON.parse(fs.readFileSync(currentDbPath, 'utf-8'));
        dbSongs.forEach((song: any) => {
          if (song.source === 'saavn') {
            existingSongsMap.set(`${song.name.toLowerCase().trim()}|${song.artist.toLowerCase().trim()}`, song);
          }
        });
      } catch (e) {
        console.warn("Could not load extracted_songs.json:", e);
      }
    }

    // 4. Merge tracks: preserve existing high fidelity resolved items
    const compiledPlaylist = uniqueSpotifyTracks.map((spotifyTrack) => {
      const matchByUri = existingSongsMap.get(spotifyTrack.spotifyUri);
      if (matchByUri) {
        return {
          ...matchByUri,
          spotifyUri: spotifyTrack.spotifyUri
        };
      }

      const cleanArtist = spotifyTrack.artist.split(',')[0].toLowerCase().trim();
      const matchByNameArtist = existingSongsMap.get(`${spotifyTrack.name.toLowerCase().trim()}|${cleanArtist}`);
      if (matchByNameArtist) {
        return {
          ...matchByNameArtist,
          spotifyUri: spotifyTrack.spotifyUri
        };
      }

      return spotifyTrack;
    });

    // Deduplicate the compiled playlist one final time by ID/URI
    const finalSeenIds = new Set();
    const finalUniquePlaylist = compiledPlaylist.filter((song) => {
      if (finalSeenIds.has(song.id)) return false;
      finalSeenIds.add(song.id);
      return true;
    });

    // 5. Write back to public/spotify_playlist.json
    fs.writeFileSync(playlistPath, JSON.stringify(finalUniquePlaylist, null, 2), 'utf-8');
    console.log(`Next.js Server (Old endpoint route): Compiled ${finalUniquePlaylist.length} tracks and wrote to public/spotify_playlist.json!`);

    return NextResponse.json({
      success: true,
      totalExtracted: allTracks.length,
      totalCompiled: finalUniquePlaylist.length,
      message: `Successfully sync'd ${finalUniquePlaylist.length} songs from Spotify playlist!`
    });

  } catch (error: any) {
    console.error("Next.js Server API (Old endpoint route) error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || String(error),
      stack: error.stack
    }, { status: 200 });
  }
}

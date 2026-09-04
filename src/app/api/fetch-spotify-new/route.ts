import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { SPOTIFY_PLAYLIST_ID } from '@/lib/providers/spotify';

export const dynamic = 'force-dynamic';

// Helper to perform HTTPS request
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
            resolve(''); // Resolve empty string instead of failing to prevent crashes
          }
        });
      });

      req.on('error', (err) => {
        resolve(''); // Fail gracefully
      });

      req.end();
    } catch (e) {
      resolve('');
    }
  });
}

async function fetchHttpsJson(url: string, headers: any = {}): Promise<any> {
  const text = await fetchHttps(url, headers);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

// Robust CSV Line Parser supporting double quoted fields and escaped quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Curated list of high-quality premium default music covers
const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1459749411177-042180ce673b?q=80&w=500&auto=format&fit=crop'
];

function getCleanMatchKey(name: string, artist: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const cleanArtist = artist.split(',')[0].toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  return `${cleanName}|${cleanArtist}`;
}

export async function GET(request: Request) {
  try {
    const rootDir = process.cwd();
    const csvPath = path.join(rootDir, 'public', 'My Spotify Library (1).csv');
    const playlistPath = path.join(rootDir, 'public', 'spotify_playlist.json');
    const currentDbPath = path.join(rootDir, 'extracted_songs.json');

    console.log("Next.js Server (Sync): Starting Spotify CSV / Playlist synchronization engine...");

    let rawTracks: any[] = [];
    let isCsvSync = false;

    // 1. Check if the user's uploaded CSV is available
    if (fs.existsSync(csvPath)) {
      console.log(`Next.js Server (Sync): CSV found at "${csvPath}". Proceeding with CSV Import...`);
      try {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);

        if (lines.length >= 2) {
          const header = parseCSVLine(lines[0]);
          const trackNameIdx = header.findIndex(h => h.toLowerCase().includes('track name'));
          const artistNameIdx = header.findIndex(h => h.toLowerCase().includes('artist name'));
          const albumIdx = header.findIndex(h => h.toLowerCase().includes('album'));
          const spotifyIdIdx = header.findIndex(h => h.toLowerCase().includes('spotify - id'));

          if (trackNameIdx !== -1 && artistNameIdx !== -1 && spotifyIdIdx !== -1) {
            for (let i = 1; i < lines.length; i++) {
              const row = parseCSVLine(lines[i]);
              if (row.length < header.length) continue;

              const name = row[trackNameIdx].trim();
              const artist = row[artistNameIdx].trim();
              const album = albumIdx !== -1 ? row[albumIdx].trim() : 'Sad🥺❤️ Playlist';
              const spotifyId = row[spotifyIdIdx].trim();

              if (name && artist && spotifyId) {
                rawTracks.push({
                  spotifyId,
                  name,
                  artist,
                  album,
                  spotifyUri: `spotify:track:${spotifyId}`
                });
              }
            }
            isCsvSync = true;
            console.log(`Next.js Server (Sync): Parsed ${rawTracks.length} tracks successfully from CSV.`);
          }
        }
      } catch (csvErr: any) {
        console.error("Next.js Server (Sync) Warning: CSV parse failed, falling back to Spotify API:", csvErr.message);
      }
    }

    // 2. Fall back to Spotify API collaborative playlist if CSV is not found or parsing failed
    if (!isCsvSync) {
      console.log("Next.js Server (Sync): CSV not found. Synchronizing via Spotify Playlist Web API...");
      const { searchParams } = new URL(request.url);
      let token = searchParams.get('token');

      if (!token) {
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
          if (tokenResText) {
            const tokenData = JSON.parse(tokenResText);
            token = tokenData.accessToken;
          }
        } catch (tokenErr) {}
      }

      if (!token) {
        return NextResponse.json({
          success: false,
          error: "Failed to automatically acquire Spotify token, and no CSV file or manual token query parameter was supplied."
        });
      }

      const playlistId = SPOTIFY_PLAYLIST_ID;
      let offset = 0;
      const limit = 100;
      let total = Infinity;
      let page = 1;

      while (offset < total && page <= 15) {
        const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&additional_types=track`;
        const apiData = await fetchHttpsJson(apiUrl, {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        });

        if (apiData && apiData.items) {
          total = apiData.total || total;
          const pageTracks = apiData.items
            .filter((item: any) => item.track && item.track.id)
            .map((item: any) => ({
              spotifyId: item.track.id,
              name: item.track.name,
              artist: item.track.artists.map((a: any) => a.name).join(", "),
              album: item.track.album?.name || 'Sad🥺❤️ Playlist',
              spotifyUri: item.track.uri || `spotify:track:${item.track.id}`
            }));

          rawTracks = [...rawTracks, ...pageTracks];
          offset += limit;
          page++;
        } else {
          break;
        }
      }
    }

    if (rawTracks.length === 0) {
      throw new Error("No tracks retrieved from CSV or Spotify API.");
    }

    // 3. Build a cache lookup map from current database (extracted_songs.json) and current playlist
    const cacheMap = new Map<string, any>();

    // Load extracted_songs.json
    let extractedSongsDb: any[] = [];
    if (fs.existsSync(currentDbPath)) {
      try {
        extractedSongsDb = JSON.parse(fs.readFileSync(currentDbPath, 'utf-8'));
        extractedSongsDb.forEach((song: any) => {
          if (song.id) {
            cacheMap.set(song.id.toString(), song);
          }
          const matchKey = getCleanMatchKey(song.name, song.artist);
          cacheMap.set(matchKey, song);
        });
      } catch (e) {}
    }

    // Load current playlist
    if (fs.existsSync(playlistPath)) {
      try {
        const playlistSongs = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
        playlistSongs.forEach((song: any) => {
          if (song.id) {
            cacheMap.set(song.id.toString(), song);
          }
          const matchKey = getCleanMatchKey(song.name, song.artist);
          if (!cacheMap.has(matchKey) && song.source === 'saavn' && song.url) {
            cacheMap.set(matchKey, song);
          }
        });
      } catch (e) {}
    }

    console.log(`Next.js Server (Sync): Lookup cache ready with ${cacheMap.size} entries.`);

    // 4. Resolve the parsed tracks using cache or fast JioSaavn APIs
    const finalPlaylist: any[] = [];
    const unmatchedTracks: any[] = [];
    let cacheHits = 0;

    rawTracks.forEach((track) => {
      const matchKey = getCleanMatchKey(track.name, track.artist);
      const cached = cacheMap.get(matchKey) || cacheMap.get(`spotify_${track.spotifyId}`);

      if (cached && cached.url) {
        finalPlaylist.push({
          ...cached,
          spotifyUri: track.spotifyUri,
          album: track.album
        });
        cacheHits++;
      } else {
        unmatchedTracks.push(track);
      }
    });

    console.log(`Next.js Server (Sync): Cache hits: ${cacheHits}. Unmatched to resolve: ${unmatchedTracks.length}.`);

    // 5. Pre-resolve up to 40 unmatched tracks during this API request to avoid timeouts
    const songsToResolve = unmatchedTracks.slice(0, 40);
    const remainingUnmatched = unmatchedTracks.slice(40);
    let resolvedCount = 0;

    if (songsToResolve.length > 0) {
      console.log(`Next.js Server (Sync): Resolving ${songsToResolve.length} tracks using JioSaavn CDN...`);
      
      const batchSize = 10;
      for (let i = 0; i < songsToResolve.length; i += batchSize) {
        const batch = songsToResolve.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (track) => {
          try {
            const primaryArtist = track.artist.split(',')[0].replace(/[\u00a0]/g, ' ').trim();
            const cleanQuery = `${track.name} ${primaryArtist}`.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

            const autocompleteUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(cleanQuery)}`;
            const searchRes = await fetchHttpsJson(autocompleteUrl);
            const songsList = searchRes?.songs?.data || [];

            if (songsList.length > 0) {
              const firstItem = songsList[0];
              const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${firstItem.id}`;
              const detailRes = await fetchHttpsJson(detailUrl);
              const songDetail = detailRes ? Object.values(detailRes)[0] as any : null;

              if (songDetail) {
                const encUrl = songDetail.encrypted_media_url || songDetail.encrypted_drm_media_url;
                if (encUrl) {
                  const authUrl = `https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&_format=json&_marker=0&cc=in&bitrate=320&url=${encodeURIComponent(encUrl)}`;
                  const tokenRes = await fetchHttpsJson(authUrl);

                  if (tokenRes && tokenRes.status === 'success' && tokenRes.auth_url) {
                    let hiresImage = songDetail.image || firstItem.image || DEFAULT_COVERS[0];
                    if (hiresImage) {
                      hiresImage = hiresImage.replace('150x150', '500x500').replace('50x50', '500x500');
                    }

                    const cleanName = (songDetail.song || firstItem.title || track.name)
                      .replace(/&quot;/g, '"')
                      .replace(/&amp;/g, '&')
                      .replace(/&#039;/g, "'");

                    const resolvedSong = {
                      id: firstItem.id,
                      name: cleanName,
                      artist: songDetail.singers || songDetail.primary_artists || firstItem.more_info?.primary_artists || track.artist,
                      album: songDetail.album || firstItem.album || track.album,
                      image: hiresImage,
                      url: tokenRes.auth_url,
                      source: 'saavn',
                      duration: songDetail.duration ? parseInt(songDetail.duration) : 180,
                      spotifyUri: track.spotifyUri
                    };

                    finalPlaylist.push(resolvedSong);
                    extractedSongsDb.push(resolvedSong);
                    resolvedCount++;
                    return;
                  }
                }
              }
            }
          } catch (e) {}

          // Fallback to high-quality placeholder for resolved batch that failed
          const coverIndex = Math.floor(Math.random() * DEFAULT_COVERS.length);
          finalPlaylist.push({
            id: `spotify_${track.spotifyId}`,
            name: track.name,
            artist: track.artist,
            album: track.album,
            image: DEFAULT_COVERS[coverIndex],
            url: '', // Empty triggers high-fidelity dynamic resolution on-play!
            source: 'saavn',
            duration: 180,
            spotifyUri: track.spotifyUri
          });
        }));
      }
    }

    // 6. Generate beautiful instant high-fidelity dynamic-resolve placeholders for remaining unmatched tracks
    if (remainingUnmatched.length > 0) {
      console.log(`Next.js Server (Sync): Generating dynamic on-play resolvers for ${remainingUnmatched.length} remaining songs...`);
      remainingUnmatched.forEach((track, index) => {
        const coverIndex = (index + resolvedCount) % DEFAULT_COVERS.length;
        finalPlaylist.push({
          id: `spotify_${track.spotifyId}`,
          name: track.name,
          artist: track.artist,
          album: track.album,
          image: DEFAULT_COVERS[coverIndex],
          url: '', // Empty triggers instant dynamic high-fidelity 320kbps resolution on-play!
          source: 'saavn',
          duration: 180,
          spotifyUri: track.spotifyUri
        });
      });
    }

    // 7. Deduplicate finalCompiledPlaylist by Spotify ID/URI to be absolutely clean
    const seenIds = new Set();
    const finalUniquePlaylist = finalPlaylist.filter((song) => {
      const matchId = song.spotifyUri || song.id;
      if (seenIds.has(matchId)) return false;
      seenIds.add(matchId);
      return true;
    });

    // 8. Write updated playlist and database
    fs.writeFileSync(playlistPath, JSON.stringify(finalUniquePlaylist, null, 2), 'utf-8');
    fs.writeFileSync(currentDbPath, JSON.stringify(extractedSongsDb, null, 2), 'utf-8');

    console.log(`Next.js Server (Sync): Successfully processed ${finalUniquePlaylist.length} tracks.`);
    console.log(`Next.js Server (Sync): Playlist updated in "public/spotify_playlist.json".`);

    return NextResponse.json({
      success: true,
      totalExtracted: rawTracks.length,
      totalCompiled: finalUniquePlaylist.length,
      totalResolved: cacheHits + resolvedCount,
      message: `Successfully sync'd ${finalUniquePlaylist.length} tracks from ${isCsvSync ? 'CSV Library file' : 'Spotify Playlist'}! 🎉`
    });

  } catch (error: any) {
    console.error("Next.js Server API (Sync) error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || String(error)
    }, { status: 200 });
  }
}


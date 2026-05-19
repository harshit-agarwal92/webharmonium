import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractEmbedTracks() {
  const rootDir = path.join(__dirname, '..');
  const outPath = path.join(rootDir, 'public', 'spotify_extracted_tracks.json');
  const playlistId = '0Mm8BTdceIk3XJ1XlRisws';

  console.log(`🚀 Starting Spotify track extraction for playlist: ${playlistId}...`);

  try {
    console.log('🔑 Attempting to fetch anonymous access token from Spotify...');
    const tokenUrl = "https://open.spotify.com/get_access_token?Reason=transport&productType=web_player";
    const tokenRes = await fetch(tokenUrl, {
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "App-Platform": "WebPlayer",
        "Spotify-App-Version": "1.2.22.0",
        "Origin": "https://open.spotify.com",
        "Referer": "https://open.spotify.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!tokenRes.ok) {
      throw new Error(`Token endpoint returned status ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.accessToken;
    console.log('✅ Spotify access token acquired successfully!');

    let allTracks = [];
    let offset = 0;
    let limit = 100;
    let total = Infinity;
    let page = 1;

    console.log('📡 Fetching tracks from live Spotify Web API...');
    while (offset < total && page <= 25) {
      console.log(`   Page ${page} (offset: ${offset})...`);
      const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&additional_types=track`;
      
      let apiData = null;
      let success = false;
      let retries = 3;
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const res = await fetch(apiUrl, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          apiData = await res.json();
          success = true;
          break;
        } catch (err) {
          console.warn(`   ⚠️ Fetch attempt ${attempt}/${retries} failed: ${err.message}`);
          if (attempt === retries) {
            console.error(`   ❌ Failed to fetch page ${page} after ${retries} attempts.`);
          } else {
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
          }
        }
      }

      if (success && apiData && apiData.items) {
        total = apiData.total || total;
        const mappedPage = apiData.items
          .filter(item => item.track && item.track.id)
          .map((item, idx) => {
            const track = item.track;
            return {
              index: offset + idx + 1,
              title: track.name,
              artists: track.artists.map(a => a.name).join(", "),
              durationMs: track.duration_ms,
              durationText: formatDuration(track.duration_ms),
              previewUrl: track.preview_url || null,
              spotifyUri: track.uri || `spotify:track:${track.id}`
            };
          });

        allTracks = [...allTracks, ...mappedPage];
        offset += limit;
        page++;
      } else {
        console.warn(`   ⚠️ Breaking pagination loop on page ${page}. Fetched ${allTracks.length} tracks so far.`);
        break;
      }
      
      await new Promise(r => setTimeout(r, 100)); // Small throttle
    }

    if (allTracks.length > 0) {
      // Deduplicate tracks by Spotify URI
      const seenUris = new Set();
      const uniqueTracks = [];
      allTracks.forEach(track => {
        if (!seenUris.has(track.spotifyUri)) {
          seenUris.add(track.spotifyUri);
          uniqueTracks.push(track);
        }
      });

      // Write to public/spotify_extracted_tracks.json
      fs.writeFileSync(outPath, JSON.stringify(uniqueTracks, null, 2), 'utf-8');
      console.log(`\n🎉 Success! Extracted and deduplicated ${uniqueTracks.length} tracks directly from Spotify API.`);
      console.log(`💾 Saved to: "${outPath}"`);
      return;
    } else {
      throw new Error("No tracks retrieved from Spotify API.");
    }

  } catch (err) {
    console.warn(`\n⚠️ API Extraction failed: ${err.message}`);
    console.log('🔄 Falling back to manual HTML parsing extraction of public/spotify_embed.html...');
    
    // Fallback block
    const htmlPath = path.join(rootDir, 'public', 'spotify_embed.html');
    if (!fs.existsSync(htmlPath)) {
      console.error('❌ Fallback failed: spotify_embed.html does not exist!');
      return;
    }

    const html = fs.readFileSync(htmlPath, 'utf-8');
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
    if (!match) {
      console.error('❌ Fallback failed: Could not find __NEXT_DATA__ script block in embed page HTML.');
      return;
    }

    try {
      const rawJson = match[1];
      const data = JSON.parse(rawJson);
      const entity = data?.props?.pageProps?.state?.data?.entity;
      const trackList = entity?.trackList || [];
      
      console.log(`\n🎵 Playlist Name: ${entity?.name || 'Unknown'}`);
      console.log(`👤 Owner / Subtitle: ${entity?.subtitle || 'Unknown'}`);
      console.log(`📦 Extracted Tracks Count from Embed: ${trackList.length}\n`);

      if (trackList.length === 0) {
        console.log('⚠️ Track list was empty in the HTML state.');
        return;
      }

      const resolvedTracks = trackList.map((item, index) => {
        const title = item.title || item.name || '';
        const artists = item.subtitle || '';
        const durationMs = item.duration || 0;
        const previewUrl = item.audioPreview?.url || null;
        const spotifyUri = item.uri || '';
        
        return {
          index: index + 1,
          title,
          artists,
          durationMs,
          durationText: formatDuration(durationMs),
          previewUrl,
          spotifyUri
        };
      });

      fs.writeFileSync(outPath, JSON.stringify(resolvedTracks, null, 2), 'utf-8');
      console.log(`✅ Fallback Successful: Extracted ${resolvedTracks.length} tracks from embed HTML!`);
      console.log(`💾 Saved to: "${outPath}"`);
    } catch (fallbackErr) {
      console.error('❌ Fallback extraction also failed:', fallbackErr.message);
    }
  }
}

function formatDuration(ms) {
  if (!ms) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

extractEmbedTracks();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function scrapeSpotifyPlaylist() {
  const playlistUrl = 'https://open.spotify.com/playlist/0Mm8BTdceIk3XJ1XlRisws?si=df9f82d2d98242c6&pt=35532f41b22c5cf615709774eea0ac94';
  
  console.log('🔗 Fetching Spotify Playlist...');
  try {
    const res = await fetch(playlistUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to load Spotify playlist. Status: ${res.status}`);
    }
    
    const html = await res.text();
    
    // Spotify embeds metadata inside a <script> block, often with ID "initial-state" or "__NEXT_DATA__" or in the DOM as meta tags
    // Let's first look for open graph / twitter card meta tags which contain the track listings!
    // Example: <meta property="music:song" content="...url..."/> or <meta name="music:song" content="..." />
    // Also, the track names are often in <meta name="description" content="... songs list ...">
    // Alternatively, the script contains a window.__playContext or initial state JSON. Let's scan for it!
    
    const songs = [];
    
    // 1. Try parsing JSON structure (Hydration Data)
    const jsonMatch = html.match(/<script id="initial-state" type="text\/plain">([^<]+)<\/script>/) || 
                      html.match(/<script id="session" type="application\/json">([^<]+)<\/script>/) ||
                      html.match(/<script id="config" type="application\/json">([^<]+)<\/script>/);
                      
    if (jsonMatch) {
      try {
        const decoded = Buffer.from(jsonMatch[1], 'base64').toString('utf8');
        const parsed = JSON.parse(decoded);
        console.log('✅ Successfully extracted raw session hydration payload!');
        // We can inspect this payload
      } catch (err) {}
    }

    // 2. Let's extract using Meta Properties (extremely robust for public sharing URLs!)
    // Public Spotify pages have lines like:
    // <meta name="music:song" content="https://open.spotify.com/track/..." />
    // <meta name="twitter:description" content="Listen to ... on Spotify. SongName · ArtistName · AlbumName, SongName2 · ArtistName2 ..." />
    
    const metaDescMatch = html.match(/<meta name="description" content="([^"]+)"/) || 
                          html.match(/<meta property="og:description" content="([^"]+)"/) ||
                          html.match(/<meta name="twitter:description" content="([^"]+)"/);
                          
    if (metaDescMatch) {
      const desc = metaDescMatch[1];
      console.log('📝 Extracted Description:', desc);
      
      // The description of a public playlist usually looks like:
      // "Playlist · Name · 15 songs" or lists tracks: "Song1 · Artist1, Song2 · Artist2, ..."
      // Let's see if we can parse the track list from the description.
      // E.g., "Listen to 0Mm8BTdceIk3XJ1XlRisws on Spotify. Song · Artist · Album, ..."
      const tracksPart = desc.split('·').slice(2).join('·');
      console.log('Tracks description list:', desc);
    }
    
    // Let's write the HTML to a temporary file in the workspace so we can inspect its exact structure
    const rootDir = path.join(__dirname, '..');
    const tempHtmlPath = path.join(rootDir, 'public', 'spotify_temp.html');
    fs.writeFileSync(tempHtmlPath, html, 'utf-8');
    console.log(`💾 Saved raw playlist HTML to: "${tempHtmlPath}" for visual schema mapping.`);
    
  } catch (e) {
    console.error('❌ Scraper failed:', e.message);
  }
}

scrapeSpotifyPlaylist();

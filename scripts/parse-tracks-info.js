import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseTracksInfo() {
  const rootDir = path.join(__dirname, '..');
  const htmlPath = path.join(rootDir, 'public', 'spotify_bot_success.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('File does not exist!');
    return;
  }
  
  const html = fs.readFileSync(htmlPath, 'utf-8');
  console.log('📖 Extracting song names and artists from Spotify HTML...');

  // Spotify HTML tracks usually contain:
  // <meta property="music:song" content="https://open.spotify.com/track/12345" />
  // And in the DOM (for SEO/crawlers), it lists the tracks inside anchor tags:
  // <a href="/track/12345">Song Name</a>
  // <a href="/artist/67890">Artist Name</a>
  // Let's find all occurrences of href="/track/..." and extract the inner text of the link,
  // and do the same for href="/artist/..."!
  
  const trackRegex = /href="\/track\/([a-zA-Z0-9]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const artistRegex = /href="\/artist\/([a-zA-Z0-9]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  
  const tracks = [];
  let m;
  while ((m = trackRegex.exec(html)) !== null) {
    const id = m[1];
    const rawName = m[2].trim();
    // Clean HTML entities
    const name = rawName
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/<[^>]*>/g, ''); // strip any nested tags
      
    tracks.push({ id, name, artists: [] });
  }

  // Let's also look for general script blocks that might contain the catalog mapping
  // Sometimes, Spotify encodes hydration state as a JSON string:
  // "name":"Song Name","uri":"spotify:track:..."
  const tracksByState = [];
  const stateMatch = html.match(/"tracks":\s*\{\s*"items":\s*\[([\s\S]*?)\]\s*\}/) ||
                     html.match(/"items":\s*\[([\s\S]*?)\]/);
                     
  // Let's look for standard patterns: "name":"..." and see if we can pair track names with artist names
  // In the script block, the JSON structure often has:
  // {"track":{"album":{"name":"Album"},"artists":[{"name":"Artist"}],"name":"Song"}}
  // Let's try to extract all matches using a regex for this JSON structure!
  const regexJsonTrack = /\{\s*"track"\s*:\s*\{\s*"album"[\s\S]*?"artists"\s*:\s*\[([\s\S]*?)\][\s\S]*?"name"\s*:\s*"([^"]+)"/g;
  let trackMatch;
  const extractedJSONTracks = [];
  
  // Let's write a general parser that searches for song names and artist names in sequence
  // In the HTML, there are lines like:
  // "name": "Song Name"
  // Let's parse the raw HTML script content.
  // We will find all lines containing `"name":"` and look for the structure.
  console.log(`📡 Parsed ${tracks.length} track links from DOM structure.`);
  
  // Let's check if the tracks array is populated
  if (tracks.length > 0) {
    console.log('\n🎵 Resolved Tracks List:');
    tracks.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} (ID: ${t.id})`);
    });
  } else {
    // Fallback: search for simple matches
    console.log('⚠️ DOM track links empty. Scanning scripts for track name payloads...');
    const trackNames = [];
    const artistNames = [];
    
    // In Spotify's script blocks, we have track descriptions like:
    // "title":"Song Title","subtitle":"Artist Name" or "name":"Song Title"
    // Let's do a search for:
    // <meta name="music:song" content="..."/>
    // Wait, let's look at the actual HTML. We can write a script to search for "/track/" in general
    const genericTrackRegex = /\/track\/([a-zA-Z0-9]+)/g;
    const genericMatches = html.match(genericTrackRegex) || [];
    console.log(`Generic track URL occurrences: ${genericMatches.length}`);
  }
}

parseTracksInfo();

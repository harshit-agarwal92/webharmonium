import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseBotSpotify() {
  const rootDir = path.join(__dirname, '..');
  const htmlPath = path.join(rootDir, 'public', 'spotify_bot_success.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('File does not exist!');
    return;
  }
  
  const html = fs.readFileSync(htmlPath, 'utf-8');
  console.log('📖 Parsing Spoofed Spotify HTML metadata...');

  // Let's print out the playlist name
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/) ||
                     html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    console.log(`🎵 Playlist Name: ${titleMatch[1]}`);
  }

  // 1. Search for track URLs
  // Track links look like: <meta property="music:song" content="https://open.spotify.com/track/4jKsI5rP3cT28e9W2WJmR3" />
  // or a tags: href="/track/..."
  const trackRegex = /https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/g;
  const trackIds = new Set();
  let m;
  while ((m = trackRegex.exec(html)) !== null) {
    trackIds.add(m[1]);
  }
  
  console.log(`🔗 Found ${trackIds.size} unique Spotify track IDs in the page links.`);

  // 2. Search for inline JSON
  // Let's scan for hydration payloads or JSON blobs
  const scripts = [];
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  
  console.log(`📡 Total script tags: ${scripts.length}`);
  
  let jsonExtracted = false;
  for (let i = 0; i < scripts.length; i++) {
    const js = scripts[i];
    if (js.includes('track') || js.includes('album') || js.includes('initial-state') || js.includes('Spotify')) {
      // Let's search for JSON boundaries
      const firstCurly = js.indexOf('{');
      const lastCurly = js.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
        const potentialJson = js.substring(firstCurly, lastCurly + 1);
        try {
          const parsed = JSON.parse(potentialJson);
          console.log(`✅ Script ${i} parsed successfully as JSON!`);
          fs.writeFileSync(path.join(rootDir, 'public', `spotify_extracted_payload_${i}.json`), JSON.stringify(parsed, null, 2));
          jsonExtracted = true;
        } catch (e) {
          // Attempt parsing inner matches
        }
      }
    }
  }

  if (!jsonExtracted) {
    console.log('⚠️ Could not extract clean root JSON. Scanning raw script text...');
    // Let's look for matching patterns in the text
    // Regex to match: "name":"..." or "title":"..." or similar track metadata patterns
    const trackNames = [];
    const nameMatches = html.match(/"name":"([^"]+)"/g) || [];
    console.log(`🔍 Found ${nameMatches.length} raw "name" tags in script blocks.`);
    
    // Let's check some samples
    const sampleNames = nameMatches.slice(0, 15).map(n => n.replace(/"name":"|"/g, ''));
    console.log('Sample names found:', sampleNames);
  }
}

parseBotSpotify();

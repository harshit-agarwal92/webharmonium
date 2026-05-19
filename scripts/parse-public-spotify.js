import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parsePublicSpotify() {
  const rootDir = path.join(__dirname, '..');
  const htmlPath = path.join(rootDir, 'public', 'spotify_public_temp.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('File does not exist!');
    return;
  }
  
  const html = fs.readFileSync(htmlPath, 'utf-8');
  console.log('📖 Parsing public Spotify playlist HTML...');

  // 1. Check for Meta description
  // Example description format: "Listen to 0Mm8BTdceIk3XJ1XlRisws on Spotify. Song · Artist · Album, ..."
  // Or "Playlist · Name · 15 songs" or similar
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/) ||
                    html.match(/<meta property="og:description" content="([^"]+)"/) ||
                    html.match(/<meta name="twitter:description" content="([^"]+)"/);
                    
  if (descMatch) {
    const desc = descMatch[1];
    console.log('\n📝 Description Metadata found:');
    console.log(desc);
  }

  // 2. Check for page title (playlist name)
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/) ||
                     html.match(/<meta name="twitter:title" content="([^"]+)"/);
  if (titleMatch) {
    console.log(`\n🎵 Playlist Title: ${titleMatch[1]}`);
  }

  // 3. Search for scripts containing JSON data (Spotify hydration payloads)
  // Search for state hydration blocks
  const scripts = [];
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  
  console.log(`\n📡 Total script tags found: ${scripts.length}`);
  
  // Let's scan scripts for words like "track" or "album" or "artist" or JSON objects
  for (let i = 0; i < scripts.length; i++) {
    const js = scripts[i];
    if (js.includes('Spotify') && js.includes('track') && js.includes('{')) {
      console.log(`✨ Script ${i} appears to contain tracks context! Length: ${js.length}`);
      // Write it to a temp file to inspect
      fs.writeFileSync(path.join(rootDir, 'public', `script_${i}.js`), js);
    }
  }

  // 4. Look for Open Graph images (playlist cover art)
  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (imageMatch) {
    console.log(`🖼️ Playlist Cover Art: ${imageMatch[1]}`);
  }
}

parsePublicSpotify();

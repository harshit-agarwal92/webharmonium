import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPublicSpotify() {
  const cleanUrl = 'https://open.spotify.com/playlist/0Mm8BTdceIk3XJ1XlRisws';
  console.log(`🔗 Querying public clean Spotify URL: ${cleanUrl}`);
  
  try {
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
      }
    });
    
    console.log(`📡 Fetch Response status: ${res.status}`);
    const html = await res.text();
    
    const rootDir = path.join(__dirname, '..');
    const outPath = path.join(rootDir, 'public', 'spotify_public_temp.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`💾 Saved HTML response to: "${outPath}"`);
    
    // Check if redirect or login page
    if (html.includes('login') || html.includes('Welcome back')) {
      console.log('❌ Still redirected to login.');
    } else {
      console.log('✅ Successfully loaded public landing page!');
      // Check title and tracks
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      if (titleMatch) console.log(`🎵 Page Title: ${titleMatch[1]}`);
      
      // Look for tracks in description or DOM
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/) ||
                        html.match(/<meta property="og:description" content="([^"]+)"/);
      if (descMatch) {
        console.log(`📝 Description: ${descMatch[1]}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPublicSpotify();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testEmbedSpotify() {
  const embedUrl = 'https://open.spotify.com/embed/playlist/0Mm8BTdceIk3XJ1XlRisws';
  console.log(`🔗 Querying Spotify Embed Widget URL: ${embedUrl}`);
  
  try {
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    console.log(`📡 Response Status: ${res.status}`);
    const html = await res.text();
    
    const rootDir = path.join(__dirname, '..');
    const outPath = path.join(rootDir, 'public', 'spotify_embed.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`💾 Saved Embed HTML to: "${outPath}"`);

    // Let's search for script tags containing JSON
    // The embed page usually embeds data in a <script id="resource" type="application/json"> or inside __NEXT_DATA__
    const jsonMatch = html.match(/<script[^>]*id="[^"]*resource"[^>]*>([\s\S]*?)<\/script>/i) ||
                      html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i) ||
                      html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
                      
    console.log('\n🔍 Scanning HTML content for resource scripts...');
    
    // Look for track objects using direct pattern matching
    const trackNames = [];
    const nameMatches = html.match(/"name"\s*:\s*"([^"]+)"/g) || [];
    console.log(`Found ${nameMatches.length} raw 'name' occurrences.`);
    
    // Let's search for the exact JSON script tag
    const resourceRegex = /<script id="initial-state" type="text\/plain">([^<]+)<\/script>/i;
    const resourceMatch = html.match(resourceRegex);
    if (resourceMatch) {
      console.log('✅ Found "initial-state" plain script block!');
      const decoded = Buffer.from(resourceMatch[1], 'base64').toString('utf8');
      fs.writeFileSync(path.join(rootDir, 'public', 'spotify_embed_initial_state.json'), decoded);
      console.log('💾 Extracted decoded initial state JSON to public/spotify_embed_initial_state.json');
    } else {
      // Look for any script containing "props" or "tracks"
      const resourceScriptRegex = /<script id="resource" type="application\/json">([\s\S]*?)<\/script>/i;
      const resScriptMatch = html.match(resourceScriptRegex);
      if (resScriptMatch) {
        console.log('✅ Found "resource" JSON script block!');
        fs.writeFileSync(path.join(rootDir, 'public', 'spotify_embed_resource.json'), resScriptMatch[1]);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testEmbedSpotify();

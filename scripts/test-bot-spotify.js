import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testBotSpotify() {
  const url = 'https://open.spotify.com/playlist/0Mm8BTdceIk3XJ1XlRisws?si=df9f82d2d98242c6&pt=35532f41b22c5cf615709774eea0ac94';
  
  // List of search engine and social crawler User-Agents
  const botUserAgents = [
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_patched.html)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Twitterbot/1.0',
    'LinkedInBot/1.0 (Compatible; Mozilla/5.0; Apache-HttpClient)'
  ];

  for (const ua of botUserAgents) {
    console.log(`\n🤖 Testing with User-Agent: "${ua}"`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      console.log(`📡 Response Status: ${res.status}`);
      const html = await res.text();

      // Check if description meta contains tracks
      const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/) ||
                     html.match(/<meta name="description" content="([^"]+)"/) ||
                     html.match(/<meta name="twitter:description" content="([^"]+)"/);
                     
      const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/) ||
                      html.match(/<meta name="twitter:title" content="([^"]+)"/);

      if (ogDesc) {
        console.log(`✅ Success! Playlist description resolved:`);
        console.log(`📝 Description: ${ogDesc[1]}`);
        if (ogTitle) console.log(`🎵 Title: ${ogTitle[1]}`);
        
        // Save the successful response
        const outPath = path.join(__dirname, '..', 'public', 'spotify_bot_success.html');
        fs.writeFileSync(outPath, html, 'utf-8');
        break; // Successfully got it! Stop querying others
      } else {
        console.log('❌ Metadata not resolved in raw HTML response.');
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
}

testBotSpotify();

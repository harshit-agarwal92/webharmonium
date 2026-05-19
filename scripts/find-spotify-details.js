import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findSpotifyDetails() {
  const rootDir = path.join(__dirname, '..');
  const htmlPath = path.join(rootDir, 'public', 'spotify_bot_success.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('File does not exist!');
    return;
  }
  
  const html = fs.readFileSync(htmlPath, 'utf-8');
  console.log('🔍 Locating exact occurrences of track IDs...');
  
  // List of target track IDs found in meta tags
  const ids = [
    '0cIA4bUqEKOSxJGudhEUlc',
    '2tva3nN2kQhBjHMC7Zlty6',
    '6Wuj97Iy5tDUCng1PX9x5H',
    '0tE7G1E9Mc2Eo5ZUIfKQbo'
  ];

  for (const id of ids) {
    console.log(`\n📌 Scanning ID: "${id}"`);
    let idx = -1;
    let occurrences = 0;
    while ((idx = html.indexOf(id, idx + 1)) !== -1) {
      occurrences++;
      const start = Math.max(0, idx - 100);
      const end = Math.min(html.length, idx + 150);
      const context = html.substring(start, end);
      console.log(`  Occur #${occurrences} at index ${idx}:`);
      console.log('  ----------------------------------------');
      console.log(`  ${context.trim().replace(/\n/g, ' ')}`);
      console.log('  ----------------------------------------');
    }
  }
}

findSpotifyDetails();

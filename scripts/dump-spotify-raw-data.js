import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function dumpSpotifyRawData() {
  const rootDir = path.join(__dirname, '..');
  const htmlPath = path.join(rootDir, 'public', 'spotify_bot_success.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('File does not exist!');
    return;
  }
  
  const html = fs.readFileSync(htmlPath, 'utf-8');
  console.log('🔍 Dumping context around /track/ matches...');
  
  const regex = /\/track\/([a-zA-Z0-9]+)/g;
  let match;
  let count = 0;
  
  while ((match = regex.exec(html)) !== null && count < 10) {
    const idx = match.index;
    const start = Math.max(0, idx - 100);
    const end = Math.min(html.length, idx + 150);
    const context = html.substring(start, end);
    console.log(`\n📌 Match #${count + 1} at index ${idx}:`);
    console.log('--------------------------------------------------');
    console.log(context);
    console.log('--------------------------------------------------');
    count++;
  }
}

dumpSpotifyRawData();

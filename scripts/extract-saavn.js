import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIG
const DEFAULT_QUERIES = [
  'Arijit Singh Hits',
  'Diljit Dosanjh',
  'Sidhu Moose Wala',
  'Pritam Hits',
  'Badshah',
  'Justin Bieber',
  'The Weeknd',
  'Shreya Ghoshal',
  'Honey Singh',
  'Atif Aslam',
  'A.R. Rahman',
  'Kishore Kumar Classics',
  'Lata Mangeshkar Gold',
  'Trending Bollywood',
  'Latest Punjabi 2026'
];

async function fetchJsonWithHeader(url, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// Download file helper
async function downloadFile(url, destPath) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
  const fileStream = fs.createWriteStream(destPath);
  const reader = response.body.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fileStream.write(Buffer.from(value));
  }
  fileStream.end();
}

async function startExtraction() {
  console.log('\x1b[35m%s\x1b[0m', '==================================================');
  console.log('\x1b[36m%s\x1b[0m', '    JIOSAAVN DIRECT HIGH-FIDELITY MUSIC EXTRACTOR  ');
  console.log('\x1b[35m%s\x1b[0m', '==================================================');
  
  const args = process.argv.slice(2);
  const shouldDownload = args.includes('--download');
  const customQueryIndex = args.indexOf('--query');
  const userQueries = customQueryIndex !== -1 && args[customQueryIndex + 1] 
    ? [args[customQueryIndex + 1]] 
    : DEFAULT_QUERIES;

  console.log(`\x1b[90mExecuting targeted scan across ${userQueries.length} query vectors directly on JioSaavn servers...\x1b[0m\n`);
  
  const songsDatabase = [];
  const seenIds = new Set();

  for (const query of userQueries) {
    console.log(`🔍 Vector Search: \x1b[33m"${query}"\x1b[0m`);
    try {
      const autocompleteUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`;
      const searchRes = await fetchJsonWithHeader(autocompleteUrl);
      
      const songsList = searchRes?.songs?.data || [];
      if (songsList.length === 0) {
        console.log(`   \x1b[90mNo tracks found in autocomplete search for "${query}".\x1b[0m`);
        continue;
      }

      console.log(`   Found ${songsList.length} items. Fetching secure media tunnels...`);
      let extractedCount = 0;

      for (const item of songsList) {
        if (!item.id || seenIds.has(item.id)) continue;

        try {
          // 1. Get exact song details
          const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${item.id}`;
          const detailRes = await fetchJsonWithHeader(detailUrl);
          const songDetail = Object.values(detailRes)[0];
          
          if (!songDetail) continue;

          // 2. Resolve best encrypted url
          const encUrl = songDetail.encrypted_media_url || songDetail.encrypted_drm_media_url;
          if (!encUrl) continue;

          // 3. Request authenticated CDN streaming url (320kbps quality)
          const authUrl = `https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&_format=json&_marker=0&cc=in&bitrate=320&url=${encodeURIComponent(encUrl)}`;
          const tokenRes = await fetchJsonWithHeader(authUrl);

          if (tokenRes.status === 'success' && tokenRes.auth_url) {
            // Clean up and upscale cover art to 500x500 premium size
            let hiresImage = songDetail.image || item.image;
            if (hiresImage) {
              hiresImage = hiresImage.replace('150x150', '500x500').replace('50x50', '500x500');
            }

            // Unescape HTML entities in title/name
            const cleanName = (songDetail.song || item.title || 'Unknown Song')
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/&#039;/g, "'");

            const songData = {
              id: item.id,
              name: cleanName,
              artist: songDetail.singers || songDetail.primary_artists || item.more_info?.primary_artists || 'JioSaavn Artist',
              album: songDetail.album || item.album || 'Single',
              image: hiresImage,
              url: tokenRes.auth_url,
              source: 'saavn',
              duration: songDetail.duration ? parseInt(songDetail.duration) : null
            };

            seenIds.add(item.id);
            songsDatabase.push(songData);
            extractedCount++;
          }
        } catch (songErr) {
          // Skip individual track failures silently
        }
      }
      
      console.log(`   \x1b[32m[SUCCESS] Extracted ${extractedCount} direct audio tracks!\x1b[0m`);
    } catch (err) {
      console.log(`   \x1b[31m[FAILED] Failed query vector "${query}": ${err.message}\x1b[0m`);
    }
  }

  // Deduplicate and filter duplicates
  console.log(`\n\x1b[35m--------------------------------------------------\x1b[0m`);
  console.log(`\x1b[32m✓ Bulk Extraction Completed! Unique tracks resolved: ${songsDatabase.length}\x1b[0m`);
  
  // Write to json file
  const rootDir = path.join(__dirname, '..');
  const dbPath = path.join(rootDir, 'extracted_songs.json');
  fs.writeFileSync(dbPath, JSON.stringify(songsDatabase, null, 2), 'utf-8');
  console.log(`💾 Saved high-fidelity metadata catalog to: \x1b[36m"${dbPath}"\x1b[0m`);

  // Optional: download top local audio files to public/
  if (shouldDownload && songsDatabase.length > 0) {
    const downloadLimit = Math.min(5, songsDatabase.length);
    const downloadQueue = songsDatabase.slice(0, downloadLimit);
    console.log(`\n📥 Downloading top ${downloadLimit} tracks directly to offline public cache...`);
    
    const publicDir = path.join(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    for (const song of downloadQueue) {
      const sanitizedName = song.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const destFile = path.join(publicDir, `${sanitizedName}.mp3`);
      
      console.log(`   Downloading: "${song.name}" -> \x1b[90m${destFile}\x1b[0m`);
      try {
        await downloadFile(song.url, destFile);
        console.log(`   \x1b[32m✓ Saved offline!\x1b[0m`);
      } catch (err) {
        console.log(`   \x1b[31m✗ Download failed: ${err.message}\x1b[0m`);
      }
    }
  }

  console.log(`\n\x1b[35m==================================================\x1b[0m`);
  console.log(`\x1b[33mTip:\x1b[0m To run this background extractor with direct offline downloads, run:`);
  console.log(`\x1b[36mnode scripts/extract-saavn.js --download\x1b[0m`);
  console.log(`\x1b[35m==================================================\x1b[0m\n`);
}

startExtraction().catch(err => {
  console.error('\x1b[31mFatal extraction failure:\x1b[0m', err);
});

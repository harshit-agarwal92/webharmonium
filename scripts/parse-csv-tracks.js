import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function parseCSVTracks() {
  const rootDir = path.join(__dirname, '..');
  const csvPath = path.join(rootDir, 'public', 'My Spotify Library (1).csv');
  const extractedTracksPath = path.join(rootDir, 'public', 'spotify_extracted_tracks.json');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    return;
  }

  // Read existing extracted tracks to preserve previewUrls and durations
  let existingTracksMap = new Map();
  if (fs.existsSync(extractedTracksPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(extractedTracksPath, 'utf-8'));
      existing.forEach((track) => {
        if (track.spotifyUri) {
          existingTracksMap.set(track.spotifyUri, track);
        }
      });
      console.log(`Loaded ${existingTracksMap.size} existing extracted tracks to preserve metadata.`);
    } catch (e) {
      console.warn('⚠️ Warning: Existing extracted tracks file is corrupt or empty.', e.message);
    }
  }

  // Parse CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    console.error('❌ CSV file has no data rows.');
    return;
  }

  const header = parseCSVLine(lines[0]);
  console.log('CSV Headers:', header);

  // Map headers to indexes
  const trackNameIdx = header.findIndex(h => h.toLowerCase().includes('track name'));
  const artistNameIdx = header.findIndex(h => h.toLowerCase().includes('artist name'));
  const albumIdx = header.findIndex(h => h.toLowerCase().includes('album'));
  const spotifyIdIdx = header.findIndex(h => h.toLowerCase().includes('spotify - id'));

  if (trackNameIdx === -1 || artistNameIdx === -1 || spotifyIdIdx === -1) {
    console.error('❌ Could not find required columns in CSV (Track name, Artist name, Spotify - id)');
    return;
  }

  const parsedTracks = [];
  let index = 1;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < header.length) {
      continue;
    }

    const title = row[trackNameIdx].trim();
    const artists = row[artistNameIdx].trim();
    const spotifyId = row[spotifyIdIdx].trim();

    if (!title || !artists || !spotifyId) {
      continue;
    }

    const spotifyUri = `spotify:track:${spotifyId}`;
    
    // Check if we already have detailed metadata for this track
    const existing = existingTracksMap.get(spotifyUri);

    parsedTracks.push({
      index: index++,
      title: title,
      artists: artists,
      durationMs: existing ? existing.durationMs : 180000,
      durationText: existing ? existing.durationText : '3:00',
      previewUrl: existing ? existing.previewUrl : null,
      spotifyUri: spotifyUri
    });
  }

  console.log(`Parsed ${parsedTracks.length} tracks from CSV successfully!`);

  // Write back to public/spotify_extracted_tracks.json
  fs.writeFileSync(extractedTracksPath, JSON.stringify(parsedTracks, null, 2), 'utf-8');
  console.log(`🎉 Saved ${parsedTracks.length} tracks to: ${extractedTracksPath}`);
}

parseCSVTracks().catch((err) => {
  console.error('❌ Error parsing CSV tracks:', err);
});

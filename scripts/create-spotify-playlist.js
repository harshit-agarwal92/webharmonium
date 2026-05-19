import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generatePlaylistJson() {
  const rootDir = path.join(__dirname, '..');
  const extractedPath = path.join(rootDir, 'public', 'spotify_extracted_tracks.json');
  const databasePath = path.join(rootDir, 'extracted_songs.json');
  const outputPath = path.join(rootDir, 'public', 'spotify_playlist.json');

  if (!fs.existsSync(extractedPath)) {
    console.error('❌ Spotify extracted tracks file not found!');
    return;
  }
  if (!fs.existsSync(databasePath)) {
    console.error('❌ Music database extracted_songs.json not found!');
    return;
  }

  const spotifySourceList = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
  const masterDatabase = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));

  console.log(`📖 Compiling playlist from ${spotifySourceList.length} source tracks...`);

  const compiledPlaylist = [];
  let foundCount = 0;
  let fallbackCount = 0;

  spotifySourceList.forEach((sourceTrack) => {
    // Find the resolved song in our master database
    const resolvedSong = masterDatabase.find(
      (song) =>
        song.name.toLowerCase().trim() === sourceTrack.title.toLowerCase().trim() &&
        (song.artist.toLowerCase().includes(sourceTrack.artists.split(',')[0].toLowerCase().trim()) || 
         sourceTrack.artists.toLowerCase().includes(song.artist.split(',')[0].toLowerCase().trim()))
    );

    if (resolvedSong) {
      compiledPlaylist.push({
        ...resolvedSong,
        spotifyUri: sourceTrack.spotifyUri
      });
      foundCount++;
    } else {
      // Fallback
      const spotifyId = sourceTrack.spotifyUri.split(':')[2] || Math.random().toString(36).substring(7);
      compiledPlaylist.push({
        id: `spotify_${spotifyId}`,
        name: sourceTrack.title,
        artist: sourceTrack.artists,
        album: 'Sad🥺❤️ Playlist',
        image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop',
        url: sourceTrack.previewUrl || 'https://p.scdn.co/mp3-preview/a91df7976e107df6c41b8a5b28e6c5c56436a40a',
        source: 'spotify',
        duration: Math.round(sourceTrack.durationMs / 1000) || 180,
        spotifyUri: sourceTrack.spotifyUri
      });
      fallbackCount++;
    }
  });

  fs.writeFileSync(outputPath, JSON.stringify(compiledPlaylist, null, 2), 'utf-8');
  console.log(`\n✅ Playlist compiled successfully!`);
  console.log(`🎵 Resolved high-fidelity JioSaavn items: ${foundCount}`);
  console.log(`🎵 Direct Spotify Preview CDN fallbacks: ${fallbackCount}`);
  console.log(`📦 Written exactly ${compiledPlaylist.length} tracks to: "${outputPath}"\n`);
}

generatePlaylistJson();

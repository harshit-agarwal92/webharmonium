const fs = require('fs');
const path = require('path');

const playlistPath = path.join(__dirname, '..', 'public', 'spotify_playlist.json');

if (fs.existsSync(playlistPath)) {
  const data = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
  let modified = false;

  const newData = data.map(song => {
    let changed = false;
    
    if (typeof song.playCount === 'undefined') {
      song.playCount = Math.floor(Math.random() * 5000000) + 10000;
      changed = true;
    }
    
    if (typeof song.uploadDate === 'undefined') {
      const start = new Date(2022, 0, 1).getTime();
      const end = new Date().getTime();
      song.uploadDate = new Date(start + Math.random() * (end - start)).toISOString();
      changed = true;
    }
    
    if (typeof song.trendingScore === 'undefined') {
      song.trendingScore = parseFloat((Math.random() * 10).toFixed(1));
      changed = true;
    }
    
    if (typeof song.artistPopularity === 'undefined') {
      song.artistPopularity = Math.floor(Math.random() * 100);
      changed = true;
    }

    if (changed) modified = true;
    return song;
  });

  if (modified) {
    fs.writeFileSync(playlistPath, JSON.stringify(newData, null, 2), 'utf-8');
    console.log('Seeded missing metadata fields to spotify_playlist.json');
  } else {
    console.log('No missing metadata found. Database is up to date.');
  }
} else {
  console.log('Playlist file not found.');
}

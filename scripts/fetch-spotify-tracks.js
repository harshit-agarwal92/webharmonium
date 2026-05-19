import fs from 'fs';
import path from 'path';

async function fetchSpotifyTracks() {
  try {
    console.log("Requesting anonymous access token from Spotify with custom headers...");
    
    const tokenRes = await fetch("https://open.spotify.com/get_access_token?Reason=transport&productType=web_player", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "App-Platform": "WebPlayer",
        "Spotify-App-Version": "1.2.22.0",
        "Origin": "https://open.spotify.com",
        "Referer": "https://open.spotify.com/"
      }
    });
    
    if (!tokenRes.ok) {
      throw new Error(`Token request failed with status: ${tokenRes.status} ${tokenRes.statusText}`);
    }
    
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.accessToken;
    console.log(`🎉 SUCCESS! Got token: ${accessToken.substring(0, 20)}...`);
    
    // Now let's fetch all tracks!
    const playlistId = '0Mm8BTdceIk3XJ1XlRisws';
    let allTracks = [];
    let offset = 0;
    let limit = 100;
    let total = Infinity;
    
    console.log(`Starting download of tracks for playlist ${playlistId}...`);
    
    while (offset < total) {
      console.log(`Downloading tracks ${offset} to ${offset + limit}...`);
      const apiRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&additional_types=track`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json"
        }
      });
      
      if (!apiRes.ok) {
        throw new Error(`Tracks request failed with status: ${apiRes.status}`);
      }
      
      const apiData = await apiRes.json();
      total = apiData.total;
      
      for (const item of apiData.items) {
        if (item.track) {
          allTracks.push({
            id: item.track.id || `spotify-${allTracks.length}`,
            name: item.track.name,
            artist: item.track.artists.map((a) => a.name).join(", "),
            album: item.track.album?.name || 'Unknown Album',
            image: item.track.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500',
            duration: item.track.duration_ms,
            source: 'spotify'
          });
        }
      }
      
      offset += limit;
      await new Promise(r => setTimeout(r, 200)); // be nice to the API
    }
    
    console.log(`Successfully extracted ${allTracks.length} tracks in total!`);
    
    // Save to public/spotify_playlist.json
    const outputPath = path.join(process.cwd(), 'public', 'spotify_playlist.json');
    fs.writeFileSync(outputPath, JSON.stringify(allTracks, null, 2));
    console.log(`Saved all ${allTracks.length} tracks to ${outputPath}`);
    
  } catch (error) {
    console.error("❌ Failed direct Spotify bypass:", error.message);
  }
}

fetchSpotifyTracks();


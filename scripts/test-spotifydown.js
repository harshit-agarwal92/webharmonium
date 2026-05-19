async function checkSpotifyDown() {
  try {
    const playlistId = '0Mm8BTdceIk3XJ1XlRisws';
    console.log(`Checking SpotifyDown metadata API for playlist ${playlistId}...`);
    
    // SpotifyDown usually has an endpoint at /metadata/playlist/:id
    const res = await fetch(`https://api.spotifydown.com/metadata/playlist/${playlistId}`, {
      headers: {
        "Origin": "https://spotifydown.com",
        "Referer": "https://spotifydown.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed with status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Successfully got response from SpotifyDown!");
    console.log("Response keys:", Object.keys(data));
    console.log("Playlist title:", data.title);
    console.log("Tracks array length:", data.tracks?.length);
    
    if (data.success && data.id) {
      // It has another endpoint to fetch track list
      console.log("Querying tracks list...");
      const tracksRes = await fetch(`https://api.spotifydown.com/trackList/playlist/${playlistId}`, {
        headers: {
          "Origin": "https://spotifydown.com",
          "Referer": "https://spotifydown.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const tracksData = await tracksRes.json();
      console.log("Tracks response success:", tracksData.success);
      console.log("Tracks count:", tracksData.trackList?.length);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkSpotifyDown();

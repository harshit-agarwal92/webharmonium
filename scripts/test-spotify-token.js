async function testToken() {
  try {
    console.log("Fetching anonymous web player access token from Spotify...");
    const res = await fetch("https://open.spotify.com/get_access_token?Reason=transport&productType=web_player", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://open.spotify.com/playlist/0Mm8BTdceIk3XJ1XlRisws"
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch access token: Status ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Access token retrieved successfully!");
    console.log("Token sample:", data.accessToken.substring(0, 15) + "...");
    
    // Now let's try querying the Spotify API for the first page of tracks
    console.log("Querying first 5 tracks using Spotify Web API...");
    const apiRes = await fetch("https://api.spotify.com/v1/playlists/0Mm8BTdceIk3XJ1XlRisws/tracks?limit=5", {
      headers: {
        "Authorization": `Bearer ${data.accessToken}`,
        "Accept": "application/json"
      }
    });
    
    if (!apiRes.ok) {
      throw new Error(`API query failed: Status ${apiRes.status}`);
    }
    
    const apiData = await apiRes.json();
    console.log("Total tracks in playlist:", apiData.total);
    console.log("First track:", apiData.items[0]?.track?.name, "by", apiData.items[0]?.track?.artists?.map(a => a.name).join(", "));
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

testToken();

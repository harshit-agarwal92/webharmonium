import https from 'https';

function fetchHttps(url, headers = {}) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTPS Request failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (err) => { reject(err); });
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function run() {
  try {
    console.log("Fetching Spotify Token...");
    const tokenUrl = "https://open.spotify.com/get_access_token?Reason=transport&productType=web_player";
    const tokenResText = await fetchHttps(tokenUrl, {
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "App-Platform": "WebPlayer",
      "Spotify-App-Version": "1.2.22.0",
      "Origin": "https://open.spotify.com",
      "Referer": "https://open.spotify.com/"
    });
    const tokenData = JSON.parse(tokenResText);
    const token = tokenData.accessToken;
    console.log("Acquired Spotify Token successfully!");

    const playlistId = '0Mm8BTdceIk3XJ1XlRisws';
    let offset = 0;
    let limit = 100;
    let total = Infinity;
    let page = 1;
    let allTracks = [];

    while (offset < total && page <= 25) {
      console.log(`Fetching page ${page} (offset: ${offset})...`);
      const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&additional_types=track`;
      const apiResText = await fetchHttps(apiUrl, {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      });
      const apiData = JSON.parse(apiResText);

      if (apiData && apiData.items) {
        total = apiData.total || total;
        console.log(`Found ${apiData.items.length} tracks in this page. Total: ${total}`);
        allTracks = [...allTracks, ...apiData.items];
        offset += limit;
        page++;
      } else {
        break;
      }
    }

    console.log(`Done! Fetched ${allTracks.length} tracks total.`);
  } catch (e) {
    console.error("Error:", e);
  }
}

run();

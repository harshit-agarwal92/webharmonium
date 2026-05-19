import fs from 'fs';
import path from 'path';

async function inspectHtml() {
  try {
    const playlistId = '0Mm8BTdceIk3XJ1XlRisws';
    console.log("Downloading Spotify HTML to inspect...");
    
    const res = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const html = await res.text();
    
    console.log("HTML downloaded successfully, length:", html.length);
    
    // Look for any script tags containing application/json
    const scriptMatches = html.matchAll(/<script id="(.*?)" type="application\/json">(.*?)<\/script>/g);
    for (const match of scriptMatches) {
      console.log("Found JSON script tag with id:", match[1]);
      if (match[2].includes("token") || match[2].includes("Token") || match[1] === "session") {
        console.log("This script tag might contain our token! Snippet:");
        console.log(match[2].substring(0, 500));
      }
    }
    
    // Let's also look for any string that looks like a token
    const tokenRegexes = [
      /"accessToken":"(.*?)"/,
      /"token":"(.*?)"/,
      /accessToken":"(.*?)"/,
      /token":"(.*?)"/
    ];
    
    for (const regex of tokenRegexes) {
      const tokenMatch = html.match(regex);
      if (tokenMatch) {
        console.log("Found token via regex:", regex, tokenMatch[1].substring(0, 20) + "...");
      }
    }
    
    // Write a portion of the HTML to a file so we can look at it if needed
    fs.writeFileSync(path.join(process.cwd(), 'scripts', 'spotify_dump.html'), html.substring(0, 50000));
    console.log("Wrote first 50k characters of HTML to scripts/spotify_dump.html for inspection.");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

inspectHtml();

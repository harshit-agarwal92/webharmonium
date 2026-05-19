import fs from 'fs';
import path from 'path';

async function fetchEmbedTracks() {
  try {
    const playlistId = '0Mm8BTdceIk3XJ1XlRisws';
    console.log(`Fetching Spotify embed page for playlist ${playlistId}...`);
    
    const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`);
    if (!res.ok) throw new Error(`Failed to fetch embed HTML: ${res.status}`);
    
    const html = await res.text();
    
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/) || 
                  html.match(/<script id="resource" type="application\/json">(.*?)<\/script>/) ||
                  html.match(/<script id="initial-state" type="application\/json">(.*?)<\/script>/);
                  
    if (!match || !match[1]) {
      console.log("Could not find standard state blocks. Found JSON-like instead?");
      return;
    }
    
    const data = JSON.parse(match[1]);
    
    // Traverse the Next.js page props to find the entity data
    const pageProps = data.props?.pageProps || {};
    const state = pageProps.state || {};
    const entity = state.data?.entity || pageProps.entity || {};
    
    const trackList = entity.trackList || [];
    console.log(`Found ${trackList.length} tracks in the embed payload.`);
    
    if (trackList.length > 0) {
      console.log("Sample track 1:", trackList[0].title, "-", trackList[0].subtitle);
      if (trackList.length >= 100) {
        console.log("WARNING: The embed player might be limiting the tracklist to 100 tracks.");
      }
    } else {
      console.log("Tracklist array is empty or path is incorrect. Let's inspect the entity keys:", Object.keys(entity));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchEmbedTracks();

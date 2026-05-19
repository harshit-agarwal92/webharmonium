async function testOEmbed() {
  const playlistUrl = 'https://open.spotify.com/playlist/0Mm8BTdceIk3XJ1XlRisws';
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(playlistUrl)}`;
  
  console.log(`🔗 Querying oEmbed API: ${oembedUrl}`);
  try {
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log(`📡 Response Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log('✅ oEmbed Data resolved successfully!');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Failed to fetch oEmbed:', await res.text());
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testOEmbed();

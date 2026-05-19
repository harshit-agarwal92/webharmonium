async function listFiles() {
  try {
    console.log("Fetching GitHub directory page to list files...");
    const res = await fetch("https://github.com/nbrosowsky/tonejs-instruments/tree/master/samples/harmonium");
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    
    const html = await res.text();
    // Match any links to raw files in the repository
    const matches = html.matchAll(/href="\/nbrosowsky\/tonejs-instruments\/blob\/master\/samples\/harmonium\/(.*?)"/g);
    const files = new Set();
    for (const match of matches) {
      if (match[1]) files.add(match[1]);
    }
    
    console.log("Files found in harmonium folder:");
    console.log(Array.from(files).sort());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listFiles();

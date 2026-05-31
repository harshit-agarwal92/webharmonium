const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Add handleDownload
content = content.replace(
  'const handlePlaySong = async',
  'const handleDownload = React.useCallback((song: any, e: React.MouseEvent) => {}, []);\n  const handlePlaySong = React.useCallback(async'
);

// Wrap handlePlaySong in useCallback
content = content.replace(
  /const handlePlaySong = React\.useCallback\(async \(song: any, contextQueue: any\[\]\) => \{[\s\S]*?setTimeout\(\(\) => playBackgroundTrack\(playUrl, song\.name, song\.artist\), 150\);\n  \};/,
  (match) => {
    // Ensure it ends with `}, [deps]);`
    return match.replace(/\};$/, '}, [user, playBackgroundTrack, setIsPlayerExpanded, setQueue, setCurrentTrack]);');
  }
);

// Wrap toggleFavorite in useCallback
content = content.replace(
  /const toggleFavorite = \(song: any, e\?: React\.MouseEvent\) => \{[\s\S]*?return newFavs;\n    \}\);\n  \};/,
  (match) => {
    let updated = match.replace('const toggleFavorite = (song: any, e?: React.MouseEvent) => {', 'const toggleFavorite = React.useCallback((song: any, e?: React.MouseEvent) => {');
    updated = updated.replace(/\};$/, '}, []);');
    return updated;
  }
);

// Replace all PremiumMusicCard renderings
content = content.replace(
  /<PremiumMusicCard[\s\S]*?onClick=\{\(\) => handlePlaySong\(song, (.*?)\)\}[\s\S]*?\/>/g,
  (match, queueName) => {
    return match
      .replace(/onClick=\{.*?\}/, `contextQueue={${queueName}}\n                            onClick={handlePlaySong}`)
      .replace(/onFav=\{.*?\}/, 'onFav={toggleFavorite}')
      .replace(/onDl=\{.*?\}/, 'onDl={handleDownload}');
  }
);

// For searchResults, handlePlaySong might have (song, searchResults)
// Oh, the regex (.*?) will capture it.

// Add Dynamic import for AuthModal
content = content.replace(
  "import AuthModal from '@/components/AuthModal';",
  "import dynamic from 'next/dynamic';\nconst AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false });"
);

// Dynamic VirtualHarmonium
content = content.replace(
  "import { VirtualHarmonium } from '@/components/muse/VirtualHarmonium';",
  "const VirtualHarmonium = dynamic(() => import('@/components/muse/VirtualHarmonium').then(mod => mod.VirtualHarmonium), { ssr: false });"
);

// Virtualized list for Memories
// We will use a chunked approach or just a simple slice since it's 600 items.
// Better yet, use a simple 'visibleCount' state.

fs.writeFileSync('src/app/page.tsx', content);
console.log('Updated page.tsx successfully');

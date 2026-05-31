const fs = require('fs');
const files = ['e:/webharmonium/src/app/page.tsx', 'e:/webharmonium/src/app/music/page.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  // 1. Replace State declarations
  content = content.replace(
    /const \[trendingSongs, setTrendingSongs\][\s\S]*?const \[loadingFeeds, setLoadingFeeds\] = useState\(true\);/,
    `// Dynamic Discovery States
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [trendingOffset, setTrendingOffset] = useState(0);

  const [topCharts, setTopCharts] = useState([]);
  const [chartsOffset, setChartsOffset] = useState(0);

  const [newReleases, setNewReleases] = useState([]);
  const [newReleasesOffset, setNewReleasesOffset] = useState(0);

  const [popularArtists, setPopularArtists] = useState([]);
  const [artistsOffset, setArtistsOffset] = useState(0);

  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [recentlyAddedOffset, setRecentlyAddedOffset] = useState(0);

  const [recommended, setRecommended] = useState([]);
  const [recommendedOffset, setRecommendedOffset] = useState(0);

  const [azSongs, setAzSongs] = useState([]);
  const [azOffset, setAzOffset] = useState(0);
  const [activeLetter, setActiveLetter] = useState('');

  const [loadingFeeds, setLoadingFeeds] = useState(true);

  const fetchCategory = async (category, offset, letter = '') => {
    try {
      const res = await fetch(\`/api/database?category=\${category}&offset=\${offset}&limit=8&letter=\${letter}\`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const handleLoadMore = async (category) => {
    if (category === 'trending') {
      const more = await fetchCategory('trending', trendingOffset + 8);
      setTrendingSongs(prev => [...prev, ...more]);
      setTrendingOffset(prev => prev + 8);
    } else if (category === 'charts') {
      const more = await fetchCategory('charts', chartsOffset + 8);
      setTopCharts(prev => [...prev, ...more]);
      setChartsOffset(prev => prev + 8);
    } else if (category === 'new') {
      const more = await fetchCategory('new', newReleasesOffset + 8);
      setNewReleases(prev => [...prev, ...more]);
      setNewReleasesOffset(prev => prev + 8);
    } else if (category === 'artists') {
      const more = await fetchCategory('artists', artistsOffset + 8);
      setPopularArtists(prev => [...prev, ...more]);
      setArtistsOffset(prev => prev + 8);
    } else if (category === 'recently_added') {
      const more = await fetchCategory('recently_added', recentlyAddedOffset + 8);
      setRecentlyAdded(prev => [...prev, ...more]);
      setRecentlyAddedOffset(prev => prev + 8);
    } else if (category === 'recommended') {
      const more = await fetchCategory('recommended', recommendedOffset + 8);
      setRecommended(prev => [...prev, ...more]);
      setRecommendedOffset(prev => prev + 8);
    } else if (category === 'az') {
      const more = await fetchCategory('az', azOffset + 8, activeLetter);
      setAzSongs(prev => [...prev, ...more]);
      setAzOffset(prev => prev + 8);
    }
  };`
  );

  // 2. Replace fetchAllFeeds
  // We match from "const fetchAllFeeds =" until "};" taking care of multi-lines carefully
  content = content.replace(
    /const fetchAllFeeds = async \(\) => \{[\s\S]*?^\s*\};\n/m,
    `const fetchAllFeeds = async () => {
    setLoadingFeeds(true);
    try {
      const [trend, charts, newR, artists, recent, rec] = await Promise.all([
        fetchCategory('trending', 0),
        fetchCategory('charts', 0),
        fetchCategory('new', 0),
        fetchCategory('artists', 0),
        fetchCategory('recently_added', 0),
        fetchCategory('recommended', 0)
      ]);
      setTrendingSongs(trend);
      setTopCharts(charts);
      setNewReleases(newR);
      setPopularArtists(artists);
      setRecentlyAdded(recent);
      setRecommended(rec);
      if (queue.length === 0 && trend.length > 0) setQueue(trend);
    } catch (e) {
      console.error("Failed to fetch feeds:", e);
    } finally {
      setLoadingFeeds(false);
    }
  };

  useEffect(() => {
    if (activeLetter) {
      setAzOffset(0);
      fetchCategory('az', 0, activeLetter).then(res => setAzSongs(res));
    }
  }, [activeLetter]);
`
  );

  // 3. Trending Hits replacement
  content = content.replace(
    /items=\{trendingSongs\}[\s\S]*?onLoadMore=\{[\s\S]*?\}\n\s*\/>/m,
    `items={trendingSongs}
                        onReload={fetchAllFeeds}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            onClick={() => handlePlaySong(song, trendingSongs)} 
                            onFav={(e) => toggleFavorite(song, e)} 
                            onDl={() => {}} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('trending')}
                      />`
  );

  // 4. Featured Charts replacement -> Top Charts & Popular Artists
  content = content.replace(
    /title="Featured Charts"[\s\S]*?onLoadMore=\{.*?\}\s*\/>/m,
    `title="Top Charts" 
                        badge="JIOSAAVN"
                        icon={<Star className="w-4 h-4 text-[#EC4899]" />}
                        loading={loadingFeeds}
                        items={topCharts}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            onClick={() => handlePlaySong(song, topCharts)} 
                            onFav={(e) => toggleFavorite(song, e)} 
                            onDl={() => {}} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('charts')}
                      />
                      
                      <MusicCarousel 
                        title="Popular Artists" 
                        badge="MASTI"
                        loading={loadingFeeds}
                        items={popularArtists}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            onClick={() => handlePlaySong(song, popularArtists)} 
                            onFav={(e) => toggleFavorite(song, e)} 
                            onDl={() => {}} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('artists')}
                      />`
  );

  // 5. Recommended For You
  content = content.replace(
    /title="Recommended For You"[\s\S]*?onLoadMore=\{[\s\S]*?\}\n\s*\/>/m,
    `title="Recommended For You" 
                        badge="AI PICK"
                        loading={loadingFeeds}
                        items={recommended}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            onClick={() => handlePlaySong(song, recommended)} 
                            onFav={(e) => toggleFavorite(song, e)} 
                            onDl={() => {}} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('recommended')}
                      />`
  );

  // 6. New Releases
  content = content.replace(
    /title="New Releases"[\s\S]*?onLoadMore=\{[\s\S]*?\}\n\s*\/>/m,
    `title="New Releases" 
                        badge="NEW"
                        loading={loadingFeeds}
                        items={newReleases}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            onClick={() => handlePlaySong(song, newReleases)} 
                            onFav={(e) => toggleFavorite(song, e)} 
                            onDl={() => {}} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('new')}
                      />
                      
                      <MusicCarousel 
                        title="Recently Added" 
                        badge="NEW"
                        loading={loadingFeeds}
                        items={recentlyAdded}
                        renderItem={(song) => (
                          <PremiumMusicCard 
                            song={song} 
                            onClick={() => handlePlaySong(song, recentlyAdded)} 
                            onFav={(e) => toggleFavorite(song, e)} 
                            onDl={() => {}} 
                            isFav={favorites.some(f => f.id === song.id)} 
                            isActive={currentTrack?.id === song.id}
                            isPlaying={isBGActive}
                          />
                        )}
                        onLoadMore={() => handleLoadMore('recently_added')}
                      />`
  );

  // 7. Trending Albums -> A-Z Browse UI
  content = content.replace(
    /<MusicCarousel\s+title="Trending Albums"[\s\S]*?onLoadMore=\{[\s\S]*?\}\n\s*\/>/m,
    `{/* A-Z Browse Section */}
                      <section className="mb-14">
                        <div className="flex flex-col gap-1 mb-6">
                          <h3 className="text-xl font-bold tracking-tight text-white">A-Z Browse</h3>
                          <p className="text-sm text-white/40 font-medium">Filter songs alphabetically</p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar-on-mobile snap-x snap-mandatory px-1">
                          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                            <button
                              key={letter}
                              onClick={() => setActiveLetter(letter)}
                              className={cn(
                                "shrink-0 w-10 h-10 rounded-full font-bold transition-all border snap-center",
                                activeLetter === letter 
                                  ? "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-110"
                                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                        
                        {activeLetter && (
                          <div className="mt-4">
                            <MusicCarousel 
                              title={\`Songs starting with \${activeLetter}\`}
                              badge="MASTI"
                              loading={false}
                              items={azSongs}
                              renderItem={(song) => (
                                <PremiumMusicCard 
                                  song={song} 
                                  onClick={() => handlePlaySong(song, azSongs)} 
                                  onFav={(e) => toggleFavorite(song, e)} 
                                  onDl={() => {}} 
                                  isFav={favorites.some(f => f.id === song.id)} 
                                  isActive={currentTrack?.id === song.id}
                                  isPlaying={isBGActive}
                                />
                              )}
                              onLoadMore={() => handleLoadMore('az')}
                            />
                          </div>
                        )}
                      </section>`
  );

  fs.writeFileSync(file, content, 'utf-8');
}
console.log('Patched frontend successfully!');

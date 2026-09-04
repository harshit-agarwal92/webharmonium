export interface SongResult {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  url?: string;
  source: string;
}

export interface SearchProvider {
  name: string;
  search(query: string, isTrending?: boolean): Promise<SongResult[]>;
}

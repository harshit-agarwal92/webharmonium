export interface SongNote {
  note: string;
  duration: string;
  time: number;
}

export interface Song {
  id: string;
  name: string;
  author?: string;
  difficulty?: string;
  backgroundUrl?: string;
  style?: string;
  notes: SongNote[];
}

export const PRELOADED_SONGS: Song[] = [
  {
    id: 'happy-birthday',
    name: 'Happy Birthday',
    difficulty: 'easy',
    backgroundUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'C4', duration: '4n', time: 0.5 },
      { note: 'D4', duration: '4n', time: 1.0 }, { note: 'C4', duration: '4n', time: 1.5 },
      { note: 'F4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 }
    ]
  },
  {
    id: 'twinkle',
    name: 'Twinkle Twinkle',
    difficulty: 'easy',
    backgroundUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'C4', duration: '4n', time: 0.5 },
      { note: 'G4', duration: '4n', time: 1.0 }, { note: 'G4', duration: '4n', time: 1.5 }
    ]
  },
  {
    id: 'arzkiyajain',
    name: 'Arz Kiya Hai (JioSaavn)',
    difficulty: 'hard',
    backgroundUrl: 'https://aac.saavncdn.com/393/9860c239328a6f3a7f8a7e0d37e3d8f2_320.mp4',
    notes: [
      { note: 'G4', duration: '4n', time: 0 }, { note: 'A4', duration: '4n', time: 0.5 },
      { note: 'G4', duration: '4n', time: 1.0 }, { note: 'E4', duration: '4n', time: 1.5 }
    ]
  }
];

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
    name: 'Happy Birthday (Sargam)',
    difficulty: 'easy',
    backgroundUrl: '/audio/songs/happy_birthday.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'C4', duration: '4n', time: 0.5 },
      { note: 'D4', duration: '4n', time: 1.0 }, { note: 'C4', duration: '4n', time: 1.5 },
      { note: 'F4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 },
      { note: 'C4', duration: '4n', time: 3.5 }, { note: 'C4', duration: '4n', time: 4.0 },
      { note: 'D4', duration: '4n', time: 4.5 }, { note: 'C4', duration: '4n', time: 5.0 },
      { note: 'G4', duration: '4n', time: 5.5 }, { note: 'F4', duration: '4n', time: 6.0 }
    ]
  },
  {
    id: 'twinkle',
    name: 'Twinkle Twinkle',
    difficulty: 'easy',
    backgroundUrl: '/audio/songs/twinkle.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'C4', duration: '4n', time: 0.5 },
      { note: 'G4', duration: '4n', time: 1.0 }, { note: 'G4', duration: '4n', time: 1.5 },
      { note: 'A4', duration: '4n', time: 2.0 }, { note: 'A4', duration: '4n', time: 2.5 },
      { note: 'G4', duration: '4n', time: 3.0 }, { note: 'F4', duration: '4n', time: 4.0 },
      { note: 'F4', duration: '4n', time: 4.5 }, { note: 'E4', duration: '4n', time: 5.0 },
      { note: 'E4', duration: '4n', time: 5.5 }, { note: 'D4', duration: '4n', time: 6.0 },
      { note: 'D4', duration: '4n', time: 6.5 }, { note: 'C4', duration: '4n', time: 7.0 }
    ]
  },
  {
    id: 'kesariya',
    name: 'Kesariya (Brahmastra)',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/kesariya.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'E4', duration: '4n', time: 2.0 }, { note: 'D4', duration: '4n', time: 2.5 },
      { note: 'C4', duration: '4n', time: 3.0 }, { note: 'D4', duration: '4n', time: 3.5 },
      { note: 'E4', duration: '4n', time: 4.0 }, { note: 'F4', duration: '4n', time: 4.5 },
      { note: 'G4', duration: '4n', time: 5.0 }, { note: 'F4', duration: '4n', time: 5.5 },
      { note: 'E4', duration: '4n', time: 6.0 }, { note: 'D4', duration: '4n', time: 6.5 }
    ]
  },
  {
    id: 'tumhiho',
    name: 'Tum Hi Ho',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/tum_hi_ho.mp3',
    notes: [
      { note: 'B3', duration: '4n', time: 0 }, { note: 'C4', duration: '4n', time: 0.5 },
      { note: 'D4', duration: '4n', time: 1.0 }, { note: 'E4', duration: '4n', time: 1.5 },
      { note: 'D4', duration: '4n', time: 2.0 }, { note: 'C4', duration: '4n', time: 2.5 },
      { note: 'B3', duration: '4n', time: 3.0 }, { note: 'C4', duration: '4n', time: 3.5 },
      { note: 'D4', duration: '4n', time: 4.0 }, { note: 'E4', duration: '4n', time: 4.5 },
      { note: 'F4', duration: '4n', time: 5.0 }, { note: 'G4', duration: '4n', time: 5.5 }
    ]
  },
  {
    id: 'tujhmein',
    name: 'Tujh Mein Rab Dikhta Hai',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/tujh_mein_rab.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'D4', duration: '4n', time: 1.5 },
      { note: 'C4', duration: '4n', time: 2.0 }, { note: 'C4', duration: '4n', time: 2.5 },
      { note: 'D4', duration: '4n', time: 3.0 }, { note: 'E4', duration: '4n', time: 3.5 },
      { note: 'F4', duration: '4n', time: 4.0 }, { note: 'G4', duration: '4n', time: 4.5 },
      { note: 'F4', duration: '4n', time: 5.0 }, { note: 'E4', duration: '4n', time: 5.5 }
    ]
  },
  {
    id: 'kalhonaho',
    name: 'Kal Ho Naa Ho',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/kal_ho_na_ho.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'G4', duration: '4n', time: 1.5 },
      { note: 'F4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 },
      { note: 'D4', duration: '4n', time: 3.0 }, { note: 'C4', duration: '4n', time: 3.5 },
      { note: 'B3', duration: '4n', time: 4.0 }, { note: 'C4', duration: '4n', time: 4.5 },
      { note: 'D4', duration: '4n', time: 5.0 }
    ]
  },
  {
    id: 'raghupati',
    name: 'Raghupati Raghav',
    difficulty: 'easy',
    backgroundUrl: '/audio/songs/raghupati.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'E4', duration: '4n', time: 1.5 },
      { note: 'D4', duration: '4n', time: 2.0 }, { note: 'C4', duration: '4n', time: 2.5 },
      { note: 'D4', duration: '4n', time: 3.0 }, { note: 'E4', duration: '4n', time: 3.5 },
      { note: 'F4', duration: '4n', time: 4.0 }, { note: 'F4', duration: '4n', time: 4.5 },
      { note: 'E4', duration: '4n', time: 5.0 }, { note: 'D4', duration: '4n', time: 5.5 }
    ]
  },
  {
    id: 'omjai',
    name: 'Om Jai Jagdish Hare',
    difficulty: 'easy',
    backgroundUrl: '/audio/songs/om_jai.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'C4', duration: '4n', time: 0.5 },
      { note: 'D4', duration: '4n', time: 1.0 }, { note: 'E4', duration: '4n', time: 1.5 },
      { note: 'F4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 },
      { note: 'D4', duration: '4n', time: 3.0 }, { note: 'C4', duration: '4n', time: 3.5 },
      { note: 'D4', duration: '4n', time: 4.0 }, { note: 'E4', duration: '4n', time: 4.5 },
      { note: 'F4', duration: '4n', time: 5.0 }, { note: 'G4', duration: '4n', time: 5.5 }
    ]
  },
  {
    id: 'achyutam',
    name: 'Achyutam Keshavam',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/achyutam.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'F4', duration: '4n', time: 2.5 },
      { note: 'E4', duration: '4n', time: 3.0 }, { note: 'D4', duration: '4n', time: 3.5 },
      { note: 'C4', duration: '4n', time: 4.0 }
    ]
  },
  {
    id: 'vande',
    name: 'Vande Mataram',
    difficulty: 'hard',
    backgroundUrl: '/audio/songs/vande_mataram.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'A4', duration: '4n', time: 2.5 },
      { note: 'B4', duration: '4n', time: 3.0 }, { note: 'C5', duration: '4n', time: 3.5 },
      { note: 'B4', duration: '4n', time: 4.0 }, { note: 'A4', duration: '4n', time: 4.5 },
      { note: 'G4', duration: '4n', time: 5.0 }
    ]
  },
  {
    id: 'nationalanthem',
    name: 'National Anthem',
    difficulty: 'hard',
    backgroundUrl: '/audio/songs/anthem.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'D4', duration: '4n', time: 1.5 },
      { note: 'C4', duration: '4n', time: 2.0 }, { note: 'G4', duration: '4n', time: 2.5 },
      { note: 'A4', duration: '4n', time: 3.0 }, { note: 'G4', duration: '4n', time: 3.5 },
      { note: 'F4', duration: '4n', time: 4.0 }, { note: 'E4', duration: '4n', time: 4.5 }
    ]
  },
  {
    id: 'shivtandav',
    name: 'Shiv Tandav (Basic)',
    difficulty: 'hard',
    backgroundUrl: '/audio/songs/shiv_tandav.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'A4', duration: '4n', time: 2.5 },
      { note: 'B4', duration: '4n', time: 3.0 }, { note: 'C5', duration: '4n', time: 3.5 }
    ]
  },
  {
    id: 'hanuman_chalisa',
    name: 'Hanuman Chalisa (Basic)',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/hanuman.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'F4', duration: '4n', time: 2.5 },
      { note: 'E4', duration: '4n', time: 3.0 }, { note: 'D4', duration: '4n', time: 3.5 },
      { note: 'C4', duration: '4n', time: 4.0 }
    ]
  },
  {
    id: 'pehlanasha',
    name: 'Pehla Nasha',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/pehla_nasha.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'E4', duration: '4n', time: 0.5 },
      { note: 'F4', duration: '4n', time: 1.0 }, { note: 'G4', duration: '4n', time: 1.5 },
      { note: 'F4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 },
      { note: 'D4', duration: '4n', time: 3.0 }, { note: 'C4', duration: '4n', time: 3.5 },
      { note: 'B3', duration: '4n', time: 4.0 }, { note: 'C4', duration: '4n', time: 4.5 }
    ]
  },
  {
    id: 'channamereya',
    name: 'Channa Mereya',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/channa_mereya.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'A4', duration: '4n', time: 2.5 },
      { note: 'G4', duration: '4n', time: 3.0 }, { note: 'F4', duration: '4n', time: 3.5 },
      { note: 'E4', duration: '4n', time: 4.0 }, { note: 'D4', duration: '4n', time: 4.5 },
      { note: 'C4', duration: '4n', time: 5.0 }
    ]
  },
  {
    id: 'janamjanam',
    name: 'Janam Janam',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/janam_janam.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'F4', duration: '4n', time: 2.5 },
      { note: 'E4', duration: '4n', time: 3.0 }, { note: 'D4', duration: '4n', time: 3.5 },
      { note: 'C4', duration: '4n', time: 4.0 }, { note: 'B3', duration: '4n', time: 4.5 }
    ]
  },
  {
    id: 'vaishnavjan',
    name: 'Vaishnav Jan To',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/vaishnav_jan.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'G4', duration: '4n', time: 1.5 },
      { note: 'F4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 },
      { note: 'D4', duration: '4n', time: 3.0 }, { note: 'C4', duration: '4n', time: 3.5 },
      { note: 'B3', duration: '4n', time: 4.0 }
    ]
  },
  {
    id: 'merewatan',
    name: 'Ae Mere Watan Ke Logon',
    difficulty: 'hard',
    backgroundUrl: '/audio/songs/ae_watan.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'A4', duration: '4n', time: 2.5 },
      { note: 'B4', duration: '4n', time: 3.0 }, { note: 'C5', duration: '4n', time: 3.5 },
      { note: 'B4', duration: '4n', time: 4.0 }, { note: 'A4', duration: '4n', time: 4.5 },
      { note: 'G4', duration: '4n', time: 5.0 }, { note: 'F4', duration: '4n', time: 5.5 }
    ]
  },
  {
    id: 'dildiyan',
    name: 'Dil Diyan Gallan',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/dil_diyan.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'F4', duration: '4n', time: 2.5 },
      { note: 'E4', duration: '4n', time: 3.0 }, { note: 'D4', duration: '4n', time: 3.5 }
    ]
  },
  {
    id: 'raabta',
    name: 'Raabta',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/raabta.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'A4', duration: '4n', time: 2.5 },
      { note: 'G4', duration: '4n', time: 3.0 }, { note: 'F4', duration: '4n', time: 3.5 }
    ]
  },
  {
    id: 'jeenelagahoon',
    name: 'Jeene Laga Hoon',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/jeene_laga.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'E4', duration: '4n', time: 0.5 },
      { note: 'F4', duration: '4n', time: 1.0 }, { note: 'G4', duration: '4n', time: 1.5 },
      { note: 'F4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 },
      { note: 'D4', duration: '4n', time: 3.0 }, { note: 'C4', duration: '4n', time: 3.5 }
    ]
  },
  {
    id: 'terabanjaunga',
    name: 'Tera Ban Jaunga',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/tera_ban.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'F4', duration: '4n', time: 2.5 },
      { note: 'E4', duration: '4n', time: 3.0 }
    ]
  },
  {
    id: 'kabira',
    name: 'Kabira',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/kabira.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'G4', duration: '4n', time: 1.5 },
      { note: 'F4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 },
      { note: 'D4', duration: '4n', time: 3.0 }
    ]
  },
  {
    id: 'agartumsaathho',
    name: 'Agar Tum Saath Ho',
    difficulty: 'medium',
    backgroundUrl: '/audio/songs/agar_tum.mp3',
    notes: [
      { note: 'C4', duration: '4n', time: 0 }, { note: 'D4', duration: '4n', time: 0.5 },
      { note: 'E4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'G4', duration: '4n', time: 2.0 }, { note: 'A4', duration: '4n', time: 2.5 },
      { note: 'G4', duration: '4n', time: 3.0 }, { note: 'F4', duration: '4n', time: 3.5 },
      { note: 'E4', duration: '4n', time: 4.0 }
    ]
  },
  {
    id: 'arziyan',
    name: 'Arziyan (Maula Mere Maula)',
    difficulty: 'hard',
    backgroundUrl: '/audio/songs/arziyan.mp3',
    notes: [
      { note: 'D#4', duration: '4n', time: 0 }, { note: 'F4', duration: '4n', time: 0.5 },
      { note: 'D4', duration: '4n', time: 1.0 }, { note: 'F4', duration: '4n', time: 1.5 },
      { note: 'D#4', duration: '4n', time: 2.0 }, { note: 'D#4', duration: '2n', time: 2.5 },
      { note: 'D#4', duration: '4n', time: 3.5 }, { note: 'F4', duration: '4n', time: 4.0 },
      { note: 'D4', duration: '4n', time: 4.5 }, { note: 'G4', duration: '4n', time: 5.0 },
      { note: 'G4', duration: '4n', time: 5.5 }, { note: 'G4', duration: '4n', time: 6.0 },
      { note: 'D4', duration: '4n', time: 6.5 }, { note: 'C4', duration: '4n', time: 7.0 },
      { note: 'C4', duration: '4n', time: 7.5 }, { note: 'A#3', duration: '4n', time: 8.0 },
      { note: 'D4', duration: '4n', time: 8.5 }, { note: 'D#4', duration: '2n', time: 9.0 }
    ]
  },
  {
    id: 'arzkiyajain',
    name: 'Arz Kiya Hai (Anuv Jain)',
    difficulty: 'hard',
    backgroundUrl: '/audio/songs/arz_kiya.mp3',
    notes: [
      { note: 'G4', duration: '4n', time: 0 }, { note: 'A4', duration: '4n', time: 0.5 },
      { note: 'G4', duration: '4n', time: 1.0 }, { note: 'E4', duration: '4n', time: 1.5 },
      { note: 'E4', duration: '4n', time: 2.0 }, { note: 'E4', duration: '4n', time: 2.5 },
      { note: 'E4', duration: '4n', time: 3.0 }, { note: 'F4', duration: '4n', time: 3.5 },
      { note: 'E4', duration: '4n', time: 4.0 }, { note: 'D4', duration: '4n', time: 4.5 },
      { note: 'D4', duration: '4n', time: 5.0 },
      // Ab kya kya...
      { note: 'D4', duration: '4n', time: 6.0 }, { note: 'D4', duration: '4n', time: 6.5 },
      { note: 'E4', duration: '4n', time: 7.0 }, { note: 'D4', duration: '4n', time: 7.5 },
      { note: 'C4', duration: '4n', time: 8.0 }, { note: 'C4', duration: '4n', time: 8.5 },
      { note: 'C4', duration: '4n', time: 9.0 }, { note: 'C4', duration: '4n', time: 9.5 },
      { note: 'D4', duration: '4n', time: 10.0 }, { note: 'A#3', duration: '4n', time: 10.5 }
    ]
  }
];

export const RADIX_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const NOTES = [
  { note: 'C', sargam: 'Sa', type: 'white', num: '1' },
  { note: 'C#', sargam: 're', type: 'black', num: '1#' },
  { note: 'D', sargam: 'Re', type: 'white', num: '2' },
  { note: 'D#', sargam: 'ga', type: 'black', num: '2#' },
  { note: 'E', sargam: 'Ga', type: 'white', num: '3' },
  { note: 'F', sargam: 'Ma', type: 'white', num: '4' },
  { note: 'F#', sargam: 'ma', type: 'black', num: '4#' },
  { note: 'G', sargam: 'Pa', type: 'white', num: '5' },
  { note: 'G#', sargam: 'dha', type: 'black', num: '5#' },
  { note: 'A', sargam: 'Dha', type: 'white', num: '6' },
  { note: 'A#', sargam: 'ni', type: 'black', num: '6#' },
  { note: 'B', sargam: 'Ni', type: 'white', num: '7' },
];

export const OCTAVES = 4;
export const START_OCTAVE = 2;

// CACHE OF ALL NOTES FOR THE KEYBOARD
export const noteRange: string[] = [];
for (let octave = START_OCTAVE; octave < START_OCTAVE + OCTAVES; octave++) {
  RADIX_NOTES.forEach(pitch => {
    noteRange.push(`${pitch}${octave}`);
  });
}

export const KEYBOARD_MAPPING: Record<string, string> = {
  // MIDDLE OCTAVE (Starting from C4) - Number Keys
  '1': 'C4', '2': 'D4', '3': 'E4', '4': 'F4', '5': 'G4', '6': 'A4', '7': 'B4',
  '8': 'C5', '9': 'D5', '0': 'E5', '-': 'F5', '=': 'G5',
  
  // BLACK KEYS FOR MIDDLE OCTAVE
  'q': 'C#4', 'w': 'D#4', 'e': 'F#4', 'r': 'G#4', 't': 'A#4',
  'y': 'C#5', 'u': 'D#5', 'i': 'F#5', 'o': 'G#5', 'p': 'A#5',

  // LOWER OCTAVE (Standard Home Row) - White Keys
  'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3', 'g': 'G3', 'h': 'A3', 'j': 'B3',
  'k': 'C4', 'l': 'D4', ';': 'E4', "'": 'F4',

  // LOWER OCTAVE - Black Keys
  'z': 'C#3', 'x': 'D#3', 'c': 'F#3', 'v': 'G#3', 'b': 'A#3',
  'n': 'C#4', 'm': 'D#4', ',': 'F#4', '.': 'G#4', '/': 'A#4',

  // SPECIAL CONTROLS
  ' ': 'SUSTAIN',
  'ArrowLeft': 'OCTAVE_DOWN',
  'ArrowRight': 'OCTAVE_UP',
};




export const PRESETS_LIST = [
  { id: 'classic', label: 'Classic Harmonium' },
  { id: 'bright', label: 'Bright Harmonium' },
  { id: 'bass', label: 'Bass Harmonium' },
  { id: 'soft', label: 'Soft Harmonium' },
  { id: 'stage', label: 'Stage Performance' },
  { id: 'organ', label: 'Reed Organ' },
  { id: 'e-organ', label: 'Electric Organ' },
  { id: 'pad', label: 'Atmospheric Pad' },
];

export const SCALES = [
  { name: 'Chromatic', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { name: 'Bilawal (Major)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Asavari (Minor)', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'Bhairav', intervals: [0, 1, 4, 5, 7, 8, 11] },
  { name: 'Kafi', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Kalyan (Lydian)', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Bhairavi', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Khamaaj', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Marwa', intervals: [0, 1, 4, 6, 7, 9, 11] },
];

export const LABEL_MODES = [
  { id: 'sargam', label: 'SRG' },
  { id: 'western', label: 'CDE' },
  { id: 'numbers', label: '123' },
  { id: 'none', label: 'Off' },
];

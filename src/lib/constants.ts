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
  // WHITE KEYS (A-L;)
  'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3', 'g': 'G3', 'h': 'A3', 'j': 'B3', 'k': 'C4', 'l': 'D4', ';': 'E4', "'": 'F4',
  
  // BLACK KEYS (W-P)
  'w': 'C#3', 'e': 'D#3', 't': 'F#3', 'y': 'G#3', 'u': 'A#3', 'o': 'C#4', 'p': 'D#4', '[': 'F#4',
  
  // NUMBERS (Octave 2 shortcuts)
  '1': 'C2', '2': 'D2', '3': 'E2', '4': 'F2', '5': 'G2', '6': 'A2', '7': 'B2', '8': 'C3', '9': 'D3', '0': 'E3',
  
  // SPECIAL
  ' ': 'SUSTAIN',
  'z': 'OCTAVE_DOWN',
  'x': 'OCTAVE_UP',
};

export const PRESETS_LIST = [
  { id: 'classic', label: 'Classic Harmonium' },
  { id: 'bright', label: 'Bright Reed' },
  { id: 'bass', label: 'Bass Harmonium' },
  { id: 'soft', label: 'Soft Bellows' },
  { id: 'organ', label: 'Reed Organ' },
  { id: 'e-organ', label: 'Electric Organ' },
  { id: 'pad', label: 'Synth Pad' },
];

export const SCALES = [
  { name: 'Chromatic', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { name: 'Sargam (Bilawal)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Natural Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'Bhairav Thaat', intervals: [0, 1, 4, 5, 7, 8, 11] },
  { name: 'Asavari Thaat', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'Kalyan Thaat', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Kafi Thaat', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Bhairavi (All Flat)', intervals: [0, 1, 3, 5, 7, 8, 10] },
];

export const LABEL_MODES = [
  { id: 'western', label: 'CDE' },
  { id: 'sargam', label: 'SRG' },
  { id: 'numbers', label: '123' },
  { id: 'none', label: 'None' },
];

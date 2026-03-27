import { RADIX_NOTES } from './constants';

export const getSargamNote = (note: string, rootNote: string) => {
  const pitch = note.replace(/\d+$/, '');
  const octave = parseInt(note.match(/\d+$/)?.[0] || '4');
  const noteIdx = RADIX_NOTES.indexOf(pitch);
  const rootIdx = RADIX_NOTES.indexOf(rootNote);
  const distance = (noteIdx - rootIdx + 12) % 12;
  
  const sargamMapping = ['Sa', 're', 'Re', 'ga', 'Ga', 'Ma', 'Ma#', 'Pa', 'dha', 'Dha', 'ni', 'Ni'];
  let label = sargamMapping[distance] || '';
  
  // Octave logic (Middle octave is 4 in our system)
  if (octave < 4) label = `.${label}`;
  else if (octave > 4) label = `${label}'`;
  
  return label;
};

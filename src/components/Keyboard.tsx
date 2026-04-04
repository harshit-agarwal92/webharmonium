'use client';

import { Key } from './Key';
import { motion } from 'framer-motion';
import { noteRange, SCALES, RADIX_NOTES, KEYBOARD_MAPPING } from '@/lib/constants';
import { getSargamNote } from '@/lib/theory';
import { useRef, useEffect } from 'react';

interface KeyboardProps {
  playNote: (note: string) => void;
  stopNote: (note: string) => void;
  activeNotes: string[];
  labelMode: string;
  selectedScale: string;
  rootNote: string;
  intensity: number;
  guideNotes: string[];
}

export function Keyboard({
  playNote,
  stopNote,
  activeNotes,
  labelMode,
  selectedScale,
  rootNote,
  intensity,
  guideNotes
}: KeyboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const middleKey = containerRef.current.querySelector(`[data-note="${rootNote}4"]`) || containerRef.current.querySelector('[data-note="C4"]');
      if (middleKey) {
        middleKey.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [rootNote]);

  const getSargam = (note: string) => getSargamNote(note, rootNote);

  const isHighlighted = (note: string) => {
    const scale = SCALES.find(s => s.name === selectedScale);
    if (!scale || scale.name === 'Chromatic') return true;
    const notePitch = note.replace(/\d+$/, '');
    const noteIdx = RADIX_NOTES.indexOf(notePitch);
    const rootIdx = RADIX_NOTES.indexOf(rootNote);
    const distance = (noteIdx - rootIdx + 12) % 12;
    return scale.intervals.includes(distance);
  };

  const getLabel = (note: string) => {
    if (labelMode === 'none') return '';
    if (labelMode === 'sargam') return getSargam(note);
    if (labelMode === 'western') return note.replace(/\d+$/, '');
    if (labelMode === 'numbers') {
        const notePitch = note.replace(/\d+$/, '');
        const distance = ((RADIX_NOTES.indexOf(notePitch) - RADIX_NOTES.indexOf(rootNote) + 12) % 12) + 1;
        return distance.toString();
    }
    return ''; 
  };

  const getKeyLabel = (note: string) => {
    const entry = Object.entries(KEYBOARD_MAPPING).find(([_, val]) => val === note);
    return entry ? entry[0].toUpperCase() : '';
  };

  return (
    <div className="relative w-full max-w-[100vw] overflow-hidden">
      {/* SCROLL FADERS */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0b0f0f] to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0b0f0f] to-transparent z-20 pointer-events-none" />

      <div 
        ref={containerRef}
        className="relative px-10 lg:px-20 overflow-x-auto flex min-w-max select-none no-scrollbar-on-mobile scroll-smooth custom-scrollbar pb-8"
      >
        <motion.div 
          className="flex relative items-start h-[55vh] md:h-[60vh]"
          animate={{ scale: 1 + intensity * 0.001 }}
        >
          {noteRange.map((note) => (
            <div key={note} data-note={note}>
               <Key 
                  note={note}
                  label={getLabel(note)}
                  keyLabel={getKeyLabel(note)}
                  type={note.includes('#') ? 'black' : 'white'}
                  active={activeNotes.includes(note)}
                  highlighted={isHighlighted(note)}
                  guideHighlight={guideNotes.includes(note)}
                  onMouseDown={() => playNote(note)}
                  onMouseUp={() => stopNote(note)}
                  onMouseEnter={() => playNote(note)}
                  onMouseLeave={() => stopNote(note)}
                />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

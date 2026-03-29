'use client';

import { Key } from './Key';
import { motion, AnimatePresence } from 'framer-motion';
import { noteRange, SCALES, RADIX_NOTES, KEYBOARD_MAPPING } from '@/lib/constants';
import { getSargamNote } from '@/lib/theory';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface KeyboardProps {
  playNote: (note: string) => void;
  stopNote: (note: string) => void;
  activeNotes: string[];
  labelMode: string;
  selectedScale: string;
  rootNote: string;
  intensity: number;
  guideNotes: string[]; // Notes to highlight in song mode
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

  // AUTO-CENTER (Default C4)
  useEffect(() => {
    if (containerRef.current) {
      const middleKey = containerRef.current.querySelector(`[data-note="${rootNote}4"]`) || containerRef.current.querySelector('[data-note="C4"]');
      if (middleKey) {
        middleKey.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [rootNote]);

  const getSargam = (note: string) => {
    return getSargamNote(note, rootNote);
  };

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
        const noteIdx = RADIX_NOTES.indexOf(notePitch);
        const rootIdx = RADIX_NOTES.indexOf(rootNote);
        const distance = ((noteIdx - rootIdx + 12) % 12) + 1;
        return distance.toString();
    }
    return ''; 
  };

  const getKeyLabel = (note: string) => {
    const entry = Object.entries(KEYBOARD_MAPPING).find(([key, val]) => val === note);
    return entry ? entry[0].toUpperCase() : '';
  };

  return (
    <div className="relative group w-full">
      {/* SCROLL FADERS */}
      <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      {/* HONEY OAK HOUSING */}
      <div className="bg-[#5c3a21] rounded-t-3xl lg:rounded-t-[4rem] border-t-[4px] lg:border-t-[8px] border-white/20 shadow-3xl overflow-hidden pt-4 lg:pt-8 relative">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
        
        {/* BRASS STOPPERS (KNOBS) */}
        <div className="flex justify-center gap-4 sm:gap-12 mb-6 sm:mb-10 relative z-20">
           {Array.from({length: 9}).map((_, i) => (
             <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#8a6d3b] via-[#d4af37] to-[#f9d423] shadow-lg border border-black/20" />
                <div className="w-1.5 h-4 sm:w-2 sm:h-6 bg-black/40 rounded-full" />
             </div>
           ))}
        </div>
        
        {/* REED VENTS */}
        <div className="h-4 lg:h-6 flex items-center justify-center gap-4 lg:gap-12 opacity-10 mb-2 px-10">
           {Array.from({length: 12}).map((_, i) => (
               <div key={i} className="w-12 lg:w-20 h-1.5 bg-black rounded-full" />
           ))}
        </div>

        <div 
          ref={containerRef}
          className="relative px-4 lg:px-24 pb-6 lg:pb-12 overflow-x-auto flex min-w-max select-none no-scrollbar-on-mobile scroll-smooth"
          style={{ perspective: "1500px" }}
        >
          <motion.div 
            className="flex relative"
            animate={{ 
              rotateX: intensity * 0.05,
              y: intensity * -0.2
            }}
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
    </div>
  );
}

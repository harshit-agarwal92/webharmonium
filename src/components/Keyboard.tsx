'use client';

import { Key } from './Key';
import { motion, AnimatePresence } from 'framer-motion';
import { noteRange, SCALES, RADIX_NOTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface KeyboardProps {
  playNote: (note: string) => void;
  stopNote: (note: string) => void;
  activeNotes: string[];
  labelMode: string;
  selectedScale: string;
  rootNote: string;
  boostMode: boolean;
  intensity: number;
}

export function Keyboard({
  playNote,
  stopNote,
  activeNotes,
  labelMode,
  selectedScale,
  rootNote,
  boostMode,
  intensity
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
    const pitch = note.replace(/\d+$/, '');
    const noteIdx = RADIX_NOTES.indexOf(pitch);
    const rootIdx = RADIX_NOTES.indexOf(rootNote);
    const distance = (noteIdx - rootIdx + 12) % 12;
    
    // INDIAN CLASSICAL NOTATION: 
    // Komal (Flat) = underlined/lowercase
    // Tivra (Sharp) = line-above/uppercase
    const sargamMapping = [
        'Sa',   // 0
        're',   // 1 (Komal Re)
        'Re',   // 2 (Shuddha Re)
        'ga',   // 3 (Komal Ga)
        'Ga',   // 4 (Shuddha Ga)
        'Ma',   // 5 (Shuddha Ma)
        'Mă',   // 6 (Tivra Ma)
        'Pa',   // 7 
        'dha',  // 8 (Komal Dha)
        'Dha',  // 9 (Shuddha Dha)
        'ni',   // 10 (Komal Ni)
        'Ni'    // 11 (Shuddha Ni)
    ];
    return sargamMapping[distance] || '';
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

  return (
    <div className="relative group w-full">
      {/* SCROLL FADERS */}
      <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      {/* MAHOGANY HOUSING */}
      <div className="wood-mahogany rounded-t-3xl lg:rounded-t-[3rem] border-t-[3px] lg:border-t-[6px] border-white/5 shadow-2xl overflow-hidden pt-2 lg:pt-4 bg-[#1a0b0b]">
        
        {/* REED VENTS */}
        <div className="h-2 lg:h-4 flex items-center justify-center gap-4 lg:gap-8 opacity-5 mb-1 px-10">
           {Array.from({length: 16}).map((_, i) => (
               <div key={i} className="w-10 lg:w-16 h-1 bg-black rounded-full" />
           ))}
        </div>

        <div 
          ref={containerRef}
          className="relative px-4 lg:px-24 pb-4 lg:pb-8 overflow-x-auto flex min-w-max select-none no-scrollbar-on-mobile scroll-smooth"
          style={{ perspective: "1500px" }}
        >
          <motion.div 
            className="flex relative"
            animate={{ 
              rotateX: intensity * 0.04,
              y: intensity * -0.1
            }}
          >
            {noteRange.map((note) => (
              <div key={note} data-note={note}>
                 <Key 
                    note={note}
                    label={getLabel(note)}
                    type={note.includes('#') ? 'black' : 'white'}
                    active={activeNotes.includes(note)}
                    highlighted={isHighlighted(note)}
                    boosted={boostMode}
                    onMouseDown={() => playNote(note)}
                    onMouseUp={() => stopNote(note)}
                    onMouseEnter={() => playNote(note)}
                    onMouseLeave={() => stopNote(note)}
                  />
              </div>
            ))}
          </motion.div>
        </div>

        {/* BRASS LOGO INSET */}
        <div className="absolute bottom-2 right-6 opacity-5 pointer-events-none selection:hidden italic font-black text-lg tracking-tighter text-accent-gold selection:none uppercase">
            Artisan Harmonium
        </div>
      </div>
      
      {/* FOOT SHADOW */}
      <div className="h-6 bg-black/60 blur-2xl" />
    </div>
  );
}

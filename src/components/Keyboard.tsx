'use client';

import { Key } from './Key';
import { motion } from 'framer-motion';
import { noteRange, SCALES, NOTES, RADIX_NOTES } from '@/lib/constants';
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

  // AUTO-CENTER MIDDLE C (C4) on load
  useEffect(() => {
    if (containerRef.current) {
      const middleKey = containerRef.current.querySelector('[data-note="C4"]');
      if (middleKey) {
        middleKey.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  const getSargam = (note: string) => {
    const pitch = note.replace(/\d+$/, '');
    
    // Calculate distance from root for Indian Sargam rotation
    const noteIdx = RADIX_NOTES.indexOf(pitch);
    const rootIdx = RADIX_NOTES.indexOf(rootNote);
    const distance = (noteIdx - rootIdx + 12) % 12;
    
    // Return sargam based on the semitone distance from chosen root
    const sargamMapping = ['Sa', 're', 'Re', 'ga', 'Ga', 'Ma', 'ma', 'Pa', 'dha', 'Dha', 'ni', 'Ni'];
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
    // Mapping for physical keys (if labelMode === 'keyboard')
    return ''; 
  };

  return (
    <div className="relative group w-full">
      {/* SCROLL FADERS */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

      {/* ELITE KEYBOARD SHELL */}
      <div className="wood-mahogany rounded-t-[3rem] border-t-[3px] border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* REED SLITS */}
        <div className="h-6 flex items-center justify-center gap-10 opacity-10 relative px-20">
           {Array.from({length: 12}).map((_, i) => (
               <div key={i} className="w-16 h-1 bg-black/60 rounded-full" />
           ))}
        </div>

        <div 
          ref={containerRef}
          className="relative px-8 md:px-16 pb-12 overflow-x-auto custom-scrollbar flex min-w-max select-none no-scrollbar-on-mobile scroll-smooth"
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
      </div>
      
      {/* SHADOW BASE */}
      <div className="h-4 bg-black/40 blur-xl" />
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const fftRef = useRef<Tone.Analyser | null>(null);

  useEffect(() => {
    // Waveform for smooth curves
    const analyser = new Tone.Analyser('waveform', 256);
    // FFT for high-energy bars
    const fft = new Tone.Analyser('fft', 64);
    
    Tone.getDestination().connect(analyser);
    Tone.getDestination().connect(fft);
    
    analyserRef.current = analyser;
    fftRef.current = fft;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const waveform = analyser.getValue() as Float32Array;
      const freq = fft.getValue() as Float32Array;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // --- 1. DYNAMIC BACKGROUND SPECTROGRAM (Subtle) ---
      const barWidth = (width / 2) / freq.length;
      for (let i = 0; i < freq.length; i++) {
          const v = Math.abs(freq[i]) / 100; // Normalized
          ctx.fillStyle = `rgba(212, 175, 55, ${v * 0.1})`;
          ctx.fillRect(centerX + i * barWidth, 0, barWidth, height);
          ctx.fillRect(centerX - i * barWidth, 0, -barWidth, height);
      }

      // --- 2. MAIN SYMMETRICAL WAVEFORM ---
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#d4af37';
      ctx.shadowBlur = 25;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const sliceWidth = (width / 2) / waveform.length;
      
      ctx.moveTo(centerX, centerY);
      
      // RIGHT SIDE
      for (let i = 0; i < waveform.length; i++) {
        const v = waveform[i] * 3.5;
        const x = centerX + (i * sliceWidth);
        const y = centerY + (v * height / 3);
        ctx.lineTo(x, y);
      }

      // LEFT SIDE
      ctx.moveTo(centerX, centerY);
      for (let i = 0; i < waveform.length; i++) {
        const v = waveform[i] * 3.5;
        const x = centerX - (i * sliceWidth);
        const y = centerY + (v * height / 3);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // --- 3. HARMONIC LIGHT PULSE (Secondary dim wave) ---
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.shadowBlur = 0;
      
      for (let i = 0; i < waveform.length; i += 2) {
        const v = waveform[i] * -12; // Massive reverse
        const x = centerX + (i * sliceWidth);
        const y = centerY + (v);
        ctx.lineTo(x, y);
      }
      for (let i = 0; i < waveform.length; i += 2) {
        const v = waveform[i] * -12;
        const x = centerX - (i * sliceWidth);
        const y = centerY + (v);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // --- 4. CENTER RADIANCE ---
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
      grad.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      analyser.dispose();
      fft.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div className="absolute w-[1px] h-full bg-accent-gold/5 blur-[2px]" />
      <canvas 
        ref={canvasRef} 
        width={1024} 
        height={400} 
        className="w-full h-full object-contain filter contrast-[1.2] brightness-[1.1]"
      />
    </div>
  );
}

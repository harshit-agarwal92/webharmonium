'use client';

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const fftRef = useRef<Tone.Analyser | null>(null);

  useEffect(() => {
    const analyser = new Tone.Analyser('waveform', 256);
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
      
      // 1. NEON BARS (FFT)
      const barWidth = (width / 2) / freq.length;
      for (let i = 0; i < freq.length; i++) {
          const v = (freq[i] + 140) / 100; // Normalized -140 to 0dB approx
          if (v > 0.01) {
            ctx.fillStyle = `rgba(168, 85, 247, ${v * 0.1})`;
            ctx.fillRect(centerX + i * barWidth, 0, barWidth, height);
            ctx.fillRect(centerX - i * barWidth, 0, -barWidth, height);
          }
      }

      // 2. MAIN SYMMETRICAL WAVEFORM (Neon Purple)
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#a855f7';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#a855f788';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const sliceWidth = (width / 2) / waveform.length;
      ctx.moveTo(centerX, centerY);
      
      for (let i = 0; i < waveform.length; i++) {
        const v = waveform[i] * 3.5;
        const x = centerX + (i * sliceWidth);
        const y = centerY + (v * height / 3);
        ctx.lineTo(x, y);
      }

      ctx.moveTo(centerX, centerY);
      for (let i = 0; i < waveform.length; i++) {
        const v = waveform[i] * 3.5;
        const x = centerX - (i * sliceWidth);
        const y = centerY + (v * height / 3);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. VIOLET GLOW WAVE (Subtle)
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.4)';
      ctx.shadowBlur = 0;
      
      for (let i = 0; i < waveform.length; i += 4) {
        const v = waveform[i] * -8 + Math.sin(Date.now() / 1000 + i) * 5;
        ctx.lineTo(centerX + (i * sliceWidth), centerY + (v));
      }
      ctx.moveTo(centerX, centerY);
      for (let i = 0; i < waveform.length; i += 4) {
        const v = waveform[i] * -8 + Math.sin(Date.now() / 1000 + i) * 5;
        ctx.lineTo(centerX - (i * sliceWidth), centerY + (v));
      }
      ctx.stroke();

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
    <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
      <div className="absolute w-[1px] h-full bg-harmonium-accent/10 blur-[4px]" />
      <canvas 
        ref={canvasRef} 
        width={1024} 
        height={400} 
        className="w-full h-full object-contain filter contrast-[1.1]"
      />
      {/* AMBIENT RADIAL GLOW AT CENTER */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_70%)]" />
    </div>
  );
}

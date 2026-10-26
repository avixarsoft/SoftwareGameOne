import React, { useEffect } from 'react';
import { Play, Sparkles, Code2, Server, Terminal } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        soundManager.playSuccess(600, 0.3);
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between items-center p-6 sm:p-12 bg-gradient-to-b from-[#0a0f1d] via-[#090e1c] to-[#060a14] select-none text-slate-100 overflow-hidden">
      {/* Background Subtle Tech Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Brand Tag */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-semibold text-cyan-400">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>3D OFİS & DİJİTAL ALTYAPI SİMÜLASYONU</span>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-4 my-auto">
        {/* Bespoke Geometric Monogram Logo */}
        <div className="mb-6 relative">
          <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 100 100" fill="none">
            {/* Outer Hexagon / Shield */}
            <polygon
              points="50,6 90,28 90,72 50,94 10,72 10,28"
              stroke="#0284c7"
              strokeWidth="2.5"
              fill="#080e1e"
            />
            {/* Inner Cyber Circuit Accent */}
            <polygon
              points="50,14 82,32 82,68 50,86 18,68 18,32"
              stroke="#06b6d4"
              strokeWidth="1.2"
              opacity="0.4"
            />
            {/* Bold Stylized 'A' Apex */}
            <path
              d="M50 24 L70 72 L58 72 L53 58 L47 58 L42 72 L30 72 Z"
              fill="url(#cyanGrad)"
            />
            <polygon points="50,38 46,50 54,50" fill="#080e1e" />
            <defs>
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title Lockup */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-3">
          AVIXAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">SOFTWARE</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-sans">
          Hayatı kolaylaştıran web uygulamaları geliştirin, bulut altyapınızı yönetin ve teknoloji imparatorluğunuzu kurun.
        </p>

        {/* Start CTA Button */}
        <button
          onClick={() => {
            soundManager.playSuccess(600, 0.3);
            onStart();
          }}
          className="group relative px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm sm:text-base tracking-wide flex items-center gap-3 transition-all duration-200 shadow-2xl shadow-cyan-500/30 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>ŞİRKETİ BAŞLAT</span>
        </button>

        <p className="text-[11px] text-slate-500 mt-4 font-mono">
          veya klavyeden <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">ENTER</kbd> tuşuna basın
        </p>
      </div>

      {/* Flat Control Hint Line */}
      <div className="relative z-10 w-full max-w-xl py-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs font-mono text-slate-400">
        <span className="text-cyan-400 font-bold">WASD / Ok Tuşları:</span> Hareket &nbsp;·&nbsp;
        <span className="text-cyan-400 font-bold">E / Boşluk:</span> Etkileşim &nbsp;·&nbsp;
        <span className="text-cyan-400 font-bold">Esc:</span> Duraklat / Ayarlar
      </div>
    </div>
  );
};

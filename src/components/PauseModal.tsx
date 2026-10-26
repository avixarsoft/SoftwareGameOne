import React from 'react';
import { Play, Volume2, VolumeX, RotateCcw, X, Shield, Info } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onReset: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onReset,
}) => {
  const [muted, setMuted] = React.useState(soundManager.isMuted);

  if (!isOpen) return null;

  const toggleSound = () => {
    const isMuted = soundManager.toggleMute();
    setMuted(isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#0c1322] rounded-2xl border border-slate-700/80 shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <h2 className="text-base font-bold text-white tracking-wide">OYUN DURAKLATILDI</h2>
          <button
            onClick={onResume}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 mb-6">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" /> Oyuna Devam Et
          </button>

          <button
            onClick={toggleSound}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>Ses Efektleri: {muted ? 'KAPALI' : 'AÇIK'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Şirketinizi sıfırlayıp baştan başlamak istediğinize emin misiniz?')) {
                onReset();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-300 border border-red-800/40 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Şirketi Sıfırla
          </button>
        </div>

        {/* Controls reference */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
          <div className="text-slate-300 font-bold mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> KONTROL KILAVUZU
          </div>
          <div><strong className="text-slate-200">WASD / Oklar:</strong> Ofiste serbest yürüme</div>
          <div><strong className="text-slate-200">Fare Sol Tık:</strong> Tıklanan noktaya hareket</div>
          <div><strong className="text-slate-200">Boşluk / E:</strong> İstasyonla etkileşime gir</div>
        </div>
      </div>
    </div>
  );
};

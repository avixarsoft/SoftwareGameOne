import React, { useState } from 'react';
import { Coffee, Zap, Sparkles, X, Check } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDrink: () => void;
  energy: number;
}

export const CoffeeModal: React.FC<CoffeeModalProps> = ({
  isOpen,
  onClose,
  onDrink,
  energy,
}) => {
  const [brewing, setBrewing] = useState(false);
  const [selectedBlend, setSelectedBlend] = useState<'espresso' | 'ristretto' | 'cyber'>('espresso');

  if (!isOpen) return null;

  const handleBrewAndDrink = () => {
    setBrewing(true);
    soundManager.playCoffeeBrew();
    setTimeout(() => {
      setBrewing(false);
      onDrink();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-slate-700/80 shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">İTALYAN ESPRESSO BARI</h2>
              <p className="text-[11px] text-slate-400">Karakter enerjisini ve odaklanmayı doldurur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Energy Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Mevcut Enerji / Odak</span>
            <span
              className={`font-bold ${
                energy > 60 ? 'text-emerald-400' : energy > 25 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {Math.round(energy)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                energy > 60 ? 'bg-emerald-400' : energy > 25 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>

        {/* Coffee Blends */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setSelectedBlend('espresso')}
            className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
              selectedBlend === 'espresso'
                ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-white">Single Shot Espresso</div>
              <div className="text-[10px] text-slate-400">Yoğun kavrulmuş çekirdek, dengeli odaklanma (+50 Enerji)</div>
            </div>
            {selectedBlend === 'espresso' && <Check className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => setSelectedBlend('ristretto')}
            className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
              selectedBlend === 'ristretto'
                ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-400'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-white">Double Shot Ristretto</div>
              <div className="text-[10px] text-slate-400">Ultra konsantre ekstraksiyon, hızlı zihin açıklığı (+75 Enerji)</div>
            </div>
            {selectedBlend === 'ristretto' && <Check className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBrewAndDrink}
          disabled={brewing || energy >= 99}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
            brewing
              ? 'bg-amber-600/50 text-amber-200 cursor-wait'
              : energy >= 99
              ? 'bg-slate-800 text-slate-500 cursor-default'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {brewing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" /> Kahve Hazırlanıyor...
            </>
          ) : energy >= 99 ? (
            'Enerjiniz Zaten Zirvede!'
          ) : (
            <>
              <Zap className="w-4 h-4" /> Taze Kahveyi Demle & Yudumla
            </>
          )}
        </button>
      </div>
    </div>
  );
};

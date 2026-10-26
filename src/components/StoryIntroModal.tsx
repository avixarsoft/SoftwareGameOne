import React from 'react';
import { Rocket, Sparkles, CheckCircle2, Terminal } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface StoryIntroModalProps {
  isOpen: boolean;
  onStart: () => void;
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({ isOpen, onStart }) => {
  if (!isOpen) return null;

  const handleStart = () => {
    soundManager.playSuccess(700, 0.3);
    soundManager.startAmbient();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-gradient-to-b from-[#0c1322] to-[#080d1a] rounded-2xl border border-cyan-800/60 shadow-2xl shadow-cyan-950/80 p-6 sm:p-8 text-slate-200">
        {/* Emblem / Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/25">
            <Rocket className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase">
              KURUCU HİKAYESİ & MİSYON
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Avixar Software'in Doğuşu
            </h1>
          </div>
        </div>

        {/* Story Text */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-5 rounded-xl border border-slate-800/80 mb-6">
          <p>
            Yıllardır hantal ve karmaşık dijital sistemlerle boğuşan dünyayı izlediniz. Artık buna bir son verme zamanı geldi.
          </p>
          <p>
            Bir avuç tutkulu vizyonerle birlikte kurduğunuz <strong className="text-cyan-400">Avixar Software</strong>; insanların hayatını kolaylaştıran, yüksek performanslı web uygulamaları ve sarsılmaz bulut altyapıları inşa etmek amacıyla bugün resmen kapılarını açıyor.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[12px] text-slate-400 space-y-1.5 font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <Terminal className="w-3.5 h-3.5" />
              <span>GÖREVİNİZ:</span>
            </div>
            <p>
              1. <strong>Çalışma Masası:</strong> Avixar OS bilgisayarından mailleri okuyun ve web projelerini IDE'de kodlayın.
            </p>
            <p>
              2. <strong>Kahve Makinesi:</strong> Zihniniz yorulduğunda taze espresso ile enerjinizi doldurun.
            </p>
            <p>
              3. <strong>Sunucu Kabini:</strong> Dijital altyapınızı kararlı tutun ve krizlere zamanında müdahale edin.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-cyan-500/25 active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" /> OFİSİME GİR VE ŞİRKETİ BÜYÜT
        </button>
      </div>
    </div>
  );
};

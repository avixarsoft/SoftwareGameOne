import React from 'react';
import { Server, Activity, ShieldCheck, RefreshCw, X, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { GameStats, ServerIncident } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface ServerRackModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  incidents: ServerIncident[];
  onResolveIncident: (id: string) => void;
}

export const ServerRackModal: React.FC<ServerRackModalProps> = ({
  isOpen,
  onClose,
  stats,
  incidents,
  onResolveIncident,
}) => {
  if (!isOpen) return null;

  const activeIncidents = incidents.filter((i) => !i.resolved);

  const handleReboot = () => {
    soundManager.playSuccess(650, 0.25);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0c1322] rounded-2xl border border-cyan-800/60 shadow-2xl p-6 text-slate-200 font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans">FİZİKSEL SUNUCU KABİNİ (42U)</h2>
              <p className="text-[11px] text-slate-400">Avixar Cloud Edge Düğüm Kontrolü</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Physical Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400">KABİN SICAKLIĞI</div>
            <div className="text-sm font-bold text-cyan-400 mt-1">36.4 °C (Normal)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400">FAN HIZI</div>
            <div className="text-sm font-bold text-slate-200 mt-1">4,200 RPM</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400">GÜÇ TÜKETİMİ</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">780 W</div>
          </div>
        </div>

        {/* Incidents Check */}
        {activeIncidents.length > 0 ? (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 mb-5">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-3">
              <AlertOctagon className="w-4 h-4 animate-bounce" />
              <span>DONANIM / SİSTEM ALARMI ({activeIncidents.length})</span>
            </div>
            <div className="space-y-2">
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between p-2.5 rounded bg-slate-900/90 border border-red-900/60"
                >
                  <div>
                    <div className="font-bold text-white">{inc.title}</div>
                    <div className="text-[10px] text-slate-400">{inc.description}</div>
                  </div>
                  <button
                    onClick={() => onResolveIncident(inc.id)}
                    className="py-1 px-3 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-md shadow-red-600/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Müdahale Et
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 mb-5 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="font-bold text-white text-xs">Tüm Sunucu Blade'leri Kusursuz Çalışıyor</div>
              <div className="text-[11px] text-slate-400">Kararlılık seviyesi: %{stats.serverStability.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleReboot}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Donanım Teşhisini Onayla & Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

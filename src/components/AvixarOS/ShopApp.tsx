import React, { useState } from 'react';
import { GameStats, HardwareUpgrade, Employee } from '../../types/game';
import {
  ShoppingBag,
  Users,
  HardDrive,
  Keyboard,
  Monitor,
  Armchair,
  Coffee,
  Check,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ShopAppProps {
  stats: GameStats;
  upgrades: HardwareUpgrade[];
  employees: Employee[];
  onBuyUpgrade: (id: string) => void;
  onHireEmployee: (id: string) => void;
}

export const ShopApp: React.FC<ShopAppProps> = ({
  stats,
  upgrades,
  employees,
  onBuyUpgrade,
  onHireEmployee,
}) => {
  const [tab, setTab] = useState<'hardware' | 'team'>('hardware');

  const getUpgradeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Keyboard':
        return <Keyboard className="w-5 h-5 text-cyan-400" />;
      case 'Monitor':
        return <Monitor className="w-5 h-5 text-blue-400" />;
      case 'Armchair':
        return <Armchair className="w-5 h-5 text-indigo-400" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5 text-purple-400" />;
      default:
        return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-200 select-none overflow-hidden font-sans">
      {/* Top Header & Tabs */}
      <div className="p-4 bg-[#080d1a] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">AVIXAR STORE & TALENT HUB</h2>
            <p className="text-[11px] text-slate-400">Şirket altyapınızı güçlendirin ve uzman yetenekleri işe alın</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('hardware')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'hardware'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" /> Donanım & Ofis
          </button>
          <button
            onClick={() => setTab('team')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              tab === 'team'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Yazılım Ekibi ({employees.filter((e) => e.hired).length}/{employees.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#0a0f1d]">
        {tab === 'hardware' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upgrades.map((up) => {
              const isMax = up.level >= up.maxLevel;
              const canAfford = stats.money >= up.cost;

              return (
                <div
                  key={up.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                          {getUpgradeIcon(up.icon)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{up.name}</h3>
                          <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                            {up.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-300">
                          Seviye {up.level}/{up.maxLevel}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {Array.from({ length: up.maxLevel }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2.5 h-1 rounded-full ${
                                i < up.level ? 'bg-cyan-400' : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {up.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500">YÜKSELTME BEDELİ</div>
                      <div className="text-sm font-bold text-emerald-400">
                        {isMax ? 'MAKSİMUM SEVİYE' : `${up.cost.toLocaleString()} ₺`}
                      </div>
                    </div>

                    <button
                      onClick={() => onBuyUpgrade(up.id)}
                      disabled={isMax || !canAfford}
                      className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 opacity-60 cursor-default'
                          : canAfford
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Sahip Olundu
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Yükselt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.map((emp) => {
              const hiringFee = emp.salary * 3;
              const canAfford = stats.money >= hiringFee;

              return (
                <div
                  key={emp.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                    emp.hired
                      ? 'bg-cyan-950/20 border-cyan-800/40'
                      : 'bg-slate-900/60 border-slate-800/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                        style={{ backgroundColor: emp.avatarColor }}
                      >
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{emp.name}</h3>
                        <p className="text-xs text-cyan-400 font-medium">{emp.role}</p>
                      </div>
                      {emp.hired && (
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          KADRODA
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Günlük Maaş</span>
                        <span className="font-bold text-slate-200">{emp.salary} ₺ / gün</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Pasif Üretim</span>
                        <span className="font-bold text-cyan-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> +{emp.productivity} puan/sn
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500">İŞE ALIM DEPOZİTOSU</div>
                      <div className="text-sm font-bold text-emerald-400">
                        {emp.hired ? 'İstihdam Edildi' : `${hiringFee.toLocaleString()} ₺`}
                      </div>
                    </div>

                    <button
                      onClick={() => onHireEmployee(emp.id)}
                      disabled={emp.hired || !canAfford}
                      className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        emp.hired
                          ? 'bg-slate-800 text-slate-500 opacity-60 cursor-default'
                          : canAfford
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {emp.hired ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Ofiste Çalışıyor
                        </>
                      ) : (
                        <>
                          <Users className="w-3.5 h-3.5" /> İşe Al
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  GameStats,
  ProjectContract,
  InteractionStation,
} from '../types/game';
import {
  DollarSign,
  Zap,
  Server,
  Award,
  Clock,
  Code2,
  Coffee,
  HardDrive,
  Armchair,
  Pause,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Users,
  Briefcase,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameHUDProps {
  stats: GameStats;
  activeProject: ProjectContract | null;
  nearStation: InteractionStation;
  onInteract: (station: InteractionStation) => void;
  onTeleportTo: (station: InteractionStation) => void;
  onPause: () => void;
  notifications: Array<{ id: string; text: string; type: 'info' | 'success' | 'alert' }>;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  activeProject,
  nearStation,
  onInteract,
  onTeleportTo,
  onPause,
  notifications,
}) => {
  const [dockCollapsed, setDockCollapsed] = React.useState(false);

  const getStationLabel = (s: InteractionStation) => {
    switch (s) {
      case 'desk':
        return 'Çalışma Masası (VS Code Stüdyosu)';
      case 'boss':
        return 'Demir Bey (CEO & Patron Camlı Ofisi)';
      case 'burak':
        return 'Burak (Junior Frontend Geliştirici)';
      case 'selin':
        return 'Selin (Senior Backend & DB Mimarı)';
      case 'zeynep':
        return 'Zeynep (UI/UX Baş Tasarımcısı)';
      case 'kaan':
        return 'Kaan (DevOps & Bulut Altyapı Uzmanı)';
      case 'coffee':
        return 'Plaza Barista & Espresso Barı';
      case 'server':
        return '42U Kurumsal Sunucu Kabini';
      case 'meeting':
        return 'Toplantı & Yönetim Kurulu Salonu';
      case 'lounge':
        return 'Dinlenme Koltukları & Mola Alanı';
      default:
        return '';
    }
  };

  const getStationAction = (s: InteractionStation) => {
    switch (s) {
      case 'desk':
        return 'VS Code Aç';
      case 'boss':
        return 'Patronla Konuş (Görev İste)';
      case 'burak':
        return 'Burak ile Konuş';
      case 'selin':
        return 'Selin ile Konuş';
      case 'zeynep':
        return 'Zeynep ile Konuş';
      case 'kaan':
        return 'Kaan ile Konuş';
      case 'coffee':
        return 'Espresso Al';
      case 'server':
        return 'Sunucu Kapağını Aç';
      case 'meeting':
        return 'Toplantı Odasına Gir';
      case 'lounge':
        return 'Dinlen';
      default:
        return 'Etkileşime Gir';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 sm:p-5 font-sans overflow-hidden">
      {/* Top Bar Perimeter Clusters */}
      <div className="flex items-start justify-between gap-3">
        {/* Left Status: Cash, Reputation & Plaza Level */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Company Brand Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0c1322]/95 border border-slate-700/80 shadow-lg text-xs font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="tracking-wide">AVIXAR PLAZA</span>
            <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              KAT 35
            </span>
          </div>

          {/* Cash Balance */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0c1322]/95 border border-slate-700/80 shadow-lg text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono tabular-nums">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            <span>{stats.money.toLocaleString()} ₺</span>
          </div>

          {/* Difficulty Badge */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0c1322]/95 border border-slate-700/80 shadow-lg text-[10px] font-bold">
            <span className="text-slate-400">Mod:</span>
            <span
              className={stats.difficulty === 'hard' ? 'text-amber-400 font-mono' : 'text-cyan-400 font-mono'}
            >
              {stats.difficulty === 'hard' ? 'ZOR (Gerçek Kod)' : 'KOLAY (Simülasyon)'}
            </span>
          </div>

          {/* Reputation */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1322]/95 border border-slate-700/80 shadow-lg text-xs font-bold text-cyan-400 font-mono tabular-nums">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>{stats.reputation} EXP</span>
          </div>
        </div>

        {/* Center: Interactive Prompt When Near Station */}
        {nearStation && (
          <div className="pointer-events-auto animate-bounce flex flex-col items-center">
            <button
              onClick={() => {
                soundManager.playClick();
                onInteract(nearStation);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-cyan-500/40 border border-cyan-300 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 font-mono text-[10px] border border-cyan-400/40">
                BOŞLUK / E
              </kbd>
              <span>{getStationAction(nearStation)}</span>
            </button>
            <span className="text-[10px] text-cyan-300 font-medium mt-1 bg-slate-950/90 px-2 py-0.5 rounded-full border border-slate-800">
              {getStationLabel(nearStation)}
            </span>
          </div>
        )}

        {/* Right Status: Energy, Server Stability, Clock & Pause */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Energy Meter */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0c1322]/95 border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs">
            <Zap
              className={`w-3.5 h-3.5 ${
                stats.energy > 50 ? 'text-amber-400' : 'text-red-400'
              }`}
            />
            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  stats.energy > 50 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${stats.energy}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-300 tabular-nums">
              {Math.round(stats.energy)}%
            </span>
          </div>

          {/* Server Stability */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1322]/95 border border-slate-700/80 shadow-lg text-xs font-mono tabular-nums">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span
              className={`font-bold ${
                stats.serverStability > 80 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              %{stats.serverStability.toFixed(1)}
            </span>
          </div>

          {/* Clock */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0c1322]/95 border border-slate-700/80 shadow-lg text-xs font-mono text-slate-300 flex items-center gap-1.5 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {String(stats.hour).padStart(2, '0')}:{String(stats.minute).padStart(2, '0')}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="p-2 rounded-xl bg-[#0c1322]/95 hover:bg-slate-800 border border-slate-700/80 shadow-lg text-slate-300 hover:text-white transition cursor-pointer"
            title="Duraklat / Ayarlar"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mid-screen Floating Toast Notifications */}
      <div className="self-center flex flex-col gap-2 max-w-md w-full">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl text-xs font-medium border shadow-xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 duration-200 ${
              n.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
                : n.type === 'alert'
                ? 'bg-red-950/90 text-red-200 border-red-800'
                : 'bg-slate-900/90 text-cyan-200 border-cyan-800'
            }`}
          >
            {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      {/* Bottom Area: Active Project Mini-Tracker & Unified Collapsible Dock */}
      <div className="flex flex-col items-center">
        {/* Active Project Mini-Tracker if exists */}
        {activeProject && (
          <div
            onClick={() => onInteract('desk')}
            className="pointer-events-auto mb-3 px-4 py-2.5 rounded-2xl bg-[#0c1322]/95 border border-cyan-800/80 shadow-2xl text-xs flex items-center gap-4 cursor-pointer hover:border-cyan-400 transition"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-bold text-white text-[11px] truncate max-w-[220px]">
                  {activeProject.title}
                </div>
                <div className="text-[10px] text-slate-400">
                  Kalan: <strong className="text-amber-400 font-mono">{activeProject.timeRemaining}s</strong> • Ödül:{' '}
                  <strong className="text-emerald-400 font-mono">{activeProject.reward.toLocaleString()} ₺</strong>
                </div>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-[10px]">
              VS Code Aç
            </div>
          </div>
        )}

        {/* Collapsible Quick Dock with Plaza Stations */}
        <div className="pointer-events-auto flex flex-col items-center">
          <button
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="mb-1 text-[10px] text-slate-400 hover:text-cyan-400 font-mono flex items-center gap-1 bg-[#0c1322]/80 px-2.5 py-0.5 rounded-full border border-slate-800 transition cursor-pointer"
          >
            {dockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{dockCollapsed ? 'Plaza İstasyonlarını Göster' : 'Gizle'}</span>
          </button>

          {!dockCollapsed && (
            <div className="p-1.5 rounded-2xl bg-[#0c1322]/95 border border-slate-700/80 shadow-2xl flex items-center gap-1.5 flex-wrap justify-center max-w-full">
              {/* Teleport to Desk */}
              <button
                onClick={() => onTeleportTo('desk')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Masam</span>
              </button>

              {/* Teleport to Boss */}
              <button
                onClick={() => onTeleportTo('boss')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Patron (Demir Bey)</span>
              </button>

              {/* Teleport to Burak (Frontend) */}
              <button
                onClick={() => onTeleportTo('burak')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Burak</span>
              </button>

              {/* Teleport to Selin (Backend) */}
              <button
                onClick={() => onTeleportTo('selin')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-purple-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Selin</span>
              </button>

              {/* Teleport to Coffee */}
              <button
                onClick={() => onTeleportTo('coffee')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>Barista</span>
              </button>

              {/* Teleport to Server */}
              <button
                onClick={() => onTeleportTo('server')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
              >
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sunucu / Kaan</span>
              </button>

              {/* Teleport to Lounge */}
              <button
                onClick={() => onTeleportTo('lounge')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-800"
              >
                <Armchair className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lounge</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

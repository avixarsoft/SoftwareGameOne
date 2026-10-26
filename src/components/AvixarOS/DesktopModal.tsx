import React, { useState } from 'react';
import {
  GameStats,
  ProjectContract,
  MailMessage,
  HardwareUpgrade,
  Employee,
  ServerIncident,
  GameDifficulty,
} from '../../types/game';
import { MailApp } from './MailApp';
import { IdeApp } from './IdeApp';
import { ServerConsoleApp } from './ServerConsoleApp';
import { ShopApp } from './ShopApp';
import { AnalyticsApp } from './AnalyticsApp';
import { soundManager } from '../../audio/soundManager';
import {
  Mail,
  Code2,
  Server,
  ShoppingBag,
  TrendingUp,
  X,
  Minus,
  Maximize2,
  Wifi,
  Volume2,
  VolumeX,
  LogOut,
} from 'lucide-react';

interface DesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  mails: MailMessage[];
  projects: ProjectContract[];
  activeProject: ProjectContract | null;
  upgrades: HardwareUpgrade[];
  employees: Employee[];
  serverIncidents: ServerIncident[];
  difficulty: GameDifficulty;
  onToggleDifficulty: () => void;
  onAcceptProject: (projectId: string) => void;
  onRejectProject: (projectId: string) => void;
  onMarkMailRead: (mailId: string) => void;
  onCodeModule: (type: 'architecture' | 'frontend' | 'backend' | 'qa') => void;
  onDeliverProject: () => void;
  onBuyUpgrade: (id: string) => void;
  onHireEmployee: (id: string) => void;
  onResolveIncident: (id: string) => void;
}

export type ActiveAppId = 'mail' | 'ide' | 'server' | 'shop' | 'analytics';

export const DesktopModal: React.FC<DesktopModalProps> = ({
  isOpen,
  onClose,
  stats,
  mails,
  projects,
  activeProject,
  upgrades,
  employees,
  serverIncidents,
  difficulty,
  onToggleDifficulty,
  onAcceptProject,
  onRejectProject,
  onMarkMailRead,
  onCodeModule,
  onDeliverProject,
  onBuyUpgrade,
  onHireEmployee,
  onResolveIncident,
}) => {
  const [activeApp, setActiveApp] = useState<ActiveAppId>('ide');
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  if (!isOpen) return null;

  const handleTabChange = (appId: ActiveAppId) => {
    soundManager.playClick();
    setActiveApp(appId);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const unreadCount = mails.filter((m) => m.unread).length;
  const activeIncidentsCount = serverIncidents.filter((i) => !i.resolved).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 select-none animate-in fade-in duration-200">
      {/* Computer Monitor Bezel */}
      <div className="w-full max-w-6xl h-[88vh] max-h-[820px] bg-[#0c1322] rounded-2xl border-2 border-slate-700/80 shadow-2xl shadow-cyan-950/60 flex flex-col overflow-hidden">
        {/* OS Top Menu Bar */}
        <div className="h-10 bg-[#070b16] border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300 font-sans">
          {/* Left: Brand Monogram & Window controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={onClose}
                title="Pencereyi Kapat ve Masadan Kalk"
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition cursor-pointer flex items-center justify-center group"
              >
                <X className="w-2 h-2 text-slate-900 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={onClose}
                title="Küçült"
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 transition cursor-pointer flex items-center justify-center group"
              >
                <Minus className="w-2 h-2 text-slate-900 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition cursor-pointer flex items-center justify-center group"
              >
                <Maximize2 className="w-2 h-2 text-slate-900 opacity-0 group-hover:opacity-100" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-cyan-400 tracking-wider">AVIXAR OS</span>
              <span className="text-slate-500 text-[10px]">v2.4 Developer Edition</span>
            </div>
          </div>

          {/* Right Status Tray */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-emerald-400 font-bold">
              <span>{stats.money.toLocaleString()} ₺</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono">10 Gbps</span>
            </div>

            <button
              onClick={handleToggleMute}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <div className="font-mono text-slate-300 text-[11px]">
              Gün {stats.day} • {String(stats.hour).padStart(2, '0')}:{String(stats.minute).padStart(2, '0')}
            </div>

            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <LogOut className="w-3 h-3 text-cyan-400" /> Masadan Kalk
            </button>
          </div>
        </div>

        {/* Desktop Active Window Body */}
        <div className="flex-1 overflow-hidden relative">
          {activeApp === 'mail' && (
            <MailApp
              mails={mails}
              onAcceptProject={(id) => {
                onAcceptProject(id);
                setActiveApp('ide');
              }}
              onRejectProject={onRejectProject}
              onMarkRead={onMarkMailRead}
            />
          )}

          {activeApp === 'ide' && (
            <IdeApp
              activeProject={activeProject}
              difficulty={difficulty}
              onToggleDifficulty={onToggleDifficulty}
              onCodeModule={onCodeModule}
              onDeliverProject={onDeliverProject}
              onOpenMail={() => setActiveApp('mail')}
            />
          )}

          {activeApp === 'server' && (
            <ServerConsoleApp
              stats={stats}
              incidents={serverIncidents}
              onResolveIncident={onResolveIncident}
            />
          )}

          {activeApp === 'shop' && (
            <ShopApp
              stats={stats}
              upgrades={upgrades}
              employees={employees}
              onBuyUpgrade={onBuyUpgrade}
              onHireEmployee={onHireEmployee}
            />
          )}

          {activeApp === 'analytics' && (
            <AnalyticsApp stats={stats} projects={projects} />
          )}
        </div>

        {/* Bottom OS Dock */}
        <div className="h-16 bg-[#080d1a]/95 border-t border-slate-800 flex items-center justify-center px-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-xl">
            {/* Mail */}
            <button
              onClick={() => handleTabChange('mail')}
              className={`relative p-2.5 rounded-xl transition cursor-pointer flex flex-col items-center ${
                activeApp === 'mail'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* IDE */}
            <button
              onClick={() => handleTabChange('ide')}
              className={`relative p-2.5 rounded-xl transition cursor-pointer flex flex-col items-center ${
                activeApp === 'ide'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-5 h-5" />
              {activeProject && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Server */}
            <button
              onClick={() => handleTabChange('server')}
              className={`relative p-2.5 rounded-xl transition cursor-pointer flex flex-col items-center ${
                activeApp === 'server'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-5 h-5" />
              {activeIncidentsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center animate-bounce">
                  {activeIncidentsCount}
                </span>
              )}
            </button>

            {/* Store & Hire */}
            <button
              onClick={() => handleTabChange('shop')}
              className={`relative p-2.5 rounded-xl transition cursor-pointer flex flex-col items-center ${
                activeApp === 'shop'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
            </button>

            {/* Analytics */}
            <button
              onClick={() => handleTabChange('analytics')}
              className={`relative p-2.5 rounded-xl transition cursor-pointer flex flex-col items-center ${
                activeApp === 'analytics'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

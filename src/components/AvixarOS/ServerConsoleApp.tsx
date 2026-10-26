import React, { useState } from 'react';
import { GameStats, ServerIncident } from '../../types/game';
import {
  Server,
  Activity,
  Shield,
  RefreshCw,
  Cpu,
  Wifi,
  AlertOctagon,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface ServerConsoleAppProps {
  stats: GameStats;
  incidents: ServerIncident[];
  onResolveIncident: (id: string) => void;
}

export const ServerConsoleApp: React.FC<ServerConsoleAppProps> = ({
  stats,
  incidents,
  onResolveIncident,
}) => {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] Avixar Cluster Orchestrator v4.1 online.',
    '[NET] Edge router established BGP peering across 8 datacenters.',
    '[TELEMETRY] Load: 2,450 req/sec | Latency: 18ms | SSL: Active (Let\'s Encrypt Wildcard)',
    '[SECURITY] DDoS Shield active: SYN-flood and rate-limiting enabled.',
  ]);
  const [cliInput, setCliInput] = useState('');

  const runCommand = (cmd: string) => {
    const clean = cmd.trim().toLowerCase();
    const newLogs = [...terminalLogs, `$ ${cmd}`];

    if (clean === 'avixar status' || clean === 'status') {
      newLogs.push(`>> SYSTEM STATUS: 99.98% UPTIME | STABILITY: ${stats.serverStability.toFixed(1)}% | RPS: ~3,120`);
    } else if (clean.includes('reboot') || clean.includes('restart')) {
      newLogs.push('>> [ACTION] Gracefully restarting worker nodes... Nodes reloaded in 380ms.');
    } else if (clean.includes('flush') || clean.includes('cache')) {
      newLogs.push('>> [CACHE] Redis memory flushed. 2.4 GB memory freed.');
    } else if (clean.includes('ddos') || clean.includes('firewall')) {
      newLogs.push('>> [FIREWALL] Scrubbing centers active. Dropping unauthorized packet floods.');
    } else if (clean === 'help') {
      newLogs.push('>> Available commands: status, reboot, flush, firewall, clear');
    } else if (clean === 'clear') {
      setTerminalLogs([]);
      setCliInput('');
      return;
    } else {
      newLogs.push(`>> Command not recognized: "${cmd}". Type "help" for options.`);
    }

    setTerminalLogs(newLogs.slice(-14));
    setCliInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && cliInput) {
      runCommand(cliInput);
    }
  };

  const activeIncidents = incidents.filter((i) => !i.resolved);

  return (
    <div className="flex h-full bg-[#080d1a] text-slate-200 select-none overflow-hidden font-mono text-xs">
      {/* Left Telemetry Column */}
      <div className="w-80 bg-[#070b16] border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-4 text-cyan-400 font-bold text-sm">
            <Server className="w-4 h-4" />
            <span>ALTYAPI TELEMETRİSİ</span>
          </div>

          {/* Metric Cards */}
          <div className="space-y-3 mb-5">
            {/* Stability */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">Sunucu Kararlılığı</span>
                <span
                  className={`text-xs font-bold ${
                    stats.serverStability > 80
                      ? 'text-emerald-400'
                      : stats.serverStability > 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {stats.serverStability.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    stats.serverStability > 80
                      ? 'bg-emerald-400'
                      : stats.serverStability > 50
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${stats.serverStability}%` }}
                />
              </div>
            </div>

            {/* Load & RPS */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>Trafik (RPS)</span>
                </div>
                <div className="text-sm font-bold text-cyan-300">
                  {(2400 + Math.round(stats.reputation * 35)).toLocaleString()} /s
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  <span>CPU Yükü</span>
                </div>
                <div className="text-sm font-bold text-purple-300">
                  {Math.round(20 + activeIncidents.length * 35)}%
                </div>
              </div>
            </div>

            {/* SaaS Recurring Revenue */}
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
              <div className="text-[10px] text-slate-400 mb-0.5">AYLIK DÜZENLİ SAAS GELİRİ</div>
              <div className="text-base font-bold text-emerald-400">
                {stats.recurringMonthlyRevenue.toLocaleString()} ₺ / ay
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1">
                Tamamlanan {stats.completedProjectsCount} web altyapısı aktif barındırılıyor.
              </div>
            </div>
          </div>

          {/* Quick Diagnostics Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Hızlı Sistem Müdahaleleri
            </span>
            <button
              onClick={() => runCommand('avixar reboot')}
              className="w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Düğümleri Yeniden Başlat
              </span>
              <span className="text-[9px] text-slate-500">Fast-boot</span>
            </button>
            <button
              onClick={() => runCommand('avixar flush')}
              className="w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Önbelleği Temizle
              </span>
              <span className="text-[9px] text-slate-500">Redis Flush</span>
            </button>
            <button
              onClick={() => runCommand('avixar ddos --mitigate')}
              className="w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-purple-400" /> DDoS Kalkanını Devreye Al
              </span>
              <span className="text-[9px] text-slate-500">WAF Strict</span>
            </button>
          </div>
        </div>

        {/* Server status indicator */}
        <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Bütün Altyapı Düğümleri Senkron</span>
        </div>
      </div>

      {/* Center Console Terminal & Incidents */}
      <div className="flex-1 flex flex-col bg-[#0b101f] overflow-hidden">
        {/* Active Incidents Banner */}
        {activeIncidents.length > 0 && (
          <div className="p-3 bg-red-950/40 border-b border-red-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 font-bold text-xs flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 animate-bounce" />
                DİKKAT: {activeIncidents.length} AKTİF SİSTEM KRİZİ TESPİT EDİLDİ!
              </span>
              <span className="text-[10px] text-red-300">Stabiliteniz düşüyor!</span>
            </div>

            <div className="space-y-2">
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-900/90 border border-red-900/50"
                >
                  <div>
                    <div className="font-bold text-slate-200 text-xs">{inc.title}</div>
                    <div className="text-[11px] text-slate-400">{inc.description}</div>
                  </div>
                  <button
                    onClick={() => {
                      onResolveIncident(inc.id);
                      runCommand(`avixar fix --incident ${inc.id}`);
                    }}
                    className="py-1 px-3 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-lg shadow-red-600/30 transition"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Müdahale Et & Çöz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terminal Header */}
        <div className="h-9 bg-[#090d19] border-b border-slate-800 flex items-center px-4 justify-between">
          <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>AVIXAR INFRA TERMINAL (BASH v5.2)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[10px]">
            <span>NODE: cluster-alpha-01</span>
            <span>•</span>
            <span className="text-emerald-400">UPTIME: 14d 6h</span>
          </div>
        </div>

        {/* Terminal Log Output */}
        <div className="flex-1 p-4 bg-[#080d18] overflow-y-auto text-slate-300 font-mono text-[11px] space-y-1">
          {terminalLogs.map((log, idx) => (
            <div
              key={idx}
              className={`${
                log.startsWith('$')
                  ? 'text-cyan-400 font-semibold'
                  : log.startsWith('>>')
                  ? 'text-emerald-300'
                  : 'text-slate-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>

        {/* Terminal CLI Command Input */}
        <div className="p-3 bg-[#0a0f21] border-t border-slate-800 flex items-center gap-2">
          <span className="text-cyan-400 font-bold">$</span>
          <input
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Komut yazın (örn: avixar status, reboot, flush, help)..."
            className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono text-xs placeholder:text-slate-600"
          />
          <button
            onClick={() => runCommand(cliInput)}
            className="py-1 px-3 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-bold text-[10px] transition cursor-pointer"
          >
            Çalıştır
          </button>
        </div>
      </div>
    </div>
  );
};

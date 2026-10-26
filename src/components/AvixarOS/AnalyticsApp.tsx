import React from 'react';
import { GameStats, ProjectContract } from '../../types/game';
import {
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AnalyticsAppProps {
  stats: GameStats;
  projects: ProjectContract[];
}

export const AnalyticsApp: React.FC<AnalyticsAppProps> = ({ stats, projects }) => {
  const completedProjects = projects.filter((p) => p.status === 'completed');

  const getLevelTitle = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'Garaj Girişimi (Seed Stage)';
      case 2:
        return 'Teknokent İnovasyon Ofisi';
      case 3:
        return 'Büyüyen Yazılım & SaaS Ajansı';
      case 4:
        return 'Kurumsal Teknoloji Şirketi';
      case 5:
        return 'Global Bulut & Altyapı Devi';
      default:
        return 'Yazılım Şirketi';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-200 select-none overflow-y-auto p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">AVIXAR MALİ & STRATEJİ RAPORU</h2>
          <p className="text-xs text-slate-400">Şirket büyüme eğrisi, bilanço ve tamamlanan projeler</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-bold">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>{getLevelTitle(stats.companyLevel)}</span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Kasa / Likit Nakit</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {stats.money.toLocaleString()} ₺
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Şirket Prestiji</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400">
            {stats.reputation} EXP
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Düzenli SaaS Geliri</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">
            {stats.recurringMonthlyRevenue.toLocaleString()} ₺ / ay
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Teslim Edilen Projeler</span>
            <CheckCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400">
            {stats.completedProjectsCount} Adet
          </div>
        </div>
      </div>

      {/* Next Level Progression */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-cyan-950/30 border border-slate-800 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">BİR SONRAKİ ŞİRKET SEVİYESİ</span>
          </div>
          <span className="text-xs text-cyan-400 font-bold">
            {stats.reputation} / {stats.companyLevel * 150} EXP
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (stats.reputation / (stats.companyLevel * 150)) * 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Daha fazla sözleşme tamamlayıp şirketinizi büyüterek yeni ofis dekorasyonları ve kurumsal müşterilerin kilidini açın.
        </p>
      </div>

      {/* Completed Projects Portfolio */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-cyan-400" />
          <span>PORTFÖY VE BAŞARI LİSTESİ</span>
        </h3>

        {completedProjects.length > 0 ? (
          <div className="space-y-2">
            {completedProjects.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-xs">{p.title}</div>
                  <div className="text-[11px] text-slate-400">{p.client}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">
                    +{p.reward.toLocaleString()} ₺
                  </span>
                  <div className="text-[10px] text-cyan-400">+{p.exp} EXP</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
            Henüz teslim edilmiş bir proje bulunmuyor. İlk projenizi tamamladığınızda burada sergilenecektir.
          </div>
        )}
      </div>
    </div>
  );
};

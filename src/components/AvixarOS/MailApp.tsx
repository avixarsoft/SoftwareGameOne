import React, { useState } from 'react';
import { MailMessage } from '../../types/game';
import { Mail, CheckCircle, FileText, Send, AlertTriangle, Inbox } from 'lucide-react';

interface MailAppProps {
  mails: MailMessage[];
  onAcceptProject: (projectId: string) => void;
  onRejectProject: (projectId: string) => void;
  onMarkRead: (mailId: string) => void;
}

export const MailApp: React.FC<MailAppProps> = ({
  mails,
  onAcceptProject,
  onRejectProject,
  onMarkRead,
}) => {
  const [selectedMailId, setSelectedMailId] = useState<string>(mails[0]?.id || '');

  const selectedMail = mails.find((m) => m.id === selectedMailId) || mails[0];

  const handleSelect = (m: MailMessage) => {
    setSelectedMailId(m.id);
    if (m.unread) {
      onMarkRead(m.id);
    }
  };

  return (
    <div className="flex h-full bg-[#0a0f1d] text-slate-200 select-none overflow-hidden">
      {/* Sidebar Folders */}
      <div className="w-56 bg-[#080d1a] border-r border-slate-800 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 px-2 py-1.5 text-cyan-400 font-semibold text-sm tracking-wide">
            <Inbox className="w-4 h-4" />
            <span>AVIXAR MAIL</span>
          </div>

          <div className="space-y-1">
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-950/40 text-cyan-300 text-xs font-medium border border-cyan-800/40">
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Gelen Kutusu
              </span>
              <span className="bg-cyan-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {mails.filter((m) => m.unread).length}
              </span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/50 text-slate-400 text-xs font-medium transition">
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Sözleşmeler
              </span>
              <span className="text-slate-500 text-[10px]">
                {mails.filter((m) => m.type === 'contract').length}
              </span>
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/50 text-slate-400 text-xs font-medium transition">
              <span className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5" /> Arşiv
              </span>
            </button>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300">Güvenlik Durumu</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">TLS 1.3 Şifreli Bağlantı Aktif</p>
        </div>
      </div>

      {/* Email List Column */}
      <div className="w-80 bg-[#0c1322] border-r border-slate-800 flex flex-col overflow-y-auto">
        <div className="p-3 border-b border-slate-800/80 bg-[#0d1527] flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Gelen Mesajlar ({mails.length})</span>
          <span className="text-[11px] text-cyan-400">Canlı Senkron</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {mails.map((m) => {
            const isSelected = m.id === selectedMailId;
            return (
              <div
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`p-3.5 cursor-pointer transition flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-slate-800/80 border-l-2 border-cyan-400'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold truncate ${
                      m.unread ? 'text-white font-bold' : 'text-slate-300'
                    }`}
                  >
                    {m.sender}
                  </span>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                    {m.date}
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-medium truncate">
                  {m.subject}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {m.content}
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  {m.type === 'contract' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Sözleşme Teklifi
                    </span>
                  )}
                  {m.type === 'client_review' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Müşteri İncelemesi
                    </span>
                  )}
                  {m.type === 'system' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Sistem Bildirimi
                    </span>
                  )}
                  {m.unread && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 ml-auto" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Reader View */}
      <div className="flex-1 bg-[#0a0f1d] flex flex-col justify-between overflow-y-auto p-6">
        {selectedMail ? (
          <div>
            {/* Header */}
            <div className="pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    {selectedMail.subject}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-cyan-400">
                      {selectedMail.sender}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{selectedMail.senderRole}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded">
                  {selectedMail.date}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 mb-6">
              {selectedMail.content}
            </div>

            {/* Contract Attachment Box */}
            {selectedMail.contract && (
              <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-800/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-white text-sm">
                      SÖZLEŞME VE PROJE BİLGİSİ
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedMail.contract.category.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">SÖZLEŞME BEDELİ</div>
                    <div className="text-base font-bold text-emerald-400">
                      {selectedMail.contract.reward.toLocaleString()} ₺
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">ŞİRKET PRESTİJİ</div>
                    <div className="text-base font-bold text-cyan-400">
                      +{selectedMail.contract.exp} EXP
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">TESLİM SÜRESİ</div>
                    <div className="text-base font-bold text-amber-400">
                      {selectedMail.contract.deadlineSeconds} saniye
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">ZORLUK SEVİYESİ</div>
                    <div className="text-base font-bold text-purple-400">
                      {'★'.repeat(selectedMail.contract.complexity)}
                    </div>
                  </div>
                </div>

                {selectedMail.contract.status === 'available' ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onAcceptProject(selectedMail.contract!.id)}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" /> Projeyi Kabul Et & İmzala
                    </button>
                    <button
                      onClick={() => onRejectProject(selectedMail.contract!.id)}
                      className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                    >
                      Teklifi Geri Çevir
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-800/80 text-cyan-300 text-xs font-semibold text-center border border-slate-700">
                    {selectedMail.contract.status === 'in-progress' && 'Bu proje şu an Geliştirme Stüdyosu (IDE) üzerinde aktif!'}
                    {selectedMail.contract.status === 'completed' && 'Bu proje başarıyla teslim edildi ve arşivlendi.'}
                    {selectedMail.contract.status === 'failed' && 'Bu projenin teslim süresi aşıldı.'}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
            <Mail className="w-12 h-12 stroke-[1.2] mb-2 text-slate-600" />
            Okumak için bir e-posta seçin
          </div>
        )}
      </div>
    </div>
  );
};

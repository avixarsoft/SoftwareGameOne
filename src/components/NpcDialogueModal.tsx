import React, { useState } from 'react';
import { InteractionStation, GameStats, ProjectContract } from '../types/game';
import {
  Briefcase,
  MessageSquare,
  Award,
  Zap,
  Coffee,
  X,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface NpcDialogueModalProps {
  station: InteractionStation;
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onAssignBossProject?: (proj: ProjectContract) => void;
  onBoostProgress?: (module: 'frontend' | 'backend' | 'architecture' | 'server') => void;
  onAddBonusCash?: (amount: number) => void;
}

export const NpcDialogueModal: React.FC<NpcDialogueModalProps> = ({
  station,
  isOpen,
  onClose,
  stats,
  onAssignBossProject,
  onBoostProgress,
  onAddBonusCash,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !station) return null;

  const getNpcData = () => {
    switch (station) {
      case 'boss':
        return {
          name: 'Demir Yılmaz',
          role: 'Avixar Software Kurucusu & CEO (Patron)',
          avatarColor: '#1e3a8a',
          quote:
            'Hoş geldin Ahmet! 35. kat plazamıza yakışır küresel yazılımlar üretmek zorundayız. Maslak’taki kurumsal müşteriler hata kabul etmez. Masandaki VS Code stüdyosunda kodları pürüzsüz yaz, canlıya almadan önce QA testlerini tamamla.',
          actions: [
            {
              label: 'Patrondan Yeni Öncelikli Proje İste',
              icon: <Briefcase className="w-4 h-4 text-cyan-400" />,
              action: () => {
                soundManager.playSuccess(680, 0.3);
                if (onAssignBossProject) {
                  const bossProj: ProjectContract = {
                    id: `boss-proj-${Date.now().toString().slice(-4)}`,
                    title: 'FinTech PayStream - Kurumsal Ödeme Motoru',
                    client: 'QNB & Akbank Ortak Konsorsiyumu',
                    category: 'security',
                    description: 'Demir Bey tarafından bizzat atanan yüksek bütçeli, PCI-DSS uyumlu mikroservis mimarisi.',
                    reward: 28000,
                    exp: 160,
                    deadlineSeconds: 180,
                    timeRemaining: 180,
                    complexity: 4,
                    requiredArchitecture: 60,
                    requiredFrontend: 50,
                    requiredBackend: 90,
                    requiredQA: 60,
                    currentArchitecture: 0,
                    currentFrontend: 0,
                    currentBackend: 0,
                    currentQA: 0,
                    status: 'available',
                    bugs: 0,
                    iconName: 'ShieldCheck',
                    assignedByBoss: true,
                    bossNote: 'Patron Notu: Bu teslimat şirketimizin halka arz değerini ikiye katlayacak!',
                    hardModeChallenges: [
                      {
                        file: 'payment_engine.ts',
                        description: 'Ödeme doğrulama ve tokenizasyon fonksiyonunu implemente et',
                        targetCode: 'export async function processPayment(token: string, amount: number): Promise<boolean> { return await bankGateway.charge(token, amount); }',
                        completed: false,
                      },
                    ],
                  };
                  onAssignBossProject(bossProj);
                  setFeedback('Demir Bey sana 28.000 ₺ değerinde yeni bir FinTech projesi atadı! Masana geç ve başla.');
                }
              },
            },
            {
              label: 'Performans Primi / Zam Talep Et',
              icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
              action: () => {
                if (stats.completedProjectsCount >= 1) {
                  soundManager.playCashRegister();
                  onAddBonusCash?.(3500);
                  setFeedback('Demir Bey: "Çalışmalarından çok memnunum! Al sana 3.500 ₺ başarı ikramiyesi."');
                } else {
                  soundManager.playAlert();
                  setFeedback('Demir Bey: "Önce masana geçip ilk projeyi canlıya al bakalım, prim sonra!"');
                }
              },
            },
            {
              label: 'Şirket Vizyonunu Dinle',
              icon: <Sparkles className="w-4 h-4 text-amber-400" />,
              action: () => {
                soundManager.playClick();
                setFeedback('Demir Bey: "Avixar Software sadece bir yazılım evi değil; Avrupa’nın en kararlı dijital altyapı omurgası olacak!"');
              },
            },
          ],
        };

      case 'burak':
        return {
          name: 'Burak',
          role: 'Junior Frontend Geliştirici',
          avatarColor: '#10b981',
          quote:
            'Selam abi! Tailwind 4 ve React 19 bileşenlerini düzenliyordum. Şuradaki CSS grid yapısında responsive taşma oluyordu, çözdüm sanırım. Frontend tarafında yardıma ihtiyacın olursa buradayım!',
          actions: [
            {
              label: 'Frontend Modülünde Birlikte Kodla (Pair-Programming)',
              icon: <Zap className="w-4 h-4 text-blue-400" />,
              action: () => {
                soundManager.playKeyClick();
                onBoostProgress?.('frontend');
                setFeedback('Burak ile birlikte çalıştınız! Frontend arayüz modülüne +25 ilerleme puanı eklendi.');
              },
            },
            {
              label: 'Kahve Arası Ver & Sohbet Et',
              icon: <Coffee className="w-4 h-4 text-amber-400" />,
              action: () => {
                soundManager.playSuccess(540, 0.2);
                setFeedback('Burak: "Abi Maslak plazası cidden çok ferah, kahveler de harika. Enerjim yerine geldi!"');
              },
            },
          ],
        };

      case 'selin':
        return {
          name: 'Selin',
          role: 'Senior Backend Mimarı',
          avatarColor: '#8b5cf6',
          quote:
            'Merhaba! PostgreSQL indekslerini B-Tree olarak optimize ettim. Sorgu sürelerini 42 milisaniyeden 3 milisaniyeye çektim. Mimari ya da veritabanı tıkanıklığı yaşarsan haber ver, mikroservisleri elden geçirelim.',
          actions: [
            {
              label: 'Backend & Veritabanı Desteği İste',
              icon: <Zap className="w-4 h-4 text-emerald-400" />,
              action: () => {
                soundManager.playKeyClick();
                onBoostProgress?.('backend');
                setFeedback('Selin API rotalarını optimize etti! Backend modülüne +25 ilerleme puanı eklendi.');
              },
            },
            {
              label: 'Sistem Mimarisi İncelemesi Yap',
              icon: <Award className="w-4 h-4 text-purple-400" />,
              action: () => {
                soundManager.playKeyClick();
                onBoostProgress?.('architecture');
                setFeedback('Selin mimariyi denetledi! Mimari modülüne +25 ilerleme puanı eklendi.');
              },
            },
          ],
        };

      case 'zeynep':
        return {
          name: 'Zeynep',
          role: 'UI/UX Baş Tasarımcısı',
          avatarColor: '#f59e0b',
          quote:
            'Harika bir Figma tasarım sistemi hazırladım! Kullanıcı deneyimini pürüzsüz kılmak için buton kontrastlarını ve mikro-animasyonları ayarladım. Projede harika duracak!',
          actions: [
            {
              label: 'Tasarım Bileşenlerini İçe Aktar',
              icon: <Sparkles className="w-4 h-4 text-amber-400" />,
              action: () => {
                soundManager.playSuccess(600, 0.2);
                onBoostProgress?.('frontend');
                setFeedback('Zeynep’in Figma bileşenleri entegre edildi! Frontend modülüne +30 ilerleme puanı eklendi.');
              },
            },
          ],
        };

      case 'kaan':
        return {
          name: 'Kaan',
          role: 'DevOps & Bulut Güvenliği Uzmanı',
          avatarColor: '#06b6d4',
          quote:
            'Sunucu kabini stabil çalışıyor. Redis önbelleği ve Kubernetes pod’larında hiçbir sızıntı yok. Olası bir DDoS saldırısında haber ver, Cloudflare ve güvenlik duvarı kurallarını anında sıkarım.',
          actions: [
            {
              label: 'Sunucu Sağlık Taraması Yap',
              icon: <Zap className="w-4 h-4 text-cyan-400" />,
              action: () => {
                soundManager.playSuccess(750, 0.2);
                onBoostProgress?.('server');
                setFeedback('Kaan sunucu düğümlerini temizledi ve yükü dengeledi! Kararlılık +%15 arttı.');
              },
            },
          ],
        };

      default:
        return null;
    }
  };

  const npc = getNpcData();
  if (!npc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0c1322] rounded-2xl border border-cyan-800/60 shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-lg"
              style={{ backgroundColor: npc.avatarColor }}
            >
              {npc.name[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{npc.name}</h2>
              <p className="text-xs text-cyan-400 font-medium">{npc.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NPC Dialogue Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-5">
          "{npc.quote}"
        </div>

        {/* Feedback Alert if action occurred */}
        {feedback && (
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-700/60 text-cyan-200 text-xs font-semibold mb-4 flex items-center gap-2 animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Interaction Actions */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Etkileşim Seçenekleri
          </span>
          {npc.actions.map((act, idx) => (
            <button
              key={idx}
              onClick={act.action}
              className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-600/50 text-left text-xs font-semibold text-slate-200 flex items-center justify-between transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-950 transition">
                  {act.icon}
                </div>
                <span>{act.label}</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition">
                Uygula →
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
        >
          Konuşmayı Bitir ve İşe Dön
        </button>
      </div>
    </div>
  );
};

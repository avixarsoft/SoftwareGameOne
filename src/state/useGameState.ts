import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameStats,
  ProjectContract,
  MailMessage,
  HardwareUpgrade,
  Employee,
  ServerIncident,
  GameDifficulty,
} from '../types/game';
import { soundManager } from '../audio/soundManager';

const INITIAL_PROJECTS: ProjectContract[] = [
  {
    id: 'proj-1',
    title: 'MediSync - Klinik Randevu Sistemi',
    client: 'Özel Vadi Tıp Merkezi',
    category: 'web-app',
    description: 'Hasta randevu takibi, doktor ajandası ve SMS entegrasyonu içeren modern bulut tabanlı bir sağlık portalı.',
    reward: 8500,
    exp: 50,
    deadlineSeconds: 160,
    timeRemaining: 160,
    complexity: 1,
    requiredArchitecture: 20,
    requiredFrontend: 40,
    requiredBackend: 40,
    requiredQA: 20,
    currentArchitecture: 0,
    currentFrontend: 0,
    currentBackend: 0,
    currentQA: 0,
    status: 'available',
    bugs: 0,
    iconName: 'HeartPulse',
    bossNote: 'Patron Notu: Özel Vadi Tıp Merkezi yönetim kuruluyla bizzat el sıkıştım. Hızlı ve temiz teslimat istiyorum!',
  },
  {
    id: 'proj-2',
    title: 'EcoCart - Akıllı E-Ticaret Altyapısı',
    client: 'Nordic Style Mobilya',
    category: 'ecommerce',
    description: 'Yüksek trafikli, sepet optimizasyonlu ve iyzico ödeme geçidi destekli headless e-ticaret altyapısı.',
    reward: 14500,
    exp: 85,
    deadlineSeconds: 220,
    timeRemaining: 220,
    complexity: 2,
    requiredArchitecture: 40,
    requiredFrontend: 60,
    requiredBackend: 60,
    requiredQA: 35,
    currentArchitecture: 0,
    currentFrontend: 0,
    currentBackend: 0,
    currentQA: 0,
    status: 'available',
    bugs: 0,
    iconName: 'ShoppingBag',
    bossNote: 'Patron Notu: Cuma günkü indirim çılgınlığına yetişmesi gerek. Selin ile arka plan sorgularını optimize edin.',
  },
  {
    id: 'proj-3',
    title: 'OmniCloud - Dağıtık Depolama Ağı',
    client: 'DataVortex Bilişim',
    category: 'cloud',
    description: 'S3 uyumlu, uç noktalarda şifrelenmiş ve otomatik yedeklemeli kurumsal bulut depolama mikroservisi.',
    reward: 26000,
    exp: 150,
    deadlineSeconds: 320,
    timeRemaining: 320,
    complexity: 3,
    requiredArchitecture: 70,
    requiredFrontend: 50,
    requiredBackend: 90,
    requiredQA: 60,
    currentArchitecture: 0,
    currentFrontend: 0,
    currentBackend: 0,
    currentQA: 0,
    status: 'available',
    bugs: 0,
    iconName: 'Server',
    bossNote: 'Patron Notu: Kaan sunucu kabininde disk ve bant genişliği kontrollerini yapıyor. Tam kadro odaklanın.',
  },
];

const INITIAL_MAILS: MailMessage[] = [
  {
    id: 'mail-boss-directive',
    sender: 'Demir Yılmaz',
    senderRole: 'Avixar Software CEO (Patron)',
    subject: '35. Kat Maslak Plazamıza Hoş Geldin! İlk Görevin',
    date: 'Bugün, 09:00',
    content: `Ahmet merhaba,
Avixar Software Maslak Tech Plaza 35. katındaki yeni çalışma masana hoş geldin. Ekip arkadaşlarımız Burak (Frontend), Selin (Backend), Zeynep (UI/UX) ve Kaan (DevOps) ofiste yerlerini aldılar.

Bugün ilk iş olarak Özel Vadi Tıp Merkezi'nin klinik randevu sistemi (MediSync) projesini üstleneceksin. Masandaki VS Code stüdyosuna geç, sözleşmeyi incele ve hemen geliştirmeye başla.

Zorluk seviyesini VS Code üzerinden istediğin zaman "Kolay (Simülasyon)" veya "Zor (Gerçek Kod Yazımı)" olarak değiştirebilirsin. Herhangi bir sorunda odama gelip benimle doğrudan konuşabilirsin. Başarılar!`,
    unread: true,
    type: 'boss_directive',
  },
  {
    id: 'mail-contract-1',
    sender: 'Dr. Kerem Arslan',
    senderRole: 'Özel Vadi Tıp Merkezi BT Direktörü',
    subject: 'Sözleşme Onayı: MediSync Klinik Randevu Portalı',
    date: 'Bugün, 09:15',
    content: `Sayın Avixar Software Ekibi,
Demir Bey ile yaptığımız görüşme doğrultusunda projemizin geliştirme aşamasını başlatmak istiyoruz. Proje detayları ve bütçe ekte sunulmuştur.`,
    unread: true,
    type: 'contract',
    contract: INITIAL_PROJECTS[0],
  },
];

const INITIAL_UPGRADES: HardwareUpgrade[] = [
  {
    id: 'up-keyboard',
    name: 'Mekanik Gateron Switch Klavye',
    category: 'hardware',
    description: 'Dokunsal geri bildirim ve optimize edilmiş vuruş derinliğiyle kod yazma hızını %25 artırır.',
    cost: 1800,
    level: 0,
    maxLevel: 3,
    bonusType: 'code_speed',
    bonusValue: 25,
    unlocked: false,
    icon: 'Keyboard',
  },
  {
    id: 'up-monitor',
    name: 'Çift 4K UltraWide Monitör',
    category: 'hardware',
    description: 'Geniş ekran çalışma alanı sayesinde arayüz ve test hata oranını %30 azaltır.',
    cost: 4500,
    level: 0,
    maxLevel: 3,
    bonusType: 'bug_reduction',
    bonusValue: 30,
    unlocked: false,
    icon: 'Monitor',
  },
  {
    id: 'up-chair',
    name: 'Ergonomik Lumbar Mesh Koltuk',
    category: 'office',
    description: 'Omurga desteği sayesinde kodlama esnasında karakterin enerji tüketimini %35 yavaşlatır.',
    cost: 3200,
    level: 0,
    maxLevel: 2,
    bonusType: 'energy_efficiency',
    bonusValue: 35,
    unlocked: false,
    icon: 'Armchair',
  },
  {
    id: 'up-espresso',
    name: 'İtalyan Çift Kazanlı Espresso Barı',
    category: 'office',
    description: 'Kahve makinesinden alınan her espresso karakterin enerjisini anında %60 doldurur.',
    cost: 2500,
    level: 0,
    maxLevel: 2,
    bonusType: 'energy_efficiency',
    bonusValue: 60,
    unlocked: false,
    icon: 'Coffee',
  },
  {
    id: 'up-server',
    name: 'NVMe Gen5 Enterprise Blade Sunucu',
    category: 'network',
    description: 'Sunucu kabinine eklenen kurumsal blade üniteleri ile sistem stabilitesini ve bant genişliğini katlar.',
    cost: 8500,
    level: 0,
    maxLevel: 4,
    bonusType: 'server_capacity',
    bonusValue: 50,
    unlocked: false,
    icon: 'HardDrive',
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Burak',
    role: 'Frontend Geliştirici',
    salary: 220,
    productivity: 2.5,
    morale: 95,
    hired: true,
    avatarColor: '#10b981',
    avatarSeed: 101,
    dialogue: 'React 19 ve Tailwind bileşenleri harika çalışıyor abi!',
    interactionOptions: [],
  },
  {
    id: 'emp-2',
    name: 'Selin',
    role: 'Backend Mimarı',
    salary: 380,
    productivity: 3.5,
    morale: 92,
    hired: true,
    avatarColor: '#8b5cf6',
    avatarSeed: 202,
    dialogue: 'PostgreSQL sorguları ve API rotaları taş gibi stabil.',
    interactionOptions: [],
  },
  {
    id: 'emp-3',
    name: 'Kaan',
    role: 'DevOps Uzmanı',
    salary: 420,
    productivity: 4.0,
    morale: 90,
    hired: true,
    avatarColor: '#06b6d4',
    avatarSeed: 303,
    dialogue: 'Kubernetes cluster ve ağ gecikmeleri 12ms altında.',
    interactionOptions: [],
  },
  {
    id: 'emp-4',
    name: 'Zeynep',
    role: 'UI/UX Tasarımcısı',
    salary: 260,
    productivity: 2.8,
    morale: 96,
    hired: true,
    avatarColor: '#f59e0b',
    avatarSeed: 404,
    dialogue: 'Figma tasarım sistemini kodla tam uyumlu hale getirdim!',
    interactionOptions: [],
  },
];

export function useGameState() {
  const [stats, setStats] = useState<GameStats>(() => {
    return {
      money: 7500,
      reputation: 25,
      companyLevel: 2,
      day: 1,
      hour: 9,
      minute: 0,
      energy: 100,
      serverStability: 99.8,
      serverLoad: 18,
      completedProjectsCount: 0,
      totalRevenueEarned: 7500,
      recurringMonthlyRevenue: 1200,
      difficulty: 'easy',
    };
  });

  const [mails, setMails] = useState<MailMessage[]>(INITIAL_MAILS);
  const [projects, setProjects] = useState<ProjectContract[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProject] = useState<ProjectContract | null>(null);
  const [upgrades, setUpgrades] = useState<HardwareUpgrade[]>(INITIAL_UPGRADES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [serverIncidents, setServerIncidents] = useState<ServerIncident[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; type: 'info' | 'success' | 'alert' }>>([]);

  const activeProjectRef = useRef<ProjectContract | null>(null);
  activeProjectRef.current = activeProject;

  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;

  const pushNotification = useCallback((text: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  // Toggle Difficulty (Easy vs Hard)
  const toggleDifficulty = useCallback(() => {
    soundManager.playClick();
    setStats((s) => {
      const nextDiff: GameDifficulty = s.difficulty === 'easy' ? 'hard' : 'easy';
      pushNotification(
        nextDiff === 'hard'
          ? 'Zor Mod Aktif: VS Code içinde gerçek kod yazarak projeleri tamamlayın!'
          : 'Kolay Mod Aktif: Modül butonları ve simülasyon mekanikleri devreye alındı.',
        'info'
      );
      return { ...s, difficulty: nextDiff };
    });
  }, [pushNotification]);

  // Assign Boss Project
  const assignBossProject = useCallback(
    (bossProj: ProjectContract) => {
      setProjects((prev) => [bossProj, ...prev]);
      setActiveProject(bossProj);
      pushNotification(`Demir Bey: "${bossProj.title}" projesi atandı! Masana geç ve başla.`, 'success');

      // Add notification email
      const bossMail: MailMessage = {
        id: `mail-boss-${Date.now()}`,
        sender: 'Demir Yılmaz',
        senderRole: 'Avixar Software CEO (Patron)',
        subject: `Öncelikli Talimat: ${bossProj.title}`,
        date: 'Şimdi',
        content: `Ahmet, bu proje şirketimiz için kritik önem taşıyor. Ödülü ${bossProj.reward.toLocaleString()} ₺ olarak belirledim. Hatasız şekilde bitirmeni bekliyorum.`,
        unread: true,
        type: 'boss_directive',
        contract: bossProj,
      };
      setMails((prev) => [bossMail, ...prev]);
    },
    [pushNotification]
  );

  // Boost Progress by Coworker
  const boostProgress = useCallback(
    (moduleType: 'frontend' | 'backend' | 'architecture' | 'server') => {
      if (moduleType === 'server') {
        setStats((s) => ({
          ...s,
          serverStability: Math.min(100, s.serverStability + 15),
        }));
        pushNotification('Kaan sunucu stabilitesini güçlendirdi!', 'success');
        return;
      }

      if (!activeProjectRef.current) {
        pushNotification('Aktif bir projeniz yokken iş arkadaşınız destek veremez!', 'info');
        return;
      }

      setActiveProject((curr) => {
        if (!curr) return null;
        const updated = { ...curr };
        const boostAmt = 25;

        if (moduleType === 'architecture') {
          updated.currentArchitecture = Math.min(
            updated.requiredArchitecture,
            updated.currentArchitecture + boostAmt
          );
        } else if (moduleType === 'frontend') {
          updated.currentFrontend = Math.min(
            updated.requiredFrontend,
            updated.currentFrontend + boostAmt
          );
        } else if (moduleType === 'backend') {
          updated.currentBackend = Math.min(
            updated.requiredBackend,
            updated.currentBackend + boostAmt
          );
        }

        return updated;
      });
    },
    [pushNotification]
  );

  // Add Bonus Cash by Boss
  const addBonusCash = useCallback((amount: number) => {
    setStats((s) => ({
      ...s,
      money: s.money + amount,
    }));
  }, []);

  // Accept Project from Mail
  const acceptProject = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const inProg: ProjectContract = { ...p, status: 'in-progress' };
          setActiveProject(inProg);
          return inProg;
        }
        return p;
      })
    );
    soundManager.playSuccess(600, 0.2);
    pushNotification(`"${projectId}" sözleşmesi imzalandı. VS Code IDE açılabilir!`, 'info');
  }, [pushNotification]);

  // Reject / Cancel project
  const rejectProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProject?.id === projectId) {
      setActiveProject(null);
    }
    soundManager.playClick();
  }, [activeProject]);

  // Mark Mail as read
  const markMailAsRead = useCallback((mailId: string) => {
    setMails((prev) =>
      prev.map((m) => (m.id === mailId ? { ...m, unread: false } : m))
    );
  }, []);

  // Code Action in IDE
  const codeModule = useCallback(
    (moduleType: 'architecture' | 'frontend' | 'backend' | 'qa') => {
      if (!activeProjectRef.current) return;
      if (statsRef.current.energy <= 2) {
        soundManager.playAlert();
        pushNotification('Enerjiniz tükendi! Kahve makinesine gidip espresso için.', 'alert');
        return;
      }

      soundManager.playKeyClick();

      const kbUpgrade = upgrades.find((u) => u.id === 'up-keyboard');
      const speedMultiplier = 1 + (kbUpgrade?.level || 0) * 0.35;
      const progressAmount = Math.round(5 * speedMultiplier);

      const chairUpgrade = upgrades.find((u) => u.id === 'up-chair');
      const chairDamping = 1 - (chairUpgrade?.level || 0) * 0.25;
      const energyCost = 1.0 * chairDamping;

      setStats((s) => ({
        ...s,
        energy: Math.max(0, s.energy - energyCost),
      }));

      setActiveProject((curr) => {
        if (!curr) return null;
        const updated = { ...curr };

        if (moduleType === 'architecture') {
          updated.currentArchitecture = Math.min(
            updated.requiredArchitecture,
            updated.currentArchitecture + progressAmount
          );
        } else if (moduleType === 'frontend') {
          updated.currentFrontend = Math.min(
            updated.requiredFrontend,
            updated.currentFrontend + progressAmount
          );
        } else if (moduleType === 'backend') {
          updated.currentBackend = Math.min(
            updated.requiredBackend,
            updated.currentBackend + progressAmount
          );
        } else if (moduleType === 'qa') {
          updated.currentQA = Math.min(
            updated.requiredQA,
            updated.currentQA + progressAmount
          );
          if (updated.bugs > 0 && Math.random() > 0.45) {
            updated.bugs = Math.max(0, updated.bugs - 1);
          }
        }

        const monUpgrade = upgrades.find((u) => u.id === 'up-monitor');
        const bugChance = 0.07 * (1 - (monUpgrade?.level || 0) * 0.3);
        if (Math.random() < bugChance) {
          updated.bugs += 1;
        }

        return updated;
      });
    },
    [upgrades, pushNotification]
  );

  // Deliver Completed Project
  const deliverProject = useCallback(() => {
    if (!activeProject) return;

    const isFinished =
      activeProject.currentArchitecture >= activeProject.requiredArchitecture &&
      activeProject.currentFrontend >= activeProject.requiredFrontend &&
      activeProject.currentBackend >= activeProject.requiredBackend &&
      activeProject.currentQA >= activeProject.requiredQA;

    if (!isFinished) {
      soundManager.playAlert();
      pushNotification('Tüm modüller ve testler tamamlanmadan proje teslim edilemez!', 'alert');
      return;
    }

    if (activeProject.bugs > 0) {
      soundManager.playAlert();
      pushNotification(`${activeProject.bugs} adet hata tespit edildi! QA modülünde temizleyin.`, 'alert');
      return;
    }

    soundManager.playCashRegister();

    const rewardMoney = activeProject.reward;
    const expGain = activeProject.exp;
    const monthlySaaSGain = Math.round(rewardMoney * 0.05);

    setStats((s) => {
      const newRep = s.reputation + expGain;
      let newLevel = s.companyLevel;
      if (newRep >= 100 && newLevel === 1) newLevel = 2;
      if (newRep >= 250 && newLevel === 2) newLevel = 3;
      if (newRep >= 500 && newLevel === 3) newLevel = 4;
      if (newRep >= 1000 && newLevel === 4) newLevel = 5;

      return {
        ...s,
        money: s.money + rewardMoney,
        reputation: newRep,
        companyLevel: newLevel,
        completedProjectsCount: s.completedProjectsCount + 1,
        totalRevenueEarned: s.totalRevenueEarned + rewardMoney,
        recurringMonthlyRevenue: s.recurringMonthlyRevenue + monthlySaaSGain,
      };
    });

    const clientMail: MailMessage = {
      id: `client-review-${Date.now()}`,
      sender: activeProject.client,
      senderRole: 'Müşteri Temsilcisi',
      subject: `Teslimat Onayı: ${activeProject.title}`,
      date: 'Şimdi',
      content: `Harika bir iş çıkardınız! "${activeProject.title}" projesi tam istediğimiz gibi kusursuz çalışıyor. Hesabınıza ${rewardMoney.toLocaleString()} ₺ havale edildi ve aylık bakım sözleşmemiz aktif edildi. Gelecek projelerde görüşmek üzere!`,
      unread: true,
      type: 'client_review',
    };

    setMails((prev) => [clientMail, ...prev]);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id ? { ...p, status: 'completed' } : p
      )
    );

    pushNotification(`"${activeProject.title}" teslim edildi! +${rewardMoney.toLocaleString()} ₺`, 'success');
    setActiveProject(null);
  }, [activeProject, pushNotification]);

  // Drink Coffee
  const drinkCoffee = useCallback(() => {
    soundManager.playCoffeeBrew();
    const espressoUp = upgrades.find((u) => u.id === 'up-espresso');
    const restoreAmount = 50 + (espressoUp?.level || 0) * 25;

    setStats((s) => ({
      ...s,
      energy: Math.min(100, s.energy + restoreAmount),
    }));

    pushNotification('Sıcak taze espresso içildi! Enerji ve odaklanma tazelendi.', 'success');
  }, [upgrades, pushNotification]);

  // Buy Hardware Upgrade
  const buyUpgrade = useCallback((upgradeId: string) => {
    const up = upgrades.find((u) => u.id === upgradeId);
    if (!up) return;

    if (statsRef.current.money < up.cost) {
      soundManager.playAlert();
      pushNotification('Yetersiz bakiye! Daha fazla proje tamamlayın.', 'alert');
      return;
    }

    if (up.level >= up.maxLevel) {
      soundManager.playAlert();
      pushNotification('Bu ekipman zaten maksimum seviyede!', 'info');
      return;
    }

    soundManager.playSuccess(700, 0.25);
    setStats((s) => ({
      ...s,
      money: s.money - up.cost,
    }));

    setUpgrades((prev) =>
      prev.map((item) =>
        item.id === upgradeId
          ? {
              ...item,
              level: item.level + 1,
              cost: Math.round(item.cost * 1.6),
              unlocked: true,
            }
          : item
      )
    );

    pushNotification(`${up.name} Seviye ${up.level + 1}'e yükseltildi!`, 'success');
  }, [upgrades, pushNotification]);

  // Hire Employee
  const hireEmployee = useCallback((employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    if (emp.hired) return;

    const hiringFee = emp.salary * 3;
    if (statsRef.current.money < hiringFee) {
      soundManager.playAlert();
      pushNotification(`İşe alım için en az ${hiringFee} ₺ güvence bedeli gerekiyor!`, 'alert');
      return;
    }

    soundManager.playSuccess(800, 0.3);
    setStats((s) => ({
      ...s,
      money: s.money - hiringFee,
    }));

    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, hired: true } : e))
    );

    pushNotification(`${emp.name} (${emp.role}) ekibe katıldı!`, 'success');
  }, [employees, pushNotification]);

  // Resolve Server Incident
  const resolveIncident = useCallback((incidentId: string) => {
    soundManager.playSuccess(880, 0.2);
    setServerIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, resolved: true } : inc))
    );
    setStats((s) => ({
      ...s,
      serverStability: Math.min(100, s.serverStability + 15),
    }));
    pushNotification('Sunucu olayı çözüldü ve sistem güvenliği sağlandı.', 'success');
  }, [pushNotification]);

  // Main Game Clock Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setStats((s) => {
        let newMin = s.minute + 4;
        let newHr = s.hour;
        let newDay = s.day;

        if (newMin >= 60) {
          newMin = 0;
          newHr += 1;
        }

        if (newHr >= 22) {
          newHr = 8;
          newDay += 1;
        }

        return {
          ...s,
          minute: newMin,
          hour: newHr,
          day: newDay,
        };
      });

      // Active project deadline countdown & hired team passive progress
      setActiveProject((curr) => {
        if (!curr || curr.status !== 'in-progress') return curr;

        const updated = { ...curr };
        updated.timeRemaining = Math.max(0, updated.timeRemaining - 1);

        employees.forEach((emp) => {
          if (emp.hired) {
            const gain = emp.productivity * 0.2;
            if (emp.role === 'Frontend Geliştirici') {
              updated.currentFrontend = Math.min(updated.requiredFrontend, updated.currentFrontend + gain);
            } else if (emp.role === 'Backend Mimarı') {
              updated.currentBackend = Math.min(updated.requiredBackend, updated.currentBackend + gain);
            } else if (emp.role === 'UI/UX Tasarımcısı') {
              updated.currentArchitecture = Math.min(updated.requiredArchitecture, updated.currentArchitecture + gain);
            } else if (emp.role === 'QA Mühendisi') {
              updated.currentQA = Math.min(updated.requiredQA, updated.currentQA + gain);
            }
          }
        });

        if (updated.timeRemaining === 0) {
          soundManager.playAlert();
          pushNotification(`"${updated.title}" teslim süresi aşıldı! Müşteri güveni sarsıldı.`, 'alert');
          return { ...updated, status: 'failed' };
        }

        return updated;
      });

      // Update Server Stability from incidents
      setServerIncidents((prev) => {
        const activeIncidents = prev.filter((i) => !i.resolved);
        if (activeIncidents.length > 0) {
          const totalImpact = activeIncidents.reduce((acc, i) => acc + i.impactPerSecond, 0);
          setStats((s) => ({
            ...s,
            serverStability: Math.max(15, s.serverStability - totalImpact),
          }));
        } else {
          setStats((s) => ({
            ...s,
            serverStability: Math.min(99.9, s.serverStability + 0.1),
          }));
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [employees, pushNotification]);

  return {
    stats,
    mails,
    projects,
    activeProject,
    upgrades,
    employees,
    serverIncidents,
    notifications,
    toggleDifficulty,
    assignBossProject,
    boostProgress,
    addBonusCash,
    acceptProject,
    rejectProject,
    markMailAsRead,
    codeModule,
    deliverProject,
    drinkCoffee,
    buyUpgrade,
    hireEmployee,
    resolveIncident,
    pushNotification,
  };
}

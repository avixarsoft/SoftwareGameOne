export type ProjectCategory = 'web-app' | 'infrastructure' | 'cloud' | 'ecommerce' | 'security';

export type GameDifficulty = 'easy' | 'hard';

export interface ProjectContract {
  id: string;
  title: string;
  client: string;
  category: ProjectCategory;
  description: string;
  reward: number;
  exp: number;
  deadlineSeconds: number;
  timeRemaining: number;
  complexity: number; // 1 to 5
  requiredArchitecture: number;
  requiredFrontend: number;
  requiredBackend: number;
  requiredQA: number;
  currentArchitecture: number;
  currentFrontend: number;
  currentBackend: number;
  currentQA: number;
  status: 'available' | 'in-progress' | 'completed' | 'failed';
  bugs: number;
  iconName: string;
  assignedByBoss?: boolean;
  bossNote?: string;
  // For Hard Mode: Target code snippets to type/complete
  hardModeChallenges?: {
    file: string;
    description: string;
    targetCode: string;
    completed: boolean;
  }[];
}

export interface MailMessage {
  id: string;
  sender: string;
  senderRole: string;
  subject: string;
  date: string;
  content: string;
  unread: boolean;
  type: 'contract' | 'system' | 'news' | 'client_review' | 'boss_directive';
  contract?: ProjectContract;
}

export interface HardwareUpgrade {
  id: string;
  name: string;
  category: 'hardware' | 'office' | 'network';
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  bonusType: 'code_speed' | 'energy_efficiency' | 'server_capacity' | 'bug_reduction';
  bonusValue: number;
  unlocked: boolean;
  icon: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Frontend Geliştirici' | 'Backend Mimarı' | 'DevOps Uzmanı' | 'UI/UX Tasarımcısı' | 'QA Mühendisi';
  salary: number; // daily
  productivity: number; // units per tick
  morale: number; // 0 - 100
  hired: boolean;
  avatarColor: string;
  avatarSeed: number;
  dialogue: string;
  interactionOptions: {
    label: string;
    type: 'chat' | 'help' | 'coffee';
    response: string;
  }[];
}

export interface BossInfo {
  name: string;
  title: string;
  mood: 'impressed' | 'neutral' | 'demanding';
  currentDirective: string;
  pendingSprintReward: number;
}

export interface ServerIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'critical';
  resolved: boolean;
  impactPerSecond: number; // reduces stability
  solution: 'reboot' | 'ddos_mitigate' | 'clear_cache' | 'patch_leak';
}

export interface GameStats {
  money: number;
  reputation: number; // 0 - 100+
  companyLevel: number;
  day: number;
  hour: number;
  minute: number;
  energy: number; // 0 - 100
  serverStability: number; // 0 - 100%
  serverLoad: number; // 0 - 100%
  completedProjectsCount: number;
  totalRevenueEarned: number;
  recurringMonthlyRevenue: number;
  difficulty: GameDifficulty;
}

export type InteractionStation =
  | 'desk'
  | 'coffee'
  | 'server'
  | 'lounge'
  | 'boss'
  | 'burak'
  | 'selin'
  | 'kaan'
  | 'zeynep'
  | 'watercooler'
  | 'meeting'
  | null;

export interface PlayerPosition {
  x: number;
  z: number;
  rotation: number;
}

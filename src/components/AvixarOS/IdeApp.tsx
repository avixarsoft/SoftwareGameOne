import React, { useState, useEffect, useRef } from 'react';
import { ProjectContract, GameDifficulty } from '../../types/game';
import {
  Files,
  Search,
  GitBranch,
  Play,
  Bug,
  CheckCircle2,
  Settings,
  Terminal as TerminalIcon,
  X,
  Code2,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Rocket,
  ShieldAlert,
  Sparkles,
  Zap,
  CornerDownLeft,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface IdeAppProps {
  activeProject: ProjectContract | null;
  difficulty: GameDifficulty;
  onCodeModule: (type: 'architecture' | 'frontend' | 'backend' | 'qa') => void;
  onDeliverProject: () => void;
  onOpenMail: () => void;
  onToggleDifficulty: () => void;
}

export const IdeApp: React.FC<IdeAppProps> = ({
  activeProject,
  difficulty,
  onCodeModule,
  onDeliverProject,
  onOpenMail,
  onToggleDifficulty,
}) => {
  const [activeFile, setActiveFile] = useState<string>('App.tsx');
  const [activeBottomTab, setActiveBottomTab] = useState<'terminal' | 'problems' | 'output'>('terminal');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Avixar Studio Terminal (zsh)',
    'node v20.11.0, npm v10.2.4',
    'Ready for build and tests.',
  ]);
  const [terminalCmd, setTerminalCmd] = useState('');

  // Hard Mode Real Code Writing State
  const [typedCode, setTypedCode] = useState<string>('');
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [isCompileSuccess, setIsCompileSuccess] = useState<boolean>(false);
  const codeInputRef = useRef<HTMLTextAreaElement>(null);

  // Target lines of real TypeScript code for Hard Mode
  const targetRealCodeLines = [
    'import { useState, useEffect } from "react";',
    'import { DatabaseClient, RedisCache } from "@avixar/infra";',
    '',
    'export async function handleClientRequest(payload: any) {',
    '  const cacheKey = `client:${payload.id}`;',
    '  const cached = await RedisCache.get(cacheKey);',
    '  if (cached) return JSON.parse(cached);',
    '',
    '  const result = await DatabaseClient.query("SELECT * FROM services WHERE id = $1", [payload.id]);',
    '  await RedisCache.set(cacheKey, JSON.stringify(result.rows[0]), "EX", 300);',
    '  return result.rows[0];',
    '}',
  ];

  const fullTargetCode = targetRealCodeLines.join('\n');

  // Hard mode: type on keyboard
  const handleHardModeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTypedCode(val);
    soundManager.playKeyClick();

    // Check progress
    const accuracy = val.length / fullTargetCode.length;
    if (val.length >= fullTargetCode.length * 0.95) {
      if (!isCompileSuccess) {
        setIsCompileSuccess(true);
        soundManager.playSuccess(880, 0.3);
        setTerminalLogs((prev) => [
          ...prev,
          '[TSC] Compiling TypeScript 5.4.2...',
          '✓ Verified 12 files in 180ms.',
          '✓ Zero syntax errors found. Ready to deploy!',
        ]);
        onCodeModule('architecture');
        onCodeModule('frontend');
        onCodeModule('backend');
        onCodeModule('qa');
      }
    } else {
      // Advance module progress incrementally as player writes real code
      if (val.length % 15 === 0) {
        const modules: Array<'architecture' | 'frontend' | 'backend' | 'qa'> = [
          'architecture',
          'frontend',
          'backend',
          'qa',
        ];
        const pick = modules[Math.floor(Math.random() * modules.length)];
        onCodeModule(pick);
      }
    }
  };

  const handleRunTerminal = (cmd: string) => {
    const clean = cmd.trim().toLowerCase();
    const newLogs = [...terminalLogs, `$ ${cmd}`];

    if (clean === 'npm run build' || clean === 'build') {
      newLogs.push('[VITE] Building for production...');
      newLogs.push('✓ 48 modules transformed.');
      newLogs.push('dist/index.html   0.84 kB');
      newLogs.push('dist/assets/index.js   142.18 kB');
      newLogs.push('✓ built in 210ms');
    } else if (clean === 'npm test' || clean === 'test') {
      newLogs.push('[VITEST] Running integration test suite...');
      newLogs.push('✓ tests/api.spec.ts (6 passed)');
      newLogs.push('✓ tests/security.spec.ts (4 passed)');
      newLogs.push('Test Files  2 passed (2)');
      newLogs.push('Tests  10 passed (10)');
    } else if (clean === 'git status' || clean === 'status') {
      newLogs.push('On branch main');
      newLogs.push('Changes to be committed:');
      newLogs.push('  modified: src/components/App.tsx');
      newLogs.push('  modified: src/api/server.ts');
    } else if (clean === 'clear') {
      setTerminalLogs([]);
      setTerminalCmd('');
      return;
    } else {
      newLogs.push(`zsh: command not found: ${cmd}. (Try 'npm run build', 'npm test', 'git status')`);
    }

    setTerminalLogs(newLogs.slice(-12));
    setTerminalCmd('');
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#1e1e1e] text-slate-400 p-8 text-center select-none font-sans">
        <div className="w-16 h-16 rounded-2xl bg-[#252526] border border-[#333333] flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
          <Code2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Visual Studio Code (Avixar Edition)</h2>
        <p className="text-sm max-w-md text-slate-400 mb-6">
          Çalışma alanında aktif bir sözleşme bulunmuyor. Patronunuz Demir Bey'in odasına gidip görev isteyin veya Avixar Mail kutunuzu açın.
        </p>
        <button
          onClick={onOpenMail}
          className="px-5 py-2.5 rounded-lg bg-[#007acc] hover:bg-[#0062a3] text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-blue-500/20"
        >
          <FolderOpen className="w-4 h-4" /> Posta Kutusuna Git
        </button>
      </div>
    );
  }

  // Calculate percentages
  const archPercent = Math.min(
    100,
    Math.round((activeProject.currentArchitecture / activeProject.requiredArchitecture) * 100)
  );
  const frontPercent = Math.min(
    100,
    Math.round((activeProject.currentFrontend / activeProject.requiredFrontend) * 100)
  );
  const backPercent = Math.min(
    100,
    Math.round((activeProject.currentBackend / activeProject.requiredBackend) * 100)
  );
  const qaPercent = Math.min(
    100,
    Math.round((activeProject.currentQA / activeProject.requiredQA) * 100)
  );

  const totalProgress = Math.round((archPercent + frontPercent + backPercent + qaPercent) / 4);
  const isDeployReady = totalProgress >= 100 && activeProject.bugs === 0;

  return (
    <div className="flex h-full bg-[#1e1e1e] text-[#cccccc] select-none overflow-hidden font-mono text-xs">
      {/* 1. VS Code Slim Activity Bar (Left 48px) */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-3 justify-between border-r border-[#252526]">
        <div className="space-y-4">
          <button
            title="Explorer"
            className="p-2 text-white border-l-2 border-white cursor-pointer"
          >
            <Files className="w-5 h-5" />
          </button>
          <button
            title="Search"
            className="p-2 text-[#858585] hover:text-white transition cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            title="Source Control"
            className="p-2 text-[#858585] hover:text-white transition cursor-pointer relative"
          >
            <GitBranch className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </button>
          <button
            title="Run & Debug"
            className="p-2 text-[#858585] hover:text-white transition cursor-pointer"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>

        <button
          title="Settings"
          className="p-2 text-[#858585] hover:text-white transition cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* 2. VS Code Primary Sidebar (Explorer Tree) */}
      <div className="w-60 bg-[#252526] border-r border-[#191919] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="h-9 px-4 flex items-center justify-between text-[11px] font-bold text-[#bbbbbb] tracking-wider border-b border-[#1e1e1e]">
            <span>EXPLORER: AVIXAR-PROJECT</span>
            <span className="text-[10px] text-cyan-400 font-normal">v2.4</span>
          </div>

          {/* Difficulty Mode Pill */}
          <div className="p-2.5 bg-[#1f1f20] border-b border-[#2d2d2d]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-sans">Zorluk Modu:</span>
              <button
                onClick={onToggleDifficulty}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  difficulty === 'hard'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {difficulty === 'hard' ? 'ZOR (Gerçek Kod)' : 'KOLAY (Simülasyon)'}
              </button>
            </div>
            <p className="text-[9px] text-slate-500 mt-1 font-sans">
              {difficulty === 'hard'
                ? 'Klavyeden gerçek kod yazarak projeyi tamamlayın.'
                : 'Modül butonlarıyla hızlıca kodlayın.'}
            </p>
          </div>

          {/* Project File Tree */}
          <div className="p-2 space-y-0.5 text-[11px]">
            <div className="flex items-center gap-1 text-[#858585] px-1 py-1 font-bold">
              <ChevronDown className="w-3.5 h-3.5" />
              <span>src</span>
            </div>

            <button
              onClick={() => setActiveFile('App.tsx')}
              className={`w-full flex items-center gap-2 px-4 py-1 rounded transition text-left cursor-pointer ${
                activeFile === 'App.tsx'
                  ? 'bg-[#37373d] text-white font-semibold'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <span className="text-cyan-400 font-bold">⚛</span>
              <span className="truncate">App.tsx</span>
            </button>

            <button
              onClick={() => setActiveFile('router.ts')}
              className={`w-full flex items-center gap-2 px-4 py-1 rounded transition text-left cursor-pointer ${
                activeFile === 'router.ts'
                  ? 'bg-[#37373d] text-white font-semibold'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <span className="text-blue-400 font-bold">⚡</span>
              <span className="truncate">router.ts</span>
            </button>

            <button
              onClick={() => setActiveFile('schema.sql')}
              className={`w-full flex items-center gap-2 px-4 py-1 rounded transition text-left cursor-pointer ${
                activeFile === 'schema.sql'
                  ? 'bg-[#37373d] text-white font-semibold'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <span className="text-emerald-400 font-bold">🗄️</span>
              <span className="truncate">schema.sql</span>
            </button>

            <button
              onClick={() => setActiveFile('qa.spec.ts')}
              className={`w-full flex items-center gap-2 px-4 py-1 rounded transition text-left cursor-pointer ${
                activeFile === 'qa.spec.ts'
                  ? 'bg-[#37373d] text-white font-semibold'
                  : 'hover:bg-[#2a2d2e] text-[#cccccc]'
              }`}
            >
              <span className="text-amber-400 font-bold">🧪</span>
              <span className="truncate">qa.spec.ts</span>
            </button>

            <div className="pt-2 text-[10px] text-[#858585] px-2 uppercase font-semibold">
              Config
            </div>
            <div className="px-4 py-1 text-slate-400">package.json</div>
            <div className="px-4 py-1 text-slate-400">tsconfig.json</div>
          </div>
        </div>

        {/* Boss Directive / Note Banner */}
        {activeProject.bossNote && (
          <div className="p-3 bg-[#1e293b]/70 border-t border-[#334155] text-[10px]">
            <span className="text-amber-400 font-bold block mb-0.5">Demir Bey (Patron):</span>
            <p className="text-slate-300 italic">{activeProject.bossNote}</p>
          </div>
        )}
      </div>

      {/* 3. VS Code Main Editor Area & Mini-Map */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
        {/* Editor Tab Bar */}
        <div className="h-9 bg-[#252526] flex items-center border-b border-[#191919]">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] text-white border-t border-cyan-400 text-[11px] font-semibold">
            <span className="text-cyan-400">⚛</span>
            <span>{activeFile}</span>
            <X className="w-3 h-3 text-slate-400 ml-1 hover:text-white" />
          </div>

          <div className="ml-auto flex items-center gap-4 pr-4 text-[11px]">
            <span className="text-slate-400 font-sans">
              Proje: <strong className="text-white">{activeProject.title}</strong>
            </span>
            <span className="text-slate-400 font-sans">
              Kalan: <strong className="text-amber-400 font-mono">{activeProject.timeRemaining}s</strong>
            </span>
          </div>
        </div>

        {/* Code Viewport (Two modes: Easy Simulation vs Hard Real Code Typing) */}
        <div className="flex-1 flex overflow-hidden">
          {difficulty === 'hard' ? (
            /* ZOR MOD (Hard Mode): Real interactive Code Typing Workspace */
            <div className="flex-1 flex flex-col p-4 bg-[#1e1e1e] overflow-y-auto">
              <div className="p-3 rounded-lg bg-[#252526] border border-[#37373d] mb-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" /> ZOR MOD: Gerçek TypeScript Kodunu Aşağıya Yazın
                  </span>
                  <span className="text-amber-400 font-bold">
                    {Math.round((typedCode.length / fullTargetCode.length) * 100)}% Tamamlandı
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Aşağıdaki kod editörüne hedef fonksiyonu klavyenizle yazın. Siz yazdıkça derleyici kodu derler ve modüller tamamlanır!
                </p>
              </div>

              {/* Target Code Reference */}
              <div className="p-3 bg-[#181818] rounded border border-[#2d2d2d] mb-3 font-mono text-[11px] text-slate-400">
                <span className="text-slate-500 uppercase font-bold text-[9px] block mb-1">
                  Hedef Kod İskeleti:
                </span>
                <pre className="text-emerald-400/90 whitespace-pre-wrap">{fullTargetCode}</pre>
              </div>

              {/* Real Input Textarea Editor */}
              <div className="relative flex-1 rounded bg-[#181818] border border-cyan-800/80 p-3 flex flex-col">
                <span className="text-cyan-400 uppercase font-bold text-[9px] block mb-1">
                  VS Code Canlı Kod Editörü (Klavyenizle Buraya Yazın):
                </span>
                <textarea
                  ref={codeInputRef}
                  value={typedCode}
                  onChange={handleHardModeInput}
                  placeholder="// Buraya hedef TypeScript kodunu yazmaya başlayın..."
                  className="flex-1 w-full bg-transparent text-white font-mono text-[12px] leading-relaxed resize-none outline-none placeholder:text-slate-600"
                  autoFocus
                />
              </div>
            </div>
          ) : (
            /* KOLAY MOD (Easy Mode): Visual Code Snippets + Module Progress Deck */
            <div className="flex-1 p-4 bg-[#1e1e1e] overflow-y-auto font-mono text-[12px] leading-relaxed text-[#d4d4d4]">
              <div className="flex">
                {/* Line numbers */}
                <div className="text-[#858585] text-right pr-4 select-none opacity-50 space-y-1">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Code body */}
                <div className="space-y-1 flex-1">
                  <div><span className="text-[#c586c0]">import</span> React, {'{'} useState, useEffect {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">'react'</span>;</div>
                  <div><span className="text-[#c586c0]">import</span> {'{'} CloudRouter, Microservice {'}'} <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]'">'@avixar/core'</span>;</div>
                  <div className="text-[#6a9955]">// Proje: {activeProject.title}</div>
                  <div className="text-[#6a9955]">// Mimari Durumu: %{archPercent} | Frontend: %{frontPercent} | Backend: %{backPercent}</div>
                  <div><span className="text-[#569cd6]">export default function</span> <span className="text-[#dcdcaa]">ApplicationModule</span>() {'{'}</div>
                  <div className="pl-4"><span className="text-[#569cd6]">const</span> [state, setState] = <span className="text-[#dcdcaa]">useState</span>(<span className="text-[#4ec9b0]">true</span>);</div>
                  <div className="pl-4"><span className="text-[#569cd6]">const</span> router = <span className="text-[#569cd6]">new</span> <span className="text-[#4ec9b0]">CloudRouter</span>({'{'} ssl: <span className="text-[#569cd6]">true</span>, rateLimit: 5000 {'}'});</div>
                  <div className="pl-4"><span className="text-[#c586c0]">return</span> (</div>
                  <div className="pl-8 text-[#9cdcfe]">&lt;<span className="text-[#4ec9b0]">div</span> className=<span className="text-[#ce9178]">"flex h-screen bg-slate-950"</span>&gt;</div>
                  <div className="pl-12 text-[#9cdcfe]">&lt;<span className="text-[#4ec9b0]">h1</span>&gt;Avixar Enterprise Node Online&lt;/<span className="text-[#4ec9b0]">h1</span>&gt;</div>
                  <div className="pl-8 text-[#9cdcfe]">&lt;/<span className="text-[#4ec9b0]">div</span>&gt;</div>
                  <div className="pl-4">);</div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Mini-Map (Right column) */}
          <div className="w-16 bg-[#181818] border-l border-[#252526] p-1 select-none hidden lg:block opacity-40">
            <div className="space-y-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 bg-slate-500 rounded-sm"
                  style={{ width: `${30 + ((i * 17) % 60)}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Development Controls & Progress Deck (In Easy Mode or as Helper in Hard Mode) */}
        <div className="p-3 bg-[#252526] border-t border-[#1e1e1e]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {/* 1. Architecture */}
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#333333]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-sans">1. Mimari</span>
                <span className="text-cyan-400 font-mono">{archPercent}%</span>
              </div>
              <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden mb-1.5">
                <div className="bg-cyan-400 h-full" style={{ width: `${archPercent}%` }} />
              </div>
              <button
                onClick={() => onCodeModule('architecture')}
                disabled={archPercent >= 100}
                className="w-full py-1 rounded bg-[#007acc]/40 hover:bg-[#007acc]/70 text-cyan-200 text-[10px] font-bold cursor-pointer transition disabled:opacity-40"
              >
                + Mimari Kodla
              </button>
            </div>

            {/* 2. Frontend */}
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#333333]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-sans">2. Frontend</span>
                <span className="text-blue-400 font-mono">{frontPercent}%</span>
              </div>
              <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden mb-1.5">
                <div className="bg-blue-400 h-full" style={{ width: `${frontPercent}%` }} />
              </div>
              <button
                onClick={() => onCodeModule('frontend')}
                disabled={frontPercent >= 100}
                className="w-full py-1 rounded bg-blue-600/40 hover:bg-blue-600/70 text-blue-200 text-[10px] font-bold cursor-pointer transition disabled:opacity-40"
              >
                + Frontend Kodla
              </button>
            </div>

            {/* 3. Backend */}
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#333333]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-sans">3. Backend</span>
                <span className="text-emerald-400 font-mono">{backPercent}%</span>
              </div>
              <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden mb-1.5">
                <div className="bg-emerald-400 h-full" style={{ width: `${backPercent}%` }} />
              </div>
              <button
                onClick={() => onCodeModule('backend')}
                disabled={backPercent >= 100}
                className="w-full py-1 rounded bg-emerald-600/40 hover:bg-emerald-600/70 text-emerald-200 text-[10px] font-bold cursor-pointer transition disabled:opacity-40"
              >
                + Backend Kodla
              </button>
            </div>

            {/* 4. QA */}
            <div className="p-2 rounded bg-[#1e1e1e] border border-[#333333]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-sans">4. Test & QA</span>
                <span className="text-purple-400 font-mono">{qaPercent}%</span>
              </div>
              <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden mb-1.5">
                <div className="bg-purple-400 h-full" style={{ width: `${qaPercent}%` }} />
              </div>
              <button
                onClick={() => onCodeModule('qa')}
                disabled={qaPercent >= 100 && activeProject.bugs === 0}
                className="w-full py-1 rounded bg-purple-600/40 hover:bg-purple-600/70 text-purple-200 text-[10px] font-bold cursor-pointer transition disabled:opacity-40"
              >
                + QA Test Et ({activeProject.bugs} Hata)
              </button>
            </div>
          </div>

          {/* Deliver / Deploy Bar */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-sans">
              {activeProject.bugs > 0 ? (
                <span className="text-red-400 flex items-center gap-1 font-bold">
                  <Bug className="w-3.5 h-3.5" /> Canlıya almadan önce {activeProject.bugs} hatayı QA modülünde temizleyin!
                </span>
              ) : isDeployReady ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Proje derlendi! Canlı sunuculara dağıtıma hazır.
                </span>
              ) : (
                <span>Tüm modüller %100 olana kadar geliştirmeye devam edin.</span>
              )}
            </span>

            <button
              onClick={onDeliverProject}
              disabled={!isDeployReady}
              className={`py-1.5 px-4 rounded font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg ${
                isDeployReady
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-[#333333] text-slate-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" /> Canlıya Dağıt & Teslim Et
            </button>
          </div>
        </div>

        {/* 4. VS Code Integrated Terminal Panel (Bottom) */}
        <div className="h-32 bg-[#181818] border-t border-[#252526] flex flex-col">
          {/* Terminal Tabs */}
          <div className="h-7 bg-[#252526] px-3 flex items-center gap-4 text-[10px] font-sans border-b border-[#1e1e1e]">
            <button
              onClick={() => setActiveBottomTab('terminal')}
              className={`flex items-center gap-1.5 font-bold cursor-pointer ${
                activeBottomTab === 'terminal' ? 'text-white border-b border-white' : 'text-slate-400'
              }`}
            >
              <TerminalIcon className="w-3 h-3 text-cyan-400" /> TERMINAL
            </button>
            <button
              onClick={() => setActiveBottomTab('problems')}
              className={`flex items-center gap-1.5 font-bold cursor-pointer ${
                activeBottomTab === 'problems' ? 'text-white border-b border-white' : 'text-slate-400'
              }`}
            >
              <Bug className="w-3 h-3 text-amber-400" /> PROBLEMS ({activeProject.bugs})
            </button>
            <button
              onClick={() => setActiveBottomTab('output')}
              className={`flex items-center gap-1.5 font-bold cursor-pointer ${
                activeBottomTab === 'output' ? 'text-white border-b border-white' : 'text-slate-400'
              }`}
            >
              OUTPUT
            </button>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 p-2 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-0.5">
            {terminalLogs.map((l, idx) => (
              <div
                key={idx}
                className={l.startsWith('$') ? 'text-cyan-400 font-bold' : l.startsWith('✓') ? 'text-emerald-400' : ''}
              >
                {l}
              </div>
            ))}
          </div>

          {/* Command Prompt */}
          <div className="h-7 bg-[#1c1c1c] border-t border-[#252526] px-2 flex items-center gap-2">
            <span className="text-cyan-400 font-bold text-xs">$</span>
            <input
              type="text"
              value={terminalCmd}
              onChange={(e) => setTerminalCmd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && terminalCmd) {
                  handleRunTerminal(terminalCmd);
                }
              }}
              placeholder="npm run build, npm test, git status..."
              className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-mono"
            />
          </div>
        </div>

        {/* 5. VS Code Blue Status Bar */}
        <div className="h-6 bg-[#007acc] text-white px-3 flex items-center justify-between text-[10px] font-sans">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold">
              <GitBranch className="w-3 h-3" /> main*
            </span>
            <span>0 Errors, 0 Warnings</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Ln 14, Col 2</span>
            <span>UTF-8</span>
            <span>TypeScript 5.4</span>
            <span className="font-bold">Prettier ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};

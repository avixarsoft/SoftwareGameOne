/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { OfficeScene } from './game/threeScene';
import { useGameState } from './state/useGameState';
import { InteractionStation } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { StoryIntroModal } from './components/StoryIntroModal';
import { GameHUD } from './components/GameHUD';
import { DesktopModal } from './components/AvixarOS/DesktopModal';
import { CoffeeModal } from './components/CoffeeModal';
import { ServerRackModal } from './components/ServerRackModal';
import { PauseModal } from './components/PauseModal';
import { NpcDialogueModal } from './components/NpcDialogueModal';
import { soundManager } from './audio/soundManager';

type GameScreen = 'title' | 'story' | 'playing';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [nearStation, setNearStation] = useState<InteractionStation>(null);
  const [activeModal, setActiveModal] = useState<
    'desktop' | 'coffee' | 'server' | 'pause' | 'npc' | null
  >(null);
  const [currentNpcStation, setCurrentNpcStation] = useState<InteractionStation>(null);

  const canvasMountRef = useRef<HTMLDivElement>(null);
  const officeSceneRef = useRef<OfficeScene | null>(null);

  const {
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
  } = useGameState();

  // Initialize Three.js Plaza Office Scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new OfficeScene(canvasMountRef.current, {
      onStationNear: (station) => {
        setNearStation(station);
      },
      onStationInteract: (station) => {
        handleStationInteract(station);
      },
    });

    officeSceneRef.current = scene;

    return () => {
      scene.dispose();
      officeSceneRef.current = null;
    };
  }, []);

  // Update sitting state when desktop modal is open
  useEffect(() => {
    if (officeSceneRef.current) {
      officeSceneRef.current.setSittingAtDesk(activeModal === 'desktop');
    }
  }, [activeModal]);

  // Handle Station Interactions
  const handleStationInteract = (station: InteractionStation) => {
    if (!station) return;

    if (station === 'desk') {
      soundManager.playClick();
      setActiveModal('desktop');
    } else if (
      station === 'boss' ||
      station === 'burak' ||
      station === 'selin' ||
      station === 'zeynep' ||
      station === 'kaan'
    ) {
      soundManager.playClick();
      setCurrentNpcStation(station);
      setActiveModal('npc');
    } else if (station === 'coffee') {
      soundManager.playClick();
      setActiveModal('coffee');
    } else if (station === 'server') {
      soundManager.playClick();
      setActiveModal('server');
    } else if (station === 'meeting') {
      soundManager.playSuccess(600, 0.2);
      pushNotification('Toplantı salonunda mimari planları gözden geçirdiniz. Ekip motivasyonu arttı!', 'info');
    } else if (station === 'lounge') {
      soundManager.playSuccess(580, 0.2);
      drinkCoffee();
      pushNotification('Plaza teras koltuğunda mola verdiniz. Zihniniz tazelendi!', 'info');
    }
  };

  // Teleport player from HUD
  const handleTeleport = (station: InteractionStation) => {
    if (officeSceneRef.current && station) {
      soundManager.playClick();
      officeSceneRef.current.teleportToStation(station);
    }
  };

  // Global Keyboard Shortcuts (Escape)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (screen === 'playing') {
          setActiveModal('pause');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [activeModal, screen]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0f1d] select-none font-sans">
      {/* 1. Isolated 3D WebGL Canvas Viewport */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 z-0 cursor-crosshair outline-none"
      />

      {/* 2. Game Title Screen */}
      {screen === 'title' && (
        <TitleScreen
          onStart={() => {
            setScreen('story');
          }}
        />
      )}

      {/* 3. Narrative Story Briefing */}
      {screen === 'story' && (
        <StoryIntroModal
          isOpen={true}
          onStart={() => {
            setScreen('playing');
            pushNotification('Avixar Maslak Plazası 35. kata hoş geldiniz! Patron Demir Bey’in odasına veya masanıza geçebilirsiniz.', 'info');
          }}
        />
      )}

      {/* 4. Active In-Game HUD */}
      {screen === 'playing' && (
        <GameHUD
          stats={stats}
          activeProject={activeProject}
          nearStation={nearStation}
          onInteract={handleStationInteract}
          onTeleportTo={handleTeleport}
          onPause={() => setActiveModal('pause')}
          notifications={notifications}
        />
      )}

      {/* 5. In-Game Desktop Modal (VS Code IDE, Mail, Server, Store, Analytics) */}
      <DesktopModal
        isOpen={activeModal === 'desktop'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        mails={mails}
        projects={projects}
        activeProject={activeProject}
        upgrades={upgrades}
        employees={employees}
        serverIncidents={serverIncidents}
        difficulty={stats.difficulty}
        onToggleDifficulty={toggleDifficulty}
        onAcceptProject={acceptProject}
        onRejectProject={rejectProject}
        onMarkMailRead={markMailAsRead}
        onCodeModule={codeModule}
        onDeliverProject={deliverProject}
        onBuyUpgrade={buyUpgrade}
        onHireEmployee={hireEmployee}
        onResolveIncident={resolveIncident}
      />

      {/* 6. NPC & Boss Dialogue Modal */}
      <NpcDialogueModal
        station={currentNpcStation}
        isOpen={activeModal === 'npc'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onAssignBossProject={assignBossProject}
        onBoostProgress={boostProgress}
        onAddBonusCash={addBonusCash}
      />

      {/* 7. Coffee Espresso Bar Modal */}
      <CoffeeModal
        isOpen={activeModal === 'coffee'}
        onClose={() => setActiveModal(null)}
        onDrink={drinkCoffee}
        energy={stats.energy}
      />

      {/* 8. Physical Server Cabinet Modal */}
      <ServerRackModal
        isOpen={activeModal === 'server'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        incidents={serverIncidents}
        onResolveIncident={resolveIncident}
      />

      {/* 9. Pause / Settings Modal */}
      <PauseModal
        isOpen={activeModal === 'pause'}
        onResume={() => setActiveModal(null)}
        onReset={() => {
          localStorage.clear();
          window.location.reload();
        }}
      />
    </div>
  );
}

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { InteractionStation } from '../types/game';
import { soundManager } from '../audio/soundManager';

// Preallocated math helpers to ensure zero GC in animation loop
const _vec3 = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _stationPos = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export interface SceneCallbacks {
  onStationNear: (station: InteractionStation) => void;
  onStationInteract: (station: InteractionStation) => void;
}

export class OfficeScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;
  private callbacks: SceneCallbacks;

  // Actors & Objects
  private playerGroup: THREE.Group;
  private playerLeftLeg!: THREE.Mesh;
  private playerRightLeg!: THREE.Mesh;
  private playerTorso!: THREE.Mesh;
  private playerHead!: THREE.Mesh;
  private serverLeds: THREE.Mesh[] = [];
  private coffeeSteamParticles: THREE.Points | null = null;
  private screenGlowMaterial!: THREE.MeshBasicMaterial;

  // Coworkers & Boss
  private npcs: Map<string, THREE.Group> = new Map();

  // Controls & Movement
  private keys: Record<string, boolean> = {};
  public playerTargetPos: THREE.Vector3 | null = null;
  private currentStation: InteractionStation = null;
  private lastFootstepTime: number = 0;
  private isSittingAtDesk: boolean = false;

  // Plaza Station Positions
  public static readonly STATIONS: Record<string, THREE.Vector3> = {
    desk: new THREE.Vector3(-1.0, 0, -0.6),
    boss: new THREE.Vector3(-7.2, 0, -4.5),
    burak: new THREE.Vector3(2.5, 0, -0.6),
    selin: new THREE.Vector3(2.5, 0, 2.5),
    zeynep: new THREE.Vector3(-1.0, 0, 2.5),
    kaan: new THREE.Vector3(7.2, 0, -4.0),
    coffee: new THREE.Vector3(-7.2, 0, -0.5),
    server: new THREE.Vector3(8.0, 0, -5.0),
    meeting: new THREE.Vector3(-7.0, 0, 4.0),
    lounge: new THREE.Vector3(0.5, 0, -5.0),
  };

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Fog (Deep Navy palette with corporate atmosphere)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.026);

    // 4. Camera (Isometric corporate perspective)
    this.camera = new THREE.PerspectiveCamera(
      42,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      120
    );
    this.camera.position.set(0, 13.5, 16);
    this.camera.lookAt(0, 0.5, 0);

    // 5. Studio Environment map (PMREM)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 6. Lighting Rig
    this.setupLighting();

    // 7. Build Full Plaza Corporate Floor
    this.buildPlazaEnvironment();

    // 8. Build Player Character
    this.playerGroup = this.createPlayerCharacter();
    this.playerGroup.position.set(-1.0, 0, 0.8);
    this.scene.add(this.playerGroup);

    // 9. Build Colleagues & Boss
    this.buildNpcs();

    // 10. Bind Input Handlers
    this.bindInputs();

    // 11. Start Loop
    this.startLoop();
  }

  private setupLighting() {
    // Cool ambient hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.95);
    this.scene.add(hemiLight);

    // Warm directional key light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
    keyLight.position.set(8, 18, 10);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 40;
      const d = 13;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // CEO Office Accent Light
    const ceoLight = new THREE.PointLight(0xf59e0b, 1.6, 12);
    ceoLight.position.set(-7.5, 3.2, -4.5);
    this.scene.add(ceoLight);

    // Server Corner Cyan Light
    const serverLight = new THREE.PointLight(0x06b6d4, 2.4, 12);
    serverLight.position.set(8.0, 3.0, -4.5);
    this.scene.add(serverLight);

    // Meeting Room Light
    const meetingLight = new THREE.PointLight(0x38bdf8, 1.4, 10);
    meetingLight.position.set(-7.0, 3.2, 4.0);
    this.scene.add(meetingLight);
  }

  private createScreenTexture(titleText: string = 'Avixar Studio - VS Code'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // VS Code dark editor background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, 512, 256);

    // Activity bar
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 24, 256);

    // Tab bar
    ctx.fillStyle = '#252526';
    ctx.fillRect(24, 0, 488, 28);
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(24, 0, 160, 28);
    ctx.fillStyle = '#61afef';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('App.tsx', 42, 18);

    // Code lines
    ctx.font = '12px monospace';
    const lines = [
      { text: 'import { useState, useEffect } from "react";', color: '#c678dd' },
      { text: 'import { AvixarClient } from "@avixar/core";', color: '#e06c75' },
      { text: 'export default function App() {', color: '#61afef' },
      { text: '  const [status, setStatus] = useState("CONNECTED");', color: '#e5c07b' },
      { text: '  // 35th Floor Plaza HQ - Production Ready', color: '#5c6370' },
      { text: '  return <AvixarDashboard node="maslak-01" />;', color: '#98c379' },
      { text: '}', color: '#61afef' },
    ];

    let y = 52;
    lines.forEach((l) => {
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, 36, y);
      y += 24;
    });

    // Status bar
    ctx.fillStyle = '#007acc';
    ctx.fillRect(0, 238, 512, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('main*  TypeScript 5.4  UTF-8  Prettier', 12, 251);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  // Build the complete Corporate Tech Plaza Floor
  private buildPlazaEnvironment() {
    // 1. Polished Plaza Hardwood & Slate Floor (22m x 16m)
    const floorGeo = new THREE.PlaneGeometry(22, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.22,
      metalness: 0.12,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !this.isSoftwareGl;
    this.scene.add(floor);

    // Central Executive Corridor Runner Decal
    const runnerGeo = new THREE.PlaneGeometry(4.5, 14);
    const runnerMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0.5, 0.01, 0);
    this.scene.add(runner);

    // 2. Plaza Outer Walls & Glass Facade
    this.buildPlazaWalls();

    // 3. CEO / Patron Executive Glass Corner Office
    this.buildCeoOffice();

    // 4. Glass Boardroom / Meeting Room
    this.buildMeetingRoom();

    // 5. Open-Plan Developer Desks (Player, Burak, Selin, Zeynep)
    this.buildDeveloperDesks();

    // 6. Server Room Cage & Rack Station
    this.buildServerStation();

    // 7. Plaza Cafe & Water Cooler Station
    this.buildBaristaCafe();

    // 8. Plaza Elevators & Lobby Doors
    this.buildPlazaElevators();

    // 9. Interactive Station Indicator Rings
    this.buildStationRings();
  }

  private buildPlazaWalls() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.1,
    });

    // Back Wall (North)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 5, 0.3), wallMat);
    backWall.position.set(0, 2.5, -8);
    backWall.receiveShadow = !this.isSoftwareGl;
    this.scene.add(backWall);

    // Left Wall (West)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 16), wallMat);
    leftWall.position.set(-11, 2.5, 0);
    leftWall.receiveShadow = !this.isSoftwareGl;
    this.scene.add(leftWall);

    // Right Wall (East) - Giant Floor-to-Ceiling Plaza Window Facade
    const glassSill = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 16), wallMat);
    glassSill.position.set(11, 0.45, 0);
    this.scene.add(glassSill);

    const glassPanes = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 3.8, 15.6),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.1,
        transmission: this.isSoftwareGl ? 0 : 0.65,
        depthWrite: false,
      })
    );
    glassPanes.position.set(10.9, 2.8, 0);
    this.scene.add(glassPanes);

    // Window Mullions (Steel frames)
    for (let z = -6.5; z <= 6.5; z += 2.6) {
      const mullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 4.2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      mullion.position.set(10.9, 2.6, z);
      this.scene.add(mullion);
    }

    // Modern Skyscraper Plaza Skyline outside the window
    this.buildSkyscraperSkyline();

    // Large Wall Logo: "AVIXAR SOFTWARE // 35. KAT PLAZA"
    this.buildPlazaBrandWall();
  }

  private buildSkyscraperSkyline() {
    const skyline = new THREE.Group();
    skyline.position.set(18, 0, 0);

    const bldMat = new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.8 });
    const cyanLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const amberLightMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    const towers = [
      { h: 14, w: 3.2, z: -6 },
      { h: 22, w: 4.0, z: -2 },
      { h: 18, w: 3.5, z: 2.5 },
      { h: 26, w: 4.5, z: 7 },
      { h: 12, w: 2.8, z: -9 },
    ];

    towers.forEach((t) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.w), bldMat);
      tower.position.set(0, t.h / 2, t.z);
      skyline.add(tower);

      // Rooftop spire and beacon
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 3, 6), bldMat);
      spire.position.set(0, t.h + 1.5, t.z);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), t.h > 20 ? cyanLightMat : amberLightMat);
      beacon.position.set(0, t.h + 3, t.z);
      skyline.add(spire, beacon);
    });

    this.scene.add(skyline);
  }

  private buildPlazaBrandWall() {
    const brandPlate = new THREE.Group();
    brandPlate.position.set(0.5, 3.8, -7.8);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('AVIXAR SOFTWARE', 512, 100);

    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('MASLAK TECH PLAZA · KAT 35 · GENEL MERKEZ', 512, 150);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 1.6),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    brandPlate.add(sign);
    this.scene.add(brandPlate);
  }

  // CEO / Patron Executive Glass Corner Suite
  private buildCeoOffice() {
    const ceoOffice = new THREE.Group();
    ceoOffice.position.set(-7.5, 0, -4.5);

    // Glass Partition Walls with doorway
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.2,
      depthWrite: false,
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });

    // Glass wall South
    const glassSouth = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.4, 0.08), glassMat);
    glassSouth.position.set(0, 1.7, 3.2);
    ceoOffice.add(glassSouth);

    // Glass wall East (with door opening)
    const glassEast = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.4, 4.0), glassMat);
    glassEast.position.set(2.4, 1.7, 0);
    ceoOffice.add(glassEast);

    // Door header & frame
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 0.12), frameMat);
    doorFrame.position.set(2.4, 1.7, 2.0);
    ceoOffice.add(doorFrame);

    // Executive Mahogany Desk
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.1, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x271810, roughness: 0.3, metalness: 0.1 })
    );
    deskTop.position.set(0, 0.9, -0.4);
    ceoOffice.add(deskTop);

    // Desk Legs
    const deskLegMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    [
      [-1.2, -0.9], [1.2, -0.9],
      [-1.2, 0.1], [1.2, 0.1]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 12), deskLegMat);
      leg.position.set(lx, 0.45, lz);
      ceoOffice.add(leg);
    });

    // Executive Laptop & Desk Nameplate: "DEMİR YILMAZ - CEO"
    const laptop = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.03, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 })
    );
    laptop.position.set(0, 0.97, -0.4);
    ceoOffice.add(laptop);

    // Leather Executive High-Back Chair
    const chairSeat = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.1, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 })
    );
    chairSeat.position.set(0, 0.55, -1.1);
    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.85, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.4 })
    );
    chairBack.position.set(0, 1.05, -1.4);
    ceoOffice.add(chairSeat, chairBack);

    // Visitor Chairs in front of desk
    [-0.7, 0.7].forEach((vx) => {
      const vChair = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.08, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
      );
      vChair.position.set(vx, 0.5, 0.5);
      ceoOffice.add(vChair);
    });

    // Office Sign
    const signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.4, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x030712 })
    );
    signMesh.position.set(2.4, 2.2, 2.8);
    ceoOffice.add(signMesh);

    this.scene.add(ceoOffice);
  }

  // Glass Boardroom / Meeting Room
  private buildMeetingRoom() {
    const meetingRoom = new THREE.Group();
    meetingRoom.position.set(-7.5, 0, 4.0);

    // Glass walls
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      metalness: 0.2,
      depthWrite: false,
    });
    const glassWallNorth = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.4, 0.08), glassMat);
    glassWallNorth.position.set(0, 1.7, -3.0);
    meetingRoom.add(glassWallNorth);

    const glassWallEast = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.4, 3.8), glassMat);
    glassWallEast.position.set(2.4, 1.7, 0);
    meetingRoom.add(glassWallEast);

    // Meeting Conference Table (Oval)
    const confTable = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.4 })
    );
    confTable.scale.set(1.6, 1, 0.9);
    confTable.position.set(0, 0.9, 0);
    meetingRoom.add(confTable);

    // Projection Whiteboard Screen on Wall
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.3, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
    );
    screen.position.set(-3.2, 2.2, 0);
    screen.rotation.y = Math.PI / 2;
    meetingRoom.add(screen);

    this.scene.add(meetingRoom);
  }

  // Developer Desks (Player, Burak, Selin, Zeynep)
  private buildDeveloperDesks() {
    const deskPositions = [
      { id: 'desk', pos: new THREE.Vector3(-1.0, 0, -1.0), label: 'Ahmet (Sen)' },
      { id: 'burak', pos: new THREE.Vector3(2.5, 0, -1.0), label: 'Burak (Junior Front)' },
      { id: 'zeynep', pos: new THREE.Vector3(-1.0, 0, 2.0), label: 'Zeynep (UI/UX)' },
      { id: 'selin', pos: new THREE.Vector3(2.5, 0, 2.0), label: 'Selin (Backend Mimar)' },
    ];

    const screenTex = this.createScreenTexture();
    this.screenGlowMaterial = new THREE.MeshBasicMaterial({ map: screenTex });

    deskPositions.forEach((dp) => {
      const dGroup = new THREE.Group();
      dGroup.position.copy(dp.pos);

      // Desk Top
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.08, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.3 })
      );
      top.position.set(0, 0.9, 0);
      dGroup.add(top);

      // Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      [
        [-1.1, -0.45], [1.1, -0.45],
        [-1.1, 0.45], [1.1, 0.45]
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), legMat);
        leg.position.set(lx, 0.45, lz);
        dGroup.add(leg);
      });

      // Monitors with VS Code screen glow
      const monGroup = new THREE.Group();
      monGroup.position.set(-0.3, 1.35, -0.2);
      const bezel = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.65, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
      );
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 0.61), this.screenGlowMaterial);
      scr.position.z = 0.025;
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), legMat);
      stand.position.set(0, -0.25, 0);
      monGroup.add(bezel, scr, stand);
      dGroup.add(monGroup);

      // Ergonomic Mesh Chair
      const chair = new THREE.Group();
      chair.position.set(0, 0, 0.6);
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.08, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 })
      );
      seat.position.y = 0.55;
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.65, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.5 })
      );
      back.position.set(0, 0.95, 0.25);
      chair.add(seat, back);
      chair.rotation.y = Math.PI;
      dGroup.add(chair);

      this.scene.add(dGroup);
    });
  }

  // Server Room Cage & Rack Station
  private buildServerStation() {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(8.0, 0, -4.5);

    // 42U Server Rack Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.0, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.8 })
    );
    frame.position.y = 1.5;
    rackGroup.add(frame);

    // Server Blades & Blinking LEDs
    const bladeGeo = new THREE.BoxGeometry(1.4, 0.15, 1.05);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 });
    const ledGeo = new THREE.SphereGeometry(0.02, 6, 6);

    for (let i = 0; i < 15; i++) {
      const y = 0.35 + i * 0.18;
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, y, 0.02);
      rackGroup.add(blade);

      for (let j = 0; j < 5; j++) {
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(-0.55 + j * 0.12, y, 0.57);
        rackGroup.add(led);
        this.serverLeds.push(led);
      }
    }

    this.scene.add(rackGroup);
  }

  // Plaza Cafe & Water Cooler Station
  private buildBaristaCafe() {
    const cafeGroup = new THREE.Group();
    cafeGroup.position.set(-7.5, 0, -0.5);

    // Barista Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.05, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.2 })
    );
    counter.position.y = 0.52;
    cafeGroup.add(counter);

    // Marble top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.06, 1.25),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.3 })
    );
    top.position.y = 1.08;
    cafeGroup.add(top);

    // Espresso Machine (Chrome)
    const machine = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.55, 0.65),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.1 })
    );
    machine.position.set(0, 1.38, 0);
    cafeGroup.add(machine);

    // Water Cooler next to cafe
    const coolerBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 1.1, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    coolerBase.position.set(1.4, 0.55, 0);
    const waterBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.55, 12),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
    );
    waterBottle.position.set(1.4, 1.38, 0);
    cafeGroup.add(coolerBase, waterBottle);

    this.scene.add(cafeGroup);
  }

  // Plaza Elevators & Lobby Doors
  private buildPlazaElevators() {
    const elGroup = new THREE.Group();
    elGroup.position.set(8.5, 0, 4.5);

    // Elevator surround frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 3.2, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 })
    );
    frame.position.y = 1.6;
    elGroup.add(frame);

    // Dual stainless steel doors
    const doors = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 2.7),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.15 })
    );
    doors.rotation.y = -Math.PI / 2;
    doors.position.set(-0.21, 1.35, 0);
    elGroup.add(doors);

    // Digital Floor Display: "35▲"
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.25),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    display.rotation.y = -Math.PI / 2;
    display.position.set(-0.21, 2.8, 0);
    elGroup.add(display);

    this.scene.add(elGroup);
  }

  // Build Interactive NPCs (Boss + Colleagues)
  private buildNpcs() {
    // 1. Boss: Demir Bey (CEO) sitting at his executive desk
    const boss = this.createNpcCharacter(0x18181b, 0x1e3a8a, 'Demir Bey (CEO)');
    boss.position.set(-7.5, 0, -5.6);
    boss.rotation.y = 0;
    this.scene.add(boss);
    this.npcs.set('boss', boss);

    // 2. Burak (Junior Frontend)
    const burak = this.createNpcCharacter(0x10b981, 0x0f172a, 'Burak');
    burak.position.set(2.5, 0, -0.4);
    burak.rotation.y = Math.PI;
    this.scene.add(burak);
    this.npcs.set('burak', burak);

    // 3. Selin (Backend Architect)
    const selin = this.createNpcCharacter(0x8b5cf6, 0x1e293b, 'Selin');
    selin.position.set(2.5, 0, 2.6);
    selin.rotation.y = Math.PI;
    this.scene.add(selin);
    this.npcs.set('selin', selin);

    // 4. Zeynep (UI/UX Designer)
    const zeynep = this.createNpcCharacter(0xf59e0b, 0x334155, 'Zeynep');
    zeynep.position.set(-1.0, 0, 2.6);
    zeynep.rotation.y = Math.PI;
    this.scene.add(zeynep);
    this.npcs.set('zeynep', zeynep);

    // 5. Kaan (DevOps Engineer) standing near server rack
    const kaan = this.createNpcCharacter(0x06b6d4, 0x0f172a, 'Kaan');
    kaan.position.set(7.0, 0, -3.8);
    kaan.rotation.y = -Math.PI / 4;
    this.scene.add(kaan);
    this.npcs.set('kaan', kaan);
  }

  private createNpcCharacter(shirtColor: number, pantsColor: number, name: string): THREE.Group {
    const npc = new THREE.Group();

    // Torso
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.5, 0.24),
      new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 })
    );
    torso.position.y = 0.72;

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfbd38d, roughness: 0.7 })
    );
    head.position.y = 1.1;

    // Hair
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.155, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 })
    );
    hair.position.set(0, 1.14, -0.02);
    hair.scale.set(1.02, 0.9, 1.05);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.13, 0.45, 0.13);
    const legMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
    const lLeg = new THREE.Mesh(legGeo, legMat);
    lLeg.position.set(-0.11, 0.25, 0);
    const rLeg = new THREE.Mesh(legGeo, legMat);
    rLeg.position.set(0.11, 0.25, 0);

    // Overhead subtle name indicator
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 256, 64);
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 42);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.2),
      new THREE.MeshBasicMaterial({ map: tex, depthTest: false, transparent: true })
    );
    tag.position.set(0, 1.45, 0);
    tag.renderOrder = 999;

    npc.add(torso, head, hair, lLeg, rLeg, tag);
    return npc;
  }

  // Interactive Station Indicator Rings on Floor
  private buildStationRings() {
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    Object.entries(OfficeScene.STATIONS).forEach(([key, pos]) => {
      const ringGeo = new THREE.RingGeometry(0.65, 0.8, 32);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pos.x, 0.02, pos.z);
      this.scene.add(ring);
    });
  }

  // Procedural Hero Player Character
  private createPlayerCharacter(): THREE.Group {
    const player = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.7 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.1 });
    const jeansMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });

    this.playerTorso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.26), jacketMat);
    this.playerTorso.position.y = 0.78;
    this.playerTorso.castShadow = !this.isSoftwareGl;

    this.playerHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), skinMat);
    this.playerHead.position.y = 1.22;
    this.playerHead.castShadow = !this.isSoftwareGl;

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.168, 14, 14), hairMat);
    hair.position.set(0, 1.26, -0.02);
    hair.scale.set(1.02, 0.9, 1.05);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.05, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    visor.position.set(0, 1.22, 0.14);

    const legGeo = new THREE.BoxGeometry(0.14, 0.45, 0.14);
    this.playerLeftLeg = new THREE.Mesh(legGeo, jeansMat);
    this.playerLeftLeg.position.set(-0.12, 0.28, 0);
    this.playerLeftLeg.castShadow = !this.isSoftwareGl;

    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.22), shoesMat);
    leftShoe.position.set(-0.12, 0.05, 0.03);

    this.playerRightLeg = new THREE.Mesh(legGeo, jeansMat);
    this.playerRightLeg.position.set(0.12, 0.28, 0);
    this.playerRightLeg.castShadow = !this.isSoftwareGl;

    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 0.22), shoesMat);
    rightShoe.position.set(0.12, 0.05, 0.03);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 16),
      new THREE.MeshBasicMaterial({ color: 0x030712, transparent: true, opacity: 0.4, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;

    player.add(
      this.playerTorso,
      this.playerHead,
      hair,
      visor,
      this.playerLeftLeg,
      leftShoe,
      this.playerRightLeg,
      rightShoe,
      shadow
    );
    return player;
  }

  // Keyboard and Pointer Input Setup
  private bindInputs() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.container.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('resize', this.onWindowResize);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;

    // Interaction key (Space or E)
    if (e.key === ' ' || e.key.toLowerCase() === 'e') {
      if (this.currentStation) {
        e.preventDefault();
        soundManager.playClick();
        this.callbacks.onStationInteract(this.currentStation);
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;

    const rect = this.container.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, this.camera);
    const hitPoint = new THREE.Vector3();
    const hit = _raycaster.ray.intersectPlane(_groundPlane, hitPoint);

    if (hit) {
      hitPoint.x = THREE.MathUtils.clamp(hitPoint.x, -10, 10);
      hitPoint.z = THREE.MathUtils.clamp(hitPoint.z, -7, 7);
      this.playerTargetPos = hitPoint;
    }
  };

  public setSittingAtDesk(sitting: boolean) {
    this.isSittingAtDesk = sitting;
    if (sitting) {
      this.playerGroup.position.set(-1.0, 0, -0.6);
      this.playerGroup.rotation.y = Math.PI;
    }
  }

  // Animation Loop with Software-WebGL Pacing
  private startLoop() {
    const tick = () => {
      const dt = Math.min(this.clock.getDelta(), 0.05);

      this.updateSimulation(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateSimulation(dt: number) {
    // 1. Process movement
    _moveDir.set(0, 0, 0);

    if (this.keys['w'] || this.keys['arrowup']) _moveDir.z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) _moveDir.z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) _moveDir.x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) _moveDir.x += 1;

    let isMoving = false;

    if (_moveDir.lengthSq() > 0) {
      this.playerTargetPos = null;
      _moveDir.normalize();
      isMoving = true;
    } else if (this.playerTargetPos) {
      _vec3.subVectors(this.playerTargetPos, this.playerGroup.position);
      _vec3.y = 0;
      if (_vec3.length() > 0.15) {
        _moveDir.copy(_vec3).normalize();
        isMoving = true;
      } else {
        this.playerTargetPos = null;
      }
    }

    if (isMoving && !this.isSittingAtDesk) {
      const speed = 4.4;
      this.playerGroup.position.x += _moveDir.x * speed * dt;
      this.playerGroup.position.z += _moveDir.z * speed * dt;

      this.playerGroup.position.x = THREE.MathUtils.clamp(this.playerGroup.position.x, -10.2, 10.2);
      this.playerGroup.position.z = THREE.MathUtils.clamp(this.playerGroup.position.z, -7.2, 7.2);

      const targetAngle = Math.atan2(_moveDir.x, _moveDir.z);
      this.playerGroup.rotation.y = THREE.MathUtils.damp(
        this.playerGroup.rotation.y,
        targetAngle,
        14,
        dt
      );

      const walkTime = this.clock.getElapsedTime() * 9;
      this.playerLeftLeg.rotation.x = Math.sin(walkTime) * 0.45;
      this.playerRightLeg.rotation.x = -Math.sin(walkTime) * 0.45;
      this.playerTorso.position.y = 0.78 + Math.abs(Math.sin(walkTime * 2)) * 0.04;

      const now = performance.now();
      if (now - this.lastFootstepTime > 340) {
        soundManager.playFootstep();
        this.lastFootstepTime = now;
      }
    } else if (!this.isSittingAtDesk) {
      this.playerLeftLeg.rotation.x = THREE.MathUtils.damp(this.playerLeftLeg.rotation.x, 0, 10, dt);
      this.playerRightLeg.rotation.x = THREE.MathUtils.damp(this.playerRightLeg.rotation.x, 0, 10, dt);
      this.playerTorso.position.y = THREE.MathUtils.damp(this.playerTorso.position.y, 0.78, 10, dt);
    }

    // Camera follow player smoothly
    const targetCamX = this.playerGroup.position.x * 0.45;
    const targetCamZ = this.playerGroup.position.z * 0.45 + 14.5;
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 4, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 4, dt);

    // 2. Animate Server LEDs
    const elapsed = this.clock.getElapsedTime();
    this.serverLeds.forEach((led, i) => {
      const mat = led.material as THREE.MeshBasicMaterial;
      if (Math.sin(elapsed * 6 + i) > 0.8) {
        mat.color.setHex(0x38bdf8);
      } else {
        mat.color.setHex(0x06b6d4);
      }
    });

    // 3. Proximity Detection to Stations & NPCs
    let detectedStation: InteractionStation = null;
    const playerPos = this.playerGroup.position;
    const interactDist = 1.8;

    for (const [key, sPos] of Object.entries(OfficeScene.STATIONS)) {
      _stationPos.copy(sPos);
      if (playerPos.distanceTo(_stationPos) < interactDist) {
        detectedStation = key as InteractionStation;
        break;
      }
    }

    if (detectedStation !== this.currentStation) {
      this.currentStation = detectedStation;
      this.callbacks.onStationNear(detectedStation);
    }
  }

  public teleportToStation(station: InteractionStation) {
    if (!station) return;
    const target = OfficeScene.STATIONS[station];
    if (target) {
      this.playerGroup.position.set(target.x, 0, target.z + 0.35);
      this.playerTargetPos = null;
      this.currentStation = station;
      this.callbacks.onStationNear(station);
    }
  }

  public onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose() {
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }
}

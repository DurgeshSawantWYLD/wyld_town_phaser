// src/world/Buildings.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { BRANDS } from '../config.js';

export const gltfLoader = new GLTFLoader();
export const gltfCache = {};

// ─── Shared Material Factories ────────────────────────────────────────────
const mat = (color, emissive = 0x000000, emissiveIntensity = 0) =>
  new THREE.MeshToonMaterial({ color, emissive: new THREE.Color(emissive), emissiveIntensity });

const basicMat = (color) => new THREE.MeshBasicMaterial({ color });

// Palette — light mode
const C = {
  darkBase:   0x3d4f65,   // medium blue-grey (was pitch black)
  concrete:   0x8fa5b8,   // warm light grey concrete
  steel:      0x6a8ea8,   // blue-grey steel
  glass:      0xa8c8e8,   // light sky blue glass
  glassNeon:  0x7ab8d8,   // medium teal glass
  neonCyan:   0x0099bb,   // deep teal (visible on light bg)
  neonMag:    0xcc0088,   // deep magenta
  neonYellow: 0xd4a000,   // amber/gold
  neonGreen:  0x1a8a4a,   // forest green
  neonOrange: 0xe05500,   // deep orange
  neonPink:   0xcc1177,   // deep pink
  neonBlue:   0x2255dd,   // royal blue
  white:      0xffffff,
  dark1:      0x4a5c70,   // medium slate
  dark2:      0x3a4d60,   // darker slate
};


// ─── Helper: window grid on a building face ────────────────────────────────
function addWindowGrid(parent, width, height, depth, side, floors, cols, winColor = C.neonCyan) {
  const winMat = basicMat(winColor);
  const winW = (width * 0.55) / cols;
  const winH = (height * 0.55) / floors;
  const gapW = (width * 0.45) / (cols + 1);
  const gapH = (height * 0.45) / (floors + 1);

  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), winMat);
      const px = -width / 2 + gapW * (c + 1) + winW * (c + 0.5);
      const py = -height / 2 + gapH * (f + 1) + winH * (f + 0.5);

      if (side === 'front') {
        win.position.set(px, py, depth / 2 + 0.001);
      } else if (side === 'right') {
        win.position.set(depth / 2 + 0.001, py, px);
        win.rotation.y = Math.PI / 2;
      } else if (side === 'left') {
        win.position.set(-depth / 2 - 0.001, py, -px);
        win.rotation.y = -Math.PI / 2;
      } else if (side === 'back') {
        win.position.set(-px, py, -depth / 2 - 0.001);
        win.rotation.y = Math.PI;
      }
      win.layers.enable(1); // bloom layer
      parent.add(win);
    }
  }
}

// ─── Helper: neon sign strip ──────────────────────────────────────────────
function addNeonSign(parent, text, w, h, y, z, color = C.neonCyan) {
  const signBase = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), mat(C.dark1));
  signBase.position.set(0, y, z);
  parent.add(signBase);

  const glow = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.015), basicMat(color));
  glow.position.set(0, y, z - 0.005);
  glow.layers.enable(1);
  parent.add(glow);
}

// ─── Helper: rooftop AC unit ──────────────────────────────────────────────
function addRooftopACU(parent, px, py, pz) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.1), mat(C.steel));
  body.position.set(px, py + 0.03, pz);
  parent.add(body);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), mat(C.concrete));
  fan.position.set(px, py + 0.065, pz);
  parent.add(fan);
}

// ─── Helper: cylinder antenna ─────────────────────────────────────────────
function addAntenna(parent, px, py, pz, color = C.neonCyan) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.35, 4), mat(C.steel));
  pole.position.set(px, py + 0.175, pz);
  parent.add(pole);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), basicMat(color));
  tip.position.set(px, py + 0.365, pz);
  tip.layers.enable(1);
  parent.add(tip);
}

// ═══════════════════════════════════════════════════════════════════════════
// 7 UNIQUE INTERACTIVE LANDMARK BUILDINGS
// ═══════════════════════════════════════════════════════════════════════════

function buildWelcome(group, primaryColor) {
  // Stepped neo-gothic plaza tower
  const steps = [
    { r: 0.62, h: 0.06 }, { r: 0.52, h: 0.08 }, { r: 0.42, h: 0.06 }
  ];
  steps.forEach((s, i) => {
    const step = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r + 0.02, s.h, 16), mat(C.concrete));
    step.position.y = steps.slice(0, i).reduce((acc, ps) => acc + ps.h, 0) + s.h / 2;
    group.add(step);
  });

  // Main obelisk tower
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.9, 12), mat(C.steel));
  tower.position.y = 0.2 + 0.45;
  group.add(tower);

  // WYLD neon ring
  const ringGeo = new THREE.TorusGeometry(0.38, 0.025, 8, 32);
  const ring = new THREE.Mesh(ringGeo, basicMat(C.neonCyan));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.22;
  ring.layers.enable(1);
  group.add(ring);

  // Crown spire
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), mat(C.steel));
  spire.position.y = 0.2 + 0.9 + 0.15;
  group.add(spire);

  const spireGlow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), basicMat(C.neonMag));
  spireGlow.position.y = 0.2 + 0.9 + 0.31;
  spireGlow.layers.enable(1);
  group.add(spireGlow);

  // Fountain basin
  const fountain = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.04, 16), mat(C.concrete));
  fountain.position.set(0, 0.02, 0);
  group.add(fountain);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.025, 16),
    new THREE.MeshToonMaterial({ color: 0x0891b2, emissive: new THREE.Color(0x00e5ff), emissiveIntensity: 0.5 })
  );
  water.position.set(0, 0.03, 0);
  water.layers.enable(1);
  group.add(water);

  // Pillar ring
  const pillarGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.24, 5);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const pillar = new THREE.Mesh(pillarGeo, mat(C.concrete));
    pillar.position.set(Math.cos(angle) * 0.52, 0.12, Math.sin(angle) * 0.52);
    group.add(pillar);
  }
}

function buildBrands(group, primaryColor) {
  // Lobby
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.18, 0.85), mat(C.concrete));
  lobby.position.y = 0.09;
  lobby.castShadow = true;
  group.add(lobby);

  // Tower floors (4 sections)
  const floors = [
    { w: 0.7, h: 0.22, y: 0.18 + 0.11 },
    { w: 0.62, h: 0.22, y: 0.40 + 0.11 },
    { w: 0.52, h: 0.22, y: 0.62 + 0.11 },
    { w: 0.42, h: 0.22, y: 0.84 + 0.11 },
  ];
  floors.forEach((f, i) => {
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(f.w, f.h, f.w),
      mat(C.glass, C.neonCyan, 0.04)
    );
    floor.position.y = f.y;
    floor.castShadow = true;
    group.add(floor);

    // Window grids on all 4 faces
    addWindowGrid(floor, f.w, f.h, f.w, 'front', 2, 3, i % 2 === 0 ? C.neonCyan : C.neonBlue);
    addWindowGrid(floor, f.w, f.h, f.w, 'right', 2, 3, i % 2 === 0 ? C.neonCyan : C.neonBlue);
    addWindowGrid(floor, f.w, f.h, f.w, 'back',  2, 3, i % 2 === 0 ? C.neonCyan : C.neonBlue);
    addWindowGrid(floor, f.w, f.h, f.w, 'left',  2, 3, i % 2 === 0 ? C.neonCyan : C.neonBlue);
  });

  // Helipad
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12), mat(C.dark1));
  pad.position.y = 1.06 + 0.01;
  group.add(pad);
  const padH = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), basicMat(C.neonMag));
  padH.rotation.x = -Math.PI / 2;
  padH.position.y = 1.08;
  padH.layers.enable(1);
  group.add(padH);

  // Vertical neon stripes on sides
  [-0.36, 0.36].forEach(sx => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.06, 0.03), basicMat(C.neonCyan));
    stripe.position.set(sx, 0.53, 0);
    stripe.layers.enable(1);
    group.add(stripe);
  });

  addNeonSign(group, 'BRANDS', 0.5, 0.08, 0.2, 0.435, C.neonCyan);
  addAntenna(group, 0, 1.06, 0, C.neonMag);
  addRooftopACU(group, -0.15, 1.07, 0.12);
  addRooftopACU(group, 0.15, 1.07, -0.12);
}

function buildCreator(group, primaryColor) {
  // Main studio block
  const studio = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.4, 0.72), mat(C.concrete));
  studio.position.y = 0.2;
  studio.castShadow = true;
  group.add(studio);

  addWindowGrid(studio, 0.85, 0.4, 0.72, 'front', 2, 4, C.neonMag);
  addWindowGrid(studio, 0.85, 0.4, 0.72, 'right', 2, 3, C.neonMag);

  // Upper control deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.26, 0.46), mat(C.steel));
  deck.position.set(-0.12, 0.53, -0.06);
  deck.castShadow = true;
  group.add(deck);
  addWindowGrid(deck, 0.52, 0.26, 0.46, 'front', 2, 3, C.neonMag);

  // Glass dome roof
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(C.glassNeon, C.neonCyan, 0.2)
  );
  dome.position.set(0.22, 0.42, 0.1);
  group.add(dome);

  // LIVE neon sign
  addNeonSign(group, 'LIVE', 0.26, 0.07, 0.42, 0.37, C.neonOrange);
  const liveGlow = basicMat(C.neonOrange);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), liveGlow);
  dot.position.set(-0.16, 0.42, 0.372);
  dot.layers.enable(1);
  group.add(dot);

  // Satellite dish
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(C.steel)
  );
  dish.rotation.x = -Math.PI / 3;
  dish.rotation.z = 0.3;
  dish.position.set(0.35, 0.55, -0.25);
  group.add(dish);

  // Main antenna
  addAntenna(group, -0.12, 0.66, -0.06, C.neonMag);

  // Camera rig on roof
  const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.1), mat(C.dark2));
  camBody.position.set(0.1, 0.68, 0.12);
  group.add(camBody);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.04, 6), basicMat(C.neonCyan));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0.1, 0.68, 0.165);
  lens.layers.enable(1);
  group.add(lens);
}

function buildCampaigns(group, primaryColor) {
  // Base station
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.58), mat(C.dark1));
  base.position.y = 0.08;
  base.castShadow = true;
  group.add(base);

  // Main mast
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.035, 0.82, 5), mat(C.steel));
  mast.position.y = 0.57;
  mast.castShadow = true;
  group.add(mast);

  // Cross arms
  [-0.22, 0, 0.22].forEach((y, i) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32 - i * 0.06, 4), mat(C.steel));
    arm.rotation.z = Math.PI / 2;
    arm.position.y = 0.3 + i * 0.2;
    group.add(arm);
  });

  // Billboard display (emissive)
  const billboard = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.04), mat(C.dark2));
  billboard.position.set(0, 0.35, 0.32);
  group.add(billboard);

  // Neon display panels on billboard
  const colors = [C.neonCyan, C.neonMag, C.neonYellow];
  for (let i = 0; i < 3; i++) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.01), basicMat(colors[i]));
    panel.position.set(-0.17 + i * 0.17, 0.35 + 0.07, 0.34);
    panel.layers.enable(1);
    group.add(panel);
  }
  const mainBar = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.01), basicMat(C.neonCyan));
  mainBar.position.set(0, 0.35 - 0.1, 0.34);
  mainBar.layers.enable(1);
  group.add(mainBar);

  // Beacon sphere on top
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), basicMat(C.neonOrange));
  beacon.position.y = 0.98;
  beacon.layers.enable(1);
  group.add(beacon);
  group.userData.beacon = beacon;

  // Small side screens
  [-0.35, 0.35].forEach(sx => {
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.04), mat(C.dark2));
    screen.position.set(sx, 0.32, 0.25);
    group.add(screen);
    const screenGlow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.01), basicMat(C.neonBlue));
    screenGlow.position.set(sx, 0.32, 0.275);
    screenGlow.layers.enable(1);
    group.add(screenGlow);
  });
}

function buildAnalytics(group, primaryColor) {
  // Geodesic dome base ring
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.08, 16), mat(C.concrete));
  base.position.y = 0.04;
  group.add(base);

  // Dome — hemisphere
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(C.glass, C.neonBlue, 0.08)
  );
  dome.position.y = 0.08;
  dome.castShadow = true;
  group.add(dome);

  // Wireframe hex lines overlay (emissive)
  const wireGeo = new THREE.SphereGeometry(0.435, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const wire = new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({
    color: C.neonBlue,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  }));
  wire.position.y = 0.08;
  wire.layers.enable(1);
  group.add(wire);

  // Hologram ring
  const holoRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.015, 8, 32), basicMat(C.neonCyan));
  holoRing.rotation.x = Math.PI / 2;
  holoRing.position.y = 0.6;
  holoRing.layers.enable(1);
  group.add(holoRing);
  group.userData.holoRing = holoRing;

  // Radar dish
  const radar = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(C.steel)
  );
  radar.rotation.x = -Math.PI / 4;
  radar.position.set(0.3, 0.56, -0.2);
  group.add(radar);

  // Indicator beacon
  const indicator = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.06, 8), basicMat(C.neonGreen));
  indicator.position.y = 0.52;
  indicator.layers.enable(1);
  group.add(indicator);

  // Port boxes
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), mat(C.dark1));
    port.position.set(Math.cos(angle) * 0.46, 0.06, Math.sin(angle) * 0.46);
    group.add(port);
    const portGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.06), basicMat(C.neonBlue));
    portGlow.position.set(Math.cos(angle) * 0.52, 0.06, Math.sin(angle) * 0.52);
    portGlow.lookAt(Math.cos(angle) * 5, 0.06, Math.sin(angle) * 5);
    portGlow.layers.enable(1);
    group.add(portGlow);
  }
}

function buildMarketplace(group, primaryColor) {
  // Floor plaza
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.95), mat(C.dark1));
  plaza.position.y = 0.02;
  group.add(plaza);

  // Stall configurations
  const stalls = [
    { x: -0.26, z: -0.26, rot: Math.PI / 4, color: C.neonPink },
    { x:  0.26, z: -0.26, rot: -Math.PI / 4, color: C.neonCyan },
    { x:  0,   z:  0.3,  rot: 0, color: C.neonYellow },
  ];

  stalls.forEach(s => {
    const stall = new THREE.Group();
    stall.rotation.y = s.rot;

    // Counter
    const cnt = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.16), mat(0x3d1a08));
    cnt.position.y = 0.06;
    stall.add(cnt);

    // Display items on counter
    for (let i = -1; i <= 1; i++) {
      const item = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), basicMat(s.color));
      item.position.set(i * 0.07, 0.14, 0);
      item.layers.enable(1);
      stall.add(item);
    }

    // Awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.015, 0.24), mat(s.color === C.neonPink ? 0x5c0a2a : s.color === C.neonCyan ? 0x0a3040 : 0x3a3a00));
    awning.position.y = 0.3;
    stall.add(awning);

    // Neon awning edge
    const awningEdge = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.012, 0.01), basicMat(s.color));
    awningEdge.position.set(0, 0.293, 0.12);
    awningEdge.layers.enable(1);
    stall.add(awningEdge);

    // Corner poles
    [[-0.13, -0.09], [0.13, -0.09], [-0.13, 0.09], [0.13, 0.09]].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.3, 4), mat(C.steel));
      pole.position.set(px, 0.15, pz);
      stall.add(pole);
    });

    stall.position.set(s.x, 0.04, s.z);
    group.add(stall);
  });

  // Central signboard
  const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.55, 5), mat(C.steel));
  signPole.position.set(0, 0.295, -0.4);
  group.add(signPole);

  const signboard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.02), mat(C.dark2));
  signboard.position.set(0, 0.62, -0.4);
  group.add(signboard);

  addNeonSign(group, 'MARKET', 0.36, 0.06, 0.62, -0.39, C.neonYellow);
}

function buildCommunity(group, primaryColor) {
  // Raised green platform
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.55, 0.06, 10),
    mat(0x0d3320)
  );
  base.position.y = 0.03;
  base.receiveShadow = true;
  group.add(base);

  // Amphitheater steps (3 tiers)
  [0.44, 0.36, 0.28].forEach((r, i) => {
    const tier = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r + 0.02, 0.04, 10),
      mat(C.dark1)
    );
    tier.position.y = 0.06 + i * 0.04;
    group.add(tier);
  });

  // Pavilion posts (4)
  const postMat = mat(C.steel);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.34, 5), postMat);
    post.position.set(Math.cos(angle) * 0.24, 0.17 + 0.06, Math.sin(angle) * 0.24);
    group.add(post);
  }

  // Glass canopy roof
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(0.36, 0.2, 8),
    mat(C.glassNeon, C.neonGreen, 0.12)
  );
  canopy.position.y = 0.34 + 0.06 + 0.1;
  canopy.castShadow = true;
  group.add(canopy);

  // Neon plant silhouettes
  const plantColors = [C.neonGreen, C.neonCyan];
  [[-0.38, -0.32], [0.38, -0.32], [-0.38, 0.32], [0.38, 0.32]].forEach(([px, pz], i) => {
    const plant = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), basicMat(plantColors[i % 2]));
    plant.position.set(px, 0.1, pz);
    plant.layers.enable(1);
    group.add(plant);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.1, 4), mat(C.dark2));
    trunk.position.set(px, 0.05, pz);
    group.add(trunk);
  });

  // Glowing lanterns
  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((angle, i) => {
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), basicMat(plantColors[i % 2]));
    lantern.position.set(Math.cos(angle) * 0.3, 0.28, Math.sin(angle) * 0.3);
    lantern.layers.enable(1);
    group.add(lantern);
  });

  // Pond
  const pond = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.02, 12),
    new THREE.MeshToonMaterial({ color: 0x0c2a4a, emissive: new THREE.Color(C.neonCyan), emissiveIntensity: 0.3 })
  );
  pond.position.set(-0.2, 0.07, 0.2);
  pond.layers.enable(1);
  group.add(pond);
}

function buildSnow(group, primaryColor) {
  // Snowy base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.08, 0.7),
    mat(0xffffff)
  );
  base.position.y = 0.04;
  base.receiveShadow = true;
  group.add(base);

  // Ice Dome (igloo)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(0x80deea)
  );
  dome.position.y = 0.06;
  dome.castShadow = true;
  group.add(dome);

  // Pine tree
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.35, 6),
    mat(0x006064)
  );
  leaves.position.set(-0.25, 0.24, -0.25);
  leaves.castShadow = true;
  group.add(leaves);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, 0.1, 4),
    mat(0x5d4037)
  );
  trunk.position.set(-0.25, 0.08, -0.25);
  group.add(trunk);
}

function buildDesert(group, primaryColor) {
  // Sand base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.08, 0.7),
    mat(0xffcc80)
  );
  base.position.y = 0.04;
  base.receiveShadow = true;
  group.add(base);

  // Golden Pyramid
  const pyr = new THREE.Mesh(
    new THREE.ConeGeometry(0.26, 0.4, 4),
    mat(0xffb300)
  );
  pyr.position.set(0.1, 0.24, -0.1);
  pyr.rotation.y = Math.PI / 4;
  pyr.castShadow = true;
  group.add(pyr);

  // Oasis Pond
  const pond = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10),
    mat(0x00e5ff)
  );
  pond.position.set(-0.2, 0.05, 0.2);
  group.add(pond);
}

// ─── Main Building Factory ────────────────────────────────────────────────
export function createMainBuilding(scene, region, cols, rows) {
  const group = new THREE.Group();
  const x = region.col - cols / 2;
  const z = region.row - rows / 2;

  group.name = region.id;
  group.userData = { isBuilding: true, regionId: region.id, regionData: region };

  switch (region.id) {
    case 'welcome':    buildWelcome(group, region.color);    break;
    case 'brands':     buildBrands(group, region.color);     break;
    case 'creator':    buildCreator(group, region.color);    break;
    case 'campaigns':  buildCampaigns(group, region.color);  break;
    case 'analytics':  buildAnalytics(group, region.color);  break;
    case 'marketplace':buildMarketplace(group, region.color);break;
    case 'community':  buildCommunity(group, region.color);  break;
    case 'snow':       buildSnow(group, region.color);       break;
    case 'desert':     buildDesert(group, region.color);     break;
  }

  group.traverse(child => { if (child.isMesh) child.castShadow = true; });
  group.position.set(x, 0, z);
  scene.add(group);
  group.scale.set(0, 0, 0);
  return group;
}

// ═══════════════════════════════════════════════════════════════════════════
// 10 DECORATIVE BUILDING VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

function buildOffice_Tower(g, h) {
  const floors = Math.floor(3 + h * 4);
  const w = 0.42 + Math.random() * 0.12, d = 0.38 + Math.random() * 0.1;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(C.steel));
  body.position.y = h / 2;
  g.add(body);
  addWindowGrid(body, w, h, d, 'front', floors, 2, Math.random() > 0.5 ? C.neonCyan : C.neonBlue);
  addWindowGrid(body, w, h, d, 'right', floors, 2, C.neonCyan);
  // Flat roof + AC units
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.03, d + 0.01), mat(C.dark1));
  roof.position.y = h + 0.015;
  g.add(roof);
  addRooftopACU(g, -0.1, h + 0.03, 0.1);
  addRooftopACU(g,  0.1, h + 0.03, -0.1);
  // Neon nameplate
  const neonColors = [C.neonCyan, C.neonMag, C.neonBlue, C.neonGreen];
  addNeonSign(g, '', w * 0.7, 0.05, h * 0.7, d / 2 + 0.002, neonColors[Math.floor(Math.random() * neonColors.length)]);
}

function buildOffice_Low(g, h) {
  const w = 0.65 + Math.random() * 0.15, d = 0.48 + Math.random() * 0.1;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(C.concrete));
  body.position.y = h / 2;
  g.add(body);
  addWindowGrid(body, w, h, d, 'front', 2, 4, C.neonCyan);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.02, d + 0.02), mat(C.dark1));
  roof.position.y = h + 0.01;
  g.add(roof);
  addNeonSign(g, '', w * 0.8, 0.06, h * 0.75, d / 2 + 0.002, C.neonMag);
}

function buildResidential_Tall(g, h) {
  const w = 0.35, d = 0.35;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(0x1a2d20));
  body.position.y = h / 2;
  g.add(body);
  const floors = Math.floor(h / 0.12);
  // Balconies
  for (let f = 1; f < floors; f++) {
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.08), mat(C.steel));
    balcony.position.set(w / 2 + 0.02, f * 0.12, 0);
    g.add(balcony);
  }
  addWindowGrid(body, w, h, d, 'front', floors, 2, C.neonGreen);
  // Water tank
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 6), mat(C.dark1));
  tank.position.y = h + 0.05;
  g.add(tank);
}

function buildResidential_House(g, h) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, 0.46), mat(0x1f2d18));
  body.position.y = h / 2;
  g.add(body);
  // Pitched roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.22, 4), mat(0x2d1506));
  roof.position.y = h + 0.11;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  // Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.06), mat(C.dark1));
  chimney.position.set(0.15, h + 0.1, 0.1);
  g.add(chimney);
  // Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.01), mat(0x3b1a04));
  door.position.set(0, 0.075, 0.231);
  g.add(door);
  // Fence posts
  for (let i = -2; i <= 2; i++) {
    const fence = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.02), mat(C.concrete));
    fence.position.set(i * 0.1, 0.03, 0.32);
    g.add(fence);
  }
}

function buildIndustrial_Factory(g, h) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.82, h, 0.58), mat(C.dark1));
  body.position.y = h / 2;
  g.add(body);
  // Skylight strips
  for (let i = -1; i <= 1; i++) {
    const sky = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.5), basicMat(C.neonCyan));
    sky.position.set(i * 0.2, h + 0.005, 0);
    sky.layers.enable(1);
    g.add(sky);
  }
  // Smokestack
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.38, 6), mat(C.concrete));
  stack.position.set(0.3, h + 0.19, -0.15);
  g.add(stack);
  // Loading dock
  const dock = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.12), mat(C.steel));
  dock.position.set(-0.3, 0.05, 0.35);
  g.add(dock);
  // Hazard stripe
  const hazard = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.06, 0.01), basicMat(C.neonYellow));
  hazard.position.set(0, 0.08, 0.291);
  hazard.layers.enable(1);
  g.add(hazard);
}

function buildIndustrial_Warehouse(g, h) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.78, h, 0.62), mat(0x151c24));
  body.position.y = h / 2;
  g.add(body);
  // Rollup door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.01), mat(C.steel));
  door.position.set(0, 0.1, 0.311);
  g.add(door);
  for (let i = -3; i <= 3; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.015, 0.005), mat(C.dark1));
    slat.position.set(0, 0.1 + i * 0.028, 0.314);
    g.add(slat);
  }
  // Flat roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.025, 0.64), mat(C.dark2));
  roof.position.y = h + 0.012;
  g.add(roof);
}

function buildShop_Corner(g, h) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.48, h, 0.42), mat(C.concrete));
  body.position.y = h / 2;
  g.add(body);
  // Awning
  const awning = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.025, 0.2), mat(0x1a0a2a));
  awning.position.set(0, h * 0.42, 0.26);
  g.add(awning);
  const awningEdge = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.01, 0.01), basicMat(C.neonMag));
  awningEdge.position.set(0, h * 0.42 - 0.01, 0.37);
  awningEdge.layers.enable(1);
  g.add(awningEdge);
  // Open sign
  const openSign = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.01), basicMat(C.neonGreen));
  openSign.position.set(-0.1, h * 0.52, 0.211);
  openSign.layers.enable(1);
  g.add(openSign);
  // Display window
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.01), basicMat(C.neonCyan));
  win.position.set(0.05, h * 0.22, 0.211);
  win.layers.enable(1);
  g.add(win);
}

function buildRestaurant(g, h) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, 0.52), mat(0x1a1008));
  body.position.y = h / 2;
  g.add(body);
  // Curved awning
  const awning = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.62, 12, 1, true, 0, Math.PI * 0.6),
    mat(0x2a0f05)
  );
  awning.rotation.y = -Math.PI * 0.3 + Math.PI / 2;
  awning.position.set(0, h * 0.5, 0.24);
  g.add(awning);
  // Menu board
  const menu = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.02), mat(C.dark1));
  menu.position.set(0.28, 0.12, 0.27);
  g.add(menu);
  addNeonSign(g, '', 0.14, 0.04, h * 0.75, 0.27, C.neonOrange);
  // Outdoor seating silhouette
  for (let i = -1; i <= 1; i++) {
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), mat(C.steel));
    chair.position.set(i * 0.12, 0.03, 0.34);
    g.add(chair);
  }
}

function buildParking_Structure(g, h) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, h, 0.55), mat(C.dark1));
  body.position.y = h / 2;
  g.add(body);
  // Open facade strips
  const floors = 3;
  for (let f = 0; f < floors; f++) {
    const fy = (f + 0.5) * (h / floors);
    // Front openings
    for (let i = -2; i <= 2; i++) {
      const opening = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.01), mat(C.dark2));
      opening.position.set(i * 0.13, fy, 0.276);
      g.add(opening);
    }
    // Level number indicator
    const lvlGlow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.005), basicMat(C.neonYellow));
    lvlGlow.position.set(-0.3, fy + 0.06, 0.278);
    lvlGlow.layers.enable(1);
    g.add(lvlGlow);
  }
  // Ramp detail on side
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.55), mat(C.steel));
  ramp.rotation.x = Math.PI / 10;
  ramp.position.set(0.38, h * 0.5, 0);
  g.add(ramp);
}

function buildCivic_Landmark(g, h) {
  // Wide decorative plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), mat(C.concrete));
  plinth.position.y = 0.06;
  g.add(plinth);
  // Stepped tiers
  [[0.44, 0.08, 0.16], [0.34, 0.06, 0.26], [0.24, 0.04, 0.34]].forEach(([w, ph, py]) => {
    const tier = new THREE.Mesh(new THREE.BoxGeometry(w, ph, w), mat(C.steel));
    tier.position.y = py;
    g.add(tier);
  });
  // Clock face
  const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 12), mat(C.dark2));
  clock.position.y = 0.42;
  g.add(clock);
  const clockGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.005, 12), basicMat(C.neonCyan));
  clockGlow.position.y = 0.428;
  clockGlow.layers.enable(1);
  g.add(clockGlow);
  // Spire
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.018, 0.32, 4), mat(C.steel));
  spire.position.y = h + 0.16;
  g.add(spire);
  addAntenna(g, 0, h + 0.13, 0, C.neonYellow);
}

// Map variant type → build function
export const DECOR_BUILDERS = {
  office_tower:        (g) => buildOffice_Tower(g, 0.5 + Math.random() * 0.4),
  office_low:          (g) => buildOffice_Low(g, 0.25 + Math.random() * 0.15),
  residential_tall:    (g) => buildResidential_Tall(g, 0.55 + Math.random() * 0.35),
  residential_house:   (g) => buildResidential_House(g, 0.28 + Math.random() * 0.1),
  industrial_factory:  (g) => buildIndustrial_Factory(g, 0.28 + Math.random() * 0.1),
  industrial_warehouse:(g) => buildIndustrial_Warehouse(g, 0.2 + Math.random() * 0.08),
  shop_corner:         (g) => buildShop_Corner(g, 0.24 + Math.random() * 0.1),
  restaurant:          (g) => buildRestaurant(g, 0.22 + Math.random() * 0.1),
  parking_structure:   (g) => buildParking_Structure(g, 0.32 + Math.random() * 0.1),
  civic_landmark:      (g) => buildCivic_Landmark(g, 0.38 + Math.random() * 0.1),
};

export function createDecorBuilding(scene, decor, cols, rows) {
  const group = new THREE.Group();
  const x = decor.c - cols / 2;
  const z = decor.r - rows / 2;

  const type = decor.type || 'office_tower';
  const builder = DECOR_BUILDERS[type] || DECOR_BUILDERS.office_tower;
  builder(group);

  group.traverse(child => { if (child.isMesh) child.castShadow = true; });
  group.position.set(x, 0, z);
  scene.add(group);
  group.scale.set(0, 0, 0);
  return group;
}

export function createCustomBuilding(scene, assetConfig, col, row, cols, rows) {
  const group = new THREE.Group();
  const x = col - cols / 2;
  const z = row - rows / 2;
  group.position.set(x, 0, z);
  scene.add(group);

  if (assetConfig.type === 'external_gltf') {
    const url = assetConfig.url;
    const scale = assetConfig.scale ?? 1;
    const rotation = assetConfig.rotation ?? 0;
    const yOffset = assetConfig.yOffset ?? 0;

    // Show a temporary placeholder box while loading
    const placeholder = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), mat(0x8fa5b8));
    placeholder.position.y = 0.15;
    group.add(placeholder);

    const loadModel = (modelUrl) => {
      if (gltfCache[modelUrl]) {
        group.remove(placeholder);
        const model = gltfCache[modelUrl].clone();
        model.scale.set(scale, scale, scale);
        model.rotation.y = rotation;
        model.position.y = yOffset;
        model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        group.add(model);
      } else {
        gltfLoader.load(modelUrl, (gltf) => {
          gltfCache[modelUrl] = gltf.scene;
          group.remove(placeholder);
          const model = gltf.scene.clone();
          model.scale.set(scale, scale, scale);
          model.rotation.y = rotation;
          model.position.y = yOffset;
          model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
          group.add(model);
        }, undefined, (err) => {
          console.error("Error loading GLTF:", err);
          // Fallback to placeholder if load fails
          placeholder.material.color.setHex(0xff3333);
        });
      }
    };
    loadModel(url);
  } else {
    // Procedural shape
    const shape = assetConfig.shape || 'office_tower';
    const builder = DECOR_BUILDERS[shape] || DECOR_BUILDERS.office_tower;
    builder(group);

    // Apply custom colors if specified
    if (assetConfig.primaryColor) {
      group.traverse(child => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          if (child.material.color) {
            child.material.color.setHex(assetConfig.primaryColor);
          }
        }
      });
    }
  }

  group.traverse(child => { if (child.isMesh) child.castShadow = true; });
  group.scale.set(0, 0, 0); // start at scale 0 for staggered reveal
  return group;
}

// ─── Confetti burst ───────────────────────────────────────────────────────
export function createConfettiBurst(scene, targetPos) {
  const burstGroup = new THREE.Group();
  burstGroup.position.copy(targetPos);
  burstGroup.position.y += 0.2;
  scene.add(burstGroup);

  const colors = [C.neonCyan, C.neonMag, C.neonYellow, C.neonGreen, C.neonOrange];
  const particles = [];
  const particleGeo = new THREE.BoxGeometry(0.02, 0.02, 0.02);

  for (let i = 0; i < 50; i++) {
    const pMat = basicMat(colors[i % colors.length]);
    const p = new THREE.Mesh(particleGeo, pMat);
    p.layers.enable(1);

    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    p.userData = {
      vx: Math.cos(angle) * speed * 0.015,
      vy: (1.0 + Math.random() * 2.0) * 0.02,
      vz: Math.sin(angle) * speed * 0.015,
      rotX: Math.random() * 0.2, rotY: Math.random() * 0.2,
      life: 1.0, decay: 0.012 + Math.random() * 0.012
    };
    burstGroup.add(p);
    particles.push(p);
  }

  const animConf = () => {
    let alive = false;
    particles.forEach(p => {
      if (p.userData.life > 0) {
        alive = true;
        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy;
        p.position.z += p.userData.vz;
        p.userData.vy -= 0.0008;
        p.rotation.x += p.userData.rotX;
        p.rotation.y += p.userData.rotY;
        p.userData.life -= p.userData.decay;
        p.scale.setScalar(Math.max(0, p.userData.life));
      }
    });
    if (alive) requestAnimationFrame(animConf);
    else {
      scene.remove(burstGroup);
      particleGeo.dispose();
      particles.forEach(p => p.material.dispose());
    }
  };
  animConf();
}

// ─── Region cloud cover (fog of war) ─────────────────────────────────────
export function createRegionCloudCover(scene, regId, centerCol, centerRow, cols, rows) {
  const group = new THREE.Group();
  group.name = `clouds_${regId}`;

  const cloudMat = new THREE.MeshToonMaterial({
    color: 0x0a1428,
    transparent: true,
    opacity: 0.92
  });

  const sphereGeo = new THREE.SphereGeometry(0.22, 6, 6);
  for (let i = 0; i < 6; i++) {
    const mesh = new THREE.Mesh(sphereGeo, cloudMat);
    const angle = (i / 6) * Math.PI * 2;
    const rDist = 0.1 + Math.random() * 0.08;
    mesh.position.set(Math.cos(angle) * rDist, 0.1 + Math.random() * 0.1, Math.sin(angle) * rDist);
    const sc = 0.8 + Math.random() * 0.5;
    mesh.scale.set(sc, sc, sc);
    group.add(mesh);
  }

  const x = centerCol - cols / 2;
  const z = centerRow - rows / 2;
  group.position.set(x, 0.35, z);
  scene.add(group);
  return group;
}

// ─── Airplane ──────────────────────────────────────────────────────────────
export function createAirplane(scene, brandId = 'cocacola') {
  const group = new THREE.Group();
  group.name = 'airplane';

  const bodyColor = brandId === 'cocacola' ? BRANDS.cocacola.primaryColor
                  : brandId === 'nike'     ? BRANDS.nike.primaryColor
                  : BRANDS.adidas.primaryColor;

  const bodyMat = mat(bodyColor);
  const wingMat = mat(C.steel);
  const glassMat2 = mat(C.glass, C.neonCyan, 0.3);

  // Fuselage
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.38, 6), bodyMat);
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  group.add(fuselage);

  // Cockpit
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), glassMat2);
  cockpit.position.set(0, 0.02, 0.14);
  group.add(cockpit);

  // Wings
  [[- 0.19, 0.09], [0.19, -0.09]].forEach(([sx, rz]) => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.008, 0.08), wingMat);
    wing.position.set(sx, 0, 0);
    wing.rotation.z = rz;
    wing.castShadow = true;
    group.add(wing);
  });

  // Tail fin
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.09, 0.07), bodyMat);
  tail.position.set(0, 0.05, -0.16);
  group.add(tail);

  // Neon engine glow
  [-0.15, 0.15].forEach(ex => {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.06, 6), basicMat(C.neonOrange));
    eng.rotation.x = Math.PI / 2;
    eng.position.set(ex, -0.015, 0.04);
    eng.layers.enable(1);
    group.add(eng);
  });

  // Brand banner
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.1, 0.005), mat(C.dark1));
  banner.position.set(0, 0, -0.56);
  group.add(banner);
  const bannerGlow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.002), basicMat(bodyColor));
  bannerGlow.position.set(0, 0, -0.555);
  bannerGlow.layers.enable(1);
  group.add(bannerGlow);

  scene.add(group);
  return group;
}

// ─── Bird ──────────────────────────────────────────────────────────────────
export function createBird(scene) {
  const group = new THREE.Group();
  group.name = 'bird';

  const birdMat = mat(0xc0e8ff);
  const beakMat = mat(C.neonYellow);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.1), birdMat);
  group.add(body);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.03, 4), beakMat);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0, 0.06);
  group.add(beak);

  const wL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.005, 0.04), birdMat);
  wL.position.set(-0.06, 0, 0);
  group.add(wL);
  group.userData.wingL = wL;

  const wR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.005, 0.04), birdMat);
  wR.position.set(0.06, 0, 0);
  group.add(wR);
  group.userData.wingR = wR;

  scene.add(group);
  return group;
}

// ─── Animals ───────────────────────────────────────────────────────────────
export function createSheep(scene) {
  const group = new THREE.Group();
  group.name = 'sheep';
  const woolMat = mat(0xd0e8f0);
  const skinMat = mat(0x1a2535);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.12), woolMat);
  body.position.y = 0.06;
  group.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), skinMat);
  head.position.set(0, 0.09, 0.07);
  group.add(head);

  const legGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.04, 4);
  [[-0.03,0.04], [0.03,0.04], [-0.03,-0.04], [0.03,-0.04]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, skinMat);
    leg.position.set(lx, 0.02, lz);
    group.add(leg);
  });
  scene.add(group);
  return group;
}

export function createCat(scene) {
  const group = new THREE.Group();
  group.name = 'cat';
  const bodyMat = mat(0x2a1a3a);
  const eyeMat = basicMat(C.neonGreen);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.055, 0.1), bodyMat);
  body.position.y = 0.04;
  group.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.05), bodyMat);
  head.position.set(0, 0.08, 0.065);
  group.add(head);
  // Glowing eyes
  [-0.012, 0.012].forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.006, 5, 5), eyeMat);
    eye.position.set(ex, 0.085, 0.088);
    eye.layers.enable(1);
    group.add(eye);
  });
  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.1, 4), bodyMat);
  tail.rotation.z = Math.PI / 4;
  tail.position.set(-0.06, 0.04, -0.055);
  group.add(tail);
  group.userData.tailRef = tail;

  scene.add(group);
  return group;
}

export function createDog(scene) {
  const group = new THREE.Group();
  group.name = 'dog';
  const bodyMat = mat(0x5a3a1a);
  const noseMat = mat(0x0d0d0d);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.14), bodyMat);
  body.position.y = 0.06;
  group.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.065, 0.07), bodyMat);
  head.position.set(0, 0.1, 0.1);
  group.add(head);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 5), noseMat);
  nose.position.set(0, 0.098, 0.135);
  group.add(nose);
  // Ears
  [-0.025, 0.025].forEach(ex => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.015), bodyMat);
    ear.position.set(ex, 0.138, 0.1);
    group.add(ear);
  });
  // Tail (for wagging)
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.08, 4), bodyMat);
  tail.rotation.z = -Math.PI / 5;
  tail.position.set(0, 0.08, -0.1);
  group.add(tail);
  group.userData.tailRef = tail;

  const legGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.05, 4);
  [[-0.035,0.05], [0.035,0.05], [-0.035,-0.05], [0.035,-0.05]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, bodyMat);
    leg.position.set(lx, 0.025, lz);
    group.add(leg);
  });
  scene.add(group);
  return group;
}

export function createRabbit(scene) {
  const group = new THREE.Group();
  group.name = 'rabbit';
  const bodyMat = mat(0xe8e0d8);
  const eyeMat = basicMat(C.neonPink);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.075), bodyMat);
  body.position.y = 0.04;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.028, 7, 7), bodyMat);
  head.position.set(0, 0.086, 0.048);
  group.add(head);
  // Ears
  [-0.012, 0.012].forEach(ex => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.04, 0.006), bodyMat);
    ear.position.set(ex, 0.122, 0.045);
    group.add(ear);
    group.userData.earL = ear; // for bobbing
  });
  // Eyes
  [-0.01, 0.01].forEach(ex => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.004, 5, 5), eyeMat);
    eye.position.set(ex, 0.09, 0.074);
    eye.layers.enable(1);
    group.add(eye);
  });
  scene.add(group);
  return group;
}

// ─── Street Landmark Props ─────────────────────────────────────────────────
export function createNeonBillboard(scene, col, row, cols, rows) {
  const group = new THREE.Group();
  const x = col - cols / 2, z = row - rows / 2;

  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.65, 5), mat(C.steel));
  pole.position.y = 0.325;
  group.add(pole);

  // Board
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.03), mat(C.dark2));
  board.position.y = 0.79;
  group.add(board);

  // Animated neon bars
  const neonColors = [C.neonCyan, C.neonMag, C.neonYellow];
  for (let i = 0; i < 3; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.055, 0.01), basicMat(neonColors[i]));
    bar.position.set(0, 0.79 + (i - 1) * 0.075, 0.021);
    bar.layers.enable(1);
    group.add(bar);
  }
  // Border glow
  const border = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.3, 0.005), basicMat(C.neonCyan));
  border.position.set(0, 0.79, 0.009);
  border.layers.enable(1);
  group.add(border);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

export function createPhoneBooth(scene, col, row, cols, rows) {
  const group = new THREE.Group();
  const x = col - cols / 2, z = row - rows / 2;

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.18), mat(C.dark2, C.neonCyan, 0.06));
  body.position.y = 0.21;
  group.add(body);

  // Glass panels
  ['front','right','left'].forEach(side => {
    addWindowGrid(body, 0.18, 0.42, 0.18, side, 3, 1, C.neonCyan);
  });

  // Roof glow
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.2), basicMat(C.neonCyan));
  roof.position.y = 0.435;
  roof.layers.enable(1);
  group.add(roof);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

export function createNewsStand(scene, col, row, cols, rows) {
  const group = new THREE.Group();
  const x = col - cols / 2, z = row - rows / 2;

  // Counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.22), mat(C.dark1));
  counter.position.y = 0.07;
  group.add(counter);

  // Roof overhang
  const overhang = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.28), mat(C.steel));
  overhang.position.y = 0.2;
  group.add(overhang);

  // Neon headline ticker
  const ticker = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.01), basicMat(C.neonYellow));
  ticker.position.set(0, 0.16, 0.112);
  ticker.layers.enable(1);
  group.add(ticker);

  // Magazines on display (colored slabs)
  [C.neonMag, C.neonCyan, C.neonOrange].forEach((c, i) => {
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.07, 0.005), mat(0x111111));
    mag.position.set(-0.07 + i * 0.07, 0.155, 0.111);
    group.add(mag);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.058, 0.003), basicMat(c));
    cover.position.set(-0.07 + i * 0.07, 0.155, 0.113);
    cover.layers.enable(1);
    group.add(cover);
  });

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

// ─── Vehicle factory (6 variants) ─────────────────────────────────────────
export function createVehicle(scene, brandId = null, variant = null) {
  const variants = ['sedan', 'suv', 'sports', 'truck', 'van', 'taxi'];
  const type = variant || variants[Math.floor(Math.random() * variants.length)];

  // Brand color
  let bodyColor = [0x3b82f6, 0xec4899, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xef4444][Math.floor(Math.random() * 6)];
  if (brandId === 'cocacola') bodyColor = BRANDS.cocacola.primaryColor;
  else if (brandId === 'nike') bodyColor = BRANDS.nike.primaryColor;
  else if (brandId === 'adidas') bodyColor = BRANDS.adidas.primaryColor;

  const group = new THREE.Group();
  group.name = 'car';

  const bodyMat = mat(bodyColor, bodyColor, 0.05);
  const wheelMat = mat(0x0d1117);
  const glassMat2 = new THREE.MeshToonMaterial({ color: 0x0a2040, transparent: true, opacity: 0.7 });
  const trimMat = mat(C.steel);
  const headlightMat = basicMat(C.neonYellow);
  const taillightMat = basicMat(0xff3300);

  // === SEDAN ===
  if (type === 'sedan') {
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.07, 0.16), bodyMat);
    chassis.position.y = 0.055;
    group.add(chassis);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.065, 0.13), glassMat2);
    cabin.position.set(-0.02, 0.13, 0);
    group.add(cabin);
  }
  // === SUV ===
  else if (type === 'suv') {
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.085, 0.18), bodyMat);
    chassis.position.y = 0.06;
    group.add(chassis);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.085, 0.16), glassMat2);
    cabin.position.set(-0.02, 0.145, 0);
    group.add(cabin);
    // Roof rack
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.012, 0.14), trimMat);
    rack.position.set(-0.02, 0.23, 0);
    group.add(rack);
  }
  // === SPORTS ===
  else if (type === 'sports') {
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.055, 0.16), bodyMat);
    chassis.position.y = 0.048;
    group.add(chassis);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.13), glassMat2);
    cabin.position.set(0, 0.1, 0);
    group.add(cabin);
    // Spoiler
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.02), bodyMat);
    spoiler.position.set(-0.14, 0.1, 0);
    group.add(spoiler);
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.045, 0.14), bodyMat);
    spoilerWing.position.set(-0.14, 0.085, 0);
    group.add(spoilerWing);
    // Neon undercarriage glow
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.14), basicMat(bodyColor));
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.01;
    glow.layers.enable(1);
    group.add(glow);
  }
  // === TRUCK ===
  else if (type === 'truck') {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.18), bodyMat);
    cab.position.set(0.1, 0.07, 0);
    group.add(cab);
    const cabWin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.15), glassMat2);
    cabWin.position.set(0.1, 0.14, 0);
    group.add(cabWin);
    const bed = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.18), trimMat);
    bed.position.set(-0.09, 0.07, 0);
    group.add(bed);
    const bedSide = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.01), bodyMat);
    bedSide.position.set(-0.09, 0.09, 0.095);
    group.add(bedSide);
    const bedSide2 = bedSide.clone();
    bedSide2.position.z = -0.095;
    group.add(bedSide2);
  }
  // === VAN ===
  else if (type === 'van') {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.17), bodyMat);
    box.position.y = 0.1;
    group.add(box);
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.15), glassMat2);
    windshield.position.set(0.145, 0.1, 0);
    group.add(windshield);
    // Sliding door line
    const doorLine = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.003), mat(C.dark1));
    doorLine.position.set(-0.04, 0.09, 0.087);
    group.add(doorLine);
    // Logo panel (brand)
    if (brandId) {
      const logo = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.003), basicMat(bodyColor));
      logo.position.set(-0.04, 0.12, 0.088);
      logo.layers.enable(1);
      group.add(logo);
    }
  }
  // === TAXI ===
  else if (type === 'taxi') {
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.075, 0.16), mat(C.neonYellow));
    chassis.position.y = 0.055;
    group.add(chassis);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.14), glassMat2);
    cabin.position.set(-0.02, 0.135, 0);
    group.add(cabin);
    // Checker light on roof
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.06), mat(C.dark1));
    light.position.set(-0.02, 0.2, 0);
    group.add(light);
    const lightGlow = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.04), basicMat(C.neonYellow));
    lightGlow.position.set(-0.02, 0.218, 0);
    lightGlow.layers.enable(1);
    group.add(lightGlow);
  }

  // Shared: 4 wheels
  const wheelGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.038, 6);
  wheelGeo.rotateX(Math.PI / 2);
  const isWide = type === 'suv' || type === 'truck';
  const hw = isWide ? 0.1 : 0.09;
  [[0.09, 0.038, hw], [-0.09, 0.038, hw], [0.09, 0.038, -hw], [-0.09, 0.038, -hw]].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  // Headlights (front glow)
  [-0.055, 0.055].forEach(hx => {
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.022), headlightMat);
    hl.position.set(0.15, 0.065, hx);
    hl.rotation.y = Math.PI / 2;
    hl.layers.enable(1);
    group.add(hl);
  });
  // Taillights
  [-0.055, 0.055].forEach(hx => {
    const tl = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.022), taillightMat);
    tl.position.set(-0.15, 0.065, hx);
    tl.rotation.y = -Math.PI / 2;
    tl.layers.enable(1);
    group.add(tl);
  });

  group.traverse(c => { if (c.isMesh) c.castShadow = true; });
  scene.add(group);
  return group;
}

// Legacy alias for Traffic.js compatibility
export { createVehicle as createCar };
export const createCitizen = (scene, color = 0x6366f1) => {
  const group = new THREE.Group();
  group.name = 'citizen';
  const bodyMat = mat(color);
  const skinMat = mat(0xc8956c);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.11, 5), bodyMat);
  body.position.y = 0.055;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), skinMat);
  head.position.y = 0.13;
  group.add(head);
  scene.add(group);
  return group;
};

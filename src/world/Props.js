// src/world/Props.js
import * as THREE from 'three';

// ─── Reusable geometries ───────────────────────────────────────────────────
const mkMat = (color, emissive = 0x000000, ei = 0) =>
  new THREE.MeshToonMaterial({ color, emissive: new THREE.Color(emissive), emissiveIntensity: ei });

// ─── Shared materials ─────────────────────────────────────────────────────
const trunkBrown  = mkMat(0x6b4c2a);
const trunkDark   = mkMat(0x3d2b14);
const trunkGrey   = mkMat(0x8c9eae);
const woodMat     = mkMat(0x8d6e4b);
const ironMat     = mkMat(0x4a5f70);
const lampPoleMat = mkMat(0x8c9eae);
const lampGlowMat = mkMat(0xfff5c8, 0xffe080, 0.5);

export const animatedTrees = [];

// ═══════════════════════════════════════════════════════════════════════════
// 6 TREE TYPES
// ═══════════════════════════════════════════════════════════════════════════

// 1. LOLLIPOP — classic street tree (sphere on stick)
function buildLollipop(group) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.038, 0.30, 6),
    trunkBrown
  );
  trunk.position.y = 0.15;
  trunk.castShadow = true;
  group.add(trunk);

  const foliage = new THREE.Group();
  foliage.position.y = 0.40;

  const main = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mkMat(0x3aaa35));
  main.castShadow = true;
  foliage.add(main);

  const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 7), mkMat(0x4ec949));
  highlight.position.set(0.04, 0.06, 0.04);
  foliage.add(highlight);

  group.add(foliage);
  animatedTrees.push(foliage);
}

// 2. PINE — stacked cones (conifer/spruce)
function buildPine(group) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.030, 0.22, 5),
    trunkDark
  );
  trunk.position.y = 0.11;
  trunk.castShadow = true;
  group.add(trunk);

  // 3 stacked cone tiers — each narrower and higher
  const tiers = [
    { r: 0.26, h: 0.30, y: 0.22 + 0.15, color: 0x2d6e2d },
    { r: 0.20, h: 0.26, y: 0.22 + 0.30 + 0.13, color: 0x338833 },
    { r: 0.14, h: 0.22, y: 0.22 + 0.52 + 0.11, color: 0x3aaa35 },
  ];

  const foliage = new THREE.Group();
  tiers.forEach(t => {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 7), mkMat(t.color));
    mesh.position.y = t.y;
    mesh.castShadow = true;
    foliage.add(mesh);
  });
  group.add(foliage);
  animatedTrees.push(foliage);
}

// 3. OAK — wide flat canopy (broad crown)
function buildOak(group) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.055, 0.28, 6),
    trunkBrown
  );
  trunk.position.y = 0.14;
  trunk.castShadow = true;
  group.add(trunk);

  const foliage = new THREE.Group();
  foliage.position.y = 0.34;

  // Wide ellipsoid crown (scale Y down)
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.30, 9, 7), mkMat(0x3d9e38));
  crown.scale.set(1, 0.72, 1);
  crown.castShadow = true;
  foliage.add(crown);

  // 3 sub-sphere puffs for depth
  const puffPositions = [
    { x:  0.14, y: 0.04, z:  0.10, r: 0.18, c: 0x4ab545 },
    { x: -0.14, y: 0.02, z: -0.08, r: 0.16, c: 0x2e8c2a },
    { x:  0.06, y: 0.10, z: -0.14, r: 0.15, c: 0x45b040 },
  ];
  puffPositions.forEach(p => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(p.r, 7, 7), mkMat(p.c));
    puff.position.set(p.x, p.y, p.z);
    puff.castShadow = true;
    foliage.add(puff);
  });

  group.add(foliage);
  animatedTrees.push(foliage);
}

// 4. PALM — tall thin trunk + fan fronds
function buildPalm(group) {
  // Segmented trunk (slight curve via rotation offsets)
  const segments = [
    { y: 0.08, r: 0.022, h: 0.16, rx: 0.02 },
    { y: 0.26, r: 0.020, h: 0.20, rx: 0.04 },
    { y: 0.48, r: 0.018, h: 0.20, rx: -0.02 },
    { y: 0.70, r: 0.016, h: 0.18, rx: 0.03 },
    { y: 0.90, r: 0.014, h: 0.14, rx: 0.00 },
  ];

  const trunkMat = mkMat(0x9e7a4a);
  segments.forEach(s => {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(s.r, s.r + 0.002, s.h, 5),
      trunkMat
    );
    seg.position.y = s.y;
    seg.rotation.x = s.rx;
    seg.rotation.z = s.rx * 0.5;
    seg.castShadow = true;
    group.add(seg);
  });

  // Crown node
  const crown = new THREE.Group();
  crown.position.y = 1.02;

  // Fan fronds (6 flat ellipses radiating outward)
  const frondMat = mkMat(0x5cb84a);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const frond = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 5, 4, 0, Math.PI * 2, 0, Math.PI / 2),
      frondMat
    );
    frond.scale.set(0.5, 0.15, 1.0);
    frond.rotation.y = angle;
    frond.rotation.z = Math.PI / 2.5;
    frond.position.set(Math.cos(angle) * 0.06, 0, Math.sin(angle) * 0.06);
    frond.castShadow = true;
    crown.add(frond);
  }

  group.add(crown);
  animatedTrees.push(crown);
}

// 5. BUSH — low wide sphere cluster (no trunk)
function buildBush(group) {
  const foliage = new THREE.Group();

  const puffs = [
    { x:  0,    y: 0.12, z:  0,    r: 0.20, c: 0x2d8c28 },
    { x:  0.14, y: 0.10, z:  0.10, r: 0.15, c: 0x3aaa35 },
    { x: -0.12, y: 0.09, z:  0.08, r: 0.14, c: 0x248020 },
    { x:  0.08, y: 0.09, z: -0.12, r: 0.13, c: 0x3aaa35 },
    { x: -0.10, y: 0.08, z: -0.10, r: 0.12, c: 0x2d8c28 },
  ];

  puffs.forEach(p => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 7, 6), mkMat(p.c));
    mesh.scale.set(1, 0.75, 1); // squat
    mesh.position.set(p.x, p.y, p.z);
    mesh.castShadow = true;
    foliage.add(mesh);
  });

  group.add(foliage);
  animatedTrees.push(foliage);
}

// 6. AUTUMN — warm orange/red sphere (seasonal deciduous)
function buildAutumn(group) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.042, 0.28, 6),
    mkMat(0x5c3a1e)
  );
  trunk.position.y = 0.14;
  trunk.castShadow = true;
  group.add(trunk);

  const foliage = new THREE.Group();
  foliage.position.y = 0.38;

  const colors = [0xe8720c, 0xd94f00, 0xf5a623, 0xc0392b, 0xe67e22];
  const puffs = [
    { x: 0,     y: 0.08, z: 0,     r: 0.24, ci: 0 },
    { x: 0.16,  y: 0.02, z: 0.10,  r: 0.17, ci: 1 },
    { x:-0.15,  y: 0.04, z:-0.08,  r: 0.16, ci: 2 },
    { x: 0.08,  y: 0.14, z:-0.14,  r: 0.14, ci: 3 },
    { x:-0.12,  y: 0.12, z: 0.12,  r: 0.13, ci: 4 },
  ];

  puffs.forEach(p => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 7, 7), mkMat(colors[p.ci]));
    mesh.position.set(p.x, p.y, p.z);
    mesh.castShadow = true;
    foliage.add(mesh);
  });

  group.add(foliage);
  animatedTrees.push(foliage);
}

// ─── Factory ──────────────────────────────────────────────────────────────
const TREE_BUILDERS = {
  lollipop: buildLollipop,
  pine:     buildPine,
  oak:      buildOak,
  palm:     buildPalm,
  bush:     buildBush,
  autumn:   buildAutumn,
};

export function createTree(scene, col, row, cols, rows, type = 'lollipop') {
  const group = new THREE.Group();
  const x = col - cols / 2;
  const z = row - rows / 2;

  const builder = TREE_BUILDERS[type] || TREE_BUILDERS.lollipop;
  builder(group);

  group.traverse(child => { if (child.isMesh) child.receiveShadow = true; });
  group.position.set(x, 0, z);
  group.scale.set(0, 0, 0); // starts hidden, revealed in sequence
  scene.add(group);
  return group;
}

// ─── Lamp Post ────────────────────────────────────────────────────────────
export function createLampPost(scene, col, row, cols, rows) {
  const group = new THREE.Group();
  const x = col - cols / 2;
  const z = row - rows / 2;

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.065, 6), lampPoleMat);
  base.position.y = 0.033;
  group.add(base);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.65, 5), lampPoleMat);
  pole.position.y = 0.065 + 0.325;
  pole.castShadow = true;
  group.add(pole);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.15, 4), lampPoleMat);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(0.075, 0.70, 0);
  group.add(arm);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.045, 0.07), lampPoleMat);
  head.position.set(0.15, 0.695, 0);
  group.add(head);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), lampGlowMat);
  bulb.position.set(0.15, 0.69, 0);
  group.add(bulb);

  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 16),
    new THREE.MeshBasicMaterial({ color: 0xffee99, transparent: true, opacity: 0.20 })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0.15, 0.022, 0);
  group.add(pool);

  group.scale.set(0, 0, 0);
  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

// ─── Bench ────────────────────────────────────────────────────────────────
export function createBench(scene, col, row, cols, rows) {
  const group = new THREE.Group();
  const x = col - cols / 2;
  const z = row - rows / 2;

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.022, 0.15), woodMat);
  seat.position.y = 0.10;
  seat.castShadow = true;
  group.add(seat);

  for (let i = -1; i <= 1; i++) {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.018, 0.04),
      mkMat(i === 0 ? 0x9e7a50 : 0x7a5c38)
    );
    slat.position.set(0, 0.11, i * 0.048);
    group.add(slat);
  }

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.10, 0.018), woodMat);
  back.position.set(0, 0.19, -0.068);
  back.rotation.x = -0.14;
  back.castShadow = true;
  group.add(back);

  const legGeo = new THREE.BoxGeometry(0.028, 0.10, 0.16);
  [-0.18, 0.18].forEach(lx => {
    const leg = new THREE.Mesh(legGeo, ironMat);
    leg.position.set(lx, 0.05, 0);
    group.add(leg);
  });

  group.scale.set(0, 0, 0);
  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

// ─── Wind sway (foliage only) ─────────────────────────────────────────────
export function updateWindSway(time) {
  for (let i = 0; i < animatedTrees.length; i++) {
    const tree = animatedTrees[i];
    const off = (tree.parent?.position.x ?? 0) + (tree.parent?.position.z ?? 0);
    tree.rotation.x = Math.sin(time * 0.0022 + off * 0.6) * 0.022;
    tree.rotation.z = Math.cos(time * 0.0017 + off * 0.7) * 0.022;
  }
}

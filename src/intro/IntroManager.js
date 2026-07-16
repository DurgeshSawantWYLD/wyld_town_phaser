// src/intro/IntroManager.js
import * as THREE from 'three';
import { playSwoosh } from '../core/Sound.js';

let introStars = null;
let isPlunging = false;

// ─── Starfield ─────────────────────────────────────────────────────────────
function createStarfield(scene) {
  const geo = new THREE.BufferGeometry();
  const count = 600;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 80;
    pos[i * 3 + 1] = Math.random() * 50 + 5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.06, transparent: true, opacity: 0.7, sizeAttenuation: true
  });
  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
  introStars = stars;
  return stars;
}

export function createIntroClouds(scene) {
  createStarfield(scene);
}

export function updateIntroClouds(time) {
  if (introStars) introStars.rotation.y = time * 0.00007;
}

// ─── Fade-out starfield ────────────────────────────────────────────────────
function fadeOutStarfield() {
  if (!introStars) return;
  gsap.to(introStars.material, {
    opacity: 0, duration: 1.6, delay: 0.5,
    onComplete: () => {
      if (introStars?.parent) {
        introStars.parent.remove(introStars);
        introStars.geometry.dispose();
        introStars.material.dispose();
        introStars = null;
      }
    }
  });
}

// ─── Camera arc ────────────────────────────────────────────────────────────
export function startPlunge(camera, targetOffset, onComplete) {
  if (isPlunging) return;
  isPlunging = true;
  playSwoosh();

  // Fade out title
  const overlay = document.getElementById('title-overlay');
  if (overlay) {
    overlay.style.transition = 'opacity 0.7s ease';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => { overlay.style.display = 'none'; }, 750);
  }

  // Camera arc: top-down → isometric
  gsap.to(camera.position, {
    x: 12 + targetOffset.x,
    y: 14 + targetOffset.y,
    z: 12 + targetOffset.z,
    duration: 3.0,
    ease: 'power3.inOut',
    onUpdate: () => camera.lookAt(targetOffset.x, targetOffset.y, targetOffset.z),
    onComplete: () => camera.lookAt(targetOffset.x, targetOffset.y, targetOffset.z),
  });

  fadeOutStarfield();

  // Trigger phased reveal after camera settles
  setTimeout(() => { if (onComplete) onComplete(); }, 2200);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4-PHASE REVEAL SEQUENCE
// Phases: 1=ground, 2=trees+props, 3=cars+traffic, 4=buildings
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @param {Object} phases
 * @param {THREE.Object3D[]} phases.ground    - ground group (already visible)
 * @param {Array<{meshes: THREE.Object3D[], delay: number}>} phases.treeClusters - cluster groups
 * @param {THREE.Object3D[]} phases.props     - lamps, benches, billboards
 * @param {THREE.Object3D[]} phases.traffic   - car meshes + citizens + animals
 * @param {THREE.Object3D[]} phases.buildings - decor + landmark buildings
 */
export function staggerPhasedReveal({ treeClusters, props, traffic, buildings }) {
  const tl = gsap.timeline();

  // ── Phase 2 (t=0): Tree clusters, one cluster at a time ─────────────────
  // Each cluster's trees pop in with a tight internal stagger
  // Then the next cluster starts 0.18s later
  let clusterT = 0.0;
  treeClusters.forEach((cluster, ci) => {
    cluster.meshes.forEach((mesh, i) => {
      tl.fromTo(mesh.scale, { x: 0, y: 0, z: 0 }, {
        x: 1, y: 1, z: 1,
        duration: 0.55,
        ease: 'back.out(1.8)',
      }, clusterT + i * 0.035);
    });
    clusterT += cluster.meshes.length * 0.035 + 0.18;
  });

  // ── Phase 2 also: Props (lamps, benches) appear with the last tree cluster
  const propStart = clusterT;
  props.forEach((mesh, i) => {
    tl.fromTo(mesh.scale, { x: 0, y: 0, z: 0 }, {
      x: 1, y: 1, z: 1,
      duration: 0.45,
      ease: 'back.out(1.6)',
    }, propStart + i * 0.025);
  });

  // ── Phase 3 (t = after trees + 0.3s): Cars, citizens, animals rise up ───
  const trafficStart = propStart + props.length * 0.025 + 0.30;
  traffic.forEach((mesh, i) => {
    // Start below ground, rise up
    mesh.position.y = -0.5;
    tl.to(mesh.position, {
      y: mesh.userData._groundY ?? 0,
      duration: 0.5,
      ease: 'power2.out',
    }, trafficStart + i * 0.04);
    tl.fromTo(mesh.scale, { x: 0, y: 0, z: 0 }, {
      x: 1, y: 1, z: 1,
      duration: 0.4,
      ease: 'back.out(1.4)',
    }, trafficStart + i * 0.04);
  });

  // ── Phase 4 (t = after traffic + 0.5s): Buildings concentric wave ───────
  const center = new THREE.Vector3(0, 0, 0);
  const buildingSorted = [...buildings].sort((a, b) =>
    a.position.distanceTo(center) - b.position.distanceTo(center)
  );
  const buildStart = trafficStart + traffic.length * 0.04 + 0.50;
  buildingSorted.forEach((mesh, i) => {
    tl.fromTo(mesh.scale, { x: 0, y: 0, z: 0 }, {
      x: 1, y: 1, z: 1,
      duration: 0.85,
      ease: 'elastic.out(1, 0.55)',
    }, buildStart + i * 0.022);
  });

  // ── Phase 5: HUD + Controls slide in after buildings ────────────────────
  const hudT   = buildStart + buildingSorted.length * 0.022 + 0.5;
  const hud    = document.getElementById('hud');
  const ctrls  = document.getElementById('controls');

  [hud, ctrls].forEach((el, idx) => {
    if (!el) return;
    const delay = hudT + idx * 0.15;
    el.style.opacity = '0';
    el.style.transform = idx === 0 ? 'translateX(-24px)' : 'translateY(16px)';
    el.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
}

// Legacy alias (for any remaining call sites)
export function staggerPop(meshes) {
  const center = new THREE.Vector3(0, 0, 0);
  const sorted = [...meshes].sort((a, b) =>
    a.position.distanceTo(center) - b.position.distanceTo(center)
  );
  sorted.forEach((mesh, i) => {
    gsap.fromTo(mesh.scale, { x: 0, y: 0, z: 0 }, {
      x: 1, y: 1, z: 1,
      duration: 0.85,
      delay: i * 0.025,
      ease: 'elastic.out(1, 0.52)',
    });
  });
}

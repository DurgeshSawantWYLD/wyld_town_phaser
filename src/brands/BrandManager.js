// src/brands/BrandManager.js
import * as THREE from 'three';
import { BRANDS } from '../config.js';

export const rotatingBrandProps = [];

// 1. Spawns roadside brand advertisement billboards
export function spawnBillboards(scene, cols, rows) {
  const billboardPlacements = [
    { c: 7, r: 7, brandId: 'cocacola', rot: Math.PI / 4 },
    { c: 9, r: 7, brandId: 'nike', rot: -Math.PI / 4 },
    { c: 9, r: 4, brandId: 'adidas', rot: Math.PI / 4 }
  ];

  billboardPlacements.forEach(pos => {
    const group = new THREE.Group();
    const x = pos.c - cols / 2;
    const z = pos.r - rows / 2;

    const brand = BRANDS[pos.brandId];
    
    // Post
    const postGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 4);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 0.2;
    post.castShadow = true;
    group.add(post);

    // Board Backdrop
    const boardGeo = new THREE.BoxGeometry(0.35, 0.2, 0.04);
    const boardMat = new THREE.MeshStandardMaterial({ color: brand.primaryColor, roughness: 0.5 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = 0.4;
    board.castShadow = true;
    group.add(board);

    // Front Screen
    const screenGeo = new THREE.PlaneGeometry(0.32, 0.17);
    const screenMat = new THREE.MeshBasicMaterial({ color: brand.accentColor });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.4, 0.021);
    group.add(screen);

    // Add minimal low poly logo representation
    if (pos.brandId === 'cocacola') {
      // Red wave line on white background
      const waveGeo = new THREE.BoxGeometry(0.2, 0.02, 0.005);
      const waveMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const wave = new THREE.Mesh(waveGeo, waveMat);
      wave.position.set(0, 0.4, 0.024);
      group.add(wave);
    } else if (pos.brandId === 'nike') {
      // Stylized Swoosh representation using a wedge/rotated box
      const swooshGeo = new THREE.BoxGeometry(0.12, 0.02, 0.005);
      const swooshMat = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Neon orange swoosh
      const swoosh = new THREE.Mesh(swooshGeo, swooshMat);
      swoosh.rotation.z = -0.3;
      swoosh.position.set(0, 0.4, 0.024);
      group.add(swoosh);
    } else if (pos.brandId === 'adidas') {
      // Three black diagonal bars
      const barGeo = new THREE.BoxGeometry(0.015, 0.08, 0.005);
      const barMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
      for (let i = 0; i < 3; i++) {
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.rotation.z = -0.35;
        bar.position.set(-0.04 + i * 0.035, 0.4, 0.024);
        group.add(bar);
      }
    }

    group.position.set(x, 0, z);
    group.rotation.y = pos.rot;
    scene.add(group);
    group.scale.set(0, 0, 0); // pop scale
    rotatingBrandProps.push({ mesh: group, type: 'scale_in' });
  });
}

// 2. Custom Brand Showcases (Soda can, sneaker, stripes) near Brands Hub
export function setupBrandShowcases(scene, brandsBuilding) {
  if (!brandsBuilding) return;

  const bPos = brandsBuilding.position;

  // 1. Coca-Cola Soda Can Showcase
  const cokeGroup = new THREE.Group();
  cokeGroup.position.set(bPos.x - 0.4, 0.3, bPos.z + 0.4);

  const canGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 8);
  const canMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.7, roughness: 0.2 });
  const can = new THREE.Mesh(canGeo, canMat);
  can.castShadow = true;
  cokeGroup.add(can);

  // Can silver top/bottom rims
  const rimGeo = new THREE.CylinderGeometry(0.082, 0.082, 0.02, 8);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.1 });
  const rimTop = new THREE.Mesh(rimGeo, rimMat);
  rimTop.position.y = 0.11;
  cokeGroup.add(rimTop);

  const rimBottom = rimTop.clone();
  rimBottom.position.y = -0.11;
  cokeGroup.add(rimBottom);

  scene.add(cokeGroup);
  rotatingBrandProps.push({ mesh: cokeGroup, type: 'rotate', speed: 0.015 });

  // 2. Nike Sneaker Shape (stylized low-poly sneaker)
  const nikeGroup = new THREE.Group();
  nikeGroup.position.set(bPos.x + 0.4, 0.3, bPos.z + 0.4);

  // Sneaker Sole (orange box)
  const soleGeo = new THREE.BoxGeometry(0.18, 0.03, 0.08);
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
  const sole = new THREE.Mesh(soleGeo, soleMat);
  sole.position.y = -0.05;
  nikeGroup.add(sole);

  // Sneaker Upper (black box slanted)
  const upperGeo = new THREE.BoxGeometry(0.14, 0.08, 0.08);
  const upperMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
  const upper = new THREE.Mesh(upperGeo, upperMat);
  upper.position.set(-0.02, 0, 0);
  nikeGroup.add(upper);

  const collarGeo = new THREE.BoxGeometry(0.08, 0.06, 0.08);
  const collar = new THREE.Mesh(collarGeo, upperMat);
  collar.position.set(-0.05, 0.07, 0);
  nikeGroup.add(collar);

  scene.add(nikeGroup);
  rotatingBrandProps.push({ mesh: nikeGroup, type: 'rotate', speed: 0.012 });

  // 3. Adidas 3-Stripes Pillar
  const adidasGroup = new THREE.Group();
  adidasGroup.position.set(bPos.x, 0.3, bPos.z - 0.5);

  const pillarGeo = new THREE.BoxGeometry(0.16, 0.22, 0.16);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.5, roughness: 0.4 });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.castShadow = true;
  adidasGroup.add(pillar);

  // Diagonal Stripes (white stripes)
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const stripeGeo = new THREE.BoxGeometry(0.015, 0.12, 0.02);
  for (let i = 0; i < 3; i++) {
    const stripe = new THREE.Mesh(stripeGeo, whiteMat);
    stripe.rotation.z = -0.3;
    stripe.position.set(-0.04 + i * 0.035, 0.02, 0.081);
    adidasGroup.add(stripe);
  }

  scene.add(adidasGroup);
  rotatingBrandProps.push({ mesh: adidasGroup, type: 'rotate', speed: -0.01 });
}

export function updateBrandAnimations(time) {
  rotatingBrandProps.forEach(prop => {
    if (prop.type === 'rotate') {
      prop.mesh.rotation.y += prop.speed;
      // Add a slight bobbing float effect
      prop.mesh.position.y = 0.22 + Math.sin(time * 0.003 + prop.mesh.position.x) * 0.04;
    }
  });
}

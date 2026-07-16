// src/world/LevelMap.js
import * as THREE from 'three';
import { REGIONS } from '../config.js';
import { DECOR_BUILDERS, gltfLoader, gltfCache } from './Buildings.js';

// Adjust hex colors for shaded hills
function adjustColor(hex, percent) {
  let num = parseInt(hex.replace("#",""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

// Generate canvas-based repeating candy road texture
function createRoadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Elegant lavender-purple road background
  ctx.fillStyle = '#6355d8';
  ctx.fillRect(0, 0, 256, 256);

  // Gold edges
  const goldGradL = ctx.createLinearGradient(0, 0, 16, 0);
  goldGradL.addColorStop(0, '#d4af37');
  goldGradL.addColorStop(1, '#fffdd0');
  ctx.fillStyle = goldGradL;
  ctx.fillRect(0, 0, 12, 256);

  const goldGradR = ctx.createLinearGradient(240, 0, 256, 0);
  goldGradR.addColorStop(0, '#fffdd0');
  goldGradR.addColorStop(1, '#d4af37');
  ctx.fillStyle = goldGradR;
  ctx.fillRect(244, 0, 12, 256);

  // White inner borders
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(12, 0, 4, 256);
  ctx.fillRect(240, 0, 4, 256);

  // Sweet candy center stripe ribbon
  const rx = 100;
  const rw = 56;
  ctx.fillStyle = '#ff4081'; // vibrant hot pink
  ctx.fillRect(rx, 0, rw, 256);
  // White ribbon borders
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(rx, 0, 6, 256);
  ctx.fillRect(rx + rw - 6, 0, 6, 256);

  // White diagonal candy stripes
  ctx.fillStyle = '#ffffff';
  const stripeGap = 64;
  for (let y = -64; y < 256 + 64; y += stripeGap) {
    ctx.beginPath();
    ctx.moveTo(rx + 6, y);
    ctx.lineTo(rx + rw - 6, y + 40);
    ctx.lineTo(rx + rw - 6, y + 60);
    ctx.lineTo(rx + 6, y + 20);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
  return texture;
}

// Generate canvas-based candy button texture with level numbers
function createCandyButtonTexture(number, status) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);

  // Determine button color based on status
  let baseColor = '#b0b5bc'; // Default locked (grey candy)
  if (status === 'completed') {
    baseColor = '#10b981'; // Completed candy (vibrant emerald green)
  } else if (status === 'unlocked') {
    baseColor = '#ec4899'; // Active candy (vibrant pink)
  }

  // Outer glossy candy circle with gradient
  const grad = ctx.createRadialGradient(64, 64, 5, 64, 64, 60);
  grad.addColorStop(0, adjustColor(baseColor, 35));
  grad.addColorStop(0.7, baseColor);
  grad.addColorStop(1, adjustColor(baseColor, -25));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();

  // Crisp white inner candy border ring
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(64, 64, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Candy reflection/highlight gel effect at top-left
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(44, 44, 20, 10, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Little star highlight at top-right for extra pop
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(88, 38, 4, 0, Math.PI * 2);
  ctx.fill();

  // Render the level number
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 4;
  ctx.fillText(number.toString(), 64, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate canvas-based 2D vector art for parallax background layers
function createBackgroundTexture(type, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 256);

  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  if (type === 'mountain') {
    // Back Hills (Rounded Waves)
    const grad1 = ctx.createLinearGradient(0, 60, 0, 256);
    grad1.addColorStop(0, adjustColor(colorHex, 10));
    grad1.addColorStop(1, adjustColor(colorHex, -30));
    ctx.fillStyle = grad1;
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.quadraticCurveTo(80, 40, 180, 120);
    ctx.quadraticCurveTo(280, 200, 360, 100);
    ctx.quadraticCurveTo(440, 20, 512, 120);
    ctx.lineTo(512, 256);
    ctx.closePath();
    ctx.fill();

    // Front Hills (Rounded Waves)
    const grad2 = ctx.createLinearGradient(0, 100, 0, 256);
    grad2.addColorStop(0, adjustColor(colorHex, 25));
    grad2.addColorStop(1, adjustColor(colorHex, -15));
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.quadraticCurveTo(120, 120, 240, 60);
    ctx.quadraticCurveTo(340, 10, 440, 90);
    ctx.quadraticCurveTo(480, 120, 512, 100);
    ctx.lineTo(512, 256);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'trees') {
    // Row of cute lollipop candy trees
    for (let x = 45; x < 512; x += 80) {
      // Trunk
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(x - 4, 160, 8, 96);
      
      // Lollipop circles (3 layered candy spheres)
      const treeGrad = ctx.createRadialGradient(x, 110, 5, x, 110, 45);
      treeGrad.addColorStop(0, adjustColor(colorHex, 30));
      treeGrad.addColorStop(0.7, colorHex);
      treeGrad.addColorStop(1, adjustColor(colorHex, -20));
      
      ctx.fillStyle = treeGrad;
      ctx.beginPath();
      ctx.arc(x, 110, 40, 0, Math.PI * 2);
      ctx.fill();

      // Soft white swirl highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(x - 10, 100, 20, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
    }
  } else {
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(100, 150, 40, 0, Math.PI*2);
    ctx.arc(150, 130, 55, 0, Math.PI*2);
    ctx.arc(200, 150, 40, 0, Math.PI*2);
    ctx.rect(100, 140, 100, 50);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate premium, professional vector textures on canvas
function createCardboardTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);

  // 1. Draw Standee stick and wooden base at the bottom
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 4;

  // Wooden base stick (brown pole)
  ctx.fillStyle = '#6d4c41'; // dark brown wood
  ctx.fillRect(124, 180, 8, 48);

  // Oval wooden base stand on the ground
  const baseGrad = ctx.createLinearGradient(96, 220, 160, 236);
  baseGrad.addColorStop(0, '#8d6e63');
  baseGrad.addColorStop(1, '#5d4037');
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.ellipse(128, 228, 40, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Highlight on wooden base
  ctx.strokeStyle = '#a1887f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(128, 226, 36, 7, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Reset shadow for the character drawing
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  if (type === 'yeti') {
    // White card outline shape first
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 115, 68, 0, Math.PI * 2); // Body outline
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(80, 155, 96, 32, 12); // Feet/scarf outline
    ctx.fill();

    // Yeti Blue Face outline
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(128, 115, 60, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.arc(128, 110, 42, 0, Math.PI * 2);
    ctx.fill();

    // Big friendly anime eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(114, 106, 7, 0, Math.PI * 2);
    ctx.arc(142, 106, 7, 0, Math.PI * 2);
    ctx.fill();
    // Eye shines
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(111, 103, 3, 0, Math.PI * 2);
    ctx.arc(139, 103, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sweet smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 118, 10, 0, Math.PI);
    ctx.stroke();

    // Fluffy fur texture (cute ears/tufts)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(76, 90, 14, 0, Math.PI * 2);
    ctx.arc(180, 90, 14, 0, Math.PI * 2);
    ctx.arc(128, 52, 16, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(98, 116, 8, 0, Math.PI * 2);
    ctx.arc(158, 116, 8, 0, Math.PI * 2);
    ctx.fill();

    // Red striped cozy scarf
    const scarfGrad = ctx.createLinearGradient(84, 0, 172, 0);
    scarfGrad.addColorStop(0, '#f43f5e');
    scarfGrad.addColorStop(1, '#e11d48');
    ctx.fillStyle = scarfGrad;
    ctx.beginPath();
    ctx.roundRect(84, 148, 88, 18, 8);
    ctx.fill();

    // White stripes on scarf
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(100, 148, 10, 18);
    ctx.fillRect(122, 148, 10, 18);
    ctx.fillRect(144, 148, 10, 18);

  } else if (type === 'popcorn_cart') {
    // White card background outline
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(66, 44, 124, 148, 16);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(88, 175, 24, 0, Math.PI * 2);
    ctx.arc(168, 175, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700'; // Golden rims
    ctx.beginPath();
    ctx.arc(88, 175, 18, 0, Math.PI * 2);
    ctx.arc(168, 175, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // White inner caps
    ctx.beginPath();
    ctx.arc(88, 175, 8, 0, Math.PI * 2);
    ctx.arc(168, 175, 8, 0, Math.PI * 2);
    ctx.fill();

    // Red Cart Body
    const cartGrad = ctx.createLinearGradient(72, 110, 184, 170);
    cartGrad.addColorStop(0, '#ff4757');
    cartGrad.addColorStop(1, '#ff6b81');
    ctx.fillStyle = cartGrad;
    ctx.beginPath();
    ctx.roundRect(72, 110, 112, 54, 8);
    ctx.fill();

    // Yellow decorative stripe
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(72, 126, 112, 6);

    // Glass Screen Frame
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(224, 242, 254, 0.4)'; // Ice blue transparent glass
    ctx.beginPath();
    ctx.rect(78, 54, 100, 56);
    ctx.fill();
    ctx.stroke();

    // Popcorn heap (yellow circles)
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.arc(86 + Math.random() * 84, 84 + Math.random() * 24, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Roof (Candy-Striped Canopy)
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.moveTo(70, 54);
    ctx.lineTo(186, 54);
    ctx.lineTo(178, 38);
    ctx.lineTo(78, 38);
    ctx.closePath();
    ctx.fill();
    // Canopy stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(94, 38, 14, 16);
    ctx.fillRect(124, 38, 14, 16);
    ctx.fillRect(154, 38, 14, 16);

  } else if (type === 'candy_cane') {
    // White outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 36;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 86, 44, Math.PI, 0, false);
    ctx.lineTo(172, 180);
    ctx.stroke();

    // Red core cane
    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 86, 44, Math.PI, 0, false);
    ctx.lineTo(172, 180);
    ctx.stroke();

    // White stripes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 22;
    ctx.setLineDash([20, 24]);
    ctx.beginPath();
    ctx.arc(128, 86, 44, Math.PI, 0, false);
    ctx.lineTo(172, 180);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Cute Green Ribbon Bow
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(148, 120, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(136, 120, 10, 0, Math.PI * 2);
    ctx.arc(160, 120, 10, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'soda_can') {
    // White card background outline
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(82, 44, 92, 144, 16);
    ctx.fill();

    // Can body
    const alumGrad = ctx.createLinearGradient(88, 0, 168, 0);
    alumGrad.addColorStop(0, '#e11d48');
    alumGrad.addColorStop(0.3, '#ff4757');
    alumGrad.addColorStop(0.7, '#ff6b81');
    alumGrad.addColorStop(1, '#be123c');
    ctx.fillStyle = alumGrad;
    ctx.beginPath();
    ctx.roundRect(88, 54, 80, 124, 8);
    ctx.fill();

    // Can aluminum tabs (silver rims)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(94, 48, 68, 6);
    ctx.fillRect(94, 178, 68, 6);

    // Soda can star logo
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 116, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff4757';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', 128, 118);

  } else if (type === 'sneaker') {
    // White card background outline
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(50, 184);
    ctx.lineTo(206, 184);
    ctx.lineTo(206, 100);
    ctx.lineTo(142, 90);
    ctx.lineTo(94, 52);
    ctx.lineTo(50, 52);
    ctx.closePath();
    ctx.fill();

    // Blue sneaker body
    const shoeGrad = ctx.createLinearGradient(60, 0, 196, 0);
    shoeGrad.addColorStop(0, '#2563eb');
    shoeGrad.addColorStop(0.5, '#3b82f6');
    shoeGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = shoeGrad;
    ctx.beginPath();
    ctx.moveTo(56, 178);
    ctx.lineTo(196, 178);
    ctx.lineTo(196, 114);
    ctx.lineTo(136, 104);
    ctx.lineTo(96, 62);
    ctx.lineTo(56, 62);
    ctx.closePath();
    ctx.fill();

    // Sneaker white sole
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(52, 166, 148, 12);

    // White stripes & details
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(88, 110);
    ctx.quadraticCurveTo(128, 140, 174, 88);
    ctx.stroke();

    // Laces
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(76, 76); ctx.lineTo(92, 92);
    ctx.moveTo(84, 70); ctx.lineTo(100, 86);
    ctx.stroke();

  } else if (type === 'puppy') {
    // White card background outline
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 115, 62, 0, Math.PI * 2);
    ctx.fill();
    // Ear outlines
    ctx.beginPath();
    ctx.ellipse(76, 120, 24, 38, Math.PI/6, 0, Math.PI * 2);
    ctx.ellipse(180, 120, 24, 38, -Math.PI/6, 0, Math.PI * 2);
    ctx.fill();

    // Fur/Body (warm caramel brown)
    const furGrad = ctx.createRadialGradient(128, 115, 10, 128, 115, 52);
    furGrad.addColorStop(0, '#f59e0b');
    furGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = furGrad;
    ctx.beginPath();
    ctx.arc(128, 115, 52, 0, Math.PI * 2);
    ctx.fill();

    // Cute ears (dark brown chocolate)
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(78, 118, 16, 32, Math.PI/6, 0, Math.PI * 2);
    ctx.ellipse(178, 118, 16, 32, -Math.PI/6, 0, Math.PI * 2);
    ctx.fill();

    // White snout
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(128, 128, 18, 0, Math.PI * 2);
    ctx.fill();

    // Shiny black nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(128, 120, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Friendly Anime Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(112, 105, 7, 0, Math.PI * 2);
    ctx.arc(144, 105, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(109, 102, 2.5, 0, Math.PI * 2);
    ctx.arc(141, 102, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.arc(96, 120, 6, 0, Math.PI * 2);
    ctx.arc(160, 120, 6, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // Cupcake/Dessert (default prop)
    // White card background outline
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 100, 52, 0, Math.PI * 2); // Frosting outline
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(82, 110);
    ctx.lineTo(174, 110);
    ctx.lineTo(162, 180);
    ctx.lineTo(96, 180);
    ctx.closePath();
    ctx.fill();

    // Cupcake cup/liner (orange-gold)
    const cupGrad = ctx.createLinearGradient(88, 116, 168, 176);
    cupGrad.addColorStop(0, '#f59e0b');
    cupGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = cupGrad;
    ctx.beginPath();
    ctx.moveTo(88, 116);
    ctx.lineTo(168, 116);
    ctx.lineTo(156, 172);
    ctx.lineTo(100, 172);
    ctx.closePath();
    ctx.fill();

    // Stripe lines on the cup
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(112, 116); ctx.lineTo(116, 172);
    ctx.moveTo(128, 116); ctx.lineTo(128, 172);
    ctx.moveTo(144, 116); ctx.lineTo(140, 172);
    ctx.stroke();

    // Pink fluffy frosting
    const frostGrad = ctx.createRadialGradient(128, 100, 5, 128, 100, 48);
    frostGrad.addColorStop(0, '#f472b6');
    frostGrad.addColorStop(0.7, '#ec4899');
    frostGrad.addColorStop(1, '#be123c');
    ctx.fillStyle = frostGrad;
    ctx.beginPath();
    ctx.arc(128, 100, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(104, 114, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(152, 114, 26, 0, Math.PI * 2);
    ctx.fill();

    // Sprinkles!
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(112, 88, 8, 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(136, 92, 4, 8);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(124, 110, 8, 3);

    // Delicious cherry on top
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(128, 58, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(128, 50);
    ctx.quadraticCurveTo(140, 36, 144, 42);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate a 3D wooden arched bridge to span canals on the globe
function createGlobeBridge(startPos, endPos, radius) {
  const bridgeGroup = new THREE.Group();

  // Find midpoint on the sphere
  const p_mid = startPos.clone().add(endPos).normalize().multiplyScalar(radius + 0.08);
  bridgeGroup.position.copy(p_mid);

  const localUp = p_mid.clone().normalize();
  const dir = endPos.clone().sub(startPos).normalize();
  const side = new THREE.Vector3().crossVectors(localUp, dir).normalize();

  // Align bridge orientation along path direction
  const matrix = new THREE.Matrix4().makeBasis(side, localUp, dir);
  bridgeGroup.quaternion.setFromRotationMatrix(matrix);

  // Wooden Deck
  const deckGeo = new THREE.BoxGeometry(2.2, 0.12, 1.8);
  const deckMat = new THREE.MeshToonMaterial({ color: 0x8d6e63, roughness: 0.8 });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 0.06;
  deck.receiveShadow = true;
  deck.castShadow = true;
  bridgeGroup.add(deck);

  // Side Railings
  const railGeo = new THREE.BoxGeometry(0.08, 0.22, 1.8);
  const railMat = new THREE.MeshToonMaterial({ color: 0xd7ccc8, roughness: 0.7 });
  
  const railL = new THREE.Mesh(railGeo, railMat);
  railL.position.set(-1.1, 0.18, 0);
  railL.castShadow = true;
  bridgeGroup.add(railL);

  const railR = new THREE.Mesh(railGeo, railMat);
  railR.position.set(1.1, 0.18, 0);
  railR.castShadow = true;
  bridgeGroup.add(railR);

  // Posts at 4 corners
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.36, 8);
  const postMat = new THREE.MeshToonMaterial({ color: 0x5d4037, roughness: 0.9 });

  const p1 = new THREE.Mesh(postGeo, postMat);
  p1.position.set(-1.1, 0.24, -0.9);
  p1.castShadow = true;
  bridgeGroup.add(p1);

  const p2 = new THREE.Mesh(postGeo, postMat);
  p2.position.set(-1.1, 0.24, 0.9);
  p2.castShadow = true;
  bridgeGroup.add(p2);

  const p3 = new THREE.Mesh(postGeo, postMat);
  p3.position.set(1.1, 0.24, -0.9);
  p3.castShadow = true;
  bridgeGroup.add(p3);

  const p4 = new THREE.Mesh(postGeo, postMat);
  p4.position.set(1.1, 0.24, 0.9);
  p4.castShadow = true;
  bridgeGroup.add(p4);

  return bridgeGroup;
}

function createProceduralPalmTree() {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshToonMaterial({ color: 0x8b5a2b, roughness: 0.9 });
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.22, 3.2, 10);
  trunkGeo.translate(0, 1.6, 0);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  g.add(trunk);

  const leafMat = new THREE.MeshToonMaterial({ color: 0x2e8b57, roughness: 0.6, side: THREE.DoubleSide });
  for (let i = 0; i < 8; i++) {
    const leafGeo = new THREE.ConeGeometry(0.35, 2.2, 6);
    leafGeo.translate(0, 1.1, 0);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.y = 3.0;
    leaf.rotation.z = Math.PI / 3;
    leaf.rotation.y = (i / 8) * Math.PI * 2;
    g.add(leaf);
  }
  g.scale.set(0.65, 0.65, 0.65);
  return g;
}

function createProceduralCamel() {
  const g = new THREE.Group();
  const mat = new THREE.MeshToonMaterial({ color: 0xd2b48c, roughness: 0.8 });
  
  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8);
  legGeo.translate(0, 0.45, 0);
  for (const x of [-0.35, 0.35]) {
    for (const z of [-0.18, 0.18]) {
      const leg = new THREE.Mesh(legGeo, mat);
      leg.position.set(x, 0, z);
      g.add(leg);
    }
  }

  const bodyGeo = new THREE.BoxGeometry(0.9, 0.5, 0.45);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.position.y = 1.1;
  g.add(body);

  const humpGeo = new THREE.SphereGeometry(0.24, 12, 12);
  const hump1 = new THREE.Mesh(humpGeo, mat);
  hump1.position.set(-0.12, 1.4, 0);
  g.add(hump1);

  const hump2 = new THREE.Mesh(humpGeo, mat);
  hump2.position.set(0.18, 1.35, 0);
  g.add(hump2);

  const neckGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.7, 8);
  const neck = new THREE.Mesh(neckGeo, mat);
  neck.position.set(0.48, 1.4, 0);
  neck.rotation.z = -Math.PI / 6;
  g.add(neck);

  const headGeo = new THREE.BoxGeometry(0.24, 0.15, 0.15);
  const head = new THREE.Mesh(headGeo, mat);
  head.position.set(0.68, 1.7, 0);
  g.add(head);

  g.scale.set(0.5, 0.5, 0.5);
  return g;
}

function createProceduralPalace(colorTheme) {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshToonMaterial({ color: colorTheme || 0xff4f7b, roughness: 0.6 });
  const domeMat = new THREE.MeshToonMaterial({ color: 0x00f3e8, roughness: 0.3, metalness: 0.2 });
  const goldMat = new THREE.MeshToonMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });

  const baseGeo = new THREE.BoxGeometry(1.6, 1.4, 1.4);
  baseGeo.translate(0, 0.7, 0);
  const base = new THREE.Mesh(baseGeo, stoneMat);
  g.add(base);

  const domeGeo = new THREE.SphereGeometry(0.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 1.4;
  dome.scale.y = 1.2;
  g.add(dome);

  const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 8);
  pillarGeo.translate(0, 0.8, 0);
  for (const x of [-0.85, 0.85]) {
    for (const z of [-0.75, 0.75]) {
      const pillar = new THREE.Mesh(pillarGeo, stoneMat);
      pillar.position.set(x, 0, z);
      g.add(pillar);

      const capGeo = new THREE.SphereGeometry(0.18, 10, 8);
      const cap = new THREE.Mesh(capGeo, goldMat);
      cap.position.set(x, 1.6, z);
      g.add(cap);
    }
  }

  g.scale.set(0.7, 0.7, 0.7);
  return g;
}

function createProceduralHouse(colorTheme) {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshToonMaterial({ color: colorTheme || 0xffb03a, roughness: 0.7 });
  const roofMat = new THREE.MeshToonMaterial({ color: 0x9b2fff, roughness: 0.5 });

  const bodyGeo = new THREE.BoxGeometry(1.1, 0.9, 1.1);
  bodyGeo.translate(0, 0.45, 0);
  const body = new THREE.Mesh(bodyGeo, wallMat);
  g.add(body);

  const roofGeo = new THREE.ConeGeometry(0.85, 0.6, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 1.2;
  g.add(roof);

  g.scale.set(0.75, 0.75, 0.75);
  return g;
}

function createProceduralFountain() {
  const g = new THREE.Group();
  const stoneMat = new THREE.MeshToonMaterial({ color: 0x17d5e0, roughness: 0.5 });
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x4df5ff, transparent: true, opacity: 0.75, roughness: 0.1 });

  const basinGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.22, 16);
  basinGeo.translate(0, 0.11, 0);
  const basin = new THREE.Mesh(basinGeo, stoneMat);
  g.add(basin);

  const poolGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.04, 16);
  poolGeo.translate(0, 0.2, 0);
  const pool = new THREE.Mesh(poolGeo, waterMat);
  g.add(pool);

  const stemGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.5, 8);
  stemGeo.translate(0, 0.45, 0);
  const stem = new THREE.Mesh(stemGeo, stoneMat);
  g.add(stem);

  const bowlGeo = new THREE.CylinderGeometry(0.3, 0.16, 0.1, 12);
  bowlGeo.translate(0, 0.7, 0);
  const bowl = new THREE.Mesh(bowlGeo, stoneMat);
  g.add(bowl);

  g.scale.set(0.8, 0.8, 0.8);
  return g;
}

function createProceduralArchway(colorTheme) {
  const g = new THREE.Group();
  const mat = new THREE.MeshToonMaterial({ color: colorTheme || 0xf06f8b, roughness: 0.6 });
  
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.25), mat);
  left.position.set(-0.6, 0.6, 0);
  
  const right = left.clone();
  right.position.x = 0.6;
  
  const top = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.12, 8, 16, Math.PI), mat);
  top.rotation.z = Math.PI;
  top.position.y = 1.2;
  
  g.add(left, right, top);
  g.scale.set(0.8, 0.8, 0.8);
  return g;
}

function createProceduralCactus() {
  const g = new THREE.Group();
  const mat = new THREE.MeshToonMaterial({ color: 0x2e8b57, roughness: 0.8 });
  
  // Main stem
  const mainGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8);
  mainGeo.translate(0, 0.6, 0);
  const main = new THREE.Mesh(mainGeo, mat);
  g.add(main);
  
  // Left arm
  const leftArm = new THREE.Group();
  const leftHorGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 6);
  leftHorGeo.rotateZ(Math.PI / 2);
  const leftHor = new THREE.Mesh(leftHorGeo, mat);
  leftHor.position.x = -0.15;
  
  const leftVertGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6);
  const leftVert = new THREE.Mesh(leftVertGeo, mat);
  leftVert.position.set(-0.3, 0.2, 0);
  leftArm.add(leftHor, leftVert);
  leftArm.position.y = 0.5;
  g.add(leftArm);
  
  // Right arm
  const rightArm = new THREE.Group();
  const rightHorGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 6);
  rightHorGeo.rotateZ(Math.PI / 2);
  const rightHor = new THREE.Mesh(rightHorGeo, mat);
  rightHor.position.x = 0.15;
  
  const rightVertGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6);
  const rightVert = new THREE.Mesh(rightVertGeo, mat);
  rightVert.position.set(0.3, 0.2, 0);
  rightArm.add(rightHor, rightVert);
  rightArm.position.y = 0.8;
  g.add(rightArm);
  
  g.scale.set(0.8, 0.8, 0.8);
  return g;
}

function createProceduralTent() {
  const g = new THREE.Group();
  const canvasMat = new THREE.MeshToonMaterial({ color: 0xe3c49a, roughness: 0.9 });
  const insideMat = new THREE.MeshBasicMaterial({ color: 0x1c120c });

  const tentGeo = new THREE.ConeGeometry(0.8, 0.9, 4);
  tentGeo.rotateY(Math.PI / 4);
  tentGeo.translate(0, 0.45, 0);
  const tent = new THREE.Mesh(tentGeo, canvasMat);
  g.add(tent);

  const doorGeo = new THREE.ConeGeometry(0.4, 0.6, 4);
  doorGeo.rotateY(Math.PI / 4);
  doorGeo.translate(0, 0.3, 0);
  const door = new THREE.Mesh(doorGeo, insideMat);
  door.position.set(0, 0, 0.42);
  door.scale.set(1, 1, 0.1);
  g.add(door);

  g.scale.set(0.9, 0.9, 0.9);
  return g;
}

function createProceduralLantern() {
  const g = new THREE.Group();
  const poleMat = new THREE.MeshToonMaterial({ color: 0x222222, roughness: 0.7 });
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xffeaad });

  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
  poleGeo.translate(0, 1.1, 0);
  const pole = new THREE.Mesh(poleGeo, poleMat);
  g.add(pole);

  const headGeo = new THREE.BoxGeometry(0.24, 0.3, 0.24);
  headGeo.translate(0, 2.3, 0);
  const head = new THREE.Mesh(headGeo, glassMat);
  g.add(head);

  const capGeo = new THREE.ConeGeometry(0.2, 0.12, 4);
  capGeo.rotateY(Math.PI / 4);
  capGeo.translate(0, 2.5, 0);
  const cap = new THREE.Mesh(capGeo, poleMat);
  g.add(cap);

  return g;
}

function createProceduralDune(baseColor) {
  const g = new THREE.Group();
  const hexStr = "#" + baseColor.toString(16).padStart(6, "0");
  const adjustedHex = adjustColor(hexStr, -15);
  const duneColor = parseInt(adjustedHex.replace("#", ""), 16);
  const duneMat = new THREE.MeshToonMaterial({ color: duneColor, roughness: 0.95 });
  
  const duneGeo = new THREE.SphereGeometry(3.5, 8, 8);
  duneGeo.scale(1.0, 0.2, 1.6);
  const dune = new THREE.Mesh(duneGeo, duneMat);
  dune.castShadow = true;
  dune.receiveShadow = true;
  g.add(dune);
  return g;
}

function createProceduralPineTree() {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshToonMaterial({ color: 0x5d4037, roughness: 0.9 });
  const leavesMat = new THREE.MeshToonMaterial({ color: 0x006064, roughness: 0.7 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.8, 8), trunkMat);
  trunk.position.y = 0.4;
  trunk.castShadow = true;
  g.add(trunk);

  // 3 stacked cones for a pine tree
  [1.0, 0.75, 0.5].forEach((h, i) => {
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.35 - i * 0.06, 0.6, 6), leavesMat);
    leaves.position.y = 0.8 + i * 0.45;
    leaves.castShadow = true;
    g.add(leaves);
  });

  g.scale.set(0.7, 0.7, 0.7);
  return g;
}

function createProceduralSnowman() {
  const g = new THREE.Group();
  const snowMat = new THREE.MeshToonMaterial({ color: 0xffffff, roughness: 0.9 });
  const carrotMat = new THREE.MeshToonMaterial({ color: 0xffa726, roughness: 0.5 });
  const coalMat = new THREE.MeshToonMaterial({ color: 0x212121, roughness: 0.9 });

  // Bottom ball
  const bottomBall = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), snowMat);
  bottomBall.position.y = 0.48;
  bottomBall.castShadow = true;
  g.add(bottomBall);

  // Top ball
  const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), snowMat);
  topBall.position.y = 1.15;
  topBall.castShadow = true;
  g.add(topBall);

  // Carrot nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 6), carrotMat);
  nose.position.set(0.3, 1.15, 0);
  nose.rotation.z = -Math.PI / 2;
  nose.castShadow = true;
  g.add(nose);

  // Eyes (coal)
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), coalMat);
  eyeL.position.set(0.24, 1.25, -0.1);
  g.add(eyeL);
  
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), coalMat);
  eyeR.position.set(0.24, 1.25, 0.1);
  g.add(eyeR);

  // Hat (black coal cylinder)
  const hatMat = new THREE.MeshToonMaterial({ color: 0x37474f, roughness: 0.5 });
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 10), hatMat);
  hatBrim.position.y = 1.45;
  hatBrim.castShadow = true;
  g.add(hatBrim);

  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10), hatMat);
  hatTop.position.y = 1.6;
  hatTop.castShadow = true;
  g.add(hatTop);

  g.scale.set(0.5, 0.5, 0.5);
  return g;
}

function createProceduralIgloo() {
  const g = new THREE.Group();
  const iceMat = new THREE.MeshToonMaterial({ color: 0xe0f7fa, roughness: 0.3, metalness: 0.1 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), iceMat);
  dome.castShadow = true;
  g.add(dome);
  const entrance = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.36, 10), iceMat);
  entrance.rotation.x = Math.PI / 2;
  entrance.position.set(0.48, 0.18, 0);
  entrance.castShadow = true;
  g.add(entrance);
  g.scale.set(0.6, 0.6, 0.6);
  return g;
}

function createProceduralIceCrystal() {
  const g = new THREE.Group();
  const crystalMat = new THREE.MeshToonMaterial({ color: 0x80deea, emissive: 0x0099bb, emissiveIntensity: 0.4 });
  const crystalGeo = new THREE.OctahedronGeometry(0.4, 0);
  crystalGeo.scale(0.5, 1.8, 0.5);
  const cry = new THREE.Mesh(crystalGeo, crystalMat);
  cry.position.y = 0.36;
  cry.castShadow = true;
  cry.layers.enable(1);
  g.add(cry);
  g.scale.set(0.7, 0.7, 0.7);
  return g;
}

function createDistantOasis(palmTemplate) {
  const g = new THREE.Group();
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    let palm;
    if (palmTemplate) {
      palm = palmTemplate.clone();
      palm.scale.setScalar(0.35 + Math.random() * 0.15);
    } else {
      palm = createProceduralPalmTree();
      palm.scale.setScalar(0.7 + Math.random() * 0.3);
    }
    const px = (Math.random() - 0.5) * 2.5;
    const pz = (Math.random() - 0.5) * 2.5;
    palm.position.set(px, 0, pz);
    g.add(palm);
  }
  return g;
}

function createDistantCactusPatch(cactusTemplate) {
  const g = new THREE.Group();
  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    let cactus;
    if (cactusTemplate) {
      cactus = cactusTemplate.clone();
      cactus.scale.setScalar(0.35 + Math.random() * 0.15);
    } else {
      cactus = createProceduralCactus();
      cactus.scale.setScalar(0.7 + Math.random() * 0.3);
    }
    const px = (Math.random() - 0.5) * 2.0;
    const pz = (Math.random() - 0.5) * 2.0;
    cactus.position.set(px, 0, pz);
    g.add(cactus);
  }
  return g;
}

function createDistantCaravan(camelTemplate) {
  const g = new THREE.Group();
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    let camel;
    if (camelTemplate) {
      camel = camelTemplate.clone();
      camel.scale.setScalar(0.4 + Math.random() * 0.1);
    } else {
      camel = createProceduralCamel();
      camel.scale.setScalar(0.75 + Math.random() * 0.15);
    }
    camel.position.set(0, 0, i * 1.8 - (count * 0.9));
    camel.rotation.y = Math.PI / 2;
    g.add(camel);
  }
  return g;
}

function createDistantVillage(regColor) {
  const g = new THREE.Group();
  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const house = createProceduralHouse(regColor);
    house.scale.setScalar(0.65 + Math.random() * 0.2);
    
    const px = (Math.random() - 0.5) * 3.0;
    const pz = (Math.random() - 0.5) * 3.0;
    house.position.set(px, 0, pz);
    house.rotation.y = Math.random() * Math.PI * 2;
    g.add(house);
  }
  return g;
}

export class LevelMap {

  constructor(renderer, onTaskClick, onStateUpdate) {
    this.renderer = renderer;
    this.onTaskClick = onTaskClick;
    this.onStateUpdate = onStateUpdate;

    this.scene = new THREE.Scene();
    
    // Sky background (flat opaque color initialized to white)
    this.scene.background = new THREE.Color('#ffffff');

    // High-angle steep camera looking down at the snaking road for a classic vertical level map view
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.updateCameraForAspect();

    this.globeRadius = 90;
    this.globeGroup = new THREE.Group();
    this.globeGroup.position.set(0, -this.globeRadius + 0.5, 0);
    this.scene.add(this.globeGroup);

    this.setupLights();
    
    // Mock 42 tasks (6 per region)
    this.orderedTasks = [];
    this.setupInitialMockTasks();

    this.setupGlobe();

    // Parallax background container
    this.parallaxGroup = new THREE.Group();
    this.parallaxGroup.position.set(0, 3, -15);
    this.scene.add(this.parallaxGroup);
    
    this.currentRegionId = '';

    this.animatedDecorations = [];
    this.taskMeshes = [];
    this.isActive = false;

    this.onResize = () => {
      this.resize();
    };
    window.addEventListener('resize', this.onResize);

    // Background gradient colors corresponding to active region (deep forest/terrain matching gradients)
    this.regionColors = {
      welcome: ['#0d211f', '#122a27', '#1b3c38'],      // Deep forest teal-green
      brands: ['#091724', '#0d2033', '#132e48'],       // Deep Navy
      creator: ['#14081a', '#1d0c26', '#2a1136'],      // Deep Purple
      campaigns: ['#091d0e', '#0d2a15', '#133e1f'],    // Deep Green
      analytics: ['#160810', '#210b18', '#301023'],    // Deep Plum
      marketplace: ['#1f1409', '#2d1d0c', '#3f2911'],  // Deep Brown
      community: ['#081b19', '#0d2825', '#133a36'],    // Deep Emerald Teal
      snow: ['#091c24', '#0e2936', '#14384a'],         // Deep Icy Cyan-Blue
      desert: ['#1c1007', '#2a180b', '#3b2210']        // Deep Warm Brownish Orange
    };

    // Ground grass themed colors matching each chapter
    this.regionGroundColors = {
      welcome: 0x1f3b39,      // Deep Slate Teal (matching reference image)
      brands: 0x142b42,       // Deep Navy Blue
      creator: 0x32133d,      // Deep Royal Purple
      campaigns: 0x15381d,    // Deep Forest Green
      analytics: 0x301222,    // Deep Magenta/Plum
      marketplace: 0x422d14,  // Deep Rich Chocolate Brown
      community: 0x113330,     // Deep Emerald Teal
      snow: 0xddeef5,         // Frosty/Snow White-Blue
      desert: 0xe2a85e        // Desert Sand Yellow
    };

    // Parallax themed flat color schemes for 2D background silhouettes (aerial perspective)
    this.regionParallaxColors = {
      welcome: '#2d5754',
      brands: '#224261',
      creator: '#4f245e',
      campaigns: '#23522d',
      analytics: '#4a2037',
      marketplace: '#5c4121',
      community: '#204d49',
      snow: '#b0cddb',
      desert: '#cca064'
    };

    this.palmTemplate = null;
    this.camelTemplate = null;
    this.cactusTemplate = null;
    this.lanternTemplate = null;
    this.loadGltfTemplates();

    this.setupRoadAndTasks();
    this.setupInput();

    this.rebuildParallaxMeshes('welcome');

  }

  setupInitialMockTasks() {
    const regionKeys = Object.keys(REGIONS);
    regionKeys.forEach(rKey => {
      const reg = REGIONS[rKey];
      for (let i = 1; i <= 6; i++) {
        let taskData = reg.tasks[i - 1];
        if (!taskData) {
          taskData = {
            id: `${rKey}_${i}`,
            title: `${reg.title} Task ${i}`,
            desc: `Complete level challenge ${i} in the beautiful ${reg.title}.`,
            status: (rKey === 'welcome' && i === 1) ? 'unlocked' : 'locked'
          };
        } else {
          taskData = {
            id: taskData.id,
            title: taskData.title,
            desc: taskData.desc,
            status: taskData.status
          };
        }
        this.orderedTasks.push({
          ...taskData,
          regionId: rKey,
          regionColor: reg.color
        });
      }
    });
  }

  loadGltfTemplates() {
    const urls = {
      camel: 'https://static.poly.pizza/44e2a4cd-9688-43d9-bf16-2c6c5083c632.glb',
      palmTree: 'https://static.poly.pizza/22b34f75-411f-4fc3-95da-342a0f10ead2.glb',
      cactus: 'https://static.poly.pizza/f5b2446f-c1f9-44ea-8cf6-cbfbe1d587c6.glb',
      lantern: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb'
    };

    gltfLoader.load(urls.palmTree, (gltf) => {
      this.palmTemplate = gltf.scene;
      this.palmTemplate.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      // Re-initialize road and tasks to place loaded model templates
      if (this.isActive) this.setupRoadAndTasks();
    }, undefined, (err) => console.warn("Could not load CDN palm model, using procedural fallback"));

    gltfLoader.load(urls.camel, (gltf) => {
      this.camelTemplate = gltf.scene;
      this.camelTemplate.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      if (this.isActive) this.setupRoadAndTasks();
    }, undefined, (err) => console.warn("Could not load CDN camel model, using procedural fallback"));

    gltfLoader.load(urls.cactus, (gltf) => {
      this.cactusTemplate = gltf.scene;
      this.cactusTemplate.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      if (this.isActive) this.setupRoadAndTasks();
    }, undefined, (err) => console.warn("Could not load CDN cactus model, using procedural fallback"));

    gltfLoader.load(urls.lantern, (gltf) => {
      this.lanternTemplate = gltf.scene;
      this.lanternTemplate.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      if (this.isActive) this.setupRoadAndTasks();
    }, undefined, (err) => console.warn("Could not load CDN lantern model, using procedural fallback"));
  }

  unlockNextTask(currentTaskId) {
    let foundIdx = -1;
    for (let i = 0; i < this.orderedTasks.length; i++) {
      if (this.orderedTasks[i].id === currentTaskId) {
        foundIdx = i;
        break;
      }
    }
    if (foundIdx !== -1 && foundIdx < this.orderedTasks.length - 1) {
      const nextTask = this.orderedTasks[foundIdx + 1];
      if (nextTask.status === 'locked') {
        nextTask.status = 'unlocked';
      }
    }
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    dirLight.position.set(5, 25, 10);
    this.scene.add(dirLight);
  }

  setupGlobe() {
    const geo = new THREE.SphereGeometry(this.globeRadius - 0.05, 64, 64);
    this.globeMat = new THREE.MeshToonMaterial({
      color: 0xffffff, // solid white globe
      roughness: 0.15,
      metalness: 0.1
    });
    this.globeMesh = new THREE.Mesh(geo, this.globeMat);
    this.globeGroup.add(this.globeMesh);
  }

  rebuildParallaxMeshes(regionId) {
    while (this.parallaxGroup.children.length > 0) {
      this.parallaxGroup.remove(this.parallaxGroup.children[0]);
    }
    this.mountainLayer = null;
    this.treeLayer = null;
    this.clouds = null;
  }

  transitionParallax(regionId) {
    if (this.currentRegionId === regionId) return;
    this.currentRegionId = regionId;

    // Instantly rebuild textures without sliding off-screen to prevent frenetic movements
    this.rebuildParallaxMeshes(regionId);
  }

  updateCameraForAspect() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;

    const defaultFov = 45;
    const baseCameraY = 22.0;
    const baseCameraZ = 36.0;
    const lookAtY = 3.5;

    if (aspect < 1.0) {
      // Portrait view: zoom in by moving camera closer
      const factor = Math.max(0.55, aspect); // range [0.55, 1.0]
      const targetY = lookAtY;
      const targetZ = 0.0;
      
      const diffY = baseCameraY - targetY;
      const diffZ = baseCameraZ - targetZ;

      this.camera.position.set(0, targetY + diffY * factor, targetZ + diffZ * factor);
      this.camera.fov = defaultFov * (0.9 + (1 - factor) * 0.1); 
    } else {
      // Landscape view: use default camera settings
      this.camera.position.set(0, baseCameraY, baseCameraZ);
      this.camera.fov = defaultFov;
    }

    this.camera.lookAt(0, lookAtY, 0);
    this.camera.updateProjectionMatrix();
  }

  transitionRegionColors(regionId) {
    const groundColor = this.regionGroundColors[regionId] || 0x1f3b39;
    const bgColors = this.regionColors[regionId] || ['#a3e2f7', '#e0f2fe', '#ffdbe6'];
    const backgroundColor = bgColors[1] || bgColors[0];

    this.backgroundColor = backgroundColor;
    this.groundColor = groundColor;

    // Smoothly transition globe material color
    if (this.globeMat) {
      const gColor = new THREE.Color(groundColor);
      gsap.to(this.globeMat.color, {
        r: gColor.r,
        g: gColor.g,
        b: gColor.b,
        duration: 0.8,
        ease: 'power2.out'
      });
    }

    // Smoothly transition background color
    if (this.scene && this.scene.background) {
      const bgColor = new THREE.Color(backgroundColor);
      gsap.to(this.scene.background, {
        r: bgColor.r,
        g: bgColor.g,
        b: bgColor.b,
        duration: 0.8,
        ease: 'power2.out'
      });
    }

    this.transitionParallax(regionId);
  }

  setTasks(allTasks, activeTaskId = null) {
    this.orderedTasks = allTasks.map((task) => {
      // Find region ID from task ID prefix (e.g. "welcome_1" -> "welcome")
      const regionId = task.id.split('_')[0];
      const reg = REGIONS[regionId] || REGIONS.welcome;
      return {
        ...task,
        regionId: regionId,
        regionColor: reg.color
      };
    });

    // Compute stepLat dynamically to wrap up to ~305 degrees (5.32 radians) max to avoid overlap
    const taskCount = this.orderedTasks.length;
    this.stepLat = taskCount > 0 ? Math.min(0.09, 5.3 / taskCount) : 0.09;

    this.setupRoadAndTasks();

    // Trigger initial color setting for the starting region
    let targetIndex = 0;
    if (activeTaskId) {
      const idx = this.orderedTasks.findIndex(t => t.id === activeTaskId);
      if (idx !== -1) targetIndex = idx;
    } else {
      const idx = this.orderedTasks.findIndex(t => t.status === 'unlocked');
      if (idx !== -1) targetIndex = idx;
    }

    const firstActiveTask = this.orderedTasks[targetIndex] || this.orderedTasks[0];
    const initialRegionId = firstActiveTask ? firstActiveTask.regionId : 'welcome';
    this.activeRegionId = null; // force transition
    this.transitionRegionColors(initialRegionId);

    // Scroll the globe to the active task
    gsap.killTweensOf(this.globeGroup.rotation);
    if (this.isActive) {
      gsap.to(this.globeGroup.rotation, {
        x: -targetIndex * this.stepLat,
        duration: 1.0,
        ease: 'power2.out',
        onComplete: () => this.updateBackgroundGradient()
      });
    } else {
      this.globeGroup.rotation.x = -targetIndex * this.stepLat;
    }
  }

  setupRoadAndTasks() {
    if (this.globeGroup) {
      const toRemove = [];
      this.globeGroup.children.forEach(child => {
        if (child !== this.globeMesh) {
          toRemove.push(child);
        }
      });
      toRemove.forEach(child => this.globeGroup.remove(child));
    }
    this.animatedDecorations = [];
    this.taskMeshes = [];

    const taskCount = this.orderedTasks.length;
    if (taskCount === 0) return;

    // Spaced out by dynamic stepLat to prevent overlaps
    const stepLat = this.stepLat || 0.09;

    this.taskPathPoints = [];
    this.orderedTasks.forEach((task, index) => {
      const lat = index * stepLat;
      const lon = 0.05 * Math.sin(index * 0.3); // much smoother, less curvy pattern

      const pos = this.getSphereCoords(lat, lon, this.globeRadius + 0.025);
      this.taskPathPoints.push({ pos, lat, lon, task });
    });

    // SMOOTH ROAD: Generate road spline using CatmullRomCurve3 for fluid curves
    const controlPoints = this.taskPathPoints.map(node => node.pos);
    const spline = new THREE.CatmullRomCurve3(controlPoints);
    const roadPoints = spline.getPoints(240);

    const roadGeo = new THREE.BufferGeometry();
    const vertices = [];
    const uvs = [];
    const indices = [];
    const roadWidth = 3.6; // wider aesthetic road

    for (let i = 0; i < roadPoints.length; i++) {
      const p = roadPoints[i];
      const normal = p.clone().normalize();
      
      let tangent;
      if (i < roadPoints.length - 1) {
        tangent = roadPoints[i+1].clone().sub(p).normalize();
      } else {
        tangent = p.clone().sub(roadPoints[i-1]).normalize();
      }
      const side = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      const leftPt = p.clone().add(side.clone().multiplyScalar(-roadWidth / 2));
      const rightPt = p.clone().add(side.clone().multiplyScalar(roadWidth / 2));

      vertices.push(leftPt.x, leftPt.y, leftPt.z);
      vertices.push(rightPt.x, rightPt.y, rightPt.z);

      // Repeat texture along the road using i * frequency (0.4 for higher frequency candy pattern)
      uvs.push(0, i * 0.4);
      uvs.push(1, i * 0.4);

      if (i < roadPoints.length - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    const roadTex = createRoadTexture();
    const roadMat = new THREE.MeshToonMaterial({
      map: roadTex,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.1
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    this.globeGroup.add(roadMesh);

    // Place Task Node Buttons (keeping node interaction)
    this.taskPathPoints.forEach((node, index) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(node.pos);

      const localUp = node.pos.clone().normalize();
      const alignRot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), localUp);
      nodeGroup.quaternion.copy(alignRot);

      // Candy Button
      const btnGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.16, 16);
      
      const sideMat = new THREE.MeshToonMaterial({ color: 0xffffff, roughness: 0.5 }); // white sides
      const topMat = new THREE.MeshBasicMaterial({
        map: createCandyButtonTexture(index + 1, node.task.status),
        transparent: true
      });

      const btnMesh = new THREE.Mesh(btnGeo, [sideMat, topMat, sideMat]);
      btnMesh.name = `node_${index}`;
      btnMesh.userData = { task: node.task, index };
      nodeGroup.add(btnMesh);

      // Glowing white ring
      if (node.task.status === 'unlocked') {
        const ringGeo = new THREE.TorusGeometry(0.65, 0.06, 8, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        nodeGroup.add(ringMesh);
        nodeGroup.userData.pulseRing = ringMesh;
      }

      // Add task 3D asset next to the candy button
      if (node.task.asset) {
        const assetGroup = new THREE.Group();
        const assetConfig = node.task.asset;

        if (assetConfig.type === 'external_gltf') {
          const url = assetConfig.url;
          const scale = (assetConfig.scale ?? 1) * 0.35;
          const rotation = assetConfig.rotation ?? 0;

          const placeholder = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.MeshToonMaterial({ color: 0x8fa5b8 })
          );
          placeholder.position.set(0.9, 0.1, 0);
          assetGroup.add(placeholder);

          const loadModel = (modelUrl) => {
            if (gltfCache[modelUrl]) {
              assetGroup.remove(placeholder);
              const model = gltfCache[modelUrl].clone();
              model.scale.set(scale, scale, scale);
              model.rotation.y = rotation;
              model.position.set(0.9, 0.05, 0);
              model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
              assetGroup.add(model);
            } else {
              gltfLoader.load(modelUrl, (gltf) => {
                gltfCache[modelUrl] = gltf.scene;
                assetGroup.remove(placeholder);
                const model = gltf.scene.clone();
                model.scale.set(scale, scale, scale);
                model.rotation.y = rotation;
                model.position.set(0.9, 0.05, 0);
                model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
                assetGroup.add(model);
              }, undefined, (err) => {
                console.error("Error loading GLTF in level map:", err);
              });
            }
          };
          loadModel(url);
        } else {
          // Procedural shape
          const shape = assetConfig.shape || 'office_tower';
          const builder = DECOR_BUILDERS[shape] || DECOR_BUILDERS.office_tower;
          builder(assetGroup);

          // Apply colors
          if (assetConfig.primaryColor) {
            const hexColor = assetConfig.primaryColor;
            assetGroup.traverse(child => {
              if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.material.color.setHex(hexColor);
              }
            });
          }

          assetGroup.scale.set(0.6, 0.6, 0.6);
          assetGroup.position.set(0.9, 0.05, 0);
          assetGroup.rotation.y = Math.PI / 4;
        }

        nodeGroup.add(assetGroup);
      }

      // Initial scale 0 (or 1 if already active to handle asynchronous GLTF loads)
      const initScale = this.isActive ? 1 : 0;
      nodeGroup.scale.set(initScale, initScale, initScale);
      nodeGroup.userData = { isNodeGroup: true, index };

      this.globeGroup.add(nodeGroup);
      this.taskMeshes.push(btnMesh);
    });

    // Place decorative assets surrounding the road
    const decorSteps = 60;
    for (let i = 0; i <= decorSteps; i++) {
      const t = 0.02 + (i / decorSteps) * 0.96;
      const p = spline.getPointAt(t);
      const tan = spline.getTangentAt(t).normalize();
      const normal = p.clone().normalize();
      
      // Calculate side vector perpendicular to normal and tangent (points right)
      const sideVec = new THREE.Vector3().crossVectors(normal, tan).normalize();

      // Find closest node to determine region colors
      const closestNodeIdx = Math.min(this.taskPathPoints.length - 1, Math.floor(t * this.taskPathPoints.length));
      const closestNode = this.taskPathPoints[closestNodeIdx];
      const regionId = closestNode?.task?.regionId || 'welcome';
      const regColor = closestNode?.task?.regionColor || 0x00e5ff;

      // Check if near any task button to avoid overlapping/blocking clicks
      let isNearNode = false;
      this.taskPathPoints.forEach(node => {
        if (node.pos.distanceTo(p) < 4.2) {
          isNearNode = true;
        }
      });

      // 25% chance to skip placing a decoration on this step to naturally space them out along the road length
      if (Math.random() < 0.25) continue;

      // Alternating sides
      const side = (i % 2 === 0) ? 1 : -1;

      // Determine decoration mesh
      let decMesh = null;
      let dist = 5.0;
      let scale = 1.0;
      let wiggle = false;

      if (isNearNode) {
        // Place small props or trees at a safe side distance
        dist = 4.8 + Math.random() * 1.5;
        const rand = Math.random();
        if (rand < 0.3) {
          // Palm tree
          if (regionId === 'snow') {
            decMesh = createProceduralPineTree();
            scale = 0.9 + Math.random() * 0.3;
          } else if (this.palmTemplate) {
            decMesh = this.palmTemplate.clone();
            scale = 0.45 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralPalmTree();
            scale = 0.9 + Math.random() * 0.3;
          }
          wiggle = true;
        } else if (rand < 0.6) {
          // Cactus
          if (regionId === 'snow') {
            decMesh = createProceduralSnowman();
            scale = 0.85 + Math.random() * 0.25;
          } else if (this.cactusTemplate) {
            decMesh = this.cactusTemplate.clone();
            scale = 0.45 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralCactus();
            scale = 0.8 + Math.random() * 0.2;
          }
          wiggle = true;
        } else if (rand < 0.8) {
          // Camel
          if (regionId === 'snow') {
            decMesh = createProceduralSnowman();
            scale = 0.85 + Math.random() * 0.25;
          } else if (this.camelTemplate) {
            decMesh = this.camelTemplate.clone();
            scale = 0.55 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralCamel();
            scale = 0.85 + Math.random() * 0.2;
          }
          wiggle = true;
        } else {
          // Lantern
          if (this.lanternTemplate) {
            decMesh = this.lanternTemplate.clone();
            scale = 0.5 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralLantern();
            scale = 0.85 + Math.random() * 0.2;
          }
        }
      } else {
        // Place larger structures, palaces, archways, fountains, etc.
        const rand = Math.random();
        if (rand < 0.22) {
          // Palace or House
          dist = 6.4 + Math.random() * 1.8;
          if (regionId === 'snow') {
            decMesh = createProceduralIgloo();
            scale = 0.9 + Math.random() * 0.25;
          } else {
            const isPalace = Math.random() < 0.4;
            if (isPalace) {
              decMesh = createProceduralPalace(regColor);
              scale = 0.8 + Math.random() * 0.2;
            } else {
              decMesh = createProceduralHouse(regColor);
              scale = 0.9 + Math.random() * 0.2;
            }
          }
        } else if (rand < 0.42) {
          // Palm tree
          dist = 4.8 + Math.random() * 1.4;
          if (regionId === 'snow') {
            decMesh = createProceduralPineTree();
            scale = 0.9 + Math.random() * 0.3;
          } else if (this.palmTemplate) {
            decMesh = this.palmTemplate.clone();
            scale = 0.45 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralPalmTree();
            scale = 0.9 + Math.random() * 0.3;
          }
          wiggle = true;
        } else if (rand < 0.57) {
          // Cactus
          dist = 4.6 + Math.random() * 1.2;
          if (regionId === 'snow') {
            decMesh = createProceduralSnowman();
            scale = 0.85 + Math.random() * 0.25;
          } else if (this.cactusTemplate) {
            decMesh = this.cactusTemplate.clone();
            scale = 0.45 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralCactus();
            scale = 0.8 + Math.random() * 0.2;
          }
          wiggle = true;
        } else if (rand < 0.7) {
          // Camel
          dist = 4.5 + Math.random() * 1.2;
          if (regionId === 'snow') {
            decMesh = createProceduralSnowman();
            scale = 0.85 + Math.random() * 0.25;
          } else if (this.camelTemplate) {
            decMesh = this.camelTemplate.clone();
            scale = 0.55 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralCamel();
            scale = 0.85 + Math.random() * 0.2;
          }
          wiggle = true;
        } else if (rand < 0.8) {
          // Fountain
          dist = 5.2 + Math.random() * 1.2;
          if (regionId === 'snow') {
            decMesh = createProceduralIceCrystal();
            scale = 0.9 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralFountain();
            scale = 0.9 + Math.random() * 0.15;
          }
        } else if (rand < 0.9) {
          // Desert Tent
          dist = 5.8 + Math.random() * 1.4;
          if (regionId === 'snow') {
            decMesh = createProceduralIgloo();
            scale = 0.9 + Math.random() * 0.25;
          } else {
            decMesh = createProceduralTent();
            scale = 0.9 + Math.random() * 0.25;
          }
        } else {
          // Lantern
          dist = 4.6 + Math.random() * 0.8;
          if (this.lanternTemplate) {
            decMesh = this.lanternTemplate.clone();
            scale = 0.5 + Math.random() * 0.15;
          } else {
            decMesh = createProceduralLantern();
            scale = 0.85 + Math.random() * 0.2;
          }
        }
      }

      if (decMesh) {
        const offsetPos = p.clone().add(sideVec.clone().multiplyScalar(side * dist));
        
        // Project onto the sphere surface (slightly embedded to avoid floating)
        const surfacePos = offsetPos.clone().normalize().multiplyScalar(this.globeRadius - 0.05);
        
        // Align to sphere surface
        const localUp = surfacePos.clone().normalize();
        const alignRot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), localUp);
        
        // Random slight y rotation for variety
        const randomYRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
        
        const decorGroup = new THREE.Group();
        decorGroup.position.copy(surfacePos);
        decorGroup.quaternion.copy(alignRot).multiply(randomYRot);
        
        // Set scale
        decMesh.scale.set(scale, scale, scale);
        
        // Enable shadows
        decMesh.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        decorGroup.add(decMesh);
        this.globeGroup.add(decorGroup);

        if (wiggle) {
          this.animatedDecorations.push({
            mesh: decorGroup,
            baseScale: scale,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }

    // Place distant scenery to populate the extreme left and right sides of the globe
    const distantSteps = 45;
    for (let i = 0; i <= distantSteps; i++) {
      const t = 0.02 + (i / distantSteps) * 0.96;
      const p = spline.getPointAt(t);
      const tan = spline.getTangentAt(t).normalize();
      const normal = p.clone().normalize();
      
      // Calculate side vector perpendicular to normal and tangent (points right)
      const sideVec = new THREE.Vector3().crossVectors(normal, tan).normalize();

      // Find closest node to determine region colors
      const closestNodeIdx = Math.min(this.taskPathPoints.length - 1, Math.floor(t * this.taskPathPoints.length));
      const closestNode = this.taskPathPoints[closestNodeIdx];
      const regColor = closestNode?.task?.regionColor || 0x00e5ff;
      const groundColor = this.regionGroundColors[closestNode?.task?.regionId || 'welcome'] || 0x1f3b39;

      // Place distant assets on BOTH sides
      for (const side of [-1, 1]) {
        // Distance is far out: between 12.5 and 26.0 units from center line
        const dist = 12.5 + Math.random() * 13.5;
        
        // Pick a scenery type
        const rand = Math.random();
        let sceneMesh = null;
        let scale = 1.0;
        let wiggle = false;

        if (rand < 0.45) {
          // Sand dune / grass hill (low dome blending with regional ground color)
          sceneMesh = createProceduralDune(groundColor);
        } else if (rand < 0.7) {
          // Oasis (Palm cluster)
          sceneMesh = createDistantOasis(this.palmTemplate);
          wiggle = true;
        } else if (rand < 0.82) {
          // Cactus Patch
          sceneMesh = createDistantCactusPatch(this.cactusTemplate);
          wiggle = true;
        } else if (rand < 0.92) {
          // Distant village
          sceneMesh = createDistantVillage(regColor);
        } else {
          // Distant Camel Caravan
          sceneMesh = createDistantCaravan(this.camelTemplate);
          wiggle = true;
        }

        if (sceneMesh) {
          const offsetPos = p.clone().add(sideVec.clone().multiplyScalar(side * dist));
          
          // Project onto the sphere surface (slightly embedded to avoid floating)
          const surfacePos = offsetPos.clone().normalize().multiplyScalar(this.globeRadius - 0.05);
          
          // Align to sphere surface
          const localUp = surfacePos.clone().normalize();
          const alignRot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), localUp);
          
          // Random slight y rotation for variety
          const randomYRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);

          const sceneGroup = new THREE.Group();
          sceneGroup.position.copy(surfacePos);
          sceneGroup.quaternion.copy(alignRot).multiply(randomYRot);
          
          // Set scale
          sceneMesh.scale.set(scale, scale, scale);
          
          // Enable shadows
          sceneMesh.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          sceneGroup.add(sceneMesh);
          this.globeGroup.add(sceneGroup);

          if (wiggle) {
            this.animatedDecorations.push({
              mesh: sceneGroup,
              baseScale: scale,
              phase: Math.random() * Math.PI * 2
            });
          }
        }
      }
    }
  }

  getSphereCoords(lat, lon, radius) {
    const x = radius * Math.cos(lat) * Math.sin(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.cos(lon);
    return new THREE.Vector3(x, y, z);
  }

  setupInput() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    this.onPointerDown = (e) => {
      if (!this.isActive) return;
      this.isDragging = true;
      this.hasDragged = false;
      this.dragStart = { x: e.clientX, y: e.clientY };
    };

    this.onPointerMove = (e) => {
      if (!this.isActive) return;
      if (this.isDragging) {
        const dy = e.clientY - this.dragStart.y;
        if (Math.abs(dy) > 3) {
          this.hasDragged = true;
        }
        const f = 0.003;
        this.globeGroup.rotation.x += dy * f;
        this.dragStart = { x: e.clientX, y: e.clientY };
      }
    };

    this.onPointerUp = (e) => {
      if (!this.isActive) return;
      this.isDragging = false;
      if (this.hasDragged) return;

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.taskMeshes);
      if (hits.length > 0) {
        const hitNode = hits[0].object;
        this.onTaskClick(hitNode.userData.task);
      }
    };

    this.onWheel = (e) => {
      if (!this.isActive) return;
      const f = 0.0008;
      this.globeGroup.rotation.x += e.deltaY * f;
    };

    this.onTouchStart = (e) => {
      if (e.touches.length > 0) this.onPointerDown(e.touches[0]);
    };
    this.onTouchMove = (e) => {
      if (e.touches.length > 0) this.onPointerMove(e.touches[0]);
    };
    this.onTouchEnd = (e) => {
      this.onPointerUp(e);
    };

    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('wheel', this.onWheel);

    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  }

  activate() {
    this.isActive = true;
    this.updateBackgroundGradient();

    // Staggered entry scale-up animation using GSAP
    if (this.globeGroup) {
      this.globeGroup.children.forEach(child => {
        if (child.userData && child.userData.isNodeGroup) {
          child.scale.set(0, 0, 0);
          gsap.to(child.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.65,
            ease: 'back.out(1.6)',
            delay: child.userData.index * 0.08
          });
        }
      });
    }
  }

  deactivate() {
    this.isActive = false;
    // Scale down nodes on exit
    if (this.globeGroup) {
      this.globeGroup.children.forEach(child => {
        if (child.userData && child.userData.isNodeGroup) {
          gsap.to(child.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.3,
            ease: 'power2.in'
          });
        }
      });
    }
  }

  animateTaskCompletion(taskId) {
    if (!this.globeGroup) return;
    this.globeGroup.children.forEach(child => {
      if (child.userData && child.userData.isNodeGroup) {
        const btn = child.children.find(c => c.userData && c.userData.task && c.userData.task.id === taskId);
        if (btn) {
          // Play a juicy bounce pop animation
          gsap.to(child.scale, {
            x: 1.4, y: 1.4, z: 1.4,
            duration: 0.25,
            yoyo: true,
            repeat: 1,
            ease: 'power2.out',
            onComplete: () => {
              // Rebuild tasks to show new completed textures
              this.setupRoadAndTasks();
              // Animate back to full size
              child.scale.set(0, 0, 0);
              gsap.to(child.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.4,
                ease: 'back.out(1.7)'
              });
            }
          });
        }
      }
    });
  }

  updateBackgroundGradient() {
    const currentAngle = -this.globeGroup.rotation.x;
    const taskIdx = Math.max(0, Math.floor(currentAngle / (this.stepLat || 0.09)));
    const activeTask = this.orderedTasks[Math.min(taskIdx, this.orderedTasks.length - 1)];
    const regionId = activeTask ? activeTask.regionId : 'welcome';
    
    if (regionId !== this.activeRegionId) {
      this.activeRegionId = regionId;
      this.transitionRegionColors(regionId);
    }
  }

  update(time) {
    if (!this.isActive) return;

    this.animatedDecorations.forEach(dec => {
      // Cancel out parent rotation
      dec.mesh.quaternion.copy(this.globeGroup.quaternion).invert();
      // Apply wiggle
      dec.mesh.rotation.z += 0.1 * Math.sin(time * 4 + dec.phase);
      // Apply breathing scale
      const breathing = dec.baseScale * (1.0 + 0.08 * Math.sin(time * 3 + dec.phase));
      dec.mesh.scale.set(breathing, breathing, breathing);
    });

    // Pulse active ring
    this.globeGroup.traverse(child => {
      if (child.parent && child.parent.userData.pulseRing) {
        const ring = child.parent.userData.pulseRing;
        const scaleVal = 1 + 0.15 * Math.sin(time * 6);
        ring.scale.set(scaleVal, scaleVal, 1);
      }
    });

    // Parallax background scrolling shift
    if (this.parallaxGroup) {
      const rot = this.globeGroup.rotation.x;
      
      // Far Layer (Mountains) shifts slowly
      if (this.mountainLayer && Math.abs(this.mountainLayer.position.x) < 29) {
        this.mountainLayer.position.y = 1.5 + Math.sin(rot * 0.2) * 1.0;
        this.mountainLayer.position.x = Math.sin(rot * 0.1) * 0.8;
      }
      // Mid Layer (Trees) shifts faster
      if (this.treeLayer && Math.abs(this.treeLayer.position.x) < 29) {
        this.treeLayer.position.y = 0.5 + Math.sin(rot * 0.45) * 1.6;
        this.treeLayer.position.x = Math.sin(rot * 0.25) * 1.4;
      }
      
      // Floating Clouds
      if (this.clouds) {
        this.clouds.forEach((cloud, cIdx) => {
          cloud.position.y = 4.5 + Math.sin(time * 1.2 + cIdx) * 0.6 + Math.sin(rot * 0.15) * 0.5;
          cloud.position.x += Math.sin(time * 0.2 + cIdx) * 0.005;
        });
      }
    }

    this.updateBackgroundGradient();
  }

  resize() {
    this.updateCameraForAspect();
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
  }
}

// src/world/Ground.js
import * as THREE from 'three';
import { ROAD_SET } from '../config.js';

// ─── Materials ─────────────────────────────────────────────────────────────
const grassMat     = new THREE.MeshToonMaterial({ color: 0x6dbf67, roughness: 0.8 });   // bright green default grass
const roadMat      = new THREE.MeshToonMaterial({ color: 0x8a9bb0, roughness: 0.4 });   // medium blue-grey asphalt
const sidewalkMat  = new THREE.MeshToonMaterial({ color: 0xd4cfc7, roughness: 0.5 });   // light concrete
const waterMat     = new THREE.MeshToonMaterial({ color: 0x1e88e5, roughness: 0.1, metalness: 0.1 }); // shiny blue water

// Bridge materials
const bridgeWoodMat = new THREE.MeshToonMaterial({ color: 0x8d6e63, roughness: 0.8 }); // warm brown wood
const bridgeRailMat = new THREE.MeshToonMaterial({ color: 0xd7ccc8, roughness: 0.7 }); // light railing wood
const bridgePostMat = new THREE.MeshToonMaterial({ color: 0x5d4037, roughness: 0.9 }); // dark post wood

export const canalCells = new Set();
export const roadMeshMap = new Map();
const landMaterials = new Map();
let currentGroundGroup = null;

// Dynamic region color land caching
function getLandMaterial(regId, activeRegions) {
  if (!regId) return grassMat;
  if (landMaterials.has(regId)) {
    return landMaterials.get(regId);
  }
  
  const reg = activeRegions[regId];
  if (!reg) return grassMat;
  
  let blendedColor;
  if (regId === 'snow') {
    blendedColor = new THREE.Color(0xddeef5); // Snow White-Blue
  } else if (regId === 'desert') {
    blendedColor = new THREE.Color(0xe2a85e); // Sand Yellow
  } else {
    // Blend default grass color (0x6dbf67) with the region theme color for distinct region branding (35% theme weight)
    const baseColor = new THREE.Color(0x6dbf67);
    const landColorVal = (reg.theme && reg.theme.landColor !== undefined) ? reg.theme.landColor : (reg.color || 0x6dbf67);
    const regColor = new THREE.Color(landColorVal);
    blendedColor = baseColor.clone().lerp(regColor, 0.35);
  }
  
  const mat = new THREE.MeshToonMaterial({
    color: blendedColor,
    roughness: 0.8
  });
  
  landMaterials.set(regId, mat);
  return mat;
}

// Rebuilds the grid ground based on the active regions list (forming canals and islands)
// Can be called as rebuildCityGround(activeRegions, cols, rows) or rebuildCityGround(scene, activeRegions, cols, rows)
export function rebuildCityGround(scene, activeRegions, cols, rows) {
  let actualScene = null;
  let regions = activeRegions;
  let c = cols;
  let r = rows;

  if (scene && typeof scene.add !== 'function') {
    // Shift arguments left if first argument is not a scene/group object
    r = c;
    c = regions;
    regions = scene;
    actualScene = null;
  } else {
    actualScene = scene;
  }

  if (actualScene && currentGroundGroup) {
    actualScene.remove(currentGroundGroup);
  }

  const group = new THREE.Group();
  group.name = 'ground';
  currentGroundGroup = group;
  
  canalCells.clear();
  landMaterials.clear();

  const regionsList = Object.values(regions || {});

  // If there are no regions, draw a simple solid grass slab
  if (regionsList.length === 0) {
    const baseGeo = new THREE.BoxGeometry(c + 8, 0.2, r + 8);
    const base = new THREE.Mesh(baseGeo, grassMat);
    base.position.set(0, -0.1, 0);
    base.receiveShadow = true;
    group.add(base);
    if (actualScene) {
      actualScene.add(group);
    }
    return group;
  }

  // First pass: compute closest region for each cell in the expanded grid
  const cellRegionMap = new Map();
  const margin = 4; // grid padding margin
  for (let colIndex = -margin; colIndex < c + margin; colIndex++) {
    for (let rowIndex = -margin; rowIndex < r + margin; rowIndex++) {
      const key = `${colIndex},${rowIndex}`;
      let minDistance = Infinity;
      let closestReg = null;
      regionsList.forEach(reg => {
        const dist = Math.abs(colIndex - reg.col) + Math.abs(rowIndex - reg.row);
        if (dist < minDistance) {
          minDistance = dist;
          closestReg = reg;
        }
      });
      cellRegionMap.set(key, closestReg ? closestReg.id : null);
    }
  }

  // Second pass: identify canal cells (on the boundary)
  for (let colIndex = -margin; colIndex < c + margin; colIndex++) {
    for (let rowIndex = -margin; rowIndex < r + margin; rowIndex++) {
      const key = `${colIndex},${rowIndex}`;
      const regId = cellRegionMap.get(key);
      if (!regId) continue;

      const neighbors = [
        `${colIndex+1},${rowIndex}`,
        `${colIndex-1},${rowIndex}`,
        `${colIndex},${rowIndex+1}`,
        `${colIndex},${rowIndex-1}`
      ];
      let isBorder = false;
      for (const nKey of neighbors) {
        const nRegId = cellRegionMap.get(nKey);
        if (nRegId && nRegId !== regId) {
          isBorder = true;
          break;
        }
      }
      if (isBorder) {
        canalCells.add(key);
      }
    }
  }

  // Render land and water cell blocks
  for (let colIndex = -margin; colIndex < c + margin; colIndex++) {
    for (let rowIndex = -margin; rowIndex < r + margin; rowIndex++) {
      const key = `${colIndex},${rowIndex}`;
      const cx = colIndex - c / 2;
      const cz = rowIndex - r / 2;

      if (canalCells.has(key)) {
        // Recessed blue water block
        const wGeo = new THREE.BoxGeometry(1.0, 0.08, 1.0);
        const water = new THREE.Mesh(wGeo, waterMat);
        water.position.set(cx, -0.06, cz);
        water.receiveShadow = true;
        group.add(water);
      } else {
        // Raised colored grass block for the region
        const regId = cellRegionMap.get(key);
        const mat = getLandMaterial(regId, regions);
        
        const gGeo = new THREE.BoxGeometry(1.0, 0.2, 1.0);
        const land = new THREE.Mesh(gGeo, mat);
        land.position.set(cx, -0.1, cz);
        land.receiveShadow = true;
        group.add(land);
      }
    }
  }

  if (actualScene) {
    actualScene.add(group);
  }
  return group;
}

export function createSmoothGround(scene, cols, rows) {
  return rebuildCityGround(scene, {}, cols, rows);
}

export function addDynamicRoadCell(scene, c, r, cols, rows) {
  const key = `${c},${r}`;
  if (roadMeshMap.has(key)) return;

  const roadGroup = new THREE.Group();
  const cx = c - cols / 2;
  const cz = r - rows / 2;

  if (canalCells.has(key)) {
    // ─── RENDER A BRIDGE OVER CANAL ───
    const isRoadEast = ROAD_SET.has(`${c+1},${r}`);
    const isRoadWest = ROAD_SET.has(`${c-1},${r}`);
    const isRoadNorth = ROAD_SET.has(`${c},${r-1}`);
    const isRoadSouth = ROAD_SET.has(`${c},${r+1}`);

    let isHorizontal = true;
    if ((isRoadNorth || isRoadSouth) && !(isRoadEast || isRoadWest)) {
      isHorizontal = false;
    }

    // 1. Deck/Floor
    const deckGeo = new THREE.BoxGeometry(1.0, 0.12, 0.85);
    const deck = new THREE.Mesh(deckGeo, bridgeWoodMat);
    deck.position.set(cx, 0.06, cz);
    deck.receiveShadow = true;
    deck.castShadow = true;
    roadGroup.add(deck);

    // 2. Railings & Posts
    if (isHorizontal) {
      const railGeo = new THREE.BoxGeometry(1.0, 0.16, 0.08);
      const railN = new THREE.Mesh(railGeo, bridgeRailMat);
      railN.position.set(cx, 0.16, cz - 0.4);
      railN.castShadow = true;
      roadGroup.add(railN);

      const railS = new THREE.Mesh(railGeo, bridgeRailMat);
      railS.position.set(cx, 0.16, cz + 0.4);
      railS.castShadow = true;
      roadGroup.add(railS);

      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8);
      const p1 = new THREE.Mesh(postGeo, bridgePostMat);
      p1.position.set(cx - 0.45, 0.22, cz - 0.4);
      roadGroup.add(p1);

      const p2 = new THREE.Mesh(postGeo, bridgePostMat);
      p2.position.set(cx + 0.45, 0.22, cz - 0.4);
      roadGroup.add(p2);

      const p3 = new THREE.Mesh(postGeo, bridgePostMat);
      p3.position.set(cx - 0.45, 0.22, cz + 0.4);
      roadGroup.add(p3);

      const p4 = new THREE.Mesh(postGeo, bridgePostMat);
      p4.position.set(cx + 0.45, 0.22, cz + 0.4);
      roadGroup.add(p4);
    } else {
      const railGeo = new THREE.BoxGeometry(0.08, 0.16, 1.0);
      const railW = new THREE.Mesh(railGeo, bridgeRailMat);
      railW.position.set(cx - 0.4, 0.16, cz);
      railW.castShadow = true;
      roadGroup.add(railW);

      const railE = new THREE.Mesh(railGeo, bridgeRailMat);
      railE.position.set(cx + 0.4, 0.16, cz);
      railE.castShadow = true;
      roadGroup.add(railE);

      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8);
      const p1 = new THREE.Mesh(postGeo, bridgePostMat);
      p1.position.set(cx - 0.4, 0.22, cz - 0.45);
      roadGroup.add(p1);

      const p2 = new THREE.Mesh(postGeo, bridgePostMat);
      p2.position.set(cx - 0.4, 0.22, cz + 0.45);
      roadGroup.add(p2);

      const p3 = new THREE.Mesh(postGeo, bridgePostMat);
      p3.position.set(cx + 0.4, 0.22, cz - 0.45);
      roadGroup.add(p3);

      const p4 = new THREE.Mesh(postGeo, bridgePostMat);
      p4.position.set(cx + 0.4, 0.22, cz + 0.45);
      roadGroup.add(p4);
    }
  } else {
    // ─── RENDER STANDARD ROAD ───
    const curbGeo = new THREE.BoxGeometry(1.0, 0.035, 1.0);
    const curb = new THREE.Mesh(curbGeo, sidewalkMat);
    curb.position.set(cx, 0.018, cz);
    curb.receiveShadow = true;
    roadGroup.add(curb);

    const rGeo = new THREE.BoxGeometry(0.85, 0.04, 0.85);
    const road = new THREE.Mesh(rGeo, roadMat);
    road.position.set(cx, 0.02, cz);
    road.receiveShadow = true;
    roadGroup.add(road);
  }

  scene.add(roadGroup);
  roadMeshMap.set(key, roadGroup);
}

export function removeDynamicRoadCell(scene, c, r) {
  const key = `${c},${r}`;
  if (roadMeshMap.has(key)) {
    scene.remove(roadMeshMap.get(key));
    roadMeshMap.delete(key);
  }
}

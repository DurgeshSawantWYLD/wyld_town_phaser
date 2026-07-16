// src/world/Traffic.js
import * as THREE from 'three';
import { COLS, ROWS, BRANDS, ROADS, RUNWAY } from '../config.js';
import { findPath, ROAD_SET } from '../utils.js';
import {
  createVehicle,
  createCitizen,
  createSheep, createCat, createDog, createRabbit,
  createBird, createAirplane
} from './Buildings.js';

export const cars      = [];
export const citizens  = [];
export const animals   = [];
export const birds     = [];
export const airplanes = [];

// ─── Navigation zone sets ──────────────────────────────────────────────────
const SIDEWALK_SET = new Set();
const GRASS_SET    = new Set();

export function initNavigationGrids() {
  SIDEWALK_SET.clear();
  GRASS_SET.clear();

  // Sidewalks: cells adjacent to roads, not themselves roads
  ROADS.forEach(road => {
    [
      { c: road.c + 1, r: road.r },
      { c: road.c - 1, r: road.r },
      { c: road.c, r: road.r + 1 },
      { c: road.c, r: road.r - 1 }
    ].forEach(n => {
      const key = `${n.c},${n.r}`;
      if (!ROAD_SET.has(key) && n.c >= 1 && n.c < COLS - 1 && n.r >= 1 && n.r < ROWS - 1) {
        SIDEWALK_SET.add(key);
      }
    });
  });

  // Grass: everything else
  for (let c = 1; c < COLS - 1; c++) {
    for (let r = 1; r < ROWS - 1; r++) {
      const key = `${c},${r}`;
      if (!ROAD_SET.has(key) && !SIDEWALK_SET.has(key)) {
        GRASS_SET.add(key);
      }
    }
  }
}

const toWorldX = c => c - COLS / 2;
const toWorldZ = r => r - ROWS / 2;

// ─── Road-only car variants ────────────────────────────────────────────────
const CAR_VARIANTS  = ['sedan', 'suv', 'sports', 'truck', 'van', 'taxi'];
const BRAND_IDS     = ['cocacola', 'nike', 'adidas', null, null, null];

export function spawnSmartCars(scene, count = 10) {
  cars.length = 0;
  const roadList = Array.from(ROAD_SET).map(k => {
    const [c, r] = k.split(',').map(Number);
    return { c, r };
  });

  for (let i = 0; i < count; i++) {
    const brandId  = BRAND_IDS[i % BRAND_IDS.length];
    const variant  = CAR_VARIANTS[i % CAR_VARIANTS.length];
    const carMesh  = createVehicle(scene, brandId, variant);

    // Spawn strictly on a road cell
    const startRoad = roadList[Math.floor(Math.random() * roadList.length)];
    carMesh.position.set(toWorldX(startRoad.c), 0.04, toWorldZ(startRoad.r));

    cars.push({
      mesh: carMesh,
      c: startRoad.c,
      r: startRoad.r,
      targetC: startRoad.c,
      targetR: startRoad.r,
      path: [],
      pathIdx: 0,
      maxSpeed: 0.04 + Math.random() * 0.03,   // 0.04–0.07 world units/frame
      currentSpeed: 0,
      angle: 0,                                  // current Y rotation (radians)
      targetAngle: 0,                            // desired Y rotation
    });
  }
}

// ─── Citizens — sidewalk A* ────────────────────────────────────────────────
export function spawnSmartCitizens(scene, count = 14) {
  citizens.length = 0;
  const colors = [0x6366f1, 0xec4899, 0xf59e0b, 0x10b981, 0x8b5cf6, 0x06b6d4];
  const sidewalkList = Array.from(SIDEWALK_SET).map(k => {
    const [c, r] = k.split(',').map(Number);
    return { c, r };
  });

  for (let i = 0; i < count; i++) {
    if (sidewalkList.length === 0) break;
    const startCell = sidewalkList[Math.floor(Math.random() * sidewalkList.length)];
    const citizenMesh = createCitizen(scene, colors[i % colors.length]);
    citizenMesh.position.set(toWorldX(startCell.c), 0, toWorldZ(startCell.r));

    citizens.push({
      mesh: citizenMesh,
      c: startCell.c,
      r: startCell.r,
      targetC: startCell.c,
      targetR: startCell.r,
      path: [],
      pathIdx: 0,
      speed: 0.012 + Math.random() * 0.008,
      state: 'idle',
      timer: Math.random() * 3,
      sidewalkList,
    });
  }
}

// ─── Animals — grass A* (4 variants) ──────────────────────────────────────
const ANIMAL_FACTORIES = [createSheep, createCat, createDog, createRabbit];

export function spawnSmartAnimals(scene, count = 10) {
  animals.length = 0;
  const grassList = Array.from(GRASS_SET).map(k => {
    const [c, r] = k.split(',').map(Number);
    return { c, r };
  });

  for (let i = 0; i < count; i++) {
    if (grassList.length === 0) break;
    const startCell = grassList[Math.floor(Math.random() * grassList.length)];
    const factory = ANIMAL_FACTORIES[i % ANIMAL_FACTORIES.length];
    const animalMesh = factory(scene);
    animalMesh.position.set(toWorldX(startCell.c), 0, toWorldZ(startCell.r));

    animals.push({
      mesh: animalMesh,
      c: startCell.c,
      r: startCell.r,
      targetC: startCell.c,
      targetR: startCell.r,
      speed: 0.007 + Math.random() * 0.005,
      state: 'idle',
      timer: 1 + Math.random() * 3,
      bounceTimer: 0,
      grassList,
    });
  }
}

// ─── Birds ────────────────────────────────────────────────────────────────
export function spawnSmartBirds(scene, count = 6) {
  birds.length = 0;
  for (let i = 0; i < count; i++) {
    const birdMesh = createBird(scene);
    birds.push({
      mesh: birdMesh,
      angle: Math.random() * Math.PI * 2,
      radius: 5 + Math.random() * 7,
      centerX: (Math.random() - 0.5) * 8,
      centerZ: (Math.random() - 0.5) * 8,
      altitude: 3.2 + Math.random() * 2.0,
      speed: 0.014 + Math.random() * 0.01,
    });
  }
}

// ─── Airplanes ────────────────────────────────────────────────────────────
export function spawnSmartAirplanes(scene) {
  airplanes.length = 0;
  ['cocacola', 'nike', 'adidas'].forEach((brandId, index) => {
    const planeMesh = createAirplane(scene, brandId);
    planeMesh.position.set(
      toWorldX(RUNWAY.startCol - index * 1.5),
      0.04,
      toWorldZ(RUNWAY.row)
    );
    airplanes.push({
      mesh: planeMesh,
      brandId,
      state: 'taxi_to_start',
      progress: 0,
      altitude: 0.04,
      angle: 0,
      index,
    });
  });
}

// ─── Main update loop ──────────────────────────────────────────────────────
export function updateSmartSimulation(time) {

  // ── CARS (road-only, smooth turn lerp, collision avoidance) ──────────────
  cars.forEach((car, index) => {
    // If we've reached the target, pick a new road destination
    if (car.c === car.targetC && car.r === car.targetR) {
      const roadArr = Array.from(ROAD_SET);
      let dest, path;
      // Try up to 5 random destinations until a valid path is found
      for (let attempt = 0; attempt < 5; attempt++) {
        const key = roadArr[Math.floor(Math.random() * roadArr.length)];
        const [dc, dr] = key.split(',').map(Number);
        dest = { c: dc, r: dr };
        path = findPath({ c: car.c, r: car.r }, dest, ROAD_SET);
        if (path && path.length > 1) break;
      }
      if (path && path.length > 1) {
        car.path    = path;
        car.pathIdx = 1;
        car.targetC = dest.c;
        car.targetR = dest.r;
      }
    }

    if (car.pathIdx < car.path.length) {
      const nextCell = car.path[car.pathIdx];
      const targetX  = toWorldX(nextCell.c);
      const targetZ  = toWorldZ(nextCell.r);
      const dx = targetX - car.mesh.position.x;
      const dz = targetZ - car.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Collision avoidance — look ahead 0.6 units
      let obstacleAhead = false;
      for (let oi = 0; oi < cars.length; oi++) {
        if (oi === index) continue;
        const other = cars[oi];
        const odx = other.mesh.position.x - car.mesh.position.x;
        const odz = other.mesh.position.z - car.mesh.position.z;
        const odist = Math.sqrt(odx * odx + odz * odz);
        if (odist < 0.6 && (odx * dx + odz * dz) > 0) {
          obstacleAhead = true;
          break;
        }
      }

      // Speed control with smooth acceleration/braking
      if (obstacleAhead) {
        car.currentSpeed = Math.max(0, car.currentSpeed - 0.004);
      } else {
        car.currentSpeed = Math.min(car.maxSpeed, car.currentSpeed + 0.003);
      }

      if (car.currentSpeed > 0) {
        if (dist < car.currentSpeed) {
          // Snap to waypoint
          car.mesh.position.set(targetX, 0.04, targetZ);
          car.c = nextCell.c;
          car.r = nextCell.r;
          car.pathIdx++;
        } else {
          // Move towards waypoint
          car.mesh.position.x += (dx / dist) * car.currentSpeed;
          car.mesh.position.z += (dz / dist) * car.currentSpeed;

          // Smooth turn: lerp Y rotation towards heading
          const desired = -Math.atan2(dz, dx) + Math.PI / 2;
          // Find shortest angular delta
          let delta = desired - car.angle;
          while (delta >  Math.PI) delta -= Math.PI * 2;
          while (delta < -Math.PI) delta += Math.PI * 2;
          car.angle += delta * 0.18; // lerp factor
          car.mesh.rotation.y = car.angle;
        }
      }
    }
  });

  // ── CITIZENS (sidewalk walk) ──────────────────────────────────────────────
  citizens.forEach(person => {
    if (person.state === 'idle') {
      person.timer -= 0.016;
      if (person.timer <= 0) {
        const dest = person.sidewalkList[Math.floor(Math.random() * person.sidewalkList.length)];
        const path = findPath({ c: person.c, r: person.r }, { c: dest.c, r: dest.r }, SIDEWALK_SET);
        if (path && path.length > 1) {
          person.path    = path;
          person.pathIdx = 1;
          person.targetC = dest.c;
          person.targetR = dest.r;
          person.state   = 'walking';
        } else {
          person.timer = 1 + Math.random() * 2;
        }
      }
    } else {
      if (person.pathIdx < person.path.length) {
        const nextCell = person.path[person.pathIdx];
        const tx = toWorldX(nextCell.c);
        const tz = toWorldZ(nextCell.r);
        const dx = tx - person.mesh.position.x;
        const dz = tz - person.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < person.speed) {
          person.mesh.position.set(tx, 0, tz);
          person.c = nextCell.c;
          person.r = nextCell.r;
          person.pathIdx++;
        } else {
          person.mesh.position.x += (dx / dist) * person.speed;
          person.mesh.position.z += (dz / dist) * person.speed;
          person.mesh.position.y = Math.abs(Math.sin(person.pathIdx + dist * Math.PI)) * 0.035;
          person.mesh.rotation.y = -Math.atan2(dz, dx) + Math.PI / 2;
        }
      } else {
        person.state = 'idle';
        person.timer = 1 + Math.random() * 3;
        person.mesh.position.y = 0;
      }
    }
  });

  // ── ANIMALS (grass wander, per-type animations) ───────────────────────────
  animals.forEach((animal, ai) => {
    if (animal.state === 'idle') {
      animal.timer -= 0.016;
      if (animal.timer <= 0) {
        const adj = [
          { c: animal.c + 1, r: animal.r },
          { c: animal.c - 1, r: animal.r },
          { c: animal.c, r: animal.r + 1 },
          { c: animal.c, r: animal.r - 1 },
        ].filter(t => GRASS_SET.has(`${t.c},${t.r}`));

        if (adj.length > 0 && Math.random() > 0.35) {
          const dest = adj[Math.floor(Math.random() * adj.length)];
          animal.targetC = dest.c;
          animal.targetR = dest.r;
          animal.state = 'walking';
          animal.bounceTimer = 0;
        } else {
          animal.timer = 1.5 + Math.random() * 4;
        }
      } else {
        // Idle animations (tails, ears)
        const t = animal.mesh.userData;
        if (t.tailRef) t.tailRef.rotation.z = Math.sin(time * 0.005 + ai) * 0.4;
        if (t.earL)    t.earL.rotation.x    = Math.sin(time * 0.003 + ai) * 0.15;
      }
    } else {
      const tx = toWorldX(animal.targetC);
      const tz = toWorldZ(animal.targetR);
      const dx = tx - animal.mesh.position.x;
      const dz = tz - animal.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < animal.speed) {
        animal.mesh.position.set(tx, 0, tz);
        animal.c = animal.targetC;
        animal.r = animal.targetR;
        animal.state = 'idle';
        animal.timer = 1.5 + Math.random() * 3;
      } else {
        animal.mesh.position.x += (dx / dist) * animal.speed;
        animal.mesh.position.z += (dz / dist) * animal.speed;
        animal.bounceTimer += 0.09;
        animal.mesh.position.y = Math.abs(Math.sin(animal.bounceTimer * Math.PI)) * 0.055;
        animal.mesh.rotation.y = -Math.atan2(dz, dx) + Math.PI / 2;
      }
    }
  });

  // ── BIRDS (flapping orbits) ───────────────────────────────────────────────
  birds.forEach(bird => {
    bird.angle += bird.speed;
    const bx = bird.centerX + Math.cos(bird.angle) * bird.radius;
    const bz = bird.centerZ + Math.sin(bird.angle) * bird.radius;
    bird.mesh.position.set(bx, bird.altitude + Math.sin(time * 0.002) * 0.18, bz);
    bird.mesh.rotation.y = -bird.angle;
    const flap = Math.sin(time * 0.016) * 0.6;
    if (bird.mesh.userData.wingL) bird.mesh.userData.wingL.rotation.z =  flap;
    if (bird.mesh.userData.wingR) bird.mesh.userData.wingR.rotation.z = -flap;
  });

  // ── AIRPLANES (takeoff → cruise → land loop) ──────────────────────────────
  airplanes.forEach(plane => {
    const runRow  = RUNWAY.row;
    const startCol = RUNWAY.startCol;
    const endCol   = RUNWAY.endCol;

    if (plane.state === 'taxi_to_start') {
      const tx = toWorldX(startCol);
      const tz = toWorldZ(runRow);
      const dx = tx - plane.mesh.position.x;
      const dz = tz - plane.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      plane.mesh.rotation.y = Math.PI / 2;
      if (dist < 0.02) {
        plane.mesh.position.set(tx, 0.04, tz);
        plane.state = 'takeoff';
        plane.progress = 0;
      } else {
        plane.mesh.position.x += (dx / dist) * 0.012;
      }
    } else if (plane.state === 'takeoff') {
      plane.progress += 0.013;
      const rx = startCol + plane.progress * (endCol - startCol);
      plane.mesh.position.x = toWorldX(rx);
      if (plane.progress > 0.55) {
        plane.altitude = Math.min(4.0, plane.altitude + 0.04);
        plane.mesh.position.y = plane.altitude;
        plane.mesh.rotation.z = 0.14;
      }
      if (plane.progress >= 1.0) {
        plane.state = 'cruise';
        plane.progress = 0;
        plane.mesh.rotation.z = 0;
      }
    } else if (plane.state === 'cruise') {
      plane.progress += 0.0035;
      const radius = 9.5;
      const angle  = plane.progress * Math.PI * 2;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      plane.mesh.position.set(px, 3.8 + Math.sin(time * 0.001) * 0.12, pz);
      plane.mesh.rotation.y = -angle + Math.PI;
      plane.mesh.rotation.z = -0.13;
      if (plane.progress >= 1.0) {
        plane.state = 'approach';
        plane.progress = 0;
      }
    } else if (plane.state === 'approach') {
      const sx = toWorldX(startCol - 4);
      const sz = toWorldZ(runRow);
      const dx = sx - plane.mesh.position.x;
      const dz = sz - plane.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      plane.mesh.rotation.y = Math.PI / 2;
      plane.mesh.rotation.z = 0.06;
      if (dist < 0.12) {
        plane.state = 'land';
        plane.progress = 0;
      } else {
        plane.mesh.position.x += (dx / dist) * 0.038;
        plane.mesh.position.z += (dz / dist) * 0.038;
        plane.mesh.position.y = Math.max(0.04, plane.mesh.position.y - 0.045);
      }
    } else if (plane.state === 'land') {
      plane.progress += 0.014;
      plane.mesh.position.x = toWorldX(startCol + plane.progress * (endCol - startCol));
      plane.mesh.position.y = 0.04;
      plane.mesh.rotation.z = 0;
      if (plane.progress >= 1.0) {
        plane.mesh.position.set(toWorldX(startCol - 3), 0.04, toWorldZ(runRow));
        plane.altitude = 0.04;
        plane.state = 'taxi_to_start';
      }
    }
  });
}

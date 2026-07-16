// src/utils.js
import { ROADS } from './config.js';

export const ROAD_SET = new Set(ROADS.map(t => `${t.c},${t.r}`));

export function isRoadAt(c, r) {
  return ROAD_SET.has(`${c},${r}`);
}

export function buildRoutes() {
  const mainH = [];
  for (let col = 3; col <= 15; col++) mainH.push({c:col, r:6});

  const mainV = [];
  for (let row = 1; row <= 12; row++) mainV.push({c:8, r:row});

  const branchLeft = [
    {c:8,r:5},{c:7,r:5},{c:6,r:5},{c:5,r:5},{c:5,r:4},{c:5,r:5},{c:5,r:6},
    {c:5,r:7},{c:5,r:8},{c:5,r:9},{c:5,r:8},{c:5,r:7},{c:5,r:6},{c:6,r:6},{c:7,r:6},{c:8,r:6}
  ];

  const branchRight = [
    {c:8,r:5},{c:9,r:5},{c:10,r:5},{c:11,r:5},{c:11,r:4},{c:11,r:3},{c:11,r:4},{c:11,r:5},{c:11,r:6},
    {c:12,r:6},{c:13,r:6},{c:13,r:7},{c:13,r:8},{c:13,r:7},{c:13,r:6},{c:12,r:6},{c:11,r:6},{c:10,r:6},{c:9,r:6},{c:8,r:6}
  ];

  return [
    mainH,
    mainV,
    branchLeft,
    branchRight,
    mainH.slice().reverse(),
    mainV.slice().reverse()
  ];
}

export function getClosestRegion(c, r, regionsObj) {
  let closestId = 'welcome';
  let minDist = 99999;
  Object.values(regionsObj).forEach(reg => {
    const dist = Math.abs(reg.col - c) + Math.abs(reg.row - r);
    if (dist < minDist) {
      minDist = dist;
      closestId = reg.id;
    }
  });
  return closestId;
}

export function hexToCSSColor(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}

// Robust custom tween helper (Cubic Ease In-Out / Elastic Ease Out)
export function tween(obj, target, duration, type = 'cubic', onComplete = null, onUpdate = null) {
  const startTime = performance.now();
  const start = {};
  for (const key in target) {
    start[key] = obj[key];
  }

  function animate(now) {
    const elapsed = (now - startTime) / duration;
    const t = Math.min(1, Math.max(0, elapsed));

    let ease = t;
    if (type === 'cubic') {
      ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // Cubic Ease In-Out
    } else if (type === 'elastic') {
      const c4 = (2 * Math.PI) / 3;
      ease = t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    } else if (type === 'quadOut') {
      ease = 1 - (1 - t) * (1 - t);
    }

    for (const key in target) {
      obj[key] = start[key] + (target[key] - start[key]) * ease;
    }

    if (onUpdate) onUpdate();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(animate);
}

// A* Grid Pathfinding algorithm
export function findPath(start, end, allowedTilesSet) {
  const startKey = `${start.c},${start.r}`;
  const endKey = `${end.c},${end.r}`;
  
  if (startKey === endKey) return [start];
  
  const openList = [];
  const closedSet = new Set();
  
  const startNode = {
    c: start.c,
    r: start.r,
    g: 0,
    h: Math.abs(start.c - end.c) + Math.abs(start.r - end.r),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  openList.push(startNode);
  
  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift();
    const currentKey = `${current.c},${current.r}`;
    closedSet.add(currentKey);
    
    if (currentKey === endKey) {
      const path = [];
      let temp = current;
      while (temp !== null) {
        path.push({ c: temp.c, r: temp.r });
        temp = temp.parent;
      }
      return path.reverse();
    }
    
    const neighbors = [
      { c: current.c + 1, r: current.r },
      { c: current.c - 1, r: current.r },
      { c: current.c, r: current.r + 1 },
      { c: current.c, r: current.r - 1 }
    ];
    
    for (const neighbor of neighbors) {
      const nKey = `${neighbor.c},${neighbor.r}`;
      if (closedSet.has(nKey)) continue;
      // Allow the tile if it's in the allowed set or if it's the exact end node (to help snap to sidewalk points)
      if (!allowedTilesSet.has(nKey) && nKey !== endKey) continue;
      
      const gScore = current.g + 1;
      let neighborNode = openList.find(n => n.c === neighbor.c && n.r === neighbor.r);
      
      if (!neighborNode) {
        neighborNode = {
          c: neighbor.c,
          r: neighbor.r,
          g: gScore,
          h: Math.abs(neighbor.c - end.c) + Math.abs(neighbor.r - end.r),
          f: 0,
          parent: current
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        openList.push(neighborNode);
      } else if (gScore < neighborNode.g) {
        neighborNode.g = gScore;
        neighborNode.f = neighborNode.g + neighborNode.h;
        neighborNode.parent = current;
      }
    }
  }
  
  return null; // Path blocked
}
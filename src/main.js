// src/main.js
import * as THREE from 'three';
import { initEngine, scene, camera, renderer, composer } from './core/Engine.js';
import { initAudio, toggleSound, isSoundEnabled, playClick, playHover, playUnlock } from './core/Sound.js';
import {
  REGIONS, TREE_CLUSTERS, DECOR_BUILDINGS, LAMP_POSTS, BENCHES,
  BILLBOARDS, PHONE_BOOTHS, NEWS_STANDS, COLS, ROWS, BRANDS
} from './config.js';
import { createSmoothGround, addDynamicRoadCell, removeDynamicRoadCell, roadMeshMap, rebuildCityGround } from './world/Ground.js';
import { createTree, createLampPost, createBench, updateWindSway } from './world/Props.js';
import {
  createDecorBuilding, createCustomBuilding, createConfettiBurst, createRegionCloudCover,
  createNeonBillboard, createPhoneBooth, createNewsStand, createCar
} from './world/Buildings.js';
import {
  initNavigationGrids,
  spawnSmartCars, spawnSmartCitizens, spawnSmartAnimals,
  spawnSmartBirds, spawnSmartAirplanes,
  updateSmartSimulation,
  cars, citizens, animals, birds, airplanes
} from './world/Traffic.js';
import { spawnBillboards, setupBrandShowcases, updateBrandAnimations } from './brands/BrandManager.js';
import {
  createIntroClouds, startPlunge, staggerPhasedReveal, updateIntroClouds
} from './intro/IntroManager.js';
import { hexToCSSColor, tween, ROAD_SET } from './utils.js';
import { LevelMap } from './world/LevelMap.js';

// ─── Game & Editor Dynamic State ───────────────────────────────────────────
const state = {
  locked: {},
  activeRegion: null,
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  camTarget: new THREE.Vector3(0, 0, 0),
  camTargetOffset: new THREE.Vector3(0, 0, 0),
  zoomLevel: 100,
  zoomTarget: 100,
  isIntroActive: true,
  activeBrand: 'cocacola',
  hasDragged: false,
  
  // Editor States
  editorActive: false,
  activeTool: 'select', // select, road, tree, prop, vehicle, clear
  customRoads: new Set(),
  customBuildings: new Map(), // key: "c,r", value: assetConfig
  customTrees: new Map(),     // key: "c,r", value: treeType
  customProps: new Map(),     // key: "c,r", value: propType
  customVehicles: new Map(),  // key: "c,r", value: vehicleType
  currentView: 'city',
};

// Dynamic Chapter definitions (Starts blank by default)
let ACTIVE_REGIONS = {};
let chapterOrder = [];
let activeChapterIndex = 0;
let levelMapInstance = null;

const regionObjects = {};
const spawnedBuildingsMap = new Map(); // key: "c,r", value: THREE.Group
const spawnedTreesMap = new Map();     // key: "c,r", value: THREE.Group
const spawnedPropsMap = new Map();     // key: "c,r", value: THREE.Group
const spawnedDecorVehiclesMap = new Map(); // key: "c,r", value: THREE.Group

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredBuilding = null;
let labelContainer;
let raycastGroundPlane;

// Active coordinates picking states
let isPickingCoords = null; // 'chapter_center' | 'task_location'

// Phase arrays for staggered reveal
const phaseTreeClusters = []; 
const phaseProps        = []; 
const phaseBuildings    = []; 

// ─── Procedural Road Generation ─────────────────────────────────────────────
function drawLineRoads(c1, r1, c2, r2, roadSet) {
  // Manhattan path: horizontal first, then vertical
  const startC = Math.min(c1, c2);
  const endC = Math.max(c1, c2);
  for (let c = startC; c <= endC; c++) {
    roadSet.add(`${c},${r1}`);
  }
  const startR = Math.min(r1, r2);
  const endR = Math.max(r1, r2);
  for (let r = startR; r <= endR; r++) {
    roadSet.add(`${c2},${r}`);
  }
}

function generateDynamicRoadNetwork() {
  const roadSet = new Set();
  if (chapterOrder.length === 0) return roadSet;

  // 1. Connect chapter centers sequentially to form the main spine
  for (let i = 0; i < chapterOrder.length - 1; i++) {
    const ch1 = ACTIVE_REGIONS[chapterOrder[i]];
    const ch2 = ACTIVE_REGIONS[chapterOrder[i+1]];
    if (ch1 && ch2) {
      drawLineRoads(ch1.col, ch1.row, ch2.col, ch2.row, roadSet);
    }
  }

  // 2. Branch out to each task in the chapters
  Object.values(ACTIVE_REGIONS).forEach(region => {
    if (!region.tasks) return;
    region.tasks.forEach(task => {
      let closestSpine = null;
      let minDist = Infinity;
      roadSet.forEach(spineCoord => {
        const [sc, sr] = spineCoord.split(',').map(Number);
        const dist = Math.abs(task.col - sc) + Math.abs(task.row - sr);
        if (dist < minDist) {
          minDist = dist;
          closestSpine = { c: sc, r: sr };
        }
      });

      if (closestSpine) {
        const neighbors = [
          { c: task.col + 1, r: task.row },
          { c: task.col - 1, r: task.row },
          { c: task.col, r: task.row + 1 },
          { c: task.col, r: task.row - 1 }
        ];
        
        let bestNeighbor = null;
        let minNeighborDist = Infinity;
        neighbors.forEach(n => {
          if (n.c >= 0 && n.c < COLS && n.r >= 0 && n.r < ROWS) {
            const dist = Math.abs(n.c - closestSpine.c) + Math.abs(n.r - closestSpine.r);
            if (dist < minNeighborDist) {
              minNeighborDist = dist;
              bestNeighbor = n;
            }
          }
        });

        if (bestNeighbor) {
          drawLineRoads(bestNeighbor.c, bestNeighbor.r, closestSpine.c, closestSpine.r, roadSet);
        }
      }
    });
  });

  return roadSet;
}

function regenerateRoadNetwork() {
  // Clear old dynamic roads
  state.customRoads.forEach(coord => {
    const [c, r] = coord.split(',').map(Number);
    removeDynamicRoadCell(scene, c, r);
  });
  
  // Re-generate auto roads
  state.customRoads = generateDynamicRoadNetwork();
  
  // Render new roads
  state.customRoads.forEach(coord => {
    const [c, r] = coord.split(',').map(Number);
    addDynamicRoadCell(scene, c, r, COLS, ROWS);
  });

  // Update navigation pathfinder grid in Traffic.js
  ROAD_SET.clear();
  state.customRoads.forEach(coord => ROAD_SET.add(coord));
  initNavigationGrids();
}

function onLevelTaskClick(task) {
  playClick();
  const regId = task.regionId || state.activeRegion || chapterOrder[0];
  openPanel(regId, task.id);
}

// ─── Init ──────────────────────────────────────────────────────────────────
function init() {
  // Clear legacy data once to ensure a clean transition to the blank canvas editor
  if (!localStorage.getItem('wyld_town_blank_canvas_migrated')) {
    localStorage.removeItem('wyld_town_journey_state');
    localStorage.setItem('wyld_town_blank_canvas_migrated', 'true');
  }

  labelContainer = document.getElementById('labels-container');
  initEngine('game-container');

  // Create an invisible ground plane for raycasting in editor mode
  const groundPlaneGeo = new THREE.PlaneGeometry(COLS + 10, ROWS + 10);
  const groundPlaneMat = new THREE.MeshBasicMaterial({ visible: false });
  raycastGroundPlane = new THREE.Mesh(groundPlaneGeo, groundPlaneMat);
  raycastGroundPlane.rotation.x = -Math.PI / 2;
  raycastGroundPlane.position.y = 0.01;
  raycastGroundPlane.name = 'raycast_ground';
  scene.add(raycastGroundPlane);

  // Load custom designed state or default to Blank Canvas
  loadJourneyState();

  // ── Phase 1: Ground (Broken down Voronoi islands separated by canals) ───
  rebuildCityGround(scene, ACTIVE_REGIONS, COLS, ROWS);

  // Draw roads (will render bridges where crossing canals)
  state.customRoads.forEach(coord => {
    const [c, r] = coord.split(',').map(Number);
    addDynamicRoadCell(scene, c, r, COLS, ROWS);
  });

  // Render spawned buildings
  state.customBuildings.forEach((config, key) => {
    const [col, row] = key.split(',').map(Number);
    spawnBuildingAtCell(col, row, config);
  });

  // Render spawned trees
  state.customTrees.forEach((type, key) => {
    const [col, row] = key.split(',').map(Number);
    spawnTreeAtCell(col, row, type);
  });

  // Render spawned props
  state.customProps.forEach((type, key) => {
    const [col, row] = key.split(',').map(Number);
    spawnPropAtCell(col, row, type);
  });

  // Render spawned vehicles
  state.customVehicles.forEach((type, key) => {
    const [col, row] = key.split(',').map(Number);
    spawnDecorVehicleAtCell(col, row, type);
  });

  // Setup dynamic chapters and cloud covers
  rebuildChaptersAndLabels();

  // Traffic
  initNavigationGrids();

  // Intro clouds
  createIntroClouds(scene);

  // Initialize Level Map view
  levelMapInstance = new LevelMap(renderer, onLevelTaskClick, () => {
    updateHUD();
    updateTimelineUI();
  });

  // Mouse / Pointer Events
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup',   onPointerUp);
  renderer.domElement.addEventListener('wheel',       onWheel);

  // Touch Events
  renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
  renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
  renderer.domElement.addEventListener('touchend', onTouchEnd);

  // UI button triggers
  document.getElementById('btn-in').onclick    = () => adjustZoom(-1.5);
  document.getElementById('btn-out').onclick   = () => adjustZoom(1.5);
  document.getElementById('btn-reset').onclick = resetView;
  document.getElementById('btn-sound').onclick = () => {
    const on = toggleSound();
    const btn = document.getElementById('btn-sound');
    btn.textContent = on ? '🔊 Sound: On' : '🔇 Sound: Off';
  };
  document.getElementById('panel-close').onclick = () =>
    document.getElementById('panel').classList.remove('open');
  document.getElementById('panel-cta').onclick = onCta;
  document.getElementById('btn-enter').onclick = startCityIntro;
  document.querySelectorAll('.brand-tab').forEach(tab =>
    tab.addEventListener('click', e => selectBrand(e.currentTarget.getAttribute('data-brand')))
  );

  // View switch toggle button
  document.getElementById('btn-toggle-view').onclick = () => {
    playClick();
    const btn = document.getElementById('btn-toggle-view');
    if (state.currentView === 'level') {
      state.currentView = 'city';
      btn.textContent = '🍭 Level Map';
      btn.style.color = '#ff44aa';
      levelMapInstance.deactivate();
      
      // Show City UI elements
      labelContainer.style.display = 'block';
      document.getElementById('hud').style.opacity = '1';
      document.getElementById('hud').style.pointerEvents = 'auto';
      document.getElementById('timeline-container').style.display = 'flex';
      document.getElementById('controls').style.opacity = '1';
    } else {
      state.currentView = 'level';
      btn.textContent = '🏙 City Map';
      btn.style.color = '#2563eb';

      if (chapterOrder.length === 0) {
        // Automatically initialize a Welcome Plaza chapter for demo purposes
        const chId = 'welcome';
        ACTIVE_REGIONS[chId] = {
          id: chId,
          title: 'Welcome Plaza',
          emoji: '🏛',
          color: 0x00e5ff,
          desc: 'Welcome to WYLD Town! The central square — your journey begins here.',
          col: 10, row: 8,
          unlocks: null,
          cta: 'Complete Chapter',
          tasks: []
        };
        chapterOrder.push(chId);
        state.locked[chId] = false;
        saveJourneyState();
      }

      // Compile all tasks across all chapters sequentially
      const allTasks = [];
      chapterOrder.forEach(chId => {
        const chapter = ACTIVE_REGIONS[chId];
        if (chapter) {
          if (!chapter.tasks) chapter.tasks = [];
          
          // Pad tasks to 8 for demo purposes
          if (chapter.tasks.length < 8) {
            const shapes = ['office_tower', 'office_low', 'residential_tall', 'residential_house', 'industrial_factory', 'shop_corner', 'restaurant', 'civic_landmark'];
            const colors = [0x00e5ff, 0xff00ff, 0xff3399, 0x00ff88, 0x4488ff, 0xfffc00, 0xff3344, 0x9933ff];
            while (chapter.tasks.length < 8) {
              const nextIdx = chapter.tasks.length;
              const shape = shapes[nextIdx % shapes.length];
              const color = colors[nextIdx % colors.length];
              chapter.tasks.push({
                id: `${chId}_task_${nextIdx + 1}`,
                title: `${chapter.title} Task ${nextIdx + 1}`,
                desc: `Complete level challenge ${nextIdx + 1} in the beautiful ${chapter.title}.`,
                status: nextIdx === 0 ? 'unlocked' : 'locked',
                col: chapter.col, row: chapter.row,
                asset: { type: 'procedural', shape: shape, height: 0.35 + Math.random() * 0.4, primaryColor: color },
                rewards: [
                  { type: 'coin', value: 100 + nextIdx * 25, label: `${100 + nextIdx * 25} WYLD Coins`, icon: '🪙' },
                  { type: 'xp', value: 50, label: '50 Creator XP', icon: '⚡' }
                ]
              });
            }
          }
          allTasks.push(...chapter.tasks);
        }
      });

      saveJourneyState();

      // Find the task to focus
      const activeChId = state.activeRegion || chapterOrder[0];
      const activeChapter = ACTIVE_REGIONS[activeChId];
      let activeTaskId = null;
      if (activeChapter && activeChapter.tasks) {
        activeTaskId = activeChapter.tasks.find(t => t.status === 'unlocked')?.id || activeChapter.tasks[0]?.id;
      }

      levelMapInstance.setTasks(allTasks, activeTaskId);

      levelMapInstance.activate();
      
      // Hide City UI elements
      labelContainer.style.display = 'none';
      document.getElementById('hud').style.opacity = '0';
      document.getElementById('hud').style.pointerEvents = 'none';
      document.getElementById('timeline-container').style.display = 'none';

      // Open the sidebar details panel for the active chapter
      openPanel(activeChId);
    }
  };

  // Level task modal close
  document.getElementById('level-task-modal-close').onclick = () => {
    playClick();
    document.getElementById('level-task-modal').style.display = 'none';
  };

  // Setup tab switcher & forms inside Editor Panel
  setupEditorUIHandlers();

  updateHUD();
  updateTimelineUI();
  animate(0);
}

// ─── Entry animation trigger ────────────────────────────────────────────────
function startCityIntro() {
  state.isIntroActive = false;
  initAudio();

  startPlunge(camera, state.camTarget, () => {
    const trafficMeshes = [
      ...cars.map(c => { c.mesh.userData._groundY = 0.04; return c.mesh; }),
      ...citizens.map(c => { c.mesh.userData._groundY = 0; return c.mesh; }),
      ...animals.map(a => { a.mesh.userData._groundY = 0; return a.mesh; }),
    ];

    staggerPhasedReveal({
      treeClusters: phaseTreeClusters,
      props: phaseProps,
      traffic: trafficMeshes,
      buildings: phaseBuildings,
    });
    
    spawnedBuildingsMap.forEach(mesh => {
      gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(1.7)' });
    });
    spawnedTreesMap.forEach(mesh => {
      gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    });
    spawnedPropsMap.forEach(mesh => {
      gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    });

    updateTimelineUI();
  });
}

// ─── Camera ────────────────────────────────────────────────────────────────
function adjustZoom(amount) {
  state.zoomTarget = Math.max(30, Math.min(280, state.zoomTarget - amount * 10));
}
function resetView() {
  state.zoomTarget = 100;
  state.camTargetOffset.set(0, 0, 0);
}
function updateProjection() {
  const aspect = window.innerWidth / window.innerHeight;
  const d = 9 * (100 / state.zoomLevel);
  camera.left   = -d * aspect;
  camera.right  =  d * aspect;
  camera.top    =  d;
  camera.bottom = -d;
  camera.updateProjectionMatrix();
}

// ─── Pointer Interaction ───────────────────────────────────────────────────
function onPointerDown(e) {
  if (state.isIntroActive || state.currentView === 'level') return;
  state.isDragging = true;
  state.hasDragged = false;
  state.dragStart = { x: e.clientX, y: e.clientY };
}

function onPointerMove(e) {
  if (state.isIntroActive || state.currentView === 'level') return;
  mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (state.isDragging) {
    const dx = e.clientX - state.dragStart.x;
    const dy = e.clientY - state.dragStart.y;
    if (Math.hypot(dx, dy) > 4) {
      state.hasDragged = true;
    }
    const f  = 0.0012 * (100 / state.zoomLevel);
    state.camTargetOffset.x -= (dx - dy) * f;
    state.camTargetOffset.z += (dx + dy) * f;
    state.dragStart = { x: e.clientX, y: e.clientY };
  } else {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(scene.children, true);
    let found = null;
    for (const hit of hits) {
      let obj = hit.object;
      while (obj.parent && !obj.userData.isBuilding && !obj.userData.isCustomBuilding) obj = obj.parent;
      if (obj.userData.isBuilding || obj.userData.isCustomBuilding) { found = obj; break; }
    }

    const tooltip = document.getElementById('tooltip');
    if (found) {
      const rId = found.userData.regionId;
      if (hoveredBuilding !== found) {
        if (hoveredBuilding) gsap.to(hoveredBuilding.scale, { x:1, y:1, z:1, duration:0.18 });
        hoveredBuilding = found;
        gsap.to(hoveredBuilding.scale, { x:1.09, y:1.09, z:1.09, duration:0.18, ease:'power2.out' });
        playHover();
      }
      
      const title = found.userData.regionData?.title || found.userData.taskData?.title || "Custom Building";
      tooltip.textContent = title + (rId && state.locked[rId] ? ' 🔒' : '');
      tooltip.style.display = 'block';
      tooltip.style.left = `${e.clientX}px`;
      tooltip.style.top  = `${e.clientY}px`;
      document.body.style.cursor = (rId && state.locked[rId]) ? 'not-allowed' : 'pointer';
    } else {
      if (hoveredBuilding) {
        gsap.to(hoveredBuilding.scale, { x:1, y:1, z:1, duration:0.18 });
        hoveredBuilding = null;
      }
      tooltip.style.display = 'none';
      document.body.style.cursor = 'default';
    }
  }
}

function onPointerUp(e) {
  const dragged = state.hasDragged;
  state.isDragging = false;
  state.hasDragged = false;
  
  if (state.isIntroActive || state.currentView === 'level') return;
  if (dragged) return; 

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(raycastGroundPlane);
  if (hits.length > 0) {
    const hit = hits[0];
    const col = Math.round(hit.point.x + COLS / 2);
    const row = Math.round(hit.point.z + ROWS / 2);
    
    // Intercept click if picking coordinates for forms
    if (isPickingCoords) {
      const key = `${col},${row}`;
      if (state.customRoads.has(key)) {
        alert("Cannot place building or chapter center on a road! Please pick a different tile.");
        return;
      }
      // Check if coordinate is already occupied
      const editTaskId = document.getElementById('edit-task-id')?.value;
      const editChapterId = document.getElementById('edit-chapter-id')?.value;
      let occupied = false;
      
      for (const [coord, asset] of state.customBuildings.entries()) {
        if (coord === key) {
          const activeChId = document.getElementById('edit-task-chapter-id')?.value || state.activeRegion || chapterOrder[0];
          const taskObj = ACTIVE_REGIONS[activeChId]?.tasks?.find(t => t.id === editTaskId);
          if (taskObj && `${taskObj.col},${taskObj.row}` === key) {
            // allowed since it's the task we are currently editing
          } else {
            occupied = true;
          }
        }
      }
      
      for (const reg of Object.values(ACTIVE_REGIONS)) {
        if (reg.id !== editChapterId && reg.col === col && reg.row === row) {
          occupied = true;
        }
      }
      
      if (occupied) {
        alert("This tile is already occupied by a building or chapter center!");
        return;
      }

      if (isPickingCoords === 'chapter_center') {
        document.getElementById('chapter-coords-lbl').textContent = `${col}, ${row}`;
        document.getElementById('btn-chapter-pick-coord').setAttribute('data-col', col);
        document.getElementById('btn-chapter-pick-coord').setAttribute('data-row', row);
      } else if (isPickingCoords === 'task_location') {
        document.getElementById('task-coords-lbl').textContent = `${col}, ${row}`;
        document.getElementById('btn-task-pick-coord').setAttribute('data-col', col);
        document.getElementById('btn-task-pick-coord').setAttribute('data-row', row);
      }
      isPickingCoords = null;
      document.body.style.cursor = 'default';
      playUnlock();
      return;
    }

    // Intercept placement tools click
    if (state.editorActive && state.activeTool !== 'select') {
      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        handleEditorGridAction(col, row);
      }
      return;
    }
  }

  // Regular select click
  raycaster.setFromCamera(mouse, camera);
  const clickHits = raycaster.intersectObjects(scene.children, true);
  for (const hit of clickHits) {
    let obj = hit.object;
    while (obj.parent && !obj.userData.isBuilding && !obj.userData.isCustomBuilding) obj = obj.parent;
    if (obj.userData.isBuilding || obj.userData.isCustomBuilding) {
      const rId = obj.userData.regionId;
      if (!rId || !state.locked[rId]) {
        playClick();
        if (obj.userData.taskData) {
          openPanel(obj.userData.regionId || state.activeRegion || chapterOrder[0], obj.userData.taskData.id);
        } else {
          openPanel(rId);
        }
      }
      break;
    }
  }
}

function onWheel(e) {
  if (state.isIntroActive || state.currentView === 'level') return;
  adjustZoom(e.deltaY * 0.014);
}

// ─── Touch Event Handlers ──────────────────────────────────────────────────
let touchStartDist = 0;
let initialTouchZoom = 100;

function onTouchStart(e) {
  if (state.isIntroActive || state.currentView === 'level') return;
  if (e.touches.length === 1) {
    state.isDragging = true;
    state.hasDragged = false;
    state.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    state.isDragging = false;
    touchStartDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    initialTouchZoom = state.zoomLevel;
  }
}

function onTouchMove(e) {
  if (state.isIntroActive || state.currentView === 'level') return;
  
  if (e.touches.length === 1 && state.isDragging) {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - state.dragStart.x;
    const dy = touch.clientY - state.dragStart.y;
    if (Math.hypot(dx, dy) > 4) {
      state.hasDragged = true;
    }
    const f  = 0.0012 * (100 / state.zoomLevel);
    state.camTargetOffset.x -= (dx - dy) * f;
    state.camTargetOffset.z += (dx + dy) * f;
    state.dragStart = { x: touch.clientX, y: touch.clientY };
  } else if (e.touches.length === 2) {
    e.preventDefault();
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    if (touchStartDist > 0) {
      const factor = dist / touchStartDist;
      state.zoomTarget = Math.max(30, Math.min(280, initialTouchZoom * factor));
    }
  }
}

function onTouchEnd(e) {
  const dragged = state.hasDragged;
  state.isDragging = false;
  state.hasDragged = false;
  touchStartDist = 0;
}

// ─── Journey Progression & Timeline ────────────────────────────────────────
function completeTask(regionId, taskId) {
  playUnlock();
  const reg = ACTIVE_REGIONS[regionId];
  const taskIndex = reg.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;

  const task = reg.tasks[taskIndex];
  task.status = 'completed';

  const mesh = spawnedBuildingsMap.get(`${task.col},${task.row}`);
  if (mesh) {
    createConfettiBurst(scene, mesh.position);
    gsap.to(mesh.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.15, yoyo: true, repeat: 1 });
  }

  if (taskIndex < reg.tasks.length - 1) {
    reg.tasks[taskIndex + 1].status = 'unlocked';
  } else {
    const chIdx = chapterOrder.indexOf(regionId);
    if (chIdx < chapterOrder.length - 1) {
      const nextRegId = chapterOrder[chIdx + 1];
      state.locked[nextRegId] = false;
      activeChapterIndex = chIdx + 1;

      const nextReg = ACTIVE_REGIONS[nextRegId];
      if (nextReg.tasks && nextReg.tasks.length > 0) {
        nextReg.tasks[0].status = 'unlocked';
      }

      const nextObj = regionObjects[nextRegId];
      if (nextObj?.clouds) {
        tween(nextObj.clouds.scale, { x: 0, y: 0, z: 0 }, 900, 'cubic', () => {
          scene.remove(nextObj.clouds);
          nextObj.clouds = null;
        });
      }

      const nextMesh = regionObjects[nextRegId]?.mesh;
      if (nextMesh) {
        setTimeout(() => {
          createConfettiBurst(scene, nextMesh.position);
        }, 500);
      }
    }
  }

  if (levelMapInstance && state.currentView === 'level') {
    // Sync the updated status for all tasks back to levelMapInstance
    const allTasks = [];
    chapterOrder.forEach(chId => {
      const chapter = ACTIVE_REGIONS[chId];
      if (chapter && chapter.tasks) {
        chapter.tasks.forEach(t => {
          allTasks.push({
            ...t,
            regionId: chId,
            regionColor: chapter.color || 0x00e5ff
          });
        });
      }
    });
    levelMapInstance.orderedTasks = allTasks;
    
    // Play the pop animation which will then call setupRoadAndTasks() to redraw nodes with updated statuses
    levelMapInstance.animateTaskCompletion(taskId);
  }

  saveJourneyState();
  renderPanelTasks(regionId);
  updateTimelineUI();
  updateHUD();
}

function updateTimelineUI() {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  container.innerHTML = '';

  chapterOrder.forEach((chId, idx) => {
    const reg = ACTIVE_REGIONS[chId];
    if (!reg) return;
    const step = document.createElement('div');
    step.className = `timeline-step`;

    let status = 'locked';
    if (idx < activeChapterIndex) {
      status = 'completed';
    } else if (idx === activeChapterIndex) {
      status = 'active';
    }
    step.classList.add(status);

    const dot = document.createElement('div');
    dot.className = 'step-dot';
    dot.textContent = reg.emoji;
    step.appendChild(dot);

    const label = document.createElement('span');
    label.textContent = reg.title;
    step.appendChild(label);

    if (status !== 'locked') {
      step.onclick = () => {
        playClick();
        openPanel(chId);
      };
    }

    container.appendChild(step);

    if (idx < chapterOrder.length - 1) {
      const line = document.createElement('div');
      line.className = `timeline-line ${idx < activeChapterIndex ? 'active' : ''}`;
      container.appendChild(line);
    }
  });

  if (!state.isIntroActive && chapterOrder.length > 0) {
    container.style.opacity = '1';
  } else {
    container.style.opacity = '0';
  }
}

// ─── Panel ─────────────────────────────────────────────────────────────────
let currentPanelState = { view: 'chapter', regionId: null, taskId: null };

function openPanel(id, taskId = null) {
  if (!id) return;
  const r = ACTIVE_REGIONS[id];
  if (!r) return;

  state.activeRegion = id;
  const targetView = taskId ? 'task' : 'chapter';

  // Toggle DOM displays directly before opening
  document.getElementById('panel-chapter-view').style.display = targetView === 'chapter' ? 'block' : 'none';
  document.getElementById('panel-chapter-footer').style.display = targetView === 'chapter' ? 'block' : 'none';
  document.getElementById('panel-task-view').style.display = targetView === 'task' ? 'block' : 'none';
  document.getElementById('panel-task-footer').style.display = targetView === 'task' ? 'flex' : 'none';

  currentPanelState = { view: targetView, regionId: id, taskId };

  // Bind the appropriate data
  if (targetView === 'chapter') {
    bindChapterData(id);
  } else {
    bindTaskData(id, taskId);
  }

  // Open camera positioning
  if (state.currentView !== 'level') {
    // If a task is selected, try to center on the task building mesh, else the chapter mesh
    let targetMesh = null;
    if (taskId) {
      const taskObj = r.tasks?.find(t => t.id === taskId);
      if (taskObj) {
        targetMesh = spawnedBuildingsMap.get(`${taskObj.col},${taskObj.row}`);
      }
    }
    if (!targetMesh) {
      targetMesh = regionObjects[id]?.mesh;
    }

    if (targetMesh) {
      state.camTargetOffset.copy(targetMesh.position);
      state.zoomTarget = 145;
      
      const zs = 100 / 145;
      const isMobile = window.innerWidth <= 768;
      let offset;
      if (isMobile) {
        offset = new THREE.Vector3(-1.4 * zs, 0, -1.4 * zs);
      } else {
        offset = new THREE.Vector3(1.8 * zs, 0, -1.8 * zs);
      }
      state.camTargetOffset.add(offset);
    }
  }

  // Add open class to side drawer panel
  const panel = document.getElementById('panel');
  panel.classList.add('open');

  // Trigger entrance animations for the open view
  animateViewEntrance(targetView);
}

function animateViewEntrance(viewType) {
  const containerId = viewType === 'chapter' ? 'panel-chapter-view' : 'panel-task-view';
  const container = document.getElementById(containerId);
  if (!container) return;
  const elements = container.querySelectorAll('.anim-el');
  
  gsap.killTweensOf(elements);
  gsap.set(elements, { opacity: 0, x: 25 });
  
  gsap.to(elements, {
    opacity: 1,
    x: 0,
    duration: 0.35,
    stagger: 0.05,
    ease: 'power2.out'
  });

  const footerId = viewType === 'chapter' ? 'panel-chapter-footer' : 'panel-task-footer';
  const footerEl = document.getElementById(footerId);
  if (footerEl) {
    const footerChildren = footerEl.children;
    gsap.killTweensOf(footerChildren);
    gsap.set(footerChildren, { opacity: 0, y: 15 });
    gsap.to(footerChildren, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      delay: 0.15,
      ease: 'power2.out'
    });
  }
}

function applyPanelTheme(regionId) {
  const r = ACTIVE_REGIONS[regionId];
  if (!r) return;
  const themeColor = hexToCSSColor(r.color);

  // 1. Sidebar Glow
  const panel = document.getElementById('panel');
  if (panel) {
    panel.style.boxShadow = `-4px 0 32px ${themeColor}12, 0 8px 40px rgba(0,0,0,0.1)`;
  }

  // 2. Icon Border
  const panelIcon = document.getElementById('panel-icon');
  if (panelIcon) {
    panelIcon.style.borderColor = `${themeColor}40`;
    panelIcon.style.boxShadow = `0 4px 12px ${themeColor}15`;
  }

  // 3. Close Button
  const panelClose = document.getElementById('panel-close');
  if (panelClose) {
    panelClose.style.borderColor = `${themeColor}25`;
    panelClose.style.color = themeColor;
    panelClose.style.background = `${themeColor}0a`;
    panelClose.onmouseenter = () => { panelClose.style.background = `${themeColor}20`; };
    panelClose.onmouseleave = () => { panelClose.style.background = `${themeColor}0a`; };
  }
}

function bindChapterData(regionId) {
  const r = ACTIVE_REGIONS[regionId];
  if (!r) return;

  const themeColor = hexToCSSColor(r.color);
  applyPanelTheme(regionId);

  const header = document.getElementById('panel-header');
  if (header) {
    header.style.background = `linear-gradient(135deg, ${themeColor}22, ${themeColor}55)`;
  }
  document.getElementById('panel-icon').textContent  = r.emoji;
  document.getElementById('panel-title').textContent = r.title;
  
  const sub = document.getElementById('panel-sub');
  sub.textContent = r.sub || 'Timeline Chapter';
  sub.style.color = themeColor;

  document.getElementById('panel-desc').textContent  = r.desc;

  const ctaBtn = document.getElementById('panel-cta');
  ctaBtn.textContent   = r.cta || 'Explore Chapter';
  ctaBtn.style.display = r.unlocks ? 'block' : 'none';
  ctaBtn.style.background = `linear-gradient(135deg, ${themeColor}, #1a7f5a)`;
  ctaBtn.style.boxShadow = `0 4px 16px ${themeColor}44`;
  ctaBtn.onmouseenter = () => { ctaBtn.style.boxShadow = `0 8px 24px ${themeColor}66`; };
  ctaBtn.onmouseleave = () => { ctaBtn.style.boxShadow = `0 4px 16px ${themeColor}44`; };

  const brandUI = document.getElementById('brand-selector-ui');
  if (regionId === 'brands') {
    brandUI.style.display = 'flex';
    selectBrand(state.activeBrand);
  } else {
    brandUI.style.display = 'none';
  }

  renderPanelTasks(regionId);
}

function bindTaskData(regionId, taskId) {
  const r = ACTIVE_REGIONS[regionId];
  if (!r) return;
  const task = r.tasks?.find(t => t.id === taskId);
  if (!task) return;

  const themeColor = hexToCSSColor(r.color);
  applyPanelTheme(regionId);

  const header = document.getElementById('panel-header');
  if (header) {
    header.style.background = `linear-gradient(135deg, ${themeColor}22, ${themeColor}55)`;
  }
  document.getElementById('panel-icon').textContent  = r.emoji;
  document.getElementById('panel-task-title').textContent = task.title;
  
  const taskSub = document.getElementById('panel-task-sub');
  taskSub.textContent = `${r.title} — Task`;
  taskSub.style.color = themeColor;

  // Display description
  document.getElementById('panel-task-desc').textContent = task.desc || 'Complete the level challenge.';

  // Render rewards
  const rewardsList = document.getElementById('panel-task-rewards-list');
  rewardsList.innerHTML = '';

  const rewards = task.rewards || [
    { type: 'coin', value: 100, label: '100 WYLD Coins', icon: '🪙' },
    { type: 'xp', value: 50, label: '50 Creator XP', icon: '⚡' }
  ];

  rewards.forEach(reward => {
    const card = document.createElement('div');
    card.className = 'reward-card';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '12px';
    card.style.padding = '10px 14px';
    card.style.background = 'rgba(255, 255, 255, 0.06)';
    card.style.borderRadius = '12px';
    card.style.border = '1.5px solid rgba(255, 255, 255, 0.12)';

    const icon = document.createElement('span');
    icon.style.fontSize = '20px';
    icon.textContent = reward.icon || '🎁';
    card.appendChild(icon);

    const info = document.createElement('div');
    const label = document.createElement('div');
    label.style.fontSize = '12px';
    label.style.fontWeight = '800';
    label.style.color = '#ffffff';
    label.textContent = reward.label || reward.value;
    info.appendChild(label);

    const typeDesc = document.createElement('div');
    typeDesc.style.fontSize = '9px';
    typeDesc.style.color = '#a0c0b8';
    typeDesc.textContent = reward.type === 'coin' ? 'In-game Currency' :
                          reward.type === 'xp' ? 'Creator Experience' :
                          reward.type === 'badge' ? 'Exclusive Badge' :
                          'Campaign Reward';
    info.appendChild(typeDesc);
    card.appendChild(info);
    rewardsList.appendChild(card);
  });

  // Bind the Back Button
  const backBtn = document.getElementById('panel-task-back');
  backBtn.style.color = themeColor;
  backBtn.onclick = () => {
    playClick();
    transitionToView('chapter', regionId);
  };

  // Bind/Update Task CTA footer
  const taskCtaBtn = document.getElementById('panel-task-cta');
  const statusBar = document.getElementById('panel-task-status-bar');

  if (task.status === 'completed') {
    taskCtaBtn.style.display = 'none';
    statusBar.style.display = 'block';
    statusBar.style.color = '#1a7f5a';
    statusBar.innerHTML = '✅ Task Completed';
  } else if (task.status === 'unlocked') {
    taskCtaBtn.style.display = 'block';
    taskCtaBtn.textContent = 'Complete Task';
    statusBar.style.display = 'none';
    
    // Set custom colors based on region theme
    taskCtaBtn.style.background = `linear-gradient(135deg, ${themeColor}, #1a7f5a)`;
    taskCtaBtn.style.boxShadow = `0 4px 16px ${themeColor}44`;
    taskCtaBtn.onmouseenter = () => { taskCtaBtn.style.boxShadow = `0 8px 24px ${themeColor}66`; };
    taskCtaBtn.onmouseleave = () => { taskCtaBtn.style.boxShadow = `0 4px 16px ${themeColor}44`; };

    taskCtaBtn.onclick = (e) => {
      e.stopPropagation();
      gsap.to(taskCtaBtn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          completeTask(regionId, task.id);
        }
      });
    };
  } else {
    // locked
    taskCtaBtn.style.display = 'none';
    statusBar.style.display = 'block';
    statusBar.style.color = '#8aabcc';
    statusBar.innerHTML = '🔒 Task Locked';
  }
}

function transitionToView(viewType, regionId, taskId = null) {
  const fromView = currentPanelState.view;
  if (fromView === viewType && currentPanelState.regionId === regionId && currentPanelState.taskId === taskId) {
    return; // Already in this view
  }

  const fromContainerId = fromView === 'chapter' ? 'panel-chapter-view' : 'panel-task-view';
  const fromFooterId = fromView === 'chapter' ? 'panel-chapter-footer' : 'panel-task-footer';
  
  const fromContainer = document.getElementById(fromContainerId);
  const fromFooter = document.getElementById(fromFooterId);
  
  const leavingElements = [];
  if (fromContainer) leavingElements.push(...fromContainer.querySelectorAll('.anim-el'));
  if (fromFooter) leavingElements.push(...fromFooter.children);

  // Animate leaving elements OUT
  gsap.killTweensOf(leavingElements);
  gsap.to(leavingElements, {
    opacity: 0,
    x: viewType === 'task' ? -25 : 25, // Slide out left when moving forward to task, right when going back to chapter
    duration: 0.22,
    stagger: 0.02,
    ease: 'power2.in',
    onComplete: () => {
      // Toggle display
      if (fromContainer) fromContainer.style.display = 'none';
      if (fromFooter) fromFooter.style.display = 'none';

      // Update panel state
      currentPanelState = { view: viewType, regionId, taskId };

      // Bind data for the target view
      if (viewType === 'chapter') {
        bindChapterData(regionId);
      } else {
        bindTaskData(regionId, taskId);
      }

      // Show new container
      const toContainerId = viewType === 'chapter' ? 'panel-chapter-view' : 'panel-task-view';
      const toFooterId = viewType === 'chapter' ? 'panel-chapter-footer' : 'panel-task-footer';
      const toContainer = document.getElementById(toContainerId);
      const toFooter = document.getElementById(toFooterId);

      if (toContainer) {
        toContainer.style.display = 'block';
      }
      if (toFooter) {
        toFooter.style.display = 'flex';
      }

      // Animate entering elements IN
      const enteringElements = [];
      if (toContainer) enteringElements.push(...toContainer.querySelectorAll('.anim-el'));
      
      // Set starting position for entering elements
      gsap.killTweensOf(enteringElements);
      gsap.set(enteringElements, {
        opacity: 0,
        x: viewType === 'task' ? 25 : -25 // Slide in from right when going to task, left when going back to chapter
      });

      gsap.to(enteringElements, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.04,
        ease: 'power2.out'
      });

      if (toFooter) {
        const footerChildren = toFooter.children;
        gsap.killTweensOf(footerChildren);
        gsap.set(footerChildren, { opacity: 0, y: 15 });
        gsap.to(footerChildren, {
          opacity: 1,
          y: 0,
          duration: 0.28,
          delay: 0.1,
          ease: 'power2.out'
        });
      }
    }
  });
}

function renderPanelTasks(regionId) {
  const reg = ACTIVE_REGIONS[regionId];
  const listEl = document.getElementById('panel-tasks-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (!reg.tasks || reg.tasks.length === 0) {
    listEl.innerHTML = '<div style="font-size:12px; color:#6a90b8;">No tasks in this chapter.</div>';
    return;
  }

  const themeColor = hexToCSSColor(reg.color);
  reg.tasks.forEach(task => {
    const item = document.createElement('div');
    item.id = `task-item-${task.id}`;
    item.className = 'task-item';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '10px 14px';
    item.style.background = 'rgba(255, 255, 255, 0.06)';
    item.style.borderRadius = '12px';
    item.style.border = '1.5px solid rgba(255, 255, 255, 0.12)';
    item.style.cursor = 'pointer';

    item.onclick = () => {
      playClick();
      transitionToView('task', regionId, task.id);
    };

    const info = document.createElement('div');
    info.style.flex = '1';
    info.style.paddingRight = '10px';

    const title = document.createElement('div');
    title.style.fontSize = '12px';
    title.style.fontWeight = '800';
    title.style.color = '#ffffff';
    title.textContent = task.title;
    info.appendChild(title);

    const desc = document.createElement('div');
    desc.style.fontSize = '10px';
    desc.style.color = '#a0c0b8';
    desc.style.marginTop = '2px';
    desc.textContent = task.desc;
    info.appendChild(desc);

    item.appendChild(info);

    const actionArea = document.createElement('div');
    if (task.status === 'completed') {
      actionArea.innerHTML = '<span style="color:#4ade80; font-weight:800; font-size:12px;">✅ Done</span>';
    } else if (task.status === 'unlocked') {
      const btn = document.createElement('button');
      btn.textContent = 'View';
      btn.style.padding = '6px 12px';
      btn.style.borderRadius = '8px';
      btn.style.border = 'none';
      btn.style.background = `linear-gradient(135deg, ${themeColor}, #1a7f5a)`;
      btn.style.color = 'white';
      btn.style.fontWeight = '800';
      btn.style.fontSize = '10px';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
      btn.style.boxShadow = `0 2px 8px ${themeColor}33`;
      btn.onmouseenter = () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = `0 4px 12px ${themeColor}55`;
      };
      btn.onmouseleave = () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = `0 2px 8px ${themeColor}33`;
      };
      btn.onclick = (e) => {
        e.stopPropagation();
        playClick();
        transitionToView('task', regionId, task.id);
      };
      actionArea.appendChild(btn);
    } else {
      actionArea.innerHTML = '<span style="color:#8aabcc; font-size:11px;">🔒 Locked</span>';
    }
    item.appendChild(actionArea);
    listEl.appendChild(item);
  });
}

function onCta() {
  const id = state.activeRegion;
  if (!id) return;
  const r = ACTIVE_REGIONS[id];
  if (!r.unlocks || !state.locked[r.unlocks]) return;

  playUnlock();
  state.locked[r.unlocks] = false;
  document.getElementById('panel').classList.remove('open');

  const targetMesh = regionObjects[r.unlocks]?.mesh;
  if (targetMesh) createConfettiBurst(scene, targetMesh.position);

  const obj = regionObjects[r.unlocks];
  if (obj?.clouds) {
    tween(obj.clouds.scale, { x:0, y:0, z:0 }, 900, 'cubic', () => {
      scene.remove(obj.clouds);
      obj.clouds = null;
    });
  }

  setTimeout(() => { openPanel(r.unlocks); updateHUD(); }, 920);
}

function selectBrand(brandId) {
  state.activeBrand = brandId;
  const brand = BRANDS[brandId];
  const brandColor = hexToCSSColor(brand.primaryColor);

  document.querySelectorAll('.brand-tab').forEach(tab => {
    const isActive = tab.getAttribute('data-brand') === brandId;
    tab.classList.toggle('active', isActive);
    if (isActive) {
      tab.style.background = `${brandColor}22`;
      tab.style.color = brandColor;
      tab.style.borderColor = `${brandColor}45`;
      tab.style.borderWidth = '1.5px';
      tab.style.borderStyle = 'solid';
    } else {
      tab.style.background = 'none';
      tab.style.color = '';
      tab.style.borderColor = 'transparent';
    }
  });

  const sub = document.getElementById('panel-sub');
  sub.textContent = `${brand.name} — ${brand.tagline}`;
  sub.style.color = brandColor;

  const ctaBtn = document.getElementById('panel-cta');
  if (ctaBtn) {
    ctaBtn.style.background = `linear-gradient(135deg, ${brandColor}, #1a7f5a)`;
    ctaBtn.style.boxShadow = `0 4px 16px ${brandColor}44`;
    ctaBtn.onmouseenter = () => { ctaBtn.style.boxShadow = `0 8px 24px ${brandColor}66`; };
    ctaBtn.onmouseleave = () => { ctaBtn.style.boxShadow = `0 4px 16px ${brandColor}44`; };
  }

  document.getElementById('panel-desc').innerHTML =
    `<strong>Featured Product:</strong> ${brand.product}<br/><br/>
     Discover collaborative campaigns and redeem exclusive tokens from ${brand.name} inside WYLD Town!`;
}

function updateHUD() {
  const total    = Object.keys(state.locked).length;
  const unlocked = Object.values(state.locked).filter(l => !l).length;
  const pct      = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  document.getElementById('prog-pct').textContent  = pct + '%';
  document.getElementById('prog-fill').style.width = pct + '%';
}

// ─── Spawner Helpers ────────────────────────────────────────────────────────
function spawnBuildingAtCell(col, row, assetConfig) {
  const key = `${col},${row}`;
  if (spawnedBuildingsMap.has(key)) {
    scene.remove(spawnedBuildingsMap.get(key));
    spawnedBuildingsMap.delete(key);
  }

  const mesh = createCustomBuilding(scene, assetConfig, col, row, COLS, ROWS);
  
  let boundTask = null;
  let boundChapterId = null;
  for (const reg of Object.values(ACTIVE_REGIONS)) {
    if (!reg.tasks) continue;
    const task = reg.tasks.find(t => t.col === col && t.row === row);
    if (task) {
      boundTask = task;
      boundChapterId = reg.id;
      break;
    }
  }

  mesh.userData.isCustomBuilding = true;
  if (boundTask) {
    mesh.userData.taskData = boundTask;
    mesh.userData.regionId = boundChapterId;
  }

  spawnedBuildingsMap.set(key, mesh);
  if (!state.isIntroActive) {
    gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(1.5)' });
  }
  return mesh;
}

function spawnTreeAtCell(col, row, type) {
  const key = `${col},${row}`;
  if (spawnedTreesMap.has(key)) {
    scene.remove(spawnedTreesMap.get(key));
    spawnedTreesMap.delete(key);
  }
  const mesh = createTree(scene, col, row, COLS, ROWS, type);
  spawnedTreesMap.set(key, mesh);
  if (!state.isIntroActive) {
    gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
  }
  return mesh;
}

function spawnPropAtCell(col, row, type) {
  const key = `${col},${row}`;
  if (spawnedPropsMap.has(key)) {
    scene.remove(spawnedPropsMap.get(key));
    spawnedPropsMap.delete(key);
  }
  let mesh;
  if (type === 'bench') mesh = createBench(scene, col, row, COLS, ROWS);
  else if (type === 'lamp') mesh = createLampPost(scene, col, row, COLS, ROWS);
  else if (type === 'billboard') mesh = createNeonBillboard(scene, col, row, COLS, ROWS);

  if (mesh) {
    spawnedPropsMap.set(key, mesh);
    if (!state.isIntroActive) {
      gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
    }
  }
  return mesh;
}

function spawnDecorVehicleAtCell(col, row, type) {
  const key = `${col},${row}`;
  if (spawnedDecorVehiclesMap.has(key)) {
    scene.remove(spawnedDecorVehiclesMap.get(key));
    spawnedDecorVehiclesMap.delete(key);
  }
  const mesh = createCar(scene, null, type);
  const x = col - COLS / 2;
  const z = row - ROWS / 2;
  mesh.position.set(x, 0.04, z);
  spawnedDecorVehiclesMap.set(key, mesh);
  if (!state.isIntroActive) {
    gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
  }
  return mesh;
}

function rebuildChaptersAndLabels() {
  // Clear old labels
  const oldLabels = labelContainer.querySelectorAll('.building-label');
  oldLabels.forEach(l => l.remove());
  
  // Clear old region clouds
  Object.values(regionObjects).forEach(obj => {
    if (obj.clouds) {
      scene.remove(obj.clouds);
    }
  });

  // Clear region objects
  for (const key in regionObjects) {
    delete regionObjects[key];
  }

  // Bind chapters and cloud cover
  Object.values(ACTIVE_REGIONS).forEach(region => {
    // Find active building mesh representing this chapter
    const mainMesh = spawnedBuildingsMap.get(`${region.col},${region.row}`) || null;

    const label = document.createElement('div');
    label.className = 'building-label';
    label.textContent = region.emoji;
    labelContainer.appendChild(label);

    regionObjects[region.id] = { mesh: mainMesh, labelElement: label, data: region, clouds: null };

    if (state.locked[region.id]) {
      regionObjects[region.id].clouds = createRegionCloudCover(
        scene, region.id, region.col, region.row, COLS, ROWS
      );
    }
  });

  // Rebuild the ground landmasses & canals, then update the roads to spawn bridges over new canals
  rebuildCityGround(scene, ACTIVE_REGIONS, COLS, ROWS);
  regenerateRoadNetwork();
}

// ─── Placement Palette Event Action ─────────────────────────────────────────
function handleEditorGridAction(col, row) {
  const key = `${col},${row}`;
  
  if (state.activeTool === 'road') {
    if (state.customRoads.has(key)) {
      state.customRoads.delete(key);
      removeDynamicRoadCell(scene, col, row);
    } else {
      // Clear any conflicting decorative assets on this tile
      if (state.customBuildings.has(key)) {
        state.customBuildings.delete(key);
        if (spawnedBuildingsMap.has(key)) {
          scene.remove(spawnedBuildingsMap.get(key));
          spawnedBuildingsMap.delete(key);
        }
      }
      if (state.customTrees.has(key)) {
        state.customTrees.delete(key);
        if (spawnedTreesMap.has(key)) {
          scene.remove(spawnedTreesMap.get(key));
          spawnedTreesMap.delete(key);
        }
      }
      if (state.customProps.has(key)) {
        state.customProps.delete(key);
        if (spawnedPropsMap.has(key)) {
          scene.remove(spawnedPropsMap.get(key));
          spawnedPropsMap.delete(key);
        }
      }
      if (state.customVehicles.has(key)) {
        state.customVehicles.delete(key);
        if (spawnedDecorVehiclesMap.has(key)) {
          scene.remove(spawnedDecorVehiclesMap.get(key));
          spawnedDecorVehiclesMap.delete(key);
        }
      }

      state.customRoads.add(key);
      addDynamicRoadCell(scene, col, row, COLS, ROWS);
    }
    // Update Traffic.js routing
    ROAD_SET.clear();
    state.customRoads.forEach(coord => ROAD_SET.add(coord));
    initNavigationGrids();
  } 
  
  else if (state.activeTool === 'tree') {
    // Prevent placing trees on roads or other occupied cells
    if (state.customRoads.has(key) || state.customBuildings.has(key) || state.customTrees.has(key) || state.customProps.has(key) || state.customVehicles.has(key)) {
      return;
    }
    const type = document.getElementById('sel-tree-type').value;
    state.customTrees.set(key, type);
    spawnTreeAtCell(col, row, type);
  } 
  
  else if (state.activeTool === 'prop') {
    // Prevent placing props on roads or other occupied cells
    if (state.customRoads.has(key) || state.customBuildings.has(key) || state.customTrees.has(key) || state.customProps.has(key) || state.customVehicles.has(key)) {
      return;
    }
    const type = document.getElementById('sel-prop-type').value;
    state.customProps.set(key, type);
    spawnPropAtCell(col, row, type);
  }

  else if (state.activeTool === 'vehicle') {
    // Prevent placing vehicles on roads or other occupied cells
    if (state.customRoads.has(key) || state.customBuildings.has(key) || state.customTrees.has(key) || state.customProps.has(key) || state.customVehicles.has(key)) {
      return;
    }
    const type = document.getElementById('sel-vehicle-type').value;
    state.customVehicles.set(key, type);
    spawnDecorVehicleAtCell(col, row, type);
  }
  
  else if (state.activeTool === 'clear') {
    // Clear everything at this coordinate
    if (state.customRoads.has(key)) {
      state.customRoads.delete(key);
      removeDynamicRoadCell(scene, col, row);
    }
    if (state.customBuildings.has(key)) {
      state.customBuildings.delete(key);
    }
    if (spawnedBuildingsMap.has(key)) {
      scene.remove(spawnedBuildingsMap.get(key));
      spawnedBuildingsMap.delete(key);
    }
    if (state.customTrees.has(key)) {
      state.customTrees.delete(key);
    }
    if (spawnedTreesMap.has(key)) {
      scene.remove(spawnedTreesMap.get(key));
      spawnedTreesMap.delete(key);
    }
    if (state.customProps.has(key)) {
      state.customProps.delete(key);
    }
    if (spawnedPropsMap.has(key)) {
      scene.remove(spawnedPropsMap.get(key));
      spawnedPropsMap.delete(key);
    }
    if (state.customVehicles.has(key)) {
      state.customVehicles.delete(key);
    }
    if (spawnedDecorVehiclesMap.has(key)) {
      scene.remove(spawnedDecorVehiclesMap.get(key));
      spawnedDecorVehiclesMap.delete(key);
    }
  }

  saveJourneyState();
  serializeConfigToTextarea();
}

// ─── City Editor Panel Manager ──────────────────────────────────────────────
function setupEditorUIHandlers() {
  const btnEditor = document.getElementById('btn-editor');
  const panel = document.getElementById('editor-panel');
  const btnClose = document.getElementById('editor-close');

  btnEditor.onclick = () => {
    state.editorActive = !state.editorActive;
    panel.classList.toggle('open', state.editorActive);
    btnEditor.style.background = state.editorActive ? '#2563eb' : '';
    btnEditor.style.color = state.editorActive ? '#fff' : '';
    
    // Default to selector tool when opening editor
    selectEditorTool('select');
    serializeConfigToTextarea();
    renderChaptersUIList();
  };

  btnClose.onclick = () => {
    state.editorActive = false;
    panel.classList.remove('open');
    btnEditor.style.background = '';
    btnEditor.style.color = '';
  };

  // Tab switching setup
  const tabs = ['chapters', 'palette', 'io'];
  tabs.forEach(tab => {
    const el = document.getElementById(`tab-${tab}`);
    if (el) {
      el.onclick = () => selectEditorTab(tab);
    }
  });

  // Palette tool switching setup
  const tools = ['select', 'road', 'tree', 'prop', 'vehicle', 'clear'];
  tools.forEach(tool => {
    const el = document.getElementById(`tool-${tool}`);
    if (el) {
      el.onclick = () => selectEditorTool(tool);
    }
  });

  // Task form asset class toggle
  const taskAssetSelect = document.getElementById('task-asset-class');
  taskAssetSelect.onchange = (e) => {
    document.getElementById('task-proc-fields').style.display = e.target.value === 'procedural' ? 'flex' : 'none';
    document.getElementById('task-gltf-fields').style.display = e.target.value === 'external_gltf' ? 'flex' : 'none';
  };

  // Value display setup for sliders
  const setupSlider = (sliderId, labelId) => {
    const slider = document.getElementById(sliderId);
    const label = document.getElementById(labelId);
    if (slider && label) {
      slider.oninput = (e) => {
        label.textContent = e.target.value;
      };
    }
  };
  setupSlider('task-proc-height', 'val-task-proc-height');
  setupSlider('task-gltf-scale', 'val-task-gltf-scale');
  setupSlider('task-gltf-rot', 'val-task-gltf-rot');

  // Chapter picker
  document.getElementById('btn-chapter-pick-coord').onclick = (e) => {
    e.preventDefault();
    isPickingCoords = 'chapter_center';
    document.body.style.cursor = 'crosshair';
    alert("Click on any grid tile on the map to set the Chapter center!");
  };

  // Task picker
  document.getElementById('btn-task-pick-coord').onclick = (e) => {
    e.preventDefault();
    isPickingCoords = 'task_location';
    document.body.style.cursor = 'crosshair';
    alert("Click on any grid tile on the map to set the Task building location!");
  };

  // Chapter save/cancel
  document.getElementById('btn-chapter-save').onclick = (e) => {
    e.preventDefault();
    saveChapterForm();
  };
  document.getElementById('btn-chapter-cancel').onclick = (e) => {
    e.preventDefault();
    toggleChapterForm(false);
  };
  document.getElementById('btn-add-chapter').onclick = () => {
    openChapterFormForCreate();
  };

  // Task save/cancel
  document.getElementById('btn-task-save').onclick = (e) => {
    e.preventDefault();
    saveTaskForm();
  };
  document.getElementById('btn-task-cancel').onclick = (e) => {
    e.preventDefault();
    toggleTaskForm(false);
  };

  // IO buttons
  document.getElementById('btn-save-local').onclick = () => {
    saveJourneyState();
    alert("Journey timeline successfully saved to browser local storage!");
  };
  document.getElementById('btn-load-preset').onclick = () => {
    if (confirm("This will overwrite your current canvas with the default WYLD City preset. Continue?")) {
      loadDefaultPreset();
    }
  };
  document.getElementById('btn-reset-canvas').onclick = () => {
    if (confirm("Are you sure you want to clear the entire map and start with a blank canvas?")) {
      resetToBlankCanvas();
    }
  };

  // JSON controls
  document.getElementById('editor-apply-json').onclick = () => {
    try {
      const configStr = document.getElementById('config-json').value;
      const json = JSON.parse(configStr);
      applyJourneyConfigJSON(json);
      playUnlock();
    } catch(err) {
      alert("Invalid JSON config format: " + err.message);
    }
  };

  document.getElementById('editor-copy-json').onclick = () => {
    const txt = document.getElementById('config-json');
    txt.select();
    document.execCommand('copy');
    alert("JSON Config copied to clipboard!");
  };
}

function selectEditorTab(tab) {
  const tabs = ['chapters', 'palette', 'io'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-${t}`);
    const content = document.getElementById(`editor-content-${t}`);
    if (btn && content) {
      btn.classList.toggle('active', t === tab);
      btn.style.color = t === tab ? '#2563eb' : '#8aabcc';
      btn.style.borderBottom = t === tab ? '2px solid #2563eb' : 'none';
      content.style.display = t === tab ? 'flex' : 'none';
    }
  });

  // Footer is only relevant for IO JSON apply
  document.getElementById('editor-io-footer').style.display = tab === 'io' ? 'flex' : 'none';
  serializeConfigToTextarea();
}

function selectEditorTool(tool) {
  state.activeTool = tool;
  const tools = ['select', 'road', 'tree', 'prop', 'vehicle', 'clear'];
  tools.forEach(t => {
    const el = document.getElementById(`tool-${t}`);
    if (el) el.classList.toggle('active', t === tool);
  });

  // Toggle placement palette submenus
  document.getElementById('opt-tree').style.display = tool === 'tree' ? 'flex' : 'none';
  document.getElementById('opt-prop').style.display = tool === 'prop' ? 'flex' : 'none';
  document.getElementById('opt-vehicle').style.display = tool === 'vehicle' ? 'flex' : 'none';
}

// ─── Chapter & Task Form Bindings ───────────────────────────────────────────
function renderChaptersUIList() {
  const container = document.getElementById('editor-chapters-list');
  if (!container) return;
  container.innerHTML = '';

  if (chapterOrder.length === 0) {
    container.innerHTML = '<div style="font-size:12px; color:#8aabcc; text-align:center; padding:10px;">No chapters created yet. Click "+ Add Chapter" to create your first region!</div>';
    return;
  }

  chapterOrder.forEach(chId => {
    const reg = ACTIVE_REGIONS[chId];
    if (!reg) return;

    const row = document.createElement('div');
    row.style.background = 'rgba(255,255,255,0.6)';
    row.style.border = '1px solid rgba(37,99,235,0.08)';
    row.style.borderRadius = '16px';
    row.style.padding = '14px';
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    row.style.gap = '10px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const titleInfo = document.createElement('div');
    titleInfo.style.display = 'flex';
    titleInfo.style.alignItems = 'center';
    titleInfo.style.gap = '6px';
    titleInfo.style.fontWeight = '800';
    titleInfo.style.fontSize = '13px';
    titleInfo.style.color = '#1e3a5f';
    titleInfo.innerHTML = `<span style="font-size:16px;">${reg.emoji}</span> ${reg.title}`;

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '4px';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.style.border = 'none'; editBtn.style.background = 'none'; editBtn.style.cursor = 'pointer';
    editBtn.onclick = () => openChapterFormForEdit(chId);

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.style.border = 'none'; delBtn.style.background = 'none'; delBtn.style.cursor = 'pointer';
    delBtn.onclick = () => deleteChapter(chId);

    controls.appendChild(editBtn);
    controls.appendChild(delBtn);
    header.appendChild(titleInfo);
    header.appendChild(controls);
    row.appendChild(header);

    // List Chapter Tasks
    const taskList = document.createElement('div');
    taskList.style.display = 'flex';
    taskList.style.flexDirection = 'column';
    taskList.style.gap = '6px';
    taskList.style.borderLeft = '2px solid rgba(37,99,235,0.1)';
    taskList.style.paddingLeft = '10px';
    taskList.style.marginLeft = '6px';

    if (reg.tasks && reg.tasks.length > 0) {
      reg.tasks.forEach(t => {
        const taskItem = document.createElement('div');
        taskItem.style.display = 'flex';
        taskItem.style.justifyContent = 'space-between';
        taskItem.style.fontSize = '11px';
        taskItem.style.color = '#5a7898';

        const name = document.createElement('span');
        name.textContent = `• ${t.title} (${t.col}, ${t.row})`;

        const taskControls = document.createElement('div');
        taskControls.style.display = 'flex';
        taskControls.style.gap = '6px';

        const taskEdit = document.createElement('span');
        taskEdit.textContent = '✏️';
        taskEdit.style.cursor = 'pointer';
        taskEdit.onclick = () => openTaskFormForEdit(chId, t.id);

        const taskDel = document.createElement('span');
        taskDel.textContent = '🗑️';
        taskDel.style.cursor = 'pointer';
        taskDel.onclick = () => deleteTask(chId, t.id);

        taskControls.appendChild(taskEdit);
        taskControls.appendChild(taskDel);
        taskItem.appendChild(name);
        taskItem.appendChild(taskControls);
        taskList.appendChild(taskItem);
      });
    }

    const addTaskBtn = document.createElement('button');
    addTaskBtn.textContent = '+ Add Task';
    addTaskBtn.style.alignSelf = 'flex-start';
    addTaskBtn.style.border = 'none'; addTaskBtn.style.background = 'none'; addTaskBtn.style.color = '#2563eb';
    addTaskBtn.style.fontSize = '11px'; addTaskBtn.style.fontWeight = '800'; addTaskBtn.style.cursor = 'pointer';
    addTaskBtn.style.marginTop = '4px';
    addTaskBtn.onclick = () => openTaskFormForCreate(chId);

    row.appendChild(taskList);
    row.appendChild(addTaskBtn);
    container.appendChild(row);
  });
}

function toggleChapterForm(show) {
  document.getElementById('form-chapter').style.display = show ? 'flex' : 'none';
  document.getElementById('btn-add-chapter').style.display = show ? 'none' : 'block';
  if (!show) {
    document.getElementById('chapter-title-input').value = '';
    document.getElementById('chapter-emoji-input').value = '';
    document.getElementById('chapter-desc-input').value = '';
    document.getElementById('chapter-coords-lbl').textContent = 'Unset';
    document.getElementById('edit-chapter-id').value = '';
    isPickingCoords = null;
    document.body.style.cursor = 'default';
  }
}

function openChapterFormForCreate() {
  toggleChapterForm(true);
  document.getElementById('form-chapter-title').textContent = 'Add Chapter';
  document.getElementById('edit-chapter-id').value = '';
}

function openChapterFormForEdit(chId) {
  const reg = ACTIVE_REGIONS[chId];
  if (!reg) return;
  toggleChapterForm(true);
  document.getElementById('form-chapter-title').textContent = 'Edit Chapter';
  document.getElementById('edit-chapter-id').value = chId;
  document.getElementById('chapter-title-input').value = reg.title;
  document.getElementById('chapter-emoji-input').value = reg.emoji;
  document.getElementById('chapter-color-input').value = '#' + reg.color.toString(16).padStart(6, '0');
  document.getElementById('chapter-desc-input').value = reg.desc;
  document.getElementById('chapter-coords-lbl').textContent = `${reg.col}, ${reg.row}`;
  document.getElementById('btn-chapter-pick-coord').setAttribute('data-col', reg.col);
  document.getElementById('btn-chapter-pick-coord').setAttribute('data-row', reg.row);
}

function saveChapterForm() {
  const title = document.getElementById('chapter-title-input').value.trim();
  const emoji = document.getElementById('chapter-emoji-input').value.trim() || '🏢';
  const colorHex = document.getElementById('chapter-color-input').value;
  const color = parseInt(colorHex.replace('#', '0x'));
  const desc = document.getElementById('chapter-desc-input').value.trim() || 'A timeline destination region.';
  
  const colVal = document.getElementById('btn-chapter-pick-coord').getAttribute('data-col');
  const rowVal = document.getElementById('btn-chapter-pick-coord').getAttribute('data-row');
  
  if (!title) { alert("Please specify a chapter title."); return; }
  if (colVal === null || rowVal === null) { alert("Please pick a center coordinate on the map."); return; }

  const col = parseInt(colVal);
  const row = parseInt(rowVal);
  const key = `${col},${row}`;

  if (state.customRoads.has(key)) {
    alert("Cannot place chapter center on a road! Please pick a different coordinate.");
    return;
  }

  // Clear any conflicting decorative assets on this tile
  if (state.customTrees.has(key)) {
    state.customTrees.delete(key);
    if (spawnedTreesMap.has(key)) {
      scene.remove(spawnedTreesMap.get(key));
      spawnedTreesMap.delete(key);
    }
  }
  if (state.customProps.has(key)) {
    state.customProps.delete(key);
    if (spawnedPropsMap.has(key)) {
      scene.remove(spawnedPropsMap.get(key));
      spawnedPropsMap.delete(key);
    }
  }
  if (state.customVehicles.has(key)) {
    state.customVehicles.delete(key);
    if (spawnedDecorVehiclesMap.has(key)) {
      scene.remove(spawnedDecorVehiclesMap.get(key));
      spawnedDecorVehiclesMap.delete(key);
    }
  }

  const editId = document.getElementById('edit-chapter-id').value;
  let chId = editId;
  
  if (!editId) {
    // Generate new unique ID
    chId = 'chapter_' + Date.now();
    ACTIVE_REGIONS[chId] = {
      id: chId, title, emoji, color, desc, col, row,
      unlocks: null, cta: 'Complete Chapter', tasks: []
    };
    chapterOrder.push(chId);
    
    // Unlocks progression setup
    if (chapterOrder.length > 1) {
      const prevChId = chapterOrder[chapterOrder.length - 2];
      ACTIVE_REGIONS[prevChId].unlocks = chId;
      ACTIVE_REGIONS[prevChId].cta = `Unlock ${title}`;
    }
  } else {
    // Edit existing
    const reg = ACTIVE_REGIONS[chId];
    reg.title = title;
    reg.emoji = emoji;
    reg.color = color;
    reg.desc = desc;
    reg.col = col;
    reg.row = row;
  }

  // Sync locked/timeline states
  recalculateLockedTimelineStates();

  toggleChapterForm(false);
  saveJourneyState();
  renderChaptersUIList();
  updateTimelineUI();
  updateHUD();
}

function deleteChapter(chId) {
  if (confirm("Are you sure you want to delete this chapter and all its tasks?")) {
    const reg = ACTIVE_REGIONS[chId];
    if (reg.tasks) {
      reg.tasks.forEach(t => {
        const key = `${t.col},${t.row}`;
        if (spawnedBuildingsMap.has(key)) {
          scene.remove(spawnedBuildingsMap.get(key));
          spawnedBuildingsMap.delete(key);
        }
        state.customBuildings.delete(key);
      });
    }

    delete ACTIVE_REGIONS[chId];
    const idx = chapterOrder.indexOf(chId);
    if (idx !== -1) {
      chapterOrder.splice(idx, 1);
    }

    // Relink remaining chapter unlocks
    for (let i = 0; i < chapterOrder.length; i++) {
      const current = ACTIVE_REGIONS[chapterOrder[i]];
      if (i < chapterOrder.length - 1) {
        const next = ACTIVE_REGIONS[chapterOrder[i+1]];
        current.unlocks = next.id;
        current.cta = `Unlock ${next.title}`;
      } else {
        current.unlocks = null;
        current.cta = '🏆 Complete!';
      }
    }

    recalculateLockedTimelineStates();
    saveJourneyState();
    renderChaptersUIList();
    updateTimelineUI();
    updateHUD();
  }
}

function toggleTaskForm(show) {
  document.getElementById('form-task').style.display = show ? 'flex' : 'none';
  if (!show) {
    document.getElementById('task-title-input').value = '';
    document.getElementById('task-desc-input').value = '';
    document.getElementById('task-coords-lbl').textContent = 'Unset';
    document.getElementById('edit-task-chapter-id').value = '';
    document.getElementById('edit-task-id').value = '';
    isPickingCoords = null;
    document.body.style.cursor = 'default';
  }
}

function openTaskFormForCreate(chId) {
  toggleTaskForm(true);
  document.getElementById('form-task-title').textContent = 'Add Task';
  document.getElementById('edit-task-chapter-id').value = chId;
  document.getElementById('edit-task-id').value = '';
}

function openTaskFormForEdit(chId, taskId) {
  const reg = ACTIVE_REGIONS[chId];
  if (!reg) return;
  const task = reg.tasks.find(t => t.id === taskId);
  if (!task) return;

  toggleTaskForm(true);
  document.getElementById('form-task-title').textContent = 'Edit Task';
  document.getElementById('edit-task-chapter-id').value = chId;
  document.getElementById('edit-task-id').value = taskId;
  document.getElementById('task-title-input').value = task.title;
  document.getElementById('task-desc-input').value = task.desc;
  document.getElementById('task-coords-lbl').textContent = `${task.col}, ${task.row}`;
  document.getElementById('btn-task-pick-coord').setAttribute('data-col', task.col);
  document.getElementById('btn-task-pick-coord').setAttribute('data-row', task.row);

  const asset = task.asset || { type: 'procedural', shape: 'office_tower', height: 0.5 };
  document.getElementById('task-asset-class').value = asset.type;
  document.getElementById('task-proc-fields').style.display = asset.type === 'procedural' ? 'flex' : 'none';
  document.getElementById('task-gltf-fields').style.display = asset.type === 'external_gltf' ? 'flex' : 'none';

  if (asset.type === 'procedural') {
    document.getElementById('task-proc-shape').value = asset.shape || 'office_tower';
    document.getElementById('task-proc-height').value = asset.height || 0.5;
    document.getElementById('val-task-proc-height').textContent = asset.height || 0.5;
  } else {
    document.getElementById('task-gltf-url').value = asset.url || '';
    document.getElementById('task-gltf-scale').value = asset.scale || 0.5;
    document.getElementById('val-task-gltf-scale').textContent = asset.scale || 0.5;
    document.getElementById('task-gltf-rot').value = Math.round((asset.rotation || 0) * 180 / Math.PI);
    document.getElementById('val-task-gltf-rot').textContent = Math.round((asset.rotation || 0) * 180 / Math.PI);
  }
}

function saveTaskForm() {
  const chId = document.getElementById('edit-task-chapter-id').value;
  const editTaskId = document.getElementById('edit-task-id').value;
  const reg = ACTIVE_REGIONS[chId];
  if (!reg) return;

  const title = document.getElementById('task-title-input').value.trim();
  const desc = document.getElementById('task-desc-input').value.trim() || 'Task goals';
  const colVal = document.getElementById('btn-task-pick-coord').getAttribute('data-col');
  const rowVal = document.getElementById('btn-task-pick-coord').getAttribute('data-row');

  if (!title) { alert("Please specify a task title."); return; }
  if (colVal === null || rowVal === null) { alert("Please pick the task coordinates on the map."); return; }

  const col = parseInt(colVal);
  const row = parseInt(rowVal);
  const key = `${col},${row}`;

  if (state.customRoads.has(key)) {
    alert("Cannot place building on a road! Please pick a different coordinate.");
    return;
  }

  // Clear any conflicting decorative assets on this tile
  if (state.customTrees.has(key)) {
    state.customTrees.delete(key);
    if (spawnedTreesMap.has(key)) {
      scene.remove(spawnedTreesMap.get(key));
      spawnedTreesMap.delete(key);
    }
  }
  if (state.customProps.has(key)) {
    state.customProps.delete(key);
    if (spawnedPropsMap.has(key)) {
      scene.remove(spawnedPropsMap.get(key));
      spawnedPropsMap.delete(key);
    }
  }
  if (state.customVehicles.has(key)) {
    state.customVehicles.delete(key);
    if (spawnedDecorVehiclesMap.has(key)) {
      scene.remove(spawnedDecorVehiclesMap.get(key));
      spawnedDecorVehiclesMap.delete(key);
    }
  }

  // Build Asset config
  const type = document.getElementById('task-asset-class').value;
  let asset;
  if (type === 'procedural') {
    asset = {
      type: 'procedural',
      shape: document.getElementById('task-proc-shape').value,
      height: parseFloat(document.getElementById('task-proc-height').value),
      primaryColor: reg.color
    };
  } else {
    asset = {
      type: 'external_gltf',
      url: document.getElementById('task-gltf-url').value.trim(),
      scale: parseFloat(document.getElementById('task-gltf-scale').value),
      rotation: (parseFloat(document.getElementById('task-gltf-rot').value) * Math.PI) / 180,
      yOffset: 0
    };
  }

  state.customBuildings.set(key, asset);

  if (!editTaskId) {
    // Create new
    const taskId = 'task_' + Date.now();
    const taskStatus = (reg.tasks.length === 0 && chapterOrder.indexOf(chId) === activeChapterIndex) ? 'unlocked' : 'locked';
    reg.tasks.push({
      id: taskId, title, desc, col, row, asset, status: taskStatus
    });
  } else {
    // Edit existing
    const task = reg.tasks.find(t => t.id === editTaskId);
    if (task) {
      task.title = title;
      task.desc = desc;
      task.col = col;
      task.row = row;
      task.asset = asset;
    }
  }

  // Spawn building on map immediately
  spawnBuildingAtCell(col, row, asset);

  // Auto-connect task roads
  regenerateRoadNetwork();

  // Refresh labels & regions
  rebuildChaptersAndLabels();

  toggleTaskForm(false);
  saveJourneyState();
  renderChaptersUIList();
}

function deleteTask(chId, taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    const reg = ACTIVE_REGIONS[chId];
    if (!reg) return;
    const idx = reg.tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      const task = reg.tasks[idx];
      const key = `${task.col},${task.row}`;
      if (spawnedBuildingsMap.has(key)) {
        scene.remove(spawnedBuildingsMap.get(key));
        spawnedBuildingsMap.delete(key);
      }
      state.customBuildings.delete(key);
      reg.tasks.splice(idx, 1);
    }

    recalculateLockedTimelineStates();
    regenerateRoadNetwork();
    rebuildChaptersAndLabels();
    saveJourneyState();
    renderChaptersUIList();
  }
}

function recalculateLockedTimelineStates() {
  state.locked = {};
  chapterOrder.forEach((chId, idx) => {
    // Welcome chapter (idx 0) is unlocked. Subsequent chapters are locked until completed.
    state.locked[chId] = (idx > 0);
  });
  
  // Set active chapter index to the first locked chapter
  activeChapterIndex = chapterOrder.findIndex(chId => state.locked[chId]);
  if (activeChapterIndex === -1) {
    activeChapterIndex = Math.max(0, chapterOrder.length - 1);
  }

  // Set active chapter tasks locked/unlocked
  chapterOrder.forEach((chId, idx) => {
    const reg = ACTIVE_REGIONS[chId];
    if (!reg || !reg.tasks) return;
    reg.tasks.forEach((t, tIdx) => {
      if (idx < activeChapterIndex) {
        t.status = 'completed';
      } else if (idx === activeChapterIndex) {
        // Active chapter tasks: first task is unlocked, others are locked
        t.status = (tIdx === 0) ? 'unlocked' : 'locked';
      } else {
        t.status = 'locked';
      }
    });
  });
}

// ─── Serialization JSON IO ──────────────────────────────────────────────────
function serializeConfigToTextarea() {
  const json = {
    chapters: ACTIVE_REGIONS,
    chapterOrder,
    activeChapterIndex,
    roads: Array.from(state.customRoads),
    buildings: Array.from(state.customBuildings.entries()),
    trees: Array.from(state.customTrees.entries()),
    props: Array.from(state.customProps.entries()),
    vehicles: Array.from(state.customVehicles.entries())
  };
  document.getElementById('config-json').value = JSON.stringify(json, null, 2);
}

function applyJourneyConfigJSON(json) {
  clearEntireSceneMeshes();

  ACTIVE_REGIONS = json.chapters || {};
  chapterOrder = json.chapterOrder || [];
  activeChapterIndex = json.activeChapterIndex ?? 0;

  // Restore locks
  chapterOrder.forEach((chId, idx) => {
    state.locked[chId] = (idx > activeChapterIndex);
  });

  // Roads
  state.customRoads = new Set(json.roads || []);
  state.customRoads.forEach(coord => {
    const [c, r] = coord.split(',').map(Number);
    addDynamicRoadCell(scene, c, r, COLS, ROWS);
  });

  // Buildings
  state.customBuildings = new Map(json.buildings || []);
  state.customBuildings.forEach((config, key) => {
    const [col, row] = key.split(',').map(Number);
    spawnBuildingAtCell(col, row, config);
  });

  // Trees
  state.customTrees = new Map(json.trees || []);
  state.customTrees.forEach((type, key) => {
    const [col, row] = key.split(',').map(Number);
    spawnTreeAtCell(col, row, type);
  });

  // Props
  state.customProps = new Map(json.props || []);
  state.customProps.forEach((type, key) => {
    const [col, row] = key.split(',').map(Number);
    spawnPropAtCell(col, row, type);
  });

  // Vehicles
  state.customVehicles = new Map(json.vehicles || []);
  state.customVehicles.forEach((type, key) => {
    const [col, row] = key.split(',').map(Number);
    spawnDecorVehicleAtCell(col, row, type);
  });

  rebuildChaptersAndLabels();
  saveJourneyState();
  updateTimelineUI();
  updateHUD();
  renderChaptersUIList();
}

function saveJourneyState() {
  const stateData = {
    chapters: ACTIVE_REGIONS,
    chapterOrder,
    activeChapterIndex,
    roads: Array.from(state.customRoads),
    buildings: Array.from(state.customBuildings.entries()),
    trees: Array.from(state.customTrees.entries()),
    props: Array.from(state.customProps.entries()),
    vehicles: Array.from(state.customVehicles.entries())
  };
  localStorage.setItem('wyld_town_journey_state', JSON.stringify(stateData));
}

function loadJourneyState() {
  const saved = localStorage.getItem('wyld_town_journey_state');
  if (!saved) {
    // Start with a blank canvas
    resetToBlankCanvas();
    return;
  }
  try {
    const data = JSON.parse(saved);
    ACTIVE_REGIONS = data.chapters || {};
    chapterOrder = data.chapterOrder || [];
    activeChapterIndex = data.activeChapterIndex ?? 0;

    // Auto-upgrade: add new chapters if they are missing from saved state
    let upgraded = false;
    for (const key in REGIONS) {
      if (!ACTIVE_REGIONS[key]) {
        ACTIVE_REGIONS[key] = JSON.parse(JSON.stringify(REGIONS[key]));
        upgraded = true;
      }
    }
    for (const key in REGIONS) {
      if (!chapterOrder.includes(key)) {
        chapterOrder.push(key);
        upgraded = true;
      }
    }

    chapterOrder.forEach((chId, idx) => {
      state.locked[chId] = (idx > activeChapterIndex);
    });

    state.customRoads = new Set(data.roads || []);
    state.customBuildings = new Map(data.buildings || []);
    state.customTrees = new Map(data.trees || []);
    state.customProps = new Map(data.props || []);
    state.customVehicles = new Map(data.vehicles || []);

    if (upgraded) {
      saveJourneyState();
    }
  } catch(e) {
    console.error("Failed to parse local storage journey state:", e);
    resetToBlankCanvas();
  }
}

function clearEntireSceneMeshes() {
  // Clear buildings
  spawnedBuildingsMap.forEach(mesh => scene.remove(mesh));
  spawnedBuildingsMap.clear();
  
  // Clear trees
  spawnedTreesMap.forEach(mesh => scene.remove(mesh));
  spawnedTreesMap.clear();

  // Clear props
  spawnedPropsMap.forEach(mesh => scene.remove(mesh));
  spawnedPropsMap.clear();

  // Clear vehicles
  spawnedDecorVehiclesMap.forEach(mesh => scene.remove(mesh));
  spawnedDecorVehiclesMap.clear();

  // Clear roads
  state.customRoads.forEach(coord => {
    const [c, r] = coord.split(',').map(Number);
    removeDynamicRoadCell(scene, c, r);
  });
  state.customRoads.clear();
}

function resetToBlankCanvas() {
  clearEntireSceneMeshes();
  
  ACTIVE_REGIONS = {};
  chapterOrder = [];
  activeChapterIndex = 0;
  state.locked = {};
  state.customBuildings.clear();
  state.customTrees.clear();
  state.customProps.clear();
  state.customVehicles.clear();

  rebuildChaptersAndLabels();
  saveJourneyState();
  updateTimelineUI();
  updateHUD();
  renderChaptersUIList();
  serializeConfigToTextarea();
}

function loadDefaultPreset() {
  clearEntireSceneMeshes();

  ACTIVE_REGIONS = JSON.parse(JSON.stringify(REGIONS));
  chapterOrder = Object.keys(ACTIVE_REGIONS);
  activeChapterIndex = 0;

  // Set default locks
  chapterOrder.forEach((chId, idx) => {
    state.locked[chId] = (idx > 0);
  });

  // Load default preset buildings
  chapterOrder.forEach(chId => {
    const reg = ACTIVE_REGIONS[chId];
    reg.tasks.forEach(t => {
      state.customBuildings.set(`${t.col},${t.row}`, t.asset);
      spawnBuildingAtCell(t.col, t.row, t.asset);
    });
  });

  // Load default preset trees
  TREE_CLUSTERS.forEach(cluster => {
    cluster.positions.forEach(p => {
      state.customTrees.set(`${p.c},${p.r}`, cluster.type);
      spawnTreeAtCell(p.c, p.r, cluster.type);
    });
  });

  // Load default preset props
  LAMP_POSTS.forEach(p => {
    state.customProps.set(`${p.c},${p.r}`, 'lamp');
    spawnPropAtCell(p.c, p.r, 'lamp');
  });
  BENCHES.forEach(p => {
    state.customProps.set(`${p.c},${p.r}`, 'bench');
    spawnPropAtCell(p.c, p.r, 'bench');
  });
  BILLBOARDS.forEach(p => {
    state.customProps.set(`${p.c},${p.r}`, 'billboard');
    spawnPropAtCell(p.c, p.r, 'billboard');
  });

  // Dynamic connected roads
  state.customRoads = generateDynamicRoadNetwork();
  state.customRoads.forEach(coord => {
    const [c, r] = coord.split(',').map(Number);
    addDynamicRoadCell(scene, c, r, COLS, ROWS);
  });

  ROAD_SET.clear();
  state.customRoads.forEach(coord => ROAD_SET.add(coord));
  initNavigationGrids();

  rebuildChaptersAndLabels();
  saveJourneyState();
  updateTimelineUI();
  updateHUD();
  renderChaptersUIList();
  serializeConfigToTextarea();
}

// ─── Render Loop ───────────────────────────────────────────────────────────
function animate(time) {
  requestAnimationFrame(animate);

  if (state.currentView === 'level' && levelMapInstance) {
    levelMapInstance.update(time / 1000);
    renderer.render(levelMapInstance.scene, levelMapInstance.camera);
    return;
  }

  if (state.isIntroActive) {
    updateIntroClouds(time);
  } else {
    state.camTarget.lerp(state.camTargetOffset, 0.05);
    if (Math.abs(state.zoomLevel - state.zoomTarget) > 0.02) {
      state.zoomLevel += (state.zoomTarget - state.zoomLevel) * 0.06;
      updateProjection();
    }
    
    const zs = 100 / state.zoomLevel;
    camera.position.set(
      state.camTarget.x + 12 * zs,
      state.camTarget.y + 14 * zs,
      state.camTarget.z + 12 * zs
    );
    camera.lookAt(state.camTarget);
  }

  const camp = regionObjects['campaigns'];
  if (camp?.mesh?.userData.beacon) {
    const p = 1 + Math.sin(time * 0.007) * 0.28;
    camp.mesh.userData.beacon.scale.setScalar(p);
  }

  const anal = regionObjects['analytics'];
  if (anal?.mesh?.userData.holoRing) {
    anal.mesh.userData.holoRing.rotation.z = time * 0.001;
    anal.mesh.userData.holoRing.position.y = 0.6 + Math.sin(time * 0.004) * 0.04;
  }

  updateSmartSimulation(time);
  updateWindSway(time);
  updateBrandAnimations(time);

  const tempV = new THREE.Vector3();
  Object.values(regionObjects).forEach(obj => {
    if (!obj.mesh) return;
    tempV.setFromMatrixPosition(obj.mesh.matrixWorld);
    const hOff = obj.data.id === 'brands' ? 1.3 : obj.data.id === 'campaigns' ? 1.1 : 0.6;
    tempV.y += hOff;
    tempV.project(camera);
    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;
    obj.labelElement.style.left    = `${x}px`;
    obj.labelElement.style.top     = `${y}px`;
    obj.labelElement.style.opacity =
      (tempV.z > 1.0 || state.isIntroActive || state.locked[obj.data.id]) ? '0' : '1';
  });

  composer.render();
}

init();

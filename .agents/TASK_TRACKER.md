# WYLD Town — Agile Task Tracker

> **READ THIS at the start of every new session** to find the next task.
> Mark stories `[x]` complete and `[→]` in-progress after each session.

Legend: `[ ]` Backlog · `[→]` Ready / In Progress · `[x]` Done · `[-]` Deferred

---

## Sprint 1 — Foundation & Scaffold

### US-01 · Vite + React Scaffold
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Bootstrap the Vite + React project in-place, replacing the Python server.  
**Acceptance Criteria:**
- [x] `package.json` created with all MVP dependencies installed
- [x] `vite.config.js` with `@` alias pointing to `src/`
- [x] `index.html` stripped to Vite entry `<div id="root">`
- [x] `src/index.css` with all CSS migrated from old `index.html` + Google Fonts
- [x] `src/main.jsx` with `ReactDOM.createRoot` entry
- [x] `.gitignore` updated with `node_modules/`, `dist/`
- [x] `npm run dev` starts without errors
- [x] `npm run build` succeeds
- [x] Old files removed: `src/main.js`, `src/utils.js`, `src/core/`, `src/intro/`, `src/brands/`

**Completion note:** Build ✓ (143 kB JS bundle), Lint ✓ 0 errors. `src/world/` excluded from ESLint (legacy browser globals).

---

### US-02 · Chapter Config Extension
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Extend `src/config.js` with the `theme` object and 10 demo tasks for the Welcome chapter.  
**Acceptance Criteria:**
- [x] `REGIONS.welcome.theme` added with: `skyColors`, `groundColor`, `parallaxColor`, `landColor`, `roadColor`, `accentColor`, `assets`
- [x] `REGIONS.welcome.tasks` has exactly 10 tasks with unique `col`/`row`, `status`, `asset`, and `rewards`
- [x] Task 1 status `'unlocked'`, tasks 2–10 status `'locked'`
- [x] No other files modified
- [x] `src/config.js` remains valid ES module (no React imports)

**Files touched:** `src/config.js` only  
**Do NOT touch:** Any component or store file

---

### US-03 · Asset Resolver Utility
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Create the abstraction layer between JSON config and Three.js geometry.  
**Acceptance Criteria:**
- [x] `src/shared/utils/assetResolver.js` created
- [x] `resolveAsset(assetConfig)` function exported — returns `THREE.Group`
- [x] Supports `type: 'procedural'` → calls correct factory from `Buildings.js`
- [x] Supports `type: 'gltf'` → loads via `GLTFLoader` with in-memory cache (async)
- [x] JSDoc on all exported functions
- [x] Zero React imports in this file

**Files touched:** `src/shared/utils/assetResolver.js`

---

## Sprint 2 — State Stores

### US-04 · Journey Store (Zustand)
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Global task/chapter progression state with localStorage persistence.  
**Acceptance Criteria:**
- [x] `src/features/journey/store/journeyStore.js` created
- [x] `persist` middleware with key `wyld_town_v2`
- [x] `immer` middleware for nested state updates
- [x] State shape: `{ tasks, activeTaskId, chapterOrder, completedTaskIds }`
- [x] Actions: `completeTask(taskId)`, `setActiveTask(taskId)`, `reset()`
- [x] `completeTask` correctly unlocks the next task in sequence
- [x] `src/features/journey/index.js` barrel export

**Files touched:** `src/features/journey/store/journeyStore.js`, `src/features/journey/index.js`

---

### US-05 · City Store (Zustand)
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Camera, view, and panel state for the city canvas.  
**Acceptance Criteria:**
- [x] `src/features/city/store/cityStore.js` created
- [x] State: `currentView`, `isIntroActive`, `zoomLevel`, `zoomTarget`, `camTargetOffset`, `panelOpen`, `panelView`, `activeRegionId`, `activeTaskId`, `hoveredMeshId`
- [x] Actions: `setView`, `openPanel`, `closePanel`, `panCamera`, `setZoom`, `setHovered`
- [x] `src/features/city/index.js` barrel export

**Files touched:** `src/features/city/store/cityStore.js`, `src/features/city/index.js`

---

## Sprint 3 — App Shell & UI

### US-06 · App Shell + Title Overlay
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Root React app with conditional view rendering and splash screen.  
**Acceptance Criteria:**
- [x] `src/app/App.jsx` renders `<TitleOverlay>` when `isIntroActive === true`
- [x] `src/app/App.jsx` renders `<div id="city-container">` and `<div id="level-container">` with `display: none/block` based on `currentView`
- [x] `src/shared/components/TitleOverlay.jsx` renders the WYLD splash with "Enter WYLD Town" button
- [x] Button click sets `isIntroActive = false` in `cityStore` via `useGSAP` fade-out animation
- [x] `npm run dev` → overlay appears on load

**Files touched:** `src/app/App.jsx`, `src/shared/components/TitleOverlay.jsx`

---

### US-07 · HUD Component
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Top-left HUD with zoom controls + view toggle button.  
**Acceptance Criteria:**
- [x] `src/shared/components/HUD.jsx` created
- [x] Renders zoom in/out/reset buttons — dispatch to `cityStore`
- [x] Renders "Level Map / City Map" toggle button — dispatches `setView`
- [x] Hidden during intro (`isIntroActive === true`)
- [x] `React.memo` applied

**Files touched:** `src/shared/components/HUD.jsx`, `src/app/App.jsx`  
**Completion note:** Added HUD.jsx with GSAP fade-in. Checked with linter and build, both passed perfectly.

---

### US-08 · Panel Component (Chapter + Task Views)
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Right-side detail drawer with chapter view and task view.  
**Acceptance Criteria:**
- [x] `src/shared/components/Panel.jsx` created
- [x] `<ChapterView>` sub-component: shows chapter title, emoji, desc, task list
- [x] `<TaskView>` sub-component: shows task title, desc, rewards, "Complete Task" button
- [x] "Complete Task" calls `journeyStore.completeTask(taskId)`
- [x] GSAP slide-in animation on open (uses `useGSAP`)
- [x] Task list items are clickable → `journeyStore.setActiveTask` + switch to `<TaskView>`

**Files touched:** `src/shared/components/Panel.jsx`, `src/app/App.jsx`  
**Completion note:** Panel component fully implemented with responsive GSAP slide animations. Checked with linter and build.

---

## Sprint 4 — City Canvas (R3F)

### US-09 · City Canvas Shell + Lights
**Status:** `[x]` Done — 2026-07-20  
**Goal:** R3F Canvas with isometric camera, fog, and lighting matching the original Engine.js.  
**Acceptance Criteria:**
- [x] `src/features/city/components/CityCanvas.jsx` — R3F `<Canvas>` with orthographic camera
- [x] `src/features/city/components/SceneLights.jsx` — hemisphere + directional sun + fill
- [x] Camera position: `(12, 14, 12)` looking at origin (matching Engine.js)
- [x] Background color `0xc8e6f5`, fog `FogExp2(0xc8e6f5, 0.012)`
- [x] `<EffectComposer>` + `<Bloom threshold={0.85} strength={0.18} radius={0.3} />`
- [x] `npm run dev` → sky-blue background visible

**Files touched:** `src/features/city/components/CityCanvas.jsx`, `src/features/city/components/SceneLights.jsx`, `src/features/city/index.js`, `src/app/App.jsx`

---

### US-10 · Camera Controller Hook
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Smooth zoom and pan camera behaviour via Zustand state.  
**Acceptance Criteria:**
- [x] `src/features/city/hooks/useCameraController.js` created
- [x] `useFrame` lerps `camTarget` toward `camTargetOffset`
- [x] `useFrame` smoothly interpolates `zoomLevel` toward `zoomTarget`
- [x] `updateProjection()` updates orthographic frustum correctly
- [x] No `setState` inside `useFrame`

**Completion note:** Smooth lerping and orthographic camera frustum update verified inside R3F frame loop.
**Files touched:** `src/features/city/hooks/useCameraController.js`, `src/features/city/components/CityCanvas.jsx`, `src/features/city/index.js`

---

### US-11 · Pointer Interaction Hook
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Pan drag, wheel zoom, pinch zoom handled as a clean hook.  

**Acceptance Criteria:**
- [x] `src/features/city/hooks/usePointerInteraction.js` created
- [x] Pan drag updates `cityStore.camTargetOffset`
- [x] Mouse wheel updates `cityStore.zoomTarget`
- [x] Two-finger pinch updates `cityStore.zoomTarget`
- [x] Returns event handler object attached to canvas `<div>`
- [x] Disabled during `isIntroActive` and `currentView === 'level'`

**Completion note:** Added drag pan, mouse wheel, and pinch-to-zoom hook. Build and lint verified.
**Files touched:** `src/features/city/hooks/usePointerInteraction.js`, `src/features/city/components/CityCanvas.jsx`, `src/features/city/index.js`

---

### US-12 · Ground Layer
**Status:** `[x]` Done — 2026-07-20  
**Goal:** Voronoi island ground rendered from chapter config.  
**Acceptance Criteria:**
- [x] `src/features/city/components/GroundLayer.jsx` created
- [x] Calls `rebuildCityGround(activeRegions, COLS, ROWS)` from `Ground.js` in `useMemo`
- [x] `<primitive object={group} />` with proper disposal on unmount
- [x] Chapter `theme.landColor` applied to region land material
- [x] Visual match to original ground rendering

**Completion note:** Refactored rebuildCityGround to output a THREE.Group, integrated GroundLayer inside CityCanvas, and verified disposal on unmount.
**Files touched:** `src/features/city/components/GroundLayer.jsx`, `src/features/city/components/CityCanvas.jsx`, `src/world/Ground.js`, `src/config.js`

---

### US-13 · Roads Layer
**Status:** `[→]` Ready  
**Goal:** Dynamic road network generated from chapter task positions.  
**Acceptance Criteria:**
- [ ] `src/features/city/components/RoadsLayer.jsx` created
- [ ] `useJourneyRoads` hook (or inline logic) generates road set from task `col/row` positions
- [ ] Calls `addDynamicRoadCell` from `Ground.js` for each road cell
- [ ] Cleans up removed roads on re-render
- [ ] Visual match to original road rendering

**Files touched:** `src/features/city/components/RoadsLayer.jsx`

---

### US-14 · Buildings Layer
**Status:** `[ ]` Backlog  
**Goal:** Task buildings rendered from chapter config, with hover + click interactions.  
**Acceptance Criteria:**
- [ ] `src/features/city/components/BuildingsLayer.jsx` created
- [ ] Iterates `journeyStore.tasks`, calls `assetResolver.resolveAsset(task.asset)`
- [ ] R3F `onPointerEnter` → `cityStore.setHovered(meshId)` → tooltip shows
- [ ] R3F `onClick` → `cityStore.openPanel(regionId, taskId)` → panel opens
- [ ] Hover scale animation via `useRef` + `useFrame` (NOT setState)
- [ ] `React.memo` applied

**Files touched:** `src/features/city/components/BuildingsLayer.jsx`

---

### US-15 · Region Labels + Intro Starfield
**Status:** `[ ]` Backlog  
**Goal:** 3D HTML labels over the chapter center + intro starfield effect.  
**Acceptance Criteria:**
- [ ] `src/features/city/components/RegionLabels.jsx` — `@react-three/drei` `<Html>` label over chapter center
- [ ] `src/features/city/components/IntroStarfield.jsx` — starfield from `IntroManager.js` logic
- [ ] Starfield `visible` only when `isIntroActive === true`
- [ ] Starfield rotated via `ref` in `useFrame` (no setState)
- [ ] Labels hidden during intro

**Files touched:** `src/features/city/components/RegionLabels.jsx`, `src/features/city/components/IntroStarfield.jsx`

---

## Sprint 5 — Level Map

### US-16 · Level Map Canvas (Faithful Rebuild)
**Status:** `[ ]` Backlog  
**Goal:** Wrap existing LevelMap.js class in a React R3F canvas, preserving all visuals exactly.  
**Acceptance Criteria:**
- [ ] `src/features/level-map/hooks/useLevelMap.js` created — manages `LevelMap` instance lifecycle
- [ ] `src/features/level-map/components/LevelMapCanvas.jsx` — separate `<Canvas>` wrapping the class
- [ ] `LevelMap` instance created in `useEffect`, destroyed on unmount
- [ ] `levelMapInstance.setTasks(orderedTasks, activeTaskId)` called when `journeyStore.tasks` changes
- [ ] `useFrame` calls `levelMapInstance.update(clock.elapsedTime)`
- [ ] Task click → `journeyStore.setActiveTask(task.id)` + `cityStore.openPanel`
- [ ] Visual match to original Level Map (globe, road, candy nodes, parallax)

**Files touched:** `src/features/level-map/hooks/useLevelMap.js`, `src/features/level-map/components/LevelMapCanvas.jsx`, `src/features/level-map/index.js`

---

## Sprint 6 — Integration & Polish

### US-17 · End-to-End Integration
**Status:** `[ ]` Backlog  
**Goal:** Wire all features together and verify the full user journey works.  
**Acceptance Criteria:**
- [ ] Title overlay → intro → city map renders with ground, roads, 10 buildings
- [ ] Click building → panel opens with chapter/task data
- [ ] "Complete Task" → task completes → next unlocks → confetti
- [ ] Toggle to Level Map → task nodes show correct status
- [ ] Click task node → panel opens
- [ ] Journey state persists on refresh
- [ ] `npm run lint` → 0 errors
- [ ] `npm run build` → 0 errors, bundle < 5 MB

**Files touched:** `src/app/App.jsx` (wiring only)

---

### US-18 · Tooltip Component
**Status:** `[ ]` Backlog  
**Goal:** Floating tooltip that follows the pointer over 3D buildings.  
**Acceptance Criteria:**
- [ ] `src/shared/components/Tooltip.jsx` created
- [ ] Reads `cityStore.hoveredMeshId` to get building title
- [ ] Follows mouse position (CSS `position: fixed` + `left/top` from pointer event)
- [ ] Hidden when `hoveredMeshId === null`

**Files touched:** `src/shared/components/Tooltip.jsx`

---

## Completion Summary

| Sprint | Stories | Done |
|---|---|---|
| Sprint 1 — Foundation | US-01, US-02, US-03 | 3/3 |
| Sprint 2 — Stores | US-04, US-05 | 2/2 |
| Sprint 3 — Shell & UI | US-06, US-07, US-08 | 3/3 |
| Sprint 4 — City Canvas | US-09 → US-15 | 3/7 |
| Sprint 5 — Level Map | US-16 | 0/1 |
| Sprint 6 — Polish | US-17, US-18 | 0/2 |
| **Total** | **18 stories** | **11/18** |



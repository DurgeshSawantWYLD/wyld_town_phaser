# WYLD Town — Project Rules (React + R3F)

These rules are **MANDATORY** for all code written in this project. They encode
industry-standard patterns, SOLID principles, and R3F-specific best practices
derived from the most-downloaded React ecosystem libraries.

---

## 1. Tech Stack (Locked — Do Not Deviate)

| Concern | Library | npm Rank |
|---|---|---|
| Build | **Vite** (React template) | #1 bundler |
| UI Framework | **React 18+** | — |
| 3D Rendering | **@react-three/fiber** (R3F) | — |
| 3D Helpers | **@react-three/drei** | — |
| Post-processing | **@react-three/postprocessing** | — |
| Global State | **Zustand** | #1 lightweight state mgr |
| Animations | **GSAP** (npm, not CDN) | #1 animation library |
| Forms (if needed) | **React Hook Form** | #1 form library |
| Validation (if needed) | **Zod** | Universal companion to RHF |
| Routing (if needed) | **React Router v6+** | #1 routing library |

**Never use:** Redux, MobX, Recoil, Formik, Axios (use native `fetch` instead).

---

## 2. Project Structure — Feature-Based (Mandatory)

```
src/
├── app/                      # App bootstrap, providers, root routes
│   ├── App.jsx
│   └── providers.jsx
├── features/                 # Self-contained domain modules
│   ├── city/                 # City canvas + interaction
│   │   ├── components/       # R3F scene components (GroundLayer, BuildingsLayer…)
│   │   ├── hooks/            # usePointerInteraction, useCameraController, useRoadNetwork
│   │   ├── store/            # cityStore.js (Zustand slice)
│   │   └── index.js          # Public API (barrel export)
│   ├── level-map/            # LevelMap canvas feature
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.js
│   ├── editor/               # City editor panel feature
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.js
│   ├── journey/              # Journey/chapter progression logic
│   │   ├── hooks/            # useJourneyState, useChapterProgression
│   │   ├── store/            # journeyStore.js
│   │   └── index.js
│   └── brands/               # Brand showcase feature
│       ├── components/
│       └── index.js
├── shared/                   # Truly cross-feature reusables
│   ├── components/           # TitleOverlay, HUD, Panel, Timeline, Tooltip
│   ├── hooks/                # useLocalStorage, useWindowSize
│   └── utils/                # hexToCSSColor, tween, findPath, ROAD_SET
├── world/                    # Pure Three.js geometry factories (NO React imports)
│   ├── Buildings.js
│   ├── Ground.js
│   ├── Props.js
│   ├── Traffic.js
│   └── LevelMap.js
├── core/                     # Non-visual singletons
│   └── Sound.js
└── config.js                 # Game constants (COLS, ROWS, REGIONS…)
```

### Structure Rules
- **Barrel exports:** Every feature directory MUST have an `index.js` that defines its public API. Never import from deep inside another feature's directory.
- **Co-location:** If a hook is used by only one component, keep it in that component's `hooks/` subfolder.
- **Max depth:** Never exceed 4 directory levels deep.
- **World layer is React-free:** Files in `src/world/` MUST NOT import from React or R3F. They are pure Three.js factories. This enforces DIP and testability.

---

## 3. SOLID Principles (Applied to React + R3F)

### S — Single Responsibility
- Each component renders ONE visual concept (e.g., `GroundLayer`, `BuildingsLayer`).
- Each custom hook manages ONE concern (e.g., `usePointerInteraction` — pointer only; `useCameraController` — camera only).
- Never mix data-fetching logic and UI in the same component. Use a Container/Presentational split.

### O — Open/Closed
- Extend components via **composition** (`children`, render props, compound components).
- Never add boolean "mode" props like `isEditor`, `isNight`. Instead, render different components.
- R3F layers are composable — add new world layers by adding `<NewLayer />` to the scene, not by modifying existing ones.

### L — Liskov Substitution
- All presentational layer components must accept a standard set of props without side effects.
- R3F `<primitive object={...} />` wrappers must always clean up (`dispose`) on unmount.

### I — Interface Segregation
- Pass only the props a component needs. Never pass an entire store slice if only one field is needed.
- Use Zustand selectors: `const zoomLevel = useGameStore(s => s.zoomLevel)` — not `const state = useGameStore()`.
- In Zustand selectors, always select the minimum required slice to prevent unnecessary re-renders.

### D — Dependency Inversion
- Components must NOT import concrete Three.js factory functions directly. Instead, they call them inside `useEffect` or `useMemo` and receive the resulting `THREE.Object3D` via hook return values.
- Sound, storage, and other side-effect services are injected via hooks (`useSound()`, `useJourneyState()`), not imported inline inside components.

---

## 4. R3F-Specific Rules (Performance-Critical)

### Frame Loop
- **NEVER call `setState` inside `useFrame`.** Use `ref.current` for per-frame mutations.
- Always accept and use `delta` for frame-rate-independent motion:
  ```js
  useFrame((state, delta) => { ref.current.rotation.y += delta; });
  ```
- Keep `useFrame` callbacks lightweight. Move expensive calculations to `useEffect` or a service.

### Memory & Geometry
- **Always dispose** geometry and materials on unmount:
  ```js
  useEffect(() => {
    return () => { geometry.dispose(); material.dispose(); };
  }, []);
  ```
- Use `useMemo` for geometries and materials shared across instances.
- Use `InstancedMesh` for repeated objects (trees, lamp posts, road tiles) — never render >50 of the same mesh individually.

### Object Visibility vs Mounting
- **Prefer `visible={false}`** over unmounting to toggle 3D objects. Mounting/unmounting Three.js objects is expensive.
- Exception: entire feature canvases (e.g., LevelMap canvas) may be unmounted when switching views.

### Canvas & Camera
- Use `frameloop="demand"` on static or rarely-updated scenes to save GPU resources.
- Use `@react-three/drei`'s `<OrthographicCamera>` instead of manually constructing one.
- Use `<Html>` from `@react-three/drei` for world-space labels — never manually project 3D positions to screen space.

### Event Handling
- Use R3F's built-in pointer events on meshes (`onPointerEnter`, `onPointerLeave`, `onClick`) for 3D object picking.
- Raw DOM events (pan drag, wheel, touch) belong in `usePointerInteraction` hook, attached to the canvas wrapper `div`.

---

## 5. Zustand Store Rules

- Use **one store file per feature** (e.g., `cityStore.js`, `journeyStore.js`). Do not create one mega-store.
- Always define **actions inside the store** using the `set` function — not outside.
- Use **shallow equality** for selecting multiple fields:
  ```js
  import { shallow } from 'zustand/shallow';
  const { a, b } = useStore(s => ({ a: s.a, b: s.b }), shallow);
  ```
- Persist relevant state (journey progress, custom buildings) using Zustand's `persist` middleware with `localStorage`.
- Use `immer` middleware for deeply nested state updates.

---

## 6. GSAP Rules (npm, not CDN)

- Import GSAP as an npm package: `import gsap from 'gsap'`.
- Use `useGSAP` from `@gsap/react` inside React components for automatic cleanup.
- Never use raw `gsap.to` inside `useEffect` without a cleanup function or `useGSAP`.
- GSAP animations belong in UI components (`Panel`, `Timeline`, `TitleOverlay`) — never inside R3F `useFrame`.

---

## 7. General Code Quality Rules

### Naming Conventions
- React components: `PascalCase` (e.g., `GroundLayer.jsx`)
- Hooks: `camelCase` prefixed with `use` (e.g., `useCameraController.js`)
- Zustand stores: `camelCase` suffixed with `Store` (e.g., `cityStore.js`) and the hook `useGameStore`
- Utilities: `camelCase` (e.g., `hexToCSSColor.js`)
- Three.js factories: `camelCase` with action prefix (e.g., `createBuilding`, `rebuildGround`)
- Constants: `SCREAMING_SNAKE_CASE`

### Component Anatomy
Every component file should follow this order:
1. Imports (external → internal → relative)
2. Types/PropTypes (if applicable)
3. Constants local to the component
4. The component function
5. Sub-components (if any, defined below)
6. Default export

### File Length
- Component files: **300 lines max**. If exceeded, split into sub-components or extract hooks.
- Hook files: **150 lines max**. If exceeded, split into composable hooks.
- Utility files: **200 lines max**.

### Comments
- JSDoc comments on all exported functions and hooks.
- Inline comments only for non-obvious Three.js math or R3F patterns.
- Preserve all existing comments when migrating code from Vanilla JS.

### Performance
- Use `React.memo()` on all presentational components that receive non-trivial props.
- Use `useCallback` and `useMemo` for values and handlers passed down as props.
- Never create new objects/arrays inline in JSX props (creates new references every render).

---

## 8. Static Analysis (Mandatory Before Committing)

Run the following before completing any task:
```bash
npm run lint          # ESLint with react-hooks plugin
npm run build         # Vite production build — must succeed with 0 errors
```

ESLint config must include:
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

---

## 9. Architectural Guardrails

- `src/world/` files have **zero React imports**. Violations break the DIP boundary.
- `src/features/X/` files never import from `src/features/Y/` internal paths — only from `src/features/Y/index.js`.
- `src/shared/` never imports from `src/features/`.
- `src/config.js` is the single source of truth for game constants. Never hardcode values like `COLS`, `ROWS`, or region data inside components.

---

## 10. Agile SOP — Session Handoff Protocol (MANDATORY)

Every coding session in this project follows this Standard Operating Procedure.

### At the START of Every New Chat Session
1. **Read** `.agents/PROJECT_CONTEXT.md` — master project context, architecture, and decisions.
2. **Read** `.agents/TASK_TRACKER.md` — find the next `[ ]` user story marked **Ready**.
3. **Confirm** the task with the user before writing any code.
4. **Do NOT** start a new task until the current sprint task is fully verified.

### During a Session
- Work on **exactly ONE user story** per chat session.
- Keep code changes scoped strictly to the files listed in that user story's acceptance criteria.
- Run `npm run lint` and `npm run build` before declaring the task done.

### At the END of Every Chat Session
1. **Update** `.agents/TASK_TRACKER.md`:
   - Mark the completed story `[x]`.
   - Add a one-line completion note with date.
   - Mark the next story `[→]` (In Progress / Ready for next session).
2. **Update** `.agents/PROJECT_CONTEXT.md` if any architectural decisions changed during the session.
3. **Commit and push** changes with a message matching the user story ID: `feat(US-03): GroundLayer R3F component` (e.g. commit and run `git push`).
4. **Provide** the next task prompt if available.


### File Locations
| File | Purpose |
|---|---|
| `.agents/PROJECT_CONTEXT.md` | Master architecture, decisions, current state |
| `.agents/TASK_TRACKER.md` | Agile sprint backlog + progress tracker |
| `.agents/AGENTS.md` | Mandatory coding rules (this file) |

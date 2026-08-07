# WYLD Town — 3D City World · MVP UI/UX Design Brief

> **Scope: 3D City Map view ONLY.**
> Do not design the Level Map (the 2D candy-crush globe). That is a separate product surface.

---

## 1. Product Overview

**WYLD Town** is an interactive isometric 3D city experience built for brand-sponsored creator journeys.
Users explore a procedurally generated city, click on landmark buildings to discover tasks, and complete
them to earn WYLD Coins and Creator XP.

Think: _Google Maps meets a brand campaign game._

- **Platform:** Web browser (desktop primary, mobile responsive)
- **Camera:** Orthographic isometric — not first-person or perspective
- **Rendering:** WebGL (Three.js under the hood, React Three Fiber)
- **Font:** [Outfit](https://fonts.google.com/specimen/Outfit) — weights 600 / 800 / 900

---

## 2. Tech Stack

| Concern | Technology | Notes |
|---|---|---|
| **Build Tool** | [Vite](https://vitejs.dev/) (React template) | Fast HMR dev server + optimised production bundle |
| **UI Framework** | [React 18](https://react.dev/) | Component-based rendering, concurrent features |
| **3D Rendering** | [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | React renderer for Three.js WebGL scenes |
| **3D Helpers** | [@react-three/drei](https://github.com/pmndrs/drei) | OrthographicCamera, Html overlay, helpers |
| **Post-processing** | [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) | Bloom effect on neon buildings |
| **Global State** | [Zustand](https://github.com/pmndrs/zustand) | Per-feature stores with `persist` + `immer` middleware |
| **UI Animations** | [GSAP](https://greensock.com/gsap/) + [@gsap/react](https://gsap.com/docs/v3/Packages/@gsap/react/) | Panel slide-in, HUD fade-in, splash fade-out |
| **Confetti** | [canvas-confetti](https://github.com/catdad/canvas-confetti) | Task completion celebration burst |
| **Routing** | None (single-page, view toggled via Zustand state) | — |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Deferred (City Editor panel — not in MVP) |
| **Font** | [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts) | Weights 600 / 800 / 900 |
| **Language** | JavaScript (ES Modules, JSX) | No TypeScript in this project |
| **Linting** | ESLint with `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | — |

### State Architecture

| Store | File | Manages |
|---|---|---|
| `cityStore` | `src/features/city/store/cityStore.js` | Camera target, zoom, panel open/close, active region & task, hovered mesh |
| `journeyStore` | `src/features/journey/store/journeyStore.js` | Task progression, completed task IDs, chapter order — **persisted to `localStorage`** |

### Project Structure (Abbreviated)

```
src/
├── app/              → App.jsx, providers
├── features/
│   ├── city/         → CityCanvas, SceneLights, GroundLayer, RoadsLayer,
│   │                   BuildingsLayer, PropsLayer, RegionLabels, IntroStarfield
│   ├── level-map/    → LevelMapCanvas (separate canvas — OUT OF SCOPE for this brief)
│   └── journey/      → journeyStore (Zustand + persist)
├── shared/
│   └── components/   → TitleOverlay, HUD, Panel, Tooltip
├── world/            → Pure Three.js factories (no React): Buildings.js, Ground.js, Props.js
└── config.js         → Single source of truth for all chapters, tasks, and theme colors
```

---

## 3. Design System

### 3.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| Sky Blue | `#c8e6f5` | Canvas background & fog |
| Primary Blue | `#2563eb` | CTAs, active states, progress |
| Primary Green | `#1a7f5a` | Completed states, CTA gradient |
| Neon Cyan | `#00e5ff` | Welcome district accent, unlocked tasks |
| Neon Magenta | `#ff00ff` | Building accents |
| Neon Pink | `#ff44aa` | View-toggle button highlight |
| Warm Yellow | `#ffea00` | Active task badge |
| Success Green | `#4ade80` | Completed task label |
| Panel BG | `#13332c` | Right-side drawer background (deep forest) |
| HUD BG | `rgba(255,255,255,0.78)` | Frosted glass cards |
| Dark Navy | `#1e3a5f` | Primary HUD text |
| Muted Blue | `#5a85a8` | Subtitle text |
| Panel Muted | `#8aabcc` | Section headings inside panel |

### 3.2 District Color Identities

Each of the 4 chapters is a distinct island cluster on the map with its own accent:

| District | Emoji | Accent Color | Land Color | Mood |
|---|---|---|---|---|
| Welcome Plaza | 🏛 | `#00e5ff` (Cyan) | `#6dbf67` (Lush green) | Clean, fresh, optimistic |
| Icy Summit | 🧊 | `#44ddff` (Ice blue) | `#e0f4ff` (Snowfield white) | Cold, crisp, minimal |
| Desert Dunes | 🏜️ | `#ffaa22` (Amber) | `#d4a85a` (Sand) | Warm, hazy, textured |
| Volcanic Caldera | 🌋 | `#ff4422` (Lava red) | `#8b3a1a` (Scorched) | Dramatic, dark, intense |

### 3.3 Typography

| Use | Weight | Size | Color |
|---|---|---|---|
| Splash title | 900 | 78px | Gradient (green→blue→violet) |
| Panel title | 900 | 22px | `#ffffff` |
| HUD heading | 900 | 18px | `#1a4080` |
| Section labels | 800 | 11–14px | `#8aabcc` uppercase |
| Body copy | 600 | 13px | `#d0e5df` (panel) / `#6a90b8` (HUD) |
| Status badges | 800 | 11px | colour-coded |

### 3.4 Glassmorphism Style (HUD & Controls)

```
background:       rgba(255, 255, 255, 0.78)
backdrop-filter:  blur(20px)
border:           1px solid rgba(255, 255, 255, 0.9)
box-shadow:       0 4px 20px rgba(37, 99, 235, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)
border-radius:    18px (cards) / 99px (pills)
```

### 3.5 Dark Panel Style

```
background:       #13332c  +  SVG vine/branch pattern overlay @ 4% opacity
backdrop-filter:  blur(28px)
border:           1.5px solid rgba(255, 255, 255, 0.12)
box-shadow:       -4px 0 32px rgba(0, 0, 0, 0.25)
border-radius:    24px
```

---

## 3. Screen Inventory

### Screen 1 — Splash / Title Screen

Full-screen overlay. Appears on first load before the 3D world is revealed.

#### Layout
```
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│           ✦  WYLD TOWN  ✦                   │
│      BRAND-SPONSORED CREATOR JOURNEYS        │
│                                              │
│           [ Enter WYLD Town ]                │
│                                              │
└──────────────────────────────────────────────┘
```
- Animated particle/starfield in background (5000 white dots slowly rotating)
- Everything centered; generous vertical whitespace

#### Specs

| Element | Spec |
|---|---|
| Background | `radial-gradient(ellipse at 50% 40%, #e8f6ff 0%, #b8d8f0 55%, #8fc4e8 100%)` |
| Title | "WYLD TOWN" · 78px · weight 900 · gradient text: `#1a7f5a → #2563eb → #7c3aed` · letter-spacing -3px |
| Subtitle | "BRAND-SPONSORED CREATOR JOURNEYS" · 13px · `#5a85a8` · all-caps · letter-spacing 4px |
| CTA Button | Pill shape · `padding: 16px 52px` · `linear-gradient(135deg, #2563eb, #1a7f5a)` · `box-shadow: 0 6px 24px rgba(37,99,235,0.35)` |
| CTA Hover | `scale(1.06) translateY(-2px)` · deeper glow |

---

### Screen 2 — Main 3D City World View

The primary experience. The **full viewport** is the 3D canvas. All UI elements float on top as overlays.

#### 3D World Composition

```
┌──────────────────────────────────────────────────────────────────┐
│  [HUD top-left]                              [Panel right-side]  │
│                                                                  │
│           ┌─────────────────────────────────┐                   │
│           │   3D ISOMETRIC CITY CANVAS      │                   │
│           │                                 │                   │
│           │   Islands of coloured ground    │                   │
│           │   connected by road networks    │                   │
│           │   Procedural neon buildings     │                   │
│           │   Subtle bloom glow             │                   │
│           └─────────────────────────────────┘                   │
│                                                                  │
│  [Controls bottom-left]                                          │
└──────────────────────────────────────────────────────────────────┘
```

#### 3D Scene Reference

- **Projection:** Orthographic (isometric angle `12, 14, 12` looking at `0,0,0`)
- **Sky + Fog:** flat sky-blue `#c8e6f5` with exponential fog
- **Ground:** Voronoi island cells — organic land patches in lush green surrounded by water channels
- **Roads:** blue-grey grid (`0x8a9bb0`) connecting all task buildings
- **Buildings:** blocky low-poly towers in neon accents — magenta, cyan, green, pink
- **Post-processing:** Subtle bloom on bright-colored elements (threshold 0.85, strength 0.18)
- **Props:** Trees, fountains, lampposts scattered organically

---

## 4. UI Overlay Components

### 4.1 Top-Left HUD

Two stacked frosted-glass cards, fixed `18px` from top and left edges. Fade in via spring animation after entering the world.

```
┌──────────────────────────────┐
│  🏙  WYLD Town Map           │
│  Explore districts & nodes   │
├──────────────────────────────┤
│  Explored Progress   14%     │
│  ████████░░░░░░░░░░░░        │
└──────────────────────────────┘
```

| Element | Spec |
|---|---|
| Card width | min 240px |
| Card padding | `16px 22px` |
| Heading | 18px · weight 900 · `#1a4080` |
| Subtitle | 12px · `#6a90b8` |
| Progress bar | gradient `#1a7f5a → #2563eb` · 6px tall · pill corners · animated width |
| Progress label | 11px · 800 weight · uppercase · `#8aabcc` |
| Progress % | `#1a7f5a` · 900 weight |

---

### 4.2 Bottom-Left Camera Controls

Horizontal pill button group, `18px` from bottom and left edges.

```
 ┌─────────────────────────────────────────────────┐
 │  +  │  −  │  RESET  │  🍭 Level Map             │
 └─────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Container | `border-radius: 99px` · frosted glass · `padding: 4px 12px` |
| Buttons | `color: #5a85a8` · no border · 16px font |
| Hover | `color: #2563eb` · `background: rgba(37,99,235,0.08)` |
| Separator | `1px` · `rgba(37,99,235,0.15)` · 16px tall |
| View toggle | `color: #ff44aa` · 12px · 800 weight |

---

### 4.3 Right-Side Detail Panel

Slides in from the right when a building is clicked. Spring animation in/out.

**Dimensions:**
- Desktop: `360px wide` · full height minus `18px` margins on all sides · `border-radius: 24px`
- Mobile: bottom sheet · 50vh · `border-radius: 24px 24px 0 0`

#### Panel State A — Chapter View

Appears when a district/region building is clicked.

```
┌─────────────────────────────────────┐
│  ✕                                  │  ← close button (top-right)
│           ┌─────────┐              │
│           │  🏛 emoji│              │  ← 66×66px glassy icon tile
│           └─────────┘              │
│         Welcome Plaza               │  ← 22px 900-weight white
│          STARTING POINT             │  ← #4ade80 badge
├─────────────────────────────────────┤
│  Description text                   │
│                                     │
│  TASKS ────────────────────────     │
│  ┌─────────────────────────────┐   │
│  │ ✅  Enter WYLD Town  DONE   │   │  ← completed: green tint
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🔓  Claim Gift    UNLOCKED  │   │  ← active: white tint + cyan label
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🔒  Connect Socials  LOCKED │   │  ← locked: 50% opacity + grey
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Task item states:**

| State | Background | Border | Icon | Status Color |
|---|---|---|---|---|
| Completed | `rgba(26,127,90,0.15)` | `rgba(26,127,90,0.3)` | ✅ | `#4ade80` |
| Unlocked | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.12)` | 🔓 | `#00e5ff` |
| Locked | `rgba(255,255,255,0.02)` | `rgba(255,255,255,0.05)` | 🔒 | `#8a9bb0` |

**Task item hover:** `translateY(-2px)` + `box-shadow: 0 6px 16px rgba(0,0,0,0.2)`

---

#### Panel State B — Task View

Appears when a task row is tapped from Chapter View.

```
┌─────────────────────────────────────┐
│  ← Back                             │  ← pill button top-left
│           ACTIVE TASK               │  ← yellow badge / green if done
│      Set Up Camera                  │  ← centered task title
├─────────────────────────────────────┤
│  Task description text...           │
│                                     │
│  REWARDS ───────────────────────    │
│  ┌─────────────────────────────┐   │
│  │  🪙   300 WYLD Coins        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  ⚡   150 Creator XP        │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │       Complete Task         │   │  ← gradient CTA button
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Back button | Pill shape · `rgba(255,255,255,0.06)` bg · left-arrow icon · hover `translateX(-4px)` |
| Status badge | "ACTIVE TASK" in `#ffea00` / "TASK COMPLETED" in `#4ade80` |
| Description | 13px · line-height 1.85 · `#d0e5df` |
| Reward card | `border-radius: 12px` · emoji + label · glassy dark bg |
| CTA button | Full width · `border-radius: 14px` · `linear-gradient(135deg, #1a7f5a, #2563eb)` · 800 weight |
| CTA disabled | `rgba(255,255,255,0.1)` bg · 60% opacity · `cursor: not-allowed` |

---

### 4.4 Hover Tooltip

Follows the cursor over a hovered 3D building.

```
        ┌──────────────────┐
        │  Office Tower    │
        └──────────────────┘
              ▼ (pointer)
```

| Property | Value |
|---|---|
| Background | `rgba(255,255,255,0.92)` · `backdrop-filter: blur(12px)` |
| Border | `1px solid rgba(37,99,235,0.18)` |
| Radius | `10px` |
| Padding | `7px 14px` |
| Font | 12px · 800 weight · `#1e3a5f` |
| Position | Fixed · transforms: `translate(-50%, -120%)` relative to cursor |

---

## 5. Interaction & Animation Spec

| Trigger | Animation | Easing | Duration |
|---|---|---|---|
| Page load → starfield | Opacity fade in | — | instant |
| "Enter WYLD Town" click | Overlay opacity 0→1→fade out | `power2.inOut` | 0.7s |
| HUD / Controls appear | Opacity 0→1 | `power2.out` | 0.5s |
| Panel open | `translateX(400px) → 0` | `power3.out` | 0.45s |
| Panel close | `translateX(0 → 400px)` | `power3.in` | 0.45s |
| Mobile panel open | `translateY(100%) → 0` | spring `cubic-bezier(0.25,1,0.5,1)` | 0.4s |
| Building hover | 3D scale lerp up (no re-render) | frame-loop lerp | per-frame |
| Task complete confetti | Full-screen burst | — | instant |
| Progress bar fill | Width transition | `cubic-bezier(0.34,1.56,0.64,1)` | 0.6s |
| Task item hover | `translateY(-2px)` | `ease-in-out` | 0.22s |
| CTA button hover | `translateY(-2px)` | ease | 0.2s |
| CTA button press | `scale(0.98)` | ease | 0.1s |

---

## 6. Responsive Layout

### Desktop (> 768px)

```
┌─────────────────────────────────────────────────────────────────┐
│ [HUD top-left]                                 [Panel → right] │
│                                                                 │
│              3D ISOMETRIC CITY — FULL BLEED                    │
│                                                                 │
│ [Controls bottom-left]                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile (≤ 768px)

```
┌─────────────────────────┐
│ [HUD top-left]          │
│                         │
│   3D CITY CANVAS        │
│                         │
│ [Controls bottom-left]  │
│ ┌─────────────────────┐ │
│ │   PANEL BOTTOM SHEET│ │  ← 50vh, slides up from bottom
│ └─────────────────────┘ │
└─────────────────────────┘
```

- Panel: full width · `50vh` · `border-radius: 24px 24px 0 0` · slides up from bottom
- HUD cards: remain top-left
- Controls: remain bottom-left (may need to nudge up above panel)

---

## 7. Figma Deliverables Checklist

Please design and deliver the following frames:

- [ ] **Splash Screen** — default state
- [ ] **City World** — idle (no panel open), desktop
- [ ] **City World** — panel open (Chapter View), desktop
- [ ] **City World** — panel open (Task View — active task), desktop
- [ ] **City World** — panel open (Task View — completed task), desktop
- [ ] **City World** — panel open (Chapter View), mobile (bottom sheet)
- [ ] **City World** — task complete confetti moment
- [ ] **Component Library** — HUD cards, controls pill, task items (all 3 states), reward cards, CTA button states, tooltip, panel header variants

---

## 8. Key Design Principles

1. **The 3D world is the hero.** UI overlays should feel light and non-intrusive — frosted glass, not opaque panels.
2. **Glassmorphism for light surfaces, dark-green for the panel.** Don't invent new surfaces.
3. **Neon accents only on interactive 3D elements.** UI stays restrained (blue + green gradient system).
4. **Mobile-first for the panel.** The bottom sheet must feel native and swipeable.
5. **Every interactive element has a hover state and a press state.** Nothing feels static.
6. **Confetti is the peak moment.** The task completion celebration should feel rewarding and joyful.

---

> **Handoff notes:** All sizing is in CSS px. The 3D canvas is rendered by WebGL — Figma frames for the 3D view are illustrations/representations, not pixel-perfect specs. Focus design energy on the overlay UI components and the splash screen.

# WYLD Town — Level Map · MVP UI/UX Design Brief

> **Scope: Level Map (the 2D candy-crush globe) ONLY.**
> For the isometric 3D City Map, refer to `DESIGN_BRIEF_3D.md`.

---

## 1. Product Overview

The **Level Map** is a vertical-scroll, 3D globe experience inspired by Candy Crush Saga's level select screen.
Users scroll through 40 numbered task nodes arranged along a winding candy road that wraps around a large sphere.
As the user scrolls, the globe's ground color, sky background, and surrounding environment transition to match
the active district — creating a seamless journey through 4 completely distinct biomes.

**Core interaction loop:**
1. User drags up/down (or scrolls) to rotate the globe
2. Candy nodes scroll into view; active node pulses with a glowing ring
3. User taps a node → task detail modal pops up from bottom
4. User completes task → node bounces and turns green (emerald candy)
5. Entire globe biome transitions when the district changes (background + ground color animated via GSAP)

**Platform:** Web browser (desktop + mobile), full-viewport WebGL canvas
**Font:** [Outfit](https://fonts.google.com/specimen/Outfit) (UI overlays only — 600/800/900 weights)

---

## 2. Tech Stack

| Concern | Technology | Notes |
|---|---|---|
| **3D Rendering** | Three.js (direct, class-based) | `LevelMap` is a 2,226-line pure Three.js class wrapped by R3F |
| **Road Texture** | Canvas 2D API (`createRoadTexture()`) | Procedurally drawn — lavender/gold/candy stripe ribbon |
| **Node Texture** | Canvas 2D API (`createCandyButtonTexture()`) | Per-node — redrawn on status change |
| **Standee Textures** | Canvas 2D API (`createCardboardTexture()`) | 6 types: yeti, popcorn_cart, candy_cane, soda_can, sneaker, puppy |
| **Globe Geometry** | `THREE.SphereGeometry(r=90, 64, 64)` | MeshToonMaterial — flat toon shading |
| **Road Geometry** | CatmullRomCurve3 + custom ribbon mesh | Smooth S-curve; 240 segment ribbon, width = 3.6 units |
| **Animations** | GSAP | Globe rotation, node pop, biome color transitions, standee breathing |
| **Camera** | PerspectiveCamera, FOV 45 | High-angle looking down at Y=3.5 |
| **State** | Zustand `journeyStore` | Tasks passed in via `levelMap.setTasks(allTasks, activeTaskId)` |

---

## 3. Globe Visual Identity

### 3.1 Camera & Scene Framing

- Camera: `position(0, 22, 36)` looking at `(0, 3.5, 0)` on desktop
- On mobile portrait: camera moves in closer — zoomed to fill width
- The globe itself is `radius = 90` units — only the top cap is visible
- Feel: looking down at a giant holiday snow globe from above

### 3.2 Lighting

| Light | Type | Color | Intensity |
|---|---|---|---|
| Ambient | AmbientLight | `#ffffff` | 1.3 |
| Sun | DirectionalLight | `#fff5ea` (warm white) | 1.8 at `(5, 25, 10)` |

MeshToonMaterial throughout — flat, cartoon aesthetic, no PBR complexity.

---

## 4. District Biomes (4 Chapters)

As the user scrolls through tasks 1-40, the environment transitions across 4 biomes. Each biome has a unique sky background and globe ground color that GSAP cross-fades smoothly in 0.8 seconds.

### Biome 1 — Welcome Plaza (Tasks 1-10)
- **Mood:** Lush forest, welcome campground, friendly
- **Sky background:** `#122a27` (deep forest teal-green)
- **Globe ground:** `#2e6f40` (vibrant green meadow)
- **Environment props:** Palm trees (animated wiggle), fountains, stone houses
- **Standee types:** Popcorn cart, cupcakes, puppy companion

### Biome 2 — Icy Summit (Tasks 11-20)
- **Mood:** Snowy mountain peak, crisp winter air
- **Sky background:** `#092133` (deep icy blue)
- **Globe ground:** `#ddeef5` (frosty snowfield white-blue)
- **Environment props:** Pine trees (dark teal cones), snowmen, igloos, ice crystals (glowing octahedra)
- **Standee type:** Yeti (blue-face, fluffy ears, anime eyes, red-striped scarf)

### Biome 3 — Desert Dunes (Tasks 21-30)
- **Mood:** Sun-scorched desert, ancient civilisation, mystery
- **Sky background:** `#381a07` (deep warm amber sunset)
- **Globe ground:** `#e2a85e` (desert sand)
- **Environment props:** Camels, cactus patches, palm oases, desert dunes, tents, palaces (pink stone + teal domes + gold finials)
- **Standee types:** Soda can ("W" logo), sneaker

### Biome 4 — Volcanic Caldera (Tasks 31-40)
- **Mood:** Active volcano, lava rivers, dramatic and intense
- **Sky background:** `#380707` (deep volcanic crimson)
- **Globe ground:** `#5c1409` (volcanic magma red-dark)
- **Environment props:** Volcano rocks (lava band torus), torches (flame cones, `#ff4500`), camel caravans
- **Standee type:** Candy cane (red + white stripe, green ribbon bow)

---

## 5. The Candy Road

The road is the visual spine of the Level Map — the most iconic element.

### Road Shape
- Subtle S-curve snake pattern wrapping vertically around the globe
- Width: 3.6 units
- Geometry: CatmullRomCurve3 spline with 240-segment ribbon mesh

### Road Texture (Canvas 2D, 256x256 tileable)

| Zone | Color |
|---|---|
| Road background | `#6355d8` (lavender-purple) |
| Gold edge (outer) | `#d4af37` to `#fffdd0` gradient |
| White border | `#ffffff` (4px inner stripe both sides) |
| Center ribbon | `#ff4081` (hot pink, 56px wide) |
| Diagonal stripes | `#ffffff` chevrons inside ribbon |

The texture tiles along the road length. Road scrolls visually as the globe rotates.

---

## 6. Task Nodes (Candy Buttons)

Each level is a flat cylinder with a hand-painted canvas texture on top.

- Geometry: `CylinderGeometry(r=0.55, height=0.16, 16 segments)`
- Side material: white MeshToonMaterial
- Top face: 128x128 Canvas texture baked per status

### Node States

#### Locked (Grey Candy)
- Base color: `#b0b5bc`
- Radial gradient: lighter centre to darker rim
- White inner ring (6px stroke)
- Top-left ellipse gel highlight `rgba(255,255,255,0.45)`
- Small white star dot top-right
- Bold white level number (50px, shadow `rgba(0,0,0,0.4)`)

#### Unlocked / Active (Pink Candy + Pulse Ring)
- Base color: `#ec4899` (vibrant hot pink)
- Glowing white ring: `TorusGeometry(r=0.65, tube=0.06)`
- Ring pulses: scale `1 +/- 0.15 * sin(time * 6)` per frame
- Ring material: `MeshBasicMaterial({ color: 0xffffff })`

#### Completed (Green Candy)
- Base color: `#10b981` (vibrant emerald)
- No pulse ring
- On completion: bounce `scale 1 -> 1.4 -> 1` (GSAP yoyo) then rebuild

---

## 7. Standee Props (Around Nodes)

Each task node has a cardboard standee prop placed beside it — a 2D cartoon illustration on a canvas texture, mounted on a wooden stick in 3D.

Alternates left/right of road based on node index. Distance: 1.2-3.0 units from road.

### Standee Mount (All Types)
- Brown pole: `#6d4c41`
- Oval wooden base: gradient `#8d6e63` to `#5d4037`
- Character illustration billboard on top

### Standee Characters

| Name | Visual Description | Biome |
|---|---|---|
| `yeti` | Blue-face (`#e0f2fe`) snowman, white fluffy ear tufts, black anime eyes with shine dots, sweet smile, red-striped scarf | Icy Summit |
| `popcorn_cart` | Red cart (`#ff4757`), golden wheels, ice-blue glass case, yellow popcorn heap, red-white striped canopy | Welcome |
| `candy_cane` | Red+white hooked cane, dashed white diagonal stripes, green ribbon bow at bend | Volcanic |
| `soda_can` | Red aluminium can, silver rims, white circle with "W" in Georgia serif red | Desert |
| `sneaker` | Blue side-profile sneaker, white sole, white swoosh stripe, white laces | Any |
| `puppy` | Caramel brown fur, chocolate ears, white snout, black anime eyes, rosy cheeks | Welcome |
| `cupcake` | Pink frosted dome, gold cupcake cup with vertical stripes, sprinkles, red cherry on top | Welcome |

---

## 8. Environment Decorations

Scattered across both sides of the road at two distance ranges:

### Close Decorations (3-8 units from road)

| Prop | District | Notes |
|---|---|---|
| Palm tree | Welcome, Desert | Curved trunk, 8 leaf cones, animated wiggle |
| Pine tree | Icy Summit | 3 stacked teal cones on brown trunk |
| Snowman | Icy Summit | 2-ball stack, carrot nose, coal eyes, grey top hat |
| Igloo | Icy Summit | White hemisphere + entrance cylinder |
| Ice crystal | Icy Summit | Glowing `#80deea` octahedra, emissive `0x0099bb` |
| Cactus | Desert | Multi-arm procedural, green |
| Camel | Desert | Tan, two humps, angled neck |
| Volcano rock | Fire | Dark dodecahedron + orange torus lava band |
| Torch | Fire | Black pole + `#ff4500` flame cone |
| Fountain | Welcome | Stone procedural fountain |

### Distant Decorations (12-26 units from road)
- Sand dunes (squashed sphere in ground color)
- Palm oasis clusters (3-6 palms)
- Cactus patches (2-5 cacti)
- Distant villages (2-5 small houses in district accent color)
- Camel caravans (2-4 camels single file)

### Wooden Globe Bridges
Between crossing sections of the road:
- Brown wooden deck + grey side railings + 4 corner posts
- MeshToonMaterial, aligned to sphere surface curvature
- Colors: deck `#8d6e63`, railing `#d7ccc8`, posts `#5d4037`

---

## 9. Biome Transitions

When scrolling crosses a district boundary:

| Property | Transition |
|---|---|
| Globe ground color | GSAP lerps `globeMat.color` to new district color |
| Sky background | GSAP lerps `scene.background` to new district sky |
| Duration | 0.8s `power2.out` |
| Trigger | When visible task index crosses boundary (tasks 10-11, 20-21, 30-31) |

The transition is gradual and imperceptible in motion — the world slowly transforms beneath you.

---

## 10. Task Detail Modal

When a task node is tapped: fires `onTaskClick(task)` -> `journeyStore.setActiveTask()` -> `cityStore.openPanel()`.

The same Panel component from the 3D City Map handles the display.
Refer to **Section 4.3** of `DESIGN_BRIEF_3D.md` for full Panel / Task View design spec.

---

## 11. Interaction & Scroll Mechanics

| Action | Behaviour |
|---|---|
| Drag up | Globe rotates forward (scroll to higher levels) |
| Drag down | Globe rotates back (scroll to lower levels) |
| Scroll wheel | Globe rotates |
| Touch swipe | Globe rotates (mobile) |
| Tap node | Opens task panel |
| Drag > 3px | Suppresses tap (prevents accidental opens while scrolling) |
| Scroll bounds | Clamped — cannot scroll past Level 1 or Level 40 |
| Drag sensitivity | `0.003` per pixel |
| Wheel sensitivity | `0.0012` per delta unit |
| Jump-to-task | GSAP rotates globe to active task on load |

---

## 12. Animation Spec

| Element | Animation | Easing | Duration |
|---|---|---|---|
| Node entry | Scale `0 to 1` staggered | `back.out(1.6)` | 0.65s, 0.08s delay per node |
| Node exit | Scale `1 to 0` | `power2.in` | 0.3s |
| Task complete | Scale `1 to 1.4 to 1` yoyo | `power2.out` | 0.25s x2 |
| Post-complete rebuild | Scale `0 to 1` spring | `back.out(1.7)` | 0.4s |
| Biome ground color | GSAP `.color` lerp | `power2.out` | 0.8s |
| Biome sky color | GSAP `.background` lerp | `power2.out` | 0.8s |
| Active ring pulse | Scale `1 +/- 0.15` | `sin(time * 6)` | per-frame |
| Decoration breathing | Scale `+/- 8%` | `sin(time * 3 + phase)` | per-frame |
| Decoration wiggle | Rotation Z `+/- 0.1` | `sin(time * 4 + phase)` | per-frame |
| Jump to active task | Globe rotation X to target | `power2.out` | 1.0s |

---

## 13. Responsive Layout

### Desktop (aspect > 1.0)
- Camera: `position(0, 22, 36)`, FOV 45
- Globe fills center of screen; road visible in middle strip
- HUD top-left, Controls bottom-left, Panel slides from right

### Mobile Portrait (aspect < 1.0)
- Camera moves closer, fills width
- Road and nodes fill most of the screen
- Panel becomes bottom sheet (50vh, slides up)
- Controls remain bottom-left

---

## 14. Design System Summary

### Level Map Specific Colors

| Token | Hex | Usage |
|---|---|---|
| Locked Candy | `#b0b5bc` | Locked node |
| Active Candy | `#ec4899` | Unlocked / active node |
| Completed Candy | `#10b981` | Completed node |
| Road Purple | `#6355d8` | Road background |
| Road Gold | `#d4af37` | Road edge gradient |
| Road Pink | `#ff4081` | Road center ribbon |
| Pulse Ring | `#ffffff` | Active node glow ring |
| Torch Flame | `#ff4500` | Volcanic torches |
| Camel Brown | `#d2b48c` | Camel / desert props |
| Wood Dark | `#6d4c41` | Standee pole, bridge deck |
| Warm Sun | `#fff5ea` | Directional light color |

### District Biome Palette

| District | Sky Background | Globe Ground |
|---|---|---|
| Welcome Plaza | `#122a27` | `#2e6f40` |
| Icy Summit | `#092133` | `#ddeef5` |
| Desert Dunes | `#381a07` | `#e2a85e` |
| Volcanic Caldera | `#380707` | `#5c1409` |

---

## 15. Figma Deliverables Checklist

### Globe Screens (4 biomes)
- [ ] **Welcome Biome** — tasks 1-10 visible, green globe, teal sky
- [ ] **Icy Biome** — tasks 11-20 visible, snowfield globe, dark blue sky
- [ ] **Desert Biome** — tasks 21-30 visible, sand globe, amber sky
- [ ] **Volcanic Biome** — tasks 31-40 visible, lava globe, crimson sky

### Node States (zoomed illustration)
- [ ] **Node — Locked** (grey candy, no ring)
- [ ] **Node — Active** (pink candy + white pulsing ring)
- [ ] **Node — Completed** (green candy)
- [ ] **Node — Bounce animation** (completion sequence frames)

### Standee Character Sheet
- [ ] Popcorn Cart (Welcome)
- [ ] Yeti (Icy Summit)
- [ ] Soda Can (Desert)
- [ ] Candy Cane (Volcanic)
- [ ] Puppy + Cupcake (Welcome)
- [ ] Sneaker (Any)

### Road & Environment
- [ ] **Road texture tile** (256x256 vector) — purple road, gold edge, pink ribbon
- [ ] **Road close-up** with candy nodes on globe surface
- [ ] **4 biome environments** side-by-side comparison
- [ ] **Wooden bridge** detail

### Biome Transition
- [ ] **Mid-transition frame** — sky and ground mid-lerp between two districts

### Shared UI (same as 3D City)
- [ ] HUD (top-left progress cards)
- [ ] Controls (bottom-left pill)
- [ ] Task panel (task view state, right sidebar / bottom sheet)

---

> **Handoff notes:** The Level Map globe is rendered in WebGL — Figma frames are illustrated art direction.
> The character standees are 2D canvas drawings; vector illustrations in Figma are a perfect 1:1 match.
> The candy road texture tile and the 3 node states are the highest-priority deliverables.

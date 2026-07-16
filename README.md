# 🎮 WYLD Interactive Town Map

A premium interactive town map and progression visualization built with **Three.js** and **Phaser**. This application offers two rich interactive views to explore the town and track chapter-based level progress.

---

## ✨ Available Views

### 1. 🏙️ Isometric View (Three.js)
The default view when the application loads. A stunning 3D isometric simulation of the town containing:
*   **Procedural Road Networks** connecting different chapters.
*   **Dynamic Traffic & Agent Simulation** including smart cars, walking citizens, animals, birds, and airplanes.
*   **Interactive Buildings & Landmarks** with brand showcases (e.g., Coca-Cola) and neon billboards.
*   **Built-in Map Editor**: Toggle edit mode to customize roads, place trees, buildings, props, and spawn vehicles.

### 2. 🍭 Level Map Viewer (Phaser)
Accessible by clicking the **🍭 Level Map** button in the HUD. A 2D board-game style map view designed to track your level progression:
*   **Phaser-powered** level nodes, paths, and chapter unlocks.
*   **Staggered Level Visuals** representing different thematic challenges.
*   **Interactive Task Cards** that update dynamically as goals are accomplished.

---

## 🚀 Running the Project

### ⚡ Quick Start (Recommended)
We have included a helper shell script to automatically find an open port, start the server, and open the application in your browser.

Run this single command in your terminal:
```bash
./run.sh
```

Once running, it will automatically launch your browser to:
👉 **[http://localhost:8000](http://localhost:8000)** (or the next available port)

---

### 🛠️ Manual Terminal Commands

If you prefer to start the server manually, choose one of the options below:

#### Option A: Using Python (No installation required)
Start a simple HTTP server using Python 3:
```bash
python3 -m http.server 8000
```
Then open:
👉 **[http://localhost:8000](http://localhost:8000)**

#### Option B: Using Node.js (`serve` package)
Run a static server using `npx`:
```bash
npx serve -l 8000
```
Then open:
👉 **[http://localhost:8000](http://localhost:8000)**

---

## 📂 Project Structure

*   `index.html` — Application entry point, containing UI controls, styles, and viewport overlays.
*   `src/` — Main source directory:
    *   `src/main.js` — Main logic managing state, updates, and view transitioning.
    *   `src/core/` — Engine & sound initialization.
    *   `src/world/` — 3D ground, buildings, simulation, props, and the Phaser level map (`LevelMap.js`).
    *   `src/brands/` — Brand managers and billboards.
    *   `src/intro/` — Intro scene animations.
*   `assets/` — Project game assets, vehicles, textures, and spritesheets.

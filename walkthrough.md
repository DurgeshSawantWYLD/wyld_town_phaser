# Walkthrough - Journey Timeline of Chapters & Tasks

We have successfully integrated a dynamic, data-driven **Journey Timeline** system into the Three.js isometric town map.

## Key Accomplishments

### 1. 100% Blank Canvas Initial State
- **Hardcoded Map Elements Removed**: We cleaned up `src/world/Ground.js` and removed all static hardcoded roads, runway, lakes, and central plaza. The canvas starts as a completely clean, pristine green grass slab.
- **Legacy Storage Migration**: Added an automatic migration checker in `src/main.js` which automatically clears legacy layout storage on first load, guaranteeing a clean slate.
- **Preset City Loader**: A button is added inside the **Data JSON** tab to easily load the default WYLD City layout (original preset of roads, chapters, and tasks) for quick testing or inspiration.

### 2. Advanced Multi-Tab Map Editor
- **Timeline & Chapters Tab**:
  - List all chapters dynamically.
  - Create, edit, or delete regions/chapters (configuring Titles, Emojis, Colors, and Center Coordinates).
  - Add tasks to each chapter and set their positions and asset class (procedural shape vs. GLTF model URL).
  - Click-to-Pick Coordinate helper allows setting positions directly by clicking on map tiles.
- **Map Tools Tab**:
  - Tool Palette supporting: Road Placer, Tree Placer, Prop Placer, Vehicle Placer, and Eraser.
  - Dropdowns to choose specific models (e.g. Pine/Oak/Palm trees, park benches, cargo/sports vehicles).
- **Data JSON Tab**:
  - Clear Reset Canvas button.
  - Save to browser storage button.
  - Textarea to copy/apply journey config JSON dynamically.

### 3. Procedural Connection & Branching Roads
- **Main Highway Spine**: The editor connects chapter center coordinates sequentially in timeline order to form a highway spine.
- **Automatic Task Branching**: Dropping a task building at a coordinate automatically routes a Manhattan road branch from the building's neighbor tile to the closest main spine, dynamically updating navigation routing.

### 4. Interactive Centering & Touch Navigation
- **Left-Viewport Focus**: Selecting a building zooms the camera in smoothly and offsets the view so the asset is focused in the left half, keeping it clear of the right details drawer.
- **Full Touch Support**: Pinch-to-zoom and dragging work seamlessly on mobile viewports and trackpads.

---

## Verifying the App

To view and verify the changes:
1. Make sure your Python server is running (`python3 -m http.server 8000`).
2. Open your browser to `http://localhost:8000/`.
3. Enter the town and click on the **🔧 Editor** button to configure your custom city journey!

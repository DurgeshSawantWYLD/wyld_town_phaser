import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const initialState = {
  currentView: 'city',
  isIntroActive: true,
  zoomLevel: 1.0,
  zoomTarget: 1.0,
  camTargetOffset: { x: 0, y: 0, z: 0 },
  panelOpen: false,
  panelView: null,
  activeRegionId: null,
  activeTaskId: null,
  hoveredMeshId: null,
};

/**
 * Zustand store to manage city map state, including camera offsets, zooms,
 * views, panel open/close state, and hovered elements.
 */
export const useCityStore = create()(
  immer((set) => ({
    ...initialState,

    /**
     * Set the current view mode ('city' or 'level').
     * @param {'city' | 'level'} view - The view mode to set.
     */
    setView: (view) =>
      set((state) => {
        state.currentView = view;
      }),

    /**
     * Open the side panel for a specific region and optional task.
     * @param {string} regionId - The ID of the active region.
     * @param {string|null} [taskId=null] - The ID of the active task.
     */
    openPanel: (regionId, taskId = null) =>
      set((state) => {
        state.panelOpen = true;
        state.panelView = taskId ? 'task' : 'chapter';
        state.activeRegionId = regionId;
        state.activeTaskId = taskId;
      }),

    /**
     * Close the side panel and reset selected region/task.
     */
    closePanel: () =>
      set((state) => {
        state.panelOpen = false;
        state.panelView = null;
        state.activeRegionId = null;
        state.activeTaskId = null;
      }),

    /**
     * Offset the camera target.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    panCamera: (x, y, z) =>
      set((state) => {
        state.camTargetOffset = { x, y, z };
      }),

    /**
     * Set the zoom target value.
     * @param {number} zoom
     */
    setZoom: (zoom) =>
      set((state) => {
        state.zoomTarget = zoom;
      }),

    /**
     * Set the ID of the currently hovered 3D mesh.
     * @param {string|null} meshId
     */
    setHovered: (meshId) =>
      set((state) => {
        state.hoveredMeshId = meshId;
      }),

    /**
     * Set whether the intro sequence is active.
     * @param {boolean} active
     */
    setIntroActive: (active) =>
      set((state) => {
        state.isIntroActive = active;
      }),
  }))
);

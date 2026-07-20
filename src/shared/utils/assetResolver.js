import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DECOR_BUILDERS } from '../../world/Buildings.js';

// In-memory cache for GLTF models to avoid re-fetching
const gltfCache = {};
const gltfLoader = new GLTFLoader();

/**
 * Resolves an asset configuration into a THREE.Group.
 * Handles both procedural geometries and external GLTF models.
 *
 * @param {Object} assetConfig - The configuration object for the asset.
 * @param {string} assetConfig.type - The type of the asset ('procedural', 'gltf', or 'external_gltf').
 * @param {string} [assetConfig.shape] - The shape key for procedural assets (e.g., 'office_tower').
 * @param {number} [assetConfig.primaryColor] - Hex color to override the primary color of procedural assets.
 * @param {string} [assetConfig.url] - The URL of the GLTF model (required for gltf/external_gltf types).
 * @param {number} [assetConfig.scale=1] - Scale multiplier for the GLTF model.
 * @param {number} [assetConfig.rotation=0] - Y-axis rotation in radians for the GLTF model.
 * @param {number} [assetConfig.yOffset=0] - Y-axis translation offset for the GLTF model.
 * @returns {THREE.Group} A THREE.Group containing the resolved meshes.
 */
export function resolveAsset(assetConfig) {
  const group = new THREE.Group();

  if (!assetConfig) {
    return group;
  }

  const isGltf = assetConfig.type === 'gltf' || assetConfig.type === 'external_gltf';

  if (isGltf) {
    const url = assetConfig.url;
    if (!url) {
      console.warn('GLTF asset type specified but no URL provided.');
      return group;
    }

    const scale = assetConfig.scale ?? 1;
    const rotation = assetConfig.rotation ?? 0;
    const yOffset = assetConfig.yOffset ?? 0;

    // Create a temporary placeholder box while loading
    const placeholderMat = new THREE.MeshToonMaterial({ color: 0x8fa5b8 });
    const placeholder = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), placeholderMat);
    placeholder.position.y = 0.15;
    group.add(placeholder);

    const applyModel = (scene) => {
      group.remove(placeholder);
      placeholderMat.dispose();
      placeholder.geometry.dispose();

      const model = scene.clone();
      model.scale.set(scale, scale, scale);
      model.rotation.y = rotation;
      model.position.y = yOffset;

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      group.add(model);
    };

    if (gltfCache[url]) {
      applyModel(gltfCache[url]);
    } else {
      gltfLoader.load(
        url,
        (gltf) => {
          gltfCache[url] = gltf.scene;
          applyModel(gltf.scene);
        },
        undefined,
        (err) => {
          console.error(`Error loading GLTF asset from ${url}:`, err);
          // Turn placeholder red to indicate failure
          placeholderMat.color.setHex(0xff3333);
        }
      );
    }
  } else {
    // Procedural shape
    const shape = assetConfig.shape || 'office_tower';
    const builder = DECOR_BUILDERS[shape] || DECOR_BUILDERS.office_tower;
    
    // Execute procedural builder
    builder(group);

    // Apply custom colors if specified
    if (assetConfig.primaryColor !== undefined) {
      group.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          if (child.material.color) {
            child.material.color.setHex(assetConfig.primaryColor);
          }
        }
      });
    }
  }

  // Ensure all child meshes cast/receive shadows by default
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

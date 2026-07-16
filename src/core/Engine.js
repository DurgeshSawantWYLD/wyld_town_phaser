// src/core/Engine.js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export let scene, camera, renderer, composer, sunLight;

export const BLOOM_LAYER = new THREE.Layers();
BLOOM_LAYER.set(1);

export function initEngine(containerId) {
  const container = document.getElementById(containerId);

  // 1. Scene — bright sky blue (light mode)
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc8e6f5);
  scene.fog = new THREE.FogExp2(0xc8e6f5, 0.012);

  // 2. Isometric Orthographic Camera
  const aspect = window.innerWidth / window.innerHeight;
  const d = 9;
  camera = new THREE.OrthographicCamera(
    -d * aspect, d * aspect,
    d, -d,
    0.1, 1000
  );
  // Entry: top-down
  camera.position.set(0, 80, 0);
  camera.lookAt(0, 0, 0);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // 4. Post-Processing — very subtle bloom (light mode: keep it gentle)
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.18,  // very low strength for light mode
    0.3,
    0.85   // high threshold — only super-bright things bloom
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // 5. Lights — bright daylight setup
  // Hemisphere: sky=bright blue-white, ground=warm green
  const hemi = new THREE.HemisphereLight(0xdceeff, 0x88cc88, 2.0);
  scene.add(hemi);

  // Main sun — warm, from top-left ISO angle
  sunLight = new THREE.DirectionalLight(0xfff8e1, 2.2);
  sunLight.position.set(12, 20, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  const sd = 20;
  sunLight.shadow.camera.left   = -sd;
  sunLight.shadow.camera.right  =  sd;
  sunLight.shadow.camera.top    =  sd;
  sunLight.shadow.camera.bottom = -sd;
  sunLight.shadow.camera.near   = 0.5;
  sunLight.shadow.camera.far    = 60;
  sunLight.shadow.bias = -0.0004;
  scene.add(sunLight);

  // Soft fill from opposite side (reduces harsh shadow areas)
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-8, 10, -6);
  scene.add(fill);

  window.addEventListener('resize', onWindowResize);
  return { scene, camera, renderer, composer };
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  const d = 9;
  camera.left   = -d * aspect;
  camera.right  =  d * aspect;
  camera.top    =  d;
  camera.bottom = -d;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

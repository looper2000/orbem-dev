// 3d-model.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
} else {
  console.error("GSAP or ScrollTrigger not found!");
}

function initScene(containerSelector, modelUrl, referenceSelector, positionSelector, scaleFactor = 0.629) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Container ${containerSelector} not found!`);
    return;
  }
  const scene = new THREE.Scene();
  const focalLength = 105;
  const sensorHeight = 24;
  const fov = 2 * Math.atan(sensorHeight / (2 * focalLength)) * (180 / Math.PI);
  const camera = new THREE.PerspectiveCamera(
    fov,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 40);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 10);
  dirLight.position.set(3, 20, 10);
  scene.add(dirLight);
  
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(dracoLoader);
  
  loader.load(modelUrl, function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    const referenceElement = document.querySelector(referenceSelector);
    const positionElement = document.querySelector(positionSelector);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
    let scale;
    if (referenceElement) {
      const heightRatio = referenceElement.clientHeight / container.clientHeight;
      scale = (visibleHeight * heightRatio / maxDim) * scaleFactor;
    } else {
      scale = (visibleHeight / maxDim) * scaleFactor;
    }
    model.scale.setScalar(scale);
    const center = new THREE.Vector3();
    box.getCenter(center);
    if (positionElement) {
      const canvasRect = container.getBoundingClientRect();
      const elementRect = positionElement.getBoundingClientRect();
      const relativeX = (elementRect.left + elementRect.width / 2 - canvasRect.left) / canvasRect.width;
      const relativeY = (elementRect.top + elementRect.height / 2 - canvasRect.top) / canvasRect.height;
      const visibleWidth = visibleHeight * camera.aspect;
      model.position.x = (relativeX - 0.5) * visibleWidth;
      model.position.y = -(relativeY - 0.5) * visibleHeight - (center.y * scale);
    } else {
      model.position.y = -center.y * scale;
    }
    console.log(`Model Loaded in ${containerSelector}`);
    
    // Connect to GSAP ScrollTrigger if available and config is loaded
    if (window.gsap && window.scrollMap) {
      const scrollMap = window.scrollMap;
      gsap.to(model.rotation, {
        y: Math.PI * 2,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero_modal-top",
          start: scrollMap.scrollTriggers[2].start,
          end: scrollMap.scrollTriggers[3].end,
          scrub: true
        }
      });
    }
  }, undefined, function (error) {
    console.error(`Error loading model in ${containerSelector}:`, error);
  });
  
  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// Initialize the specific scene
initScene(
  '.hero_modal-image.is-2',
  'https://raw.githubusercontent.com/looper2000/3d-objects/bd1f2cd262e8fc98cd9dc30ee5e9dcd8a826492d/avacado_texture.glb',
  '.hero_modal-image.is-1',
  '.hero_modal-image.is-2',
  1
);
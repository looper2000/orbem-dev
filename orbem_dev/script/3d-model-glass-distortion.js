import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Text } from 'troika-three-text';
const container = document.querySelector('.hero_modal-image.is-3');
if (!container) {
  console.error('Three.js container not found');
} else {
  const SCALE_FACTOR = 1;
  const MODEL_Y_OFFSET = 0;
  const scene = new THREE.Scene();
  const focalLength = 105;
  const sensorHeight = 24;
  const fov = 2 * Math.atan(sensorHeight / (2 * focalLength)) * (180 / Math.PI);
  const camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 40);
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 10);
  dirLight.position.set(3, 20, 10);
  scene.add(dirLight);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableRotate = false;
  const myText = new Text();
  scene.add(myText);
  const sourceElement = document.querySelector('#second-text');
  const isMobile = window.innerWidth < 768;
  if (sourceElement) {
    const style = window.getComputedStyle(sourceElement);
    const PX_TO_3D = isMobile ? 0.0111 : 0.0111;
    myText.text = sourceElement.innerText || sourceElement.textContent;
    myText.color = new THREE.Color(style.color);
    myText.fontSize = parseFloat(style.fontSize) * PX_TO_3D;
    myText.textAlign = style.textAlign;
    // --- UPDATED CODE START ---
    // Check if mobile (screen width less than 768px)
    // Set 8 for mobile, 10 for desktop (adjust these numbers as needed)
    myText.maxWidth = isMobile ? 4 : 10;
    // --- UPDATED CODE END ---
    myText.fontWeight = 500;
    myText.anchorX = 'center';
    myText.anchorY = 'middle';
    myText.lineHeight = parseFloat(style.lineHeight) / parseFloat(style.fontSize);
  } else {
    myText.text = "Default Text";
    myText.color = 0x000000;
    myText.fontSize = 1.4;
  }
  myText.position.set(0, -15, -5);
  myText.sync(() => {
    if (myText.material) {
      myText.material.transparent = false;
      myText.material.alphaTest = 0.5;
      myText.material.depthWrite = true;
      myText.material.needsUpdate = true;
    }
  });
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(myText.position, {
    y: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: ".hero_modal-top",
      start: scrollMap.scrollTriggers[3].start,
      end: scrollMap.scrollTriggers[3].end,
      scrub: 1,
      onUpdate: () => myText.updateMatrixWorld()
    }
  });
  const baseGlassParams = {
    transmission: 1,
    roughness: 0,
    thickness: 1,
    ior: 1.01,
    dispersion: 50,
    clearcoat: 1.2,
    side: THREE.DoubleSide
  };
  const loader = new GLTFLoader();
  loader.load('https://raw.githubusercontent.com/looper2000/3d-objects/bd1f2cd262e8fc98cd9dc30ee5e9dcd8a826492d/avacado_smooth.glb', (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (!child.isMesh) return;
      const m = new THREE.MeshPhysicalMaterial(baseGlassParams);
      if (child.material?.color) m.color.copy(child.material.color);
      if (child.material?.map) m.map = child.material.map;
      child.material = m;
    });
    scene.add(model);
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
    const referenceElement = document.querySelector('.hero_modal-image.is-1');
    const positionElement = document.querySelector('.hero_modal-image.is-2');
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
    let scale;
    if (referenceElement) {
      const heightRatio = referenceElement.clientHeight / container.clientHeight;
      scale = (visibleHeight * heightRatio / maxDim) * SCALE_FACTOR;
    } else {
      scale = (visibleHeight / maxDim) * SCALE_FACTOR;
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
      model.position.y = -(relativeY - 0.5) * visibleHeight - (center.y * scale) + MODEL_Y_OFFSET;
    } else {
      model.position.y = (-center.y * scale) + MODEL_Y_OFFSET;
    }
  });
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
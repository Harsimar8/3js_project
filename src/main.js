import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

// ==========================================
// 1. UI INJECTION & ASSETS
// ==========================================
document.querySelector('#app').innerHTML = `
  <div id="threejs-container" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:1;"></div>
  
  <div style="position: absolute; top: 15px; left: 50%; transform: translateX(-50%); z-index: 1001; pointer-events: auto;">
    <button id="portal-btn" style="padding: 10px 20px; font-size: 14px; background: #2ecc71; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.4); transition: transform 0.2s;">🚪 Enter Gallery</button>
  </div>

  <div class="ui-overlay" style="position: absolute; top: 15px; left: 15px; z-index: 1000; font-family: sans-serif; pointer-events: none;">
    <h1 style="color: white; font-size: 16px; margin: 0 0 10px 0; text-shadow: 1px 1px 3px #000;">Fine Art Gallery</h1>
    <div style="display: flex; flex-direction: column; gap: 8px; width: 160px; pointer-events: auto;">
      <button id="walkthrough-btn" style="padding: 6px; font-size: 11px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🚶 Walkthrough Mode</button>
      <button id="wall-color-btn" style="padding: 6px; font-size: 11px; background: #2c3e50; color: white; border: none; border-radius: 4px; cursor: pointer;">🎨 Wall Color (1/8)</button>
      <button id="floor-texture-btn" style="padding: 6px; font-size: 11px; background: #d35400; color: white; border: none; border-radius: 4px; cursor: pointer;">🪵 Floor Tex (1/7)</button>
    </div>
    <div id="controls-hint" style="display: none; color: #fff; margin-top: 10px; font-size: 11px; background: rgba(0,0,0,0.85); padding: 8px; border-radius: 4px;">
      <b>Controls:</b> W,A,S,D / Arrows to walk. Move mouse to look.
    </div>
  </div>
  <div id="painting-description-ui" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; font-family: serif; text-align: center; background: rgba(10,10,15,0.85); padding: 12px 20px; border-radius: 6px; color: white; max-width: 400px; opacity: 0; transition: opacity 0.3s;">
    <h2 id="art-title" style="margin: 0; font-size: 16px; color: #f39c12; font-style: italic;"></h2>
    <p id="art-meta" style="margin: 4px 0; font-size: 11px; color: #bdc3c7; font-family: sans-serif; text-transform: uppercase;"></p>
    <p id="art-desc" style="margin: 0; font-size: 13px; color: #eceff1;"></p>
  </div>
`;

const textureLoader = new THREE.TextureLoader();
const textures = {
  art1: textureLoader.load('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop'),
  art2: textureLoader.load('https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop'),
  art3: textureLoader.load('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=400&auto=format&fit=crop'),
  art4: textureLoader.load('https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=400&auto=format&fit=crop'),
  art5: textureLoader.load('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=400&auto=format&fit=crop'),
  art6: textureLoader.load('https://images.unsplash.com/photo-1547891654-e66ed7edd96c?q=80&w=400&auto=format&fit=crop'),
  
  floorTex1: textureLoader.load('https://plus.unsplash.com/premium_photo-1675695700408-ca54e14503a3?w=600&auto=format&fit=crop&q=60'),
  floorTex2: textureLoader.load('https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?q=80&w=687&auto=format&fit=crop'),
  floorTex3: textureLoader.load('https://images.unsplash.com/photo-1606767041004-6b918abe92be?w=500&auto=format&fit=crop&q=60'),
  floorTex4: textureLoader.load('https://images.unsplash.com/photo-1550784164-91fcd7d1e616?w=500&auto=format&fit=crop&q=60'),
  floorTex5: textureLoader.load('https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?w=500&auto=format&fit=crop&q=60'),
  floorTex6: textureLoader.load('https://images.unsplash.com/photo-1608501821300-4f99e58bba77?w=500&auto=format&fit=crop&q=60'),
  floorTex7: textureLoader.load('https://images.unsplash.com/photo-1694382224140-cb7443c6a3ec?q=80&w=2001&auto=format&fit=crop'),
  
  roomShellTex: textureLoader.load('https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600&auto=format&fit=crop')
};

const floorOptions = [
  { name: "Premium Wood", tex: textures.floorTex1, repeat: 5 },
  { name: "Abstract Slate", tex: textures.floorTex2, repeat: 4 },
  { name: "Classic Marble", tex: textures.floorTex3, repeat: 3 },
  { name: "Veined Alabaster", tex: textures.floorTex4, repeat: 3 },
  { name: "Symmetry Stone", tex: textures.floorTex5, repeat: 4 },
  { name: "Modern Quartzite", tex: textures.floorTex6, repeat: 3 },
  { name: "Pristine Terrazzo", tex: textures.floorTex7, repeat: 2 }
];

floorOptions.forEach(opt => {
  opt.tex.wrapS = opt.tex.wrapT = THREE.RepeatWrapping;
  opt.tex.repeat.set(opt.repeat, opt.repeat);
});

// ==========================================
// 2. SETUP SCENE, CAMERA, LIGHTS
// ==========================================
const container = document.querySelector('#threejs-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05050a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

// Anchor matrices for teleport locations
let isPlayerOutside = true;
const outsideCameraPos = new THREE.Vector3(0, 8, 55);
const insideCameraPos = new THREE.Vector3(0, 5, 25);
camera.position.copy(outsideCameraPos);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const overheadLight = new THREE.DirectionalLight(0xfff8ee, 0.6);
overheadLight.position.set(5, 25, 5);
overheadLight.castShadow = true;
overheadLight.shadow.mapSize.width = 2048;
overheadLight.shadow.mapSize.height = 2048;
scene.add(overheadLight);

const sunLight = new THREE.DirectionalLight(0xaaccff, 0.4);
sunLight.position.set(-20, 20, 40);
scene.add(sunLight);

// ==========================================
// 3. ENCLOSURES, ROAD & SECURITY GUARD
// ==========================================
const clickables = [], draggables = [], collidableBoxes = [], galleryPaintings = [], walkingPeople = [];
const highlightLights = []; 
const highlightMeshes = []; 
const underGlowLights = [];

const ROOM_W = 60, ROOM_H = 16, ROOM_D = 60;

const wallColors = [0x1e1e24, 0x2c3e50, 0x1c2833, 0x2e4053, 0x4a2e2b, 0x1e3f20, 0xd5c3a6, 0x7f8c8d];
let colorIndex = 0;
const galleryWallMat = new THREE.MeshStandardMaterial({ color: wallColors[colorIndex], roughness: 0.85 });

const floorMat = new THREE.MeshStandardMaterial({ map: floorOptions[0].tex, roughness: 0.3, metalness: 0.1 });
const structuralFloor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), floorMat);
structuralFloor.rotation.x = -Math.PI / 2;
structuralFloor.receiveShadow = true;
scene.add(structuralFloor);

const groundOutsideMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.9 });
const groundOutside = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, 40), groundOutsideMat);
groundOutside.rotation.x = -Math.PI / 2;
groundOutside.position.set(0, -0.01, ROOM_D / 2 + 20); 
groundOutside.receiveShadow = true;
scene.add(groundOutside);

textures.roomShellTex.wrapS = textures.roomShellTex.wrapT = THREE.RepeatWrapping;
textures.roomShellTex.repeat.set(4, 4);
const ceilingMat = new THREE.MeshStandardMaterial({ map: textures.roomShellTex, color: 0x222222, roughness: 0.9 });
const structuralCeiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), ceilingMat);
structuralCeiling.position.y = ROOM_H;
structuralCeiling.rotation.x = Math.PI / 2;
scene.add(structuralCeiling);

const buildWall = (w, h, d, x, y, z, standsAlone = true) => {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), galleryWallMat);
  wall.position.set(x, y, z);
  wall.receiveShadow = true;
  scene.add(wall);
  if (standsAlone) {
    collidableBoxes.push(new THREE.Box3().setFromObject(wall));
  }
};

buildWall(ROOM_W, ROOM_H, 1, 0, ROOM_H / 2, -ROOM_D / 2, true); 
buildWall(1, ROOM_H, ROOM_D, -ROOM_W / 2, ROOM_H / 2, 0, true); 
buildWall(1, ROOM_H, ROOM_D, ROOM_W / 2, ROOM_H / 2, 0, true);  

buildWall(25, ROOM_H, 1, -17.5, ROOM_H / 2, ROOM_D / 2, true);
buildWall(25, ROOM_H, 1, 17.5, ROOM_H / 2, ROOM_D / 2, true);
buildWall(10, 4, 1, 0, ROOM_H - 2, ROOM_D / 2, false); 

const frameMat = new THREE.MeshStandardMaterial({ color: 0x111116, metalness: 0.4, roughness: 0.2 });
const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1, 12, 1.5), frameMat);
leftPillar.position.set(-5, 6, ROOM_D / 2);
scene.add(leftPillar);
collidableBoxes.push(new THREE.Box3().setFromObject(leftPillar));

const rightPillar = leftPillar.clone();
rightPillar.position.x = 5;
scene.add(rightPillar);
collidableBoxes.push(new THREE.Box3().setFromObject(rightPillar));

buildWall(36, 11, 1.2, 0, 5.5, -14, true);  
buildWall(1.2, 11, 26, -18, 5.5, 2, true); 
buildWall(1.2, 11, 26, 18, 5.5, 2, true);  

// ==========================================
// SECURITY GUARD
// ==========================================
function buildSecurityGuard(x, z) {
  const guardGroup = new THREE.Group();
  guardGroup.position.set(x, 0, z);
  guardGroup.rotation.y = Math.PI;

  const bootsMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1a237e, roughness: 0.7 }); 
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2196f3, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.4 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0x0d47a1, roughness: 0.5 });

  const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.4, 0.25), pantsMat);
  lLeg.position.set(-0.18, 0.7, 0);
  const rLeg = lLeg.clone(); rLeg.position.x = 0.18;
  guardGroup.add(lLeg, rLeg);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.3, 0.45), shirtMat);
  torso.position.y = 2.05;
  guardGroup.add(torso);

  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.05), bootsMat);
  tie.position.set(0, 2.3, 0.23);
  guardGroup.add(tie);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), skinMat);
  head.position.y = 2.85;
  guardGroup.add(head);

  const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.15, 16), hatMat);
  capBase.position.set(0, 3.1, 0);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.2), bootsMat);
  visor.position.set(0, 3.05, 0.2);
  guardGroup.add(capBase, visor);

  scene.add(guardGroup);
  collidableBoxes.push(new THREE.Box3().setFromObject(guardGroup));
}
buildSecurityGuard(7, 33);

// UI Event Binding Setup
let floorIndex = 0;
document.getElementById('floor-texture-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  floorIndex = (floorIndex + 1) % floorOptions.length;
  floorMat.map = floorOptions[floorIndex].tex;
  floorMat.needsUpdate = true;
  e.target.textContent = `🪵 ${floorOptions[floorIndex].name} (${floorIndex + 1}/${floorOptions.length})`;
});

document.getElementById('wall-color-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  colorIndex = (colorIndex + 1) % wallColors.length;
  galleryWallMat.color.setHex(wallColors[colorIndex]);
  e.target.textContent = `🎨 Wall Color (${colorIndex + 1}/${wallColors.length})`;
});

// ==========================================
// 4. EXHIBITION BUILDERS (ART & SYMMETRIC PLINTHS)
// ==========================================
function createExhibitionPainting(x, y, z, w, h, rotY, texture, metadata) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotY;

  const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.15), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 }));
  const canvas = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, h * 0.9, 0.2), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.45 }));
  frame.castShadow = true;
  group.add(frame, canvas);
  scene.add(group);

  const lightOffset = new THREE.Vector3(0, h / 2 + 1.2, 2.2).applyQuaternion(group.quaternion);
  const spot = new THREE.SpotLight(0xffffff, 8, 14, Math.PI / 4, 0.4, 1);
  spot.position.copy(group.position).add(lightOffset);
  spot.target = canvas;
  spot.castShadow = true;
  scene.add(spot);

  const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.3, 12), new THREE.MeshBasicMaterial({ color: 0xfff2e6 }));
  fixture.position.copy(group.position).add(new THREE.Vector3(0, h / 2 + 1.2, 1.2).applyQuaternion(group.quaternion));
  fixture.quaternion.copy(group.quaternion);
  fixture.rotation.x += Math.PI / 4;
  scene.add(fixture);

  fixture.userData = { isLightFixture: true, associatedLight: spot, isOn: true };
  clickables.push(fixture);

  group.userData = { isPainting: true, metadata: metadata };
  frame.userData = canvas.userData = { parentGroup: group };
  draggables.push(frame, canvas);
  galleryPaintings.push(group);
}

createExhibitionPainting(0, 6, -13.3, 5, 3.8, 0, textures.art1, { title: "Ethereal Botanicals", artist: "Flora Danica", year: "2024", desc: "Transient organic patterns blending fluid strokes." });
createExhibitionPainting(-10, 6, -13.3, 4, 4, 0, textures.art2, { title: "Abstract Nexus No. 4", artist: "Vikram Sterling", year: "2025", desc: "Modern complex data arrays in chromatic frequencies." });
createExhibitionPainting(10, 6, -13.3, 4, 4, 0, textures.art3, { title: "Monochrome Solitude", artist: "Elena Rostova", year: "2023", desc: "An emotional dive into deep negative architectural spaces." });
createExhibitionPainting(-17.3, 6, -2, 4.5, 3.5, Math.PI / 2, textures.art4, { title: "Metropolitan Grid", artist: "Marcus Vance", year: "2026", desc: "Industrial geometry and neon reflection spikes." });
createExhibitionPainting(-17.3, 6, 6, 4, 4.5, Math.PI / 2, textures.art5, { title: "Subconscious Symphony", artist: "S. K. Kaur", year: "2025", desc: "Surreal dreamscape showcasing internal flow states." });
createExhibitionPainting(17.3, 6, 2, 5, 4, -Math.PI / 2, textures.art6, { title: "Liquid Horizons", artist: "Chieko Tanaka", year: "2024", desc: "Watercolor pigments mimicking shifting coastlines." });

function addUnderGlow(x, z, colorHex) {
  const light = new THREE.PointLight(colorHex, 1.5, 6);
  light.position.set(x, 0.6, z);
  scene.add(light);
  return light;
}

function createPedestalShowpiece(x, z, type, colorHex) {
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 3.5, 1.8),
    new THREE.MeshStandardMaterial({ color: 0xefefef, roughness: 0.9 })
  );
  plinth.position.set(x, 1.75, z);
  scene.add(plinth);
  collidableBoxes.push(new THREE.Box3().setFromObject(plinth));

  const geos = {
    cone: new THREE.ConeGeometry(0.5, 1, 4),
    torus: new THREE.TorusGeometry(0.4, 0.12, 8, 18),
    octa: new THREE.OctahedronGeometry(0.5),
    dodeca: new THREE.DodecahedronGeometry(0.45)
  };

  const sculptureMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.7,
    roughness: 0.15,
    emissive: new THREE.Color(colorHex),
    emissiveIntensity: 0.25
  });

  const sculpture = new THREE.Mesh(geos[type], sculptureMat);
  sculpture.position.set(x, 4.1, z);
  sculpture.castShadow = true;
  sculpture.userData = { isShowpiece: true, homeY: 4.1 };

  scene.add(sculpture);
  draggables.push(sculpture);

  const spot = new THREE.SpotLight(0xffffff, 2.5, 12, Math.PI / 5, 0.6, 1);
  spot.position.set(x, 8, z);
  spot.target = sculpture;
  scene.add(spot);
  scene.add(spot.target);
  highlightLights.push(spot);

  const glowGeo = new THREE.CircleGeometry(1.5, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(x, 0.02, z); 
  scene.add(glow);
  highlightMeshes.push(glow);
  
  const underGlow = addUnderGlow(x, z, colorHex);
  underGlowLights.push(underGlow);
}

createPedestalShowpiece(-8, -8, 'cone', 0xd4af37);
createPedestalShowpiece(8, -8, 'torus', 0x2980b9);
createPedestalShowpiece(-8, 8, 'octa', 0xc0392b);
createPedestalShowpiece(8, 8, 'dodeca', 0x16a085);

// Patrons
function createPatron(x, z, color, bounds) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.4), new THREE.MeshStandardMaterial({ color }));
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
  torso.position.y = 1.95; head.position.y = 2.7;
  torso.castShadow = head.castShadow = true;

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.3, 0.2), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  leftLeg.position.set(-0.16, 0.65, 0);
  const rightLeg = leftLeg.clone(); rightLeg.position.x = 0.16;
  leftLeg.castShadow = rightLeg.castShadow = true;

  group.add(torso, head, leftLeg, rightLeg);
  scene.add(group);

  const bb = new THREE.Box3();
  collidableBoxes.push(bb);
  walkingPeople.push({ group, leftLeg, rightLeg, bounds, speed: 0.03 + Math.random() * 0.02, dir: 1, offset: Math.random() * 50, bb });
}
createPatron(-11, -9, 0x9b59b6, { axis: 'z', min: -12, max: 12 });
createPatron(11, -4, 0x1abc9c, { axis: 'z', min: -14, max: 8 });
createPatron(-8, 11, 0xe67e22, { axis: 'x', min: -13, max: 13 });

// ==========================================
// 5. INTERACTION & PORTAL LOGIC ENGINE
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.target.set(0, 3, 0);

const mouse = new THREE.Vector2();
let isWalkthroughMode = false, yaw = 0, pitch = 0, dragObject = null, activeParentPaintingGroup = null;
let dragPlane = new THREE.Plane(), intersection = new THREE.Vector3(), offset = new THREE.Vector3();
const keysPressed = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
const moveSpeed = 0.16, playerRadius = 0.8; 

const updateMouse = (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
};

window.addEventListener('mousemove', (e) => {
  updateMouse(e);
  if (isWalkthroughMode) { yaw = -mouse.x * 1.8; pitch = mouse.y * 1.2; }
});
window.addEventListener('keydown', (e) => { if (e.key in keysPressed) keysPressed[e.key] = true; });
window.addEventListener('keyup', (e) => { if (e.key in keysPressed) keysPressed[e.key] = false; });

const portalBtn = document.getElementById('portal-btn');

// Functional Portal Switcher Engine
function executeTeleportation(outsideState) {
  isPlayerOutside = outsideState;
  
  if (isPlayerOutside) {
    camera.position.copy(outsideCameraPos);
    controls.target.set(0, 3, 0);
    portalBtn.textContent = "🚪 Enter Gallery";
    portalBtn.style.background = "#2ecc71";
  } else {
    camera.position.copy(insideCameraPos);
    controls.target.set(0, 5, 0);
    portalBtn.textContent = "🌲 Step Outside";
    portalBtn.style.background = "#e67e22";
  }
  yaw = pitch = 0;
  controls.update();
}

portalBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  executeTeleportation(!isPlayerOutside);
});

// Mode Toggle Setup
const toggleBtn = document.getElementById('walkthrough-btn');
const hintText = document.getElementById('controls-hint');
const descriptionUI = document.getElementById('painting-description-ui');

toggleBtn.addEventListener('click', () => {
  isWalkthroughMode = !isWalkthroughMode;
  controls.enabled = !isWalkthroughMode;
  hintText.style.display = isWalkthroughMode ? 'block' : 'none';
  descriptionUI.style.opacity = 0;
  toggleBtn.textContent = isWalkthroughMode ? '🔭 Orbit Mode' : '🚶 Walkthrough Mode';
  toggleBtn.style.background = isWalkthroughMode ? '#e74c3c' : '#3498db';
  
  if (isWalkthroughMode) { 
    camera.position.copy(isPlayerOutside ? outsideCameraPos : insideCameraPos);
    yaw = pitch = 0; 
  } else { 
    // Uses structural context positions instead of broken undefined variable references
    camera.position.copy(isPlayerOutside ? outsideCameraPos : insideCameraPos); 
    controls.target.set(0, isPlayerOutside ? 3 : 5, 0); 
    controls.update(); 
  }
});

// Drag and Drop Engine
const raycaster = new THREE.Raycaster();

window.addEventListener('pointerdown', (e) => {
  if (isWalkthroughMode || e.target.tagName === 'BUTTON') return;
  updateMouse(e);
  raycaster.setFromCamera(mouse, camera);

  const lightIntersects = raycaster.intersectObjects(clickables);
  if (lightIntersects.length > 0) {
    const fix = lightIntersects[0].object;
    fix.userData.isOn = !fix.userData.isOn;
    fix.userData.associatedLight.visible = fix.userData.isOn;
    fix.material.color.setHex(fix.userData.isOn ? 0xffe6cc : 0x222225);
    return;
  }

  const dragIntersects = raycaster.intersectObjects(draggables);
  if (dragIntersects.length > 0) {
    controls.enabled = false;
    const hit = dragIntersects[0].object;
    if (hit.userData.parentGroup) {
      activeParentPaintingGroup = dragObject = hit.userData.parentGroup;
      dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).applyQuaternion(dragObject.quaternion), dragObject.position);
    } else {
      activeParentPaintingGroup = null; dragObject = hit;
      dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, dragObject.userData.homeY, 0));
    }
    if (raycaster.ray.intersectPlane(dragPlane, intersection)) offset.copy(dragObject.position).sub(intersection);
  }
});

window.addEventListener('pointermove', (e) => {
  if (!dragObject || isWalkthroughMode) return;
  updateMouse(e);
  raycaster.setFromCamera(mouse, camera);
  if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
    const newPos = new THREE.Vector3().copy(intersection).add(offset);
    if (activeParentPaintingGroup) {
      dragObject.position.set(newPos.x, THREE.MathUtils.clamp(newPos.y, 2.5, 12), newPos.z);
    } else {
      dragObject.position.set(THREE.MathUtils.clamp(newPos.x, -27, 27), dragObject.userData.homeY, THREE.MathUtils.clamp(newPos.z, -27, 27));
    }
  }
});

window.addEventListener('pointerup', () => { if (dragObject) { controls.enabled = !isWalkthroughMode; dragObject = activeParentPaintingGroup = null; } });

// ==========================================
// 6. MAIN ANIMATION LOOP
// ==========================================
function animate() {
  requestAnimationFrame(animate);
  const t = Date.now() * 0.003;
  const pulse = Math.sin(Date.now() * 0.002) * 0.15 + 0.85;
  
  underGlowLights.forEach(l => {
    l.intensity = 1.2 + Math.sin(Date.now() * 0.002) * 0.4;
  });

  highlightLights.forEach(l => {
    l.intensity = 2.5 * pulse;
  });

  highlightMeshes.forEach(g => {
    g.material.opacity = 0.18 + Math.sin(Date.now() * 0.002) * 0.08;
  });

  walkingPeople.forEach(p => {
    const cycle = Math.sin(t * p.speed * 12 + p.offset);
    p.leftLeg.rotation.x = cycle * 0.4;
    p.rightLeg.rotation.x = -cycle * 0.4;
    p.group.position.y = Math.abs(cycle) * 0.08;

    if (p.bounds.axis === 'z') {
      p.group.position.z += p.speed * p.dir;
      p.group.rotation.y = p.dir > 0 ? 0 : Math.PI;
      if (p.group.position.z > p.bounds.max || p.group.position.z < p.bounds.min) p.dir *= -1;
    } else {
      p.group.position.x += p.speed * p.dir;
      p.group.rotation.y = p.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (p.group.position.x > p.bounds.max || p.group.position.x < p.bounds.min) p.dir *= -1;
    }
    p.bb.setFromObject(p.group);
  });

  if (isWalkthroughMode) {
    const targetDir = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).normalize();
    camera.lookAt(new THREE.Vector3().copy(camera.position).add(targetDir));

    const forward = new THREE.Vector3(targetDir.x, 0, targetDir.z).normalize();
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize().negate();
    let nextPos = camera.position.clone();

    if (keysPressed.w || keysPressed.ArrowUp) nextPos.addScaledVector(forward, moveSpeed);
    if (keysPressed.s || keysPressed.ArrowDown) nextPos.addScaledVector(forward, -moveSpeed);
    if (keysPressed.a || keysPressed.ArrowLeft) nextPos.addScaledVector(right, -moveSpeed);
    if (keysPressed.d || keysPressed.ArrowRight) nextPos.addScaledVector(right, moveSpeed);

    if (isPlayerOutside) {
      nextPos.set(
        THREE.MathUtils.clamp(nextPos.x, -28.2, 28.2),
        5.0,
        THREE.MathUtils.clamp(nextPos.z, 30.5, 58.0) 
      );
    } else {
      nextPos.set(
        THREE.MathUtils.clamp(nextPos.x, -28.2, 28.2),
        5.0,
        THREE.MathUtils.clamp(nextPos.z, -28.2, 29.2) 
      );
    }

    const pBox = new THREE.Box3(
      new THREE.Vector3(nextPos.x - playerRadius, 0, nextPos.z - playerRadius), 
      new THREE.Vector3(nextPos.x + playerRadius, 12, nextPos.z + playerRadius)
    );
    
    if (!collidableBoxes.some(box => pBox.intersectsBox(box))) {
      camera.position.copy(nextPos);
    }

    let closeArt = null, minD = 9.0;
    galleryPaintings.forEach(art => {
      const d = camera.position.distanceTo(art.position);
      if (d < minD) { minD = d; closeArt = art; }
    });

    if (closeArt && !isPlayerOutside) {
      const m = closeArt.userData.metadata;
      document.getElementById('art-title').textContent = m.title;
      document.getElementById('art-meta').textContent = `${m.artist} • ${m.year}`;
      document.getElementById('art-desc').textContent = m.desc;
      descriptionUI.style.opacity = 1;
    } else descriptionUI.style.opacity = 0;

  } else {
    // Dynamically tracks the relative viewport origin based on space configuration context
    const currentBasePos = isPlayerOutside ? outsideCameraPos : insideCameraPos;
    if (!dragObject) {
      camera.position.x += ((currentBasePos.x + mouse.x * 2.0) - camera.position.x) * 0.05;
      camera.position.y += ((currentBasePos.y + mouse.y * 1.5) - camera.position.y) * 0.05;
    }
    controls.update();
  }
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

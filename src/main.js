import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

// ==========================================
// 1. INJECT CLEAN STRUCTURAL CONTAINER
// ==========================================
document.querySelector('#app').innerHTML = `
  <div id="threejs-container"></div>
  <div class="ui-overlay">
    <h1>Fully Interactive Gallery Cafe</h1>
    <p>• <b>Drag & Drop everything:</b> Plates, geometric showpieces, and even the paintings on the wall!</p>
    <p>• Click any overhead light bulb to toggle its spotlight</p>
    <p>• Move your mouse around to shift your VR viewing perspective</p>
  </div>
`;

// ==========================================
// 2. TEXTURE LOADER & IMAGE ASSETS
// ==========================================
const textureLoader = new THREE.TextureLoader();

const textures = {
  floor: textureLoader.load('https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=1000&auto=format&fit=crop'), 
  tableWood: textureLoader.load('https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1000&auto=format&fit=crop'), 
  art1: textureLoader.load('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop'),  
  art2: textureLoader.load('https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop'),  
  art3: textureLoader.load('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600&auto=format&fit=crop')   
};

textures.floor.wrapS = textures.floor.wrapT = THREE.RepeatWrapping;
textures.floor.repeat.set(4, 4);

// ==========================================
// 3. SCENE, CAMERA, & RENDERER SETUP
// ==========================================
const container = document.querySelector('#threejs-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f); 

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 14); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); 
scene.add(ambientLight);

// ==========================================
// 4. CONTROLS & MOUSE COORDINATES
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; 
controls.target.set(0, 2, 0); 

const mouse = new THREE.Vector2();
const baseCameraPos = new THREE.Vector3(0, 8, 14);

function updateMouseCoordinates(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', (event) => {
    updateMouseCoordinates(event);
});

// ==========================================
// 5. STRUCTURE & DRAGGABLE WALL PAINTINGS
// ==========================================
const tables = [];
const clickables = []; 
const draggables = []; // Everything in here can be picked up by the user!

// Hardwood Floor
const floorGeo = new THREE.PlaneGeometry(40, 40);
const floorMat = new THREE.MeshStandardMaterial({ map: textures.floor, roughness: 0.5 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Back Wall
const wallGeo = new THREE.BoxGeometry(40, 12, 1);
const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e1e24, roughness: 0.9 });
const backWall = new THREE.Mesh(wallGeo, wallMat);
backWall.position.set(0, 6, -10); 
backWall.receiveShadow = true;
scene.add(backWall);

// --- DRAGGABLE PAINTING GENERATOR ---
function createPainting(x, y, width, height, artTexture) {
    const paintingGroup = new THREE.Group();
    paintingGroup.position.set(x, y, -9.4); // Sits flush on the back wall

    // Outer Frame
    const frameGeo = new THREE.BoxGeometry(width, height, 0.15);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.6 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.castShadow = true;
    paintingGroup.add(frame);

    // Inner Canvas Detail Mapping
    const canvasGeo = new THREE.BoxGeometry(width * 0.88, height * 0.88, 0.2);
    const canvasMat = new THREE.MeshStandardMaterial({ map: artTexture, roughness: 0.7 });
    const canvas = new THREE.Mesh(canvasGeo, canvasMat);
    paintingGroup.add(canvas);

    scene.add(paintingGroup);

    // CRITICAL: Tag the group components so our recursive raycaster knows it's a wall painting item
    paintingGroup.userData = { isPainting: true };
    frame.userData = { parentGroup: paintingGroup };
    canvas.userData = { parentGroup: paintingGroup };

    // Register frame and canvas surfaces as raycast collision listeners
    draggables.push(frame, canvas);
}

// Generate the wall paintings
createPainting(-7, 6.5, 3.5, 5, textures.art1);
createPainting(0, 7.0, 5.0, 4, textures.art2);
createPainting(7, 6.5, 3.5, 5, textures.art3);

// ==========================================
// 6. TABLES, PLATES, & DRAGGABLE SHOWPIECES
// ==========================================
const plateGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.05, 32);
const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.1 });

// Artistic geometric showpieces (Replacing the basic cups)
const showpieceGeometries = [
  new THREE.ConeGeometry(0.25, 0.7, 4),        // Modernist Pyramid
  new THREE.TorusGeometry(0.22, 0.08, 12, 32), // Modern Ring
  new THREE.OctahedronGeometry(0.3),           // Geometric Crystal Prism
  new THREE.CylinderGeometry(0.15, 0.15, 0.6, 6) // Hexagonal Column
];

const showpieceMaterials = [
  new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.2 }), // Gold
  new THREE.MeshStandardMaterial({ color: 0x4a90e2, roughness: 0.1, transparent: true, opacity: 0.85 }), // Blue Glass
  new THREE.MeshStandardMaterial({ color: 0xe06666, metalness: 0.2, roughness: 0.4 }), // Terracotta Ceramic
  new THREE.MeshStandardMaterial({ color: 0x1abc9c, roughness: 0.2 })  // Turquoise
];

function createTableEnvironment(x, z, styleIndex) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(x, 0, z);

    // Table Top
    const topGeo = new THREE.BoxGeometry(3.6, 0.15, 2.4);
    const woodMat = new THREE.MeshStandardMaterial({ map: textures.tableWood, roughness: 0.4 });
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.y = 2.0; 
    top.castShadow = true;
    top.receiveShadow = true;
    tableGroup.add(top);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.0);
    const legPositions = [[-1.6, 1.0, -1.0], [1.6, 1.0, -1.0], [-1.6, 1.0, 1.0], [1.6, 1.0, 1.0]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        tableGroup.add(leg);
    });

    // Spotlight 
    const light = new THREE.SpotLight(0xfff5e6, 6, 14, Math.PI / 3.2, 0.5, 1);
    light.position.set(0, 6.0, 0);
    light.target = top;
    light.castShadow = true;
    tableGroup.add(light);

    // Lightbulb Fixture Mesh
    const bulbGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe6cc });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 6.0, 0);
    tableGroup.add(bulb);

    bulb.userData = { isLightFixture: true, associatedLight: light, isOn: true };
    clickables.push(bulb);

    scene.add(tableGroup);
    tables.push(top);

    // --- SPARK TABLE ITEM ACCESSORIES ---
    // 1. Draggable Dinner Plate
    const plateMesh = new THREE.Mesh(plateGeo, porcelainMat);
    plateMesh.position.set(x - 0.5, 2.1, z);
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    scene.add(plateMesh);
    draggables.push(plateMesh);

    // 2. Luxury Geometric Showpiece Design
    const showpieceGeo = showpieceGeometries[styleIndex];
    const showpieceMat = showpieceMaterials[styleIndex];
    const showpieceMesh = new THREE.Mesh(showpieceGeo, showpieceMat);
    
    // Position cleanly on table top surface
    showpieceMesh.position.set(x + 0.5, 2.4, z + 0.2);
    if(styleIndex === 1) showpieceMesh.rotation.x = Math.PI / 2; // Flip Torus flat
    
    showpieceMesh.castShadow = true;
    showpieceMesh.receiveShadow = true;
    scene.add(showpieceMesh);
    draggables.push(showpieceMesh);
}

// Generate our four distinctive interactive table grid quadrants
createTableEnvironment(-6, -3, 0); 
createTableEnvironment(6, -3, 1);  
createTableEnvironment(-6, 4, 2);  
createTableEnvironment(6, 4, 3);   

// ==========================================
// 7. HYBRID MULTI-AXIS DRAG & DROP ENGINE
// ==========================================
const raycaster = new THREE.Raycaster();
let dragPlane = new THREE.Plane(); 
let intersection = new THREE.Vector3();
let dragObject = null;
let activeParentPaintingGroup = null; // Track if we are manipulating a compound painting node
let offset = new THREE.Vector3();

window.addEventListener('pointerdown', (event) => {
    updateMouseCoordinates(event);
    raycaster.setFromCamera(mouse, camera);

    // 1. Lightbulb toggle intersections
    const lightIntersects = raycaster.intersectObjects(clickables);
    if (lightIntersects.length > 0) {
        const fixture = lightIntersects[0].object;
        fixture.userData.isOn = !fixture.userData.isOn;
        fixture.userData.associatedLight.visible = fixture.userData.isOn;
        fixture.material.color.setHex(fixture.userData.isOn ? 0xffe6cc : 0x3a3a3a);
        return; 
    }

    // 2. Draggable interaction checking
    const dragIntersects = raycaster.intersectObjects(draggables);
    if (dragIntersects.length > 0) {
        controls.enabled = false; 
        const hitTarget = dragIntersects[0].object;

        // Check if the item belongs to a Wall Painting structural group
        if (hitTarget.userData.parentGroup) {
            activeParentPaintingGroup = hitTarget.userData.parentGroup;
            dragObject = activeParentPaintingGroup; // Move the whole assembly

            // Lock to a vertical plane running down the wall path
            dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), dragObject.position);
        } else {
            // Standard tabletop accessory item (Plate or Geometric Sculpture)
            activeParentPaintingGroup = null;
            dragObject = hitTarget;

            // Lock tracking vector down onto a flat horizontal layout plane matching current altitude
            dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), dragObject.position);
        }
        
        if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
            offset.copy(dragObject.position).sub(intersection);
        }
    }
});

window.addEventListener('pointermove', (event) => {
    if (!dragObject) return;

    updateMouseCoordinates(event);
    raycaster.setFromCamera(mouse, camera);
    
    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        if (activeParentPaintingGroup) {
            // Painting slide translation math: update X and Y directly across the back wall surface boundaries
            dragObject.position.x = intersection.x + offset.x;
            dragObject.position.y = Math.max(2.5, intersection.y + offset.y); // Floor guard protection limits
        } else {
            // Tabletop prop calculation: slide smoothly over standard flat grid dimensions
            dragObject.position.x = intersection.x + offset.x;
            dragObject.position.z = intersection.z + offset.z;
        }
    }
});

window.addEventListener('pointerup', () => {
    if (dragObject) {
        controls.enabled = true; 

        // If it's a wall painting, it doesn't drop down to a table top surface, it drops down safely on the wall plane
        if (!activeParentPaintingGroup) {
            let snapped = false;

            tables.forEach(table => {
                const worldPos = new THREE.Vector3();
                table.getWorldPosition(worldPos);

                if (Math.abs(dragObject.position.x - worldPos.x) < 1.8 && 
                    Math.abs(dragObject.position.z - worldPos.z) < 1.2) {
                    
                    // Simple logic to evaluate heights perfectly so items look resting on table wood surfaces
                    const boundingHeight = (dragObject.geometry.type === "CylinderGeometry" && dragObject.geometry.parameters.height === 0.05) ? 0.05 : 0.4;
                    dragObject.position.y = worldPos.y + 0.075 + boundingHeight;
                    snapped = true;
                }
            });

            // Snap item safely down directly onto room floor panel if dropped out of bounds
            if (!snapped) {
                const boundingHeight = (dragObject.geometry.type === "CylinderGeometry" && dragObject.geometry.parameters.height === 0.05) ? 0.025 : 0.3;
                dragObject.position.y = 0.01 + boundingHeight;
            }
        }
        
        dragObject = null;
        activeParentPaintingGroup = null;
    }
});

// ==========================================
// 8. ANIMATION LOOP & VIEW PORT SLIDE
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    if (!dragObject) {
        camera.position.x += ((baseCameraPos.x + mouse.x * 3.0) - camera.position.x) * 0.05;
        camera.position.y += ((baseCameraPos.y + mouse.y * 1.8) - camera.position.y) * 0.05;
    }

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
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
  art3: textureLoader.load('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600&auto=format&fit=crop'),
  art4: textureLoader.load('https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=600&auto=format&fit=crop'),
  art5: textureLoader.load('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=600&auto=format&fit=crop'),
  art6: textureLoader.load('https://images.unsplash.com/photo-1547891654-e66ed7edd96c?q=80&w=600&auto=format&fit=crop')
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
camera.position.set(0, 10, 16); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.25); 
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
const baseCameraPos = new THREE.Vector3(0, 10, 16);

function updateMouseCoordinates(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', (event) => {
    updateMouseCoordinates(event);
});

// ==========================================
// 5. STRUCTURE & WALL PAINTINGS WITH INTERACTIVE LIGHTS
// ==========================================
const tables = [];
const clickables = []; 
const draggables = []; 

// Floor
const floorGeo = new THREE.PlaneGeometry(40, 40);
const floorMat = new THREE.MeshStandardMaterial({ map: textures.floor, roughness: 0.5 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Back Wall
const wallGeo = new THREE.BoxGeometry(40, 14, 1);
const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e1e24, roughness: 0.9 });
const backWall = new THREE.Mesh(wallGeo, wallMat);
backWall.position.set(0, 7, -10); 
backWall.receiveShadow = true;
scene.add(backWall);

// --- PAINTING GENERATOR WITH LARGE, DISTINCT TRACK LIGHT FIXTURES ---
function createPainting(x, y, width, height, artTexture) {
    const paintingGroup = new THREE.Group();
    paintingGroup.position.set(x, y, -9.4); 

    const frameGeo = new THREE.BoxGeometry(width, height, 0.15);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.6 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.castShadow = true;
    paintingGroup.add(frame);

    const canvasGeo = new THREE.BoxGeometry(width * 0.88, height * 0.88, 0.2);
    const canvasMat = new THREE.MeshStandardMaterial({ map: artTexture, roughness: 0.5 });
    const canvas = new THREE.Mesh(canvasGeo, canvasMat);
    paintingGroup.add(canvas);

    scene.add(paintingGroup);

    // 1. Amplified High-Intensity Painting Spotlight (Increased intensity and spread)
    const artLight = new THREE.SpotLight(0xffffff, 12, 15, Math.PI / 3.5, 0.5, 1.0);
    artLight.position.set(x, y + (height / 2) + 1.4, -7.5);
    artLight.target = canvas;
    artLight.castShadow = true;
    scene.add(artLight);

    // 2. Large, Distinct Cylindrical Track Light Fixture Mesh
    const fixtureGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.6, 16);
    const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xfff0dd }); // Bright warm emission look
    const largeArtFixture = new THREE.Mesh(fixtureGeo, fixtureMat);
    
    // Position it clearly out and above the artwork frame, pointing down
    largeArtFixture.position.set(x, y + (height / 2) + 1.4, -8.5);
    largeArtFixture.rotation.x = Math.PI / 5; // Angled slightly toward the canvas
    scene.add(largeArtFixture);

    // Link metadata so it responds to clicks independently from table bulbs
    largeArtFixture.userData = { isLightFixture: true, associatedLight: artLight, isOn: true };
    clickables.push(largeArtFixture);

    // Heavy Industrial Mounting Arm supporting the larger fixture
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(x, y + (height / 2) + 1.5, -9.2);
    arm.rotation.x = Math.PI / 2; // Extends out straight from back wall
    scene.add(arm);

    paintingGroup.userData = { isPainting: true };
    frame.userData = { parentGroup: paintingGroup };
    canvas.userData = { parentGroup: paintingGroup };

    draggables.push(frame, canvas);
}

// Generate the collection of 6 paintings with large independent fixtures
createPainting(-10, 9.0, 3.2, 4.0, textures.art1);
createPainting(0, 9.5, 4.5, 3.2, textures.art2);
createPainting(10, 9.0, 3.2, 4.0, textures.art3);

createPainting(-5, 4.5, 3.5, 4.2, textures.art4);
createPainting(5, 4.5, 4.0, 3.5, textures.art5);
createPainting(13, 4.5, 2.8, 3.8, textures.art6);

// ==========================================
// 6. 3D LOW-POLY SEATED & STANDING PEOPLE
// ==========================================
function createPerson(x, y, z, shirtColor, pantsColor, isSeated = true, rotationY = 0) {
    const personGroup = new THREE.Group();
    personGroup.position.set(x, y, z);
    personGroup.rotation.y = rotationY;

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c1d11, roughness: 0.8 });

    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = isSeated ? 1.7 : 2.7;
    head.castShadow = true;
    personGroup.add(head);

    const hairGeo = new THREE.BoxGeometry(0.54, 0.2, 0.54);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, (isSeated ? 1.7 : 2.7) + 0.2, -0.02);
    personGroup.add(hair);

    const torsoGeo = new THREE.BoxGeometry(0.7, 1.0, 0.4);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = isSeated ? 1.0 : 1.9;
    torso.castShadow = true;
    personGroup.add(torso);

    if (isSeated) {
        const upperLegGeo = new THREE.BoxGeometry(0.24, 0.24, 0.7);
        const leftLeg = new THREE.Mesh(upperLegGeo, pantsMat);
        leftLeg.position.set(-0.2, 0.5, 0.3);
        leftLeg.castShadow = true;
        personGroup.add(leftLeg);

        const rightLeg = leftLeg.clone();
        rightLeg.position.x = 0.2;
        personGroup.add(rightLeg);

        const lowerLegGeo = new THREE.BoxGeometry(0.22, 0.5, 0.22);
        const leftShin = new THREE.Mesh(lowerLegGeo, skinMat);
        leftShin.position.set(-0.2, 0.25, 0.6);
        leftShin.castShadow = true;
        personGroup.add(leftShin);

        const rightShin = leftShin.clone();
        rightShin.position.x = 0.2;
        personGroup.add(rightShin);
    } else {
        const legGeo = new THREE.BoxGeometry(0.26, 1.4, 0.3);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.18, 0.7, 0);
        leftLeg.castShadow = true;
        personGroup.add(leftLeg);

        const rightLeg = leftLeg.clone();
        rightLeg.position.x = 0.18;
        personGroup.add(rightLeg);
    }

    scene.add(personGroup);
}

createPerson(-6, 0, -1.2, 0x3498db, 0x2c3e50, true, 0);          
createPerson(6, 0, -1.2, 0xe74c3c, 0x111111, true, 0);           
createPerson(-6, 0, 5.8, 0x9b59b6, 0x27ae60, true, Math.PI);      
createPerson(1.5, 0, 1, 0x2ecc71, 0x34495e, false, -Math.PI / 4); 
createPerson(-1.5, 0, 2, 0xf1c40f, 0xd35400, false, Math.PI / 3);  

// ==========================================
// 7. TABLES, PLATES, & DRAGGABLE SHOWPIECES
// ==========================================
const plateGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.05, 32);
const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.1 });

const showpieceGeometries = [
  new THREE.ConeGeometry(0.25, 0.7, 4),        
  new THREE.TorusGeometry(0.22, 0.08, 12, 32), 
  new THREE.OctahedronGeometry(0.3),           
  new THREE.CylinderGeometry(0.15, 0.15, 0.6, 6) 
];

const showpieceMaterials = [
  new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.2 }), 
  new THREE.MeshStandardMaterial({ color: 0x4a90e2, roughness: 0.1, transparent: true, opacity: 0.85 }), 
  new THREE.MeshStandardMaterial({ color: 0xe06666, metalness: 0.2, roughness: 0.4 }), 
  new THREE.MeshStandardMaterial({ color: 0x1abc9c, roughness: 0.2 })  
];

function createTableEnvironment(x, z, styleIndex) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(x, 0, z);

    const topGeo = new THREE.BoxGeometry(3.6, 0.15, 2.4);
    const woodMat = new THREE.MeshStandardMaterial({ map: textures.tableWood, roughness: 0.4 });
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.y = 2.0; 
    top.castShadow = true;
    top.receiveShadow = true;
    tableGroup.add(top);

    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.0);
    const legPositions = [[-1.6, 1.0, -1.0], [1.6, 1.0, -1.0], [-1.6, 1.0, 1.0], [1.6, 1.0, 1.0]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        tableGroup.add(leg);
    });

    const light = new THREE.SpotLight(0xfff5e6, 6, 14, Math.PI / 3.2, 0.5, 1);
    light.position.set(0, 6.0, 0);
    light.target = top;
    light.castShadow = true;
    tableGroup.add(light);

    // Standard small sphere bulbs for table lighting
    const bulbGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe6cc });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 6.0, 0);
    tableGroup.add(bulb);

    bulb.userData = { isLightFixture: true, associatedLight: light, isOn: true };
    clickables.push(bulb);

    scene.add(tableGroup);
    tables.push(top);

    const plateMesh = new THREE.Mesh(plateGeo, porcelainMat);
    plateMesh.position.set(x - 0.5, 2.1, z);
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    scene.add(plateMesh);
    draggables.push(plateMesh);

    const showpieceGeo = showpieceGeometries[styleIndex];
    const showpieceMat = showpieceMaterials[styleIndex];
    const showpieceMesh = new THREE.Mesh(showpieceGeo, showpieceMat);
    
    showpieceMesh.position.set(x + 0.5, 2.4, z + 0.2);
    if(styleIndex === 1) showpieceMesh.rotation.x = Math.PI / 2; 
    
    showpieceMesh.castShadow = true;
    showpieceMesh.receiveShadow = true;
    scene.add(showpieceMesh);
    draggables.push(showpieceMesh);
}

createTableEnvironment(-6, -3, 0); 
createTableEnvironment(6, -3, 1);  
createTableEnvironment(-6, 4, 2);  
createTableEnvironment(6, 4, 3);   

// ==========================================
// 8. UNIFIED RAYCASTING AND DRAG ENGINE
// ==========================================
const raycaster = new THREE.Raycaster();
let dragPlane = new THREE.Plane(); 
let intersection = new THREE.Vector3();
let dragObject = null;
let activeParentPaintingGroup = null; 
let offset = new THREE.Vector3();

window.addEventListener('pointerdown', (event) => {
    updateMouseCoordinates(event);
    raycaster.setFromCamera(mouse, camera);

    // Dynamic on/off mechanics for both small table bulbs and large track lamps
    const lightIntersects = raycaster.intersectObjects(clickables);
    if (lightIntersects.length > 0) {
        const fixture = lightIntersects[0].object;
        fixture.userData.isOn = !fixture.userData.isOn;
        fixture.userData.associatedLight.visible = fixture.userData.isOn;
        // Switches color from glowing warm-white to dead dark gray when off
        fixture.material.color.setHex(fixture.userData.isOn ? 0xfff0dd : 0x222225);
        return; 
    }

    const dragIntersects = raycaster.intersectObjects(draggables);
    if (dragIntersects.length > 0) {
        controls.enabled = false; 
        const hitTarget = dragIntersects[0].object;

        if (hitTarget.userData.parentGroup) {
            activeParentPaintingGroup = hitTarget.userData.parentGroup;
            dragObject = activeParentPaintingGroup; 
            dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), dragObject.position);
        } else {
            activeParentPaintingGroup = null;
            dragObject = hitTarget;
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
            dragObject.position.x = intersection.x + offset.x;
            dragObject.position.y = Math.max(2.0, intersection.y + offset.y); 
        } else {
            dragObject.position.x = intersection.x + offset.x;
            dragObject.position.z = intersection.z + offset.z;
        }
    }
});

window.addEventListener('pointerup', () => {
    if (dragObject) {
        controls.enabled = true; 

        if (!activeParentPaintingGroup) {
            let snapped = false;

            tables.forEach(table => {
                const worldPos = new THREE.Vector3();
                table.getWorldPosition(worldPos);

                if (Math.abs(dragObject.position.x - worldPos.x) < 1.8 && 
                    Math.abs(dragObject.position.z - worldPos.z) < 1.2) {
                    
                    const boundingHeight = (dragObject.geometry.type === "CylinderGeometry" && dragObject.geometry.parameters.height === 0.05) ? 0.05 : 0.4;
                    dragObject.position.y = worldPos.y + 0.075 + boundingHeight;
                    snapped = true;
                }
            });

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
// 9. ANIMATION LOOP & PERSPECTIVE DRIFT
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    if (!dragObject) {
        camera.position.x += ((baseCameraPos.x + mouse.x * 3.5) - camera.position.x) * 0.05;
        camera.position.y += ((baseCameraPos.y + mouse.y * 2.0) - camera.position.y) * 0.05;
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
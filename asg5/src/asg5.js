import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';

class MinMaxGUIHelper {
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }
  get min() {
    return this.obj[this.minProp];
  }
  set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }
  get max() {
    return this.obj[this.maxProp];
  }
  set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min;  // this will call the min setter
  }
}

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return '#' + this.object[this.prop].getHexString();
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  // Camera Setup
  const fov = 70;
  const aspect = 2;
  const near = 0.1;
  const far = 25;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 3;
  camera.position.x = 2;
  const scene = new THREE.Scene();
  
  // Background skybox
  {  
    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('park.jpg',
      () => {
        bgTexture.mapping = THREE.EquirectangularReflectionMapping;
        bgTexture.colorSpace = THREE.SRGBColorSpace;
        scene.background = bgTexture;
      });
  }

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0); // Point the camera at the center of the scene
  controls.update();

  function updateCamera() {
    camera.updateProjectionMatrix();
  }

  function updateLight() {
    helper.update();
  }
  
  // Lighting
  const color = 0xFFFFFF;
  const intensity = 3;
  const directionalLight = new THREE.DirectionalLight(color, intensity);
  directionalLight.position.set(5, 55, 5);
  scene.add(directionalLight);
  const pointLight = new THREE.PointLight(color, 10);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);
  const helper = new THREE.PointLightHelper(pointLight);
  scene.add(helper);
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
  scene.add(ambientLight);

  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }

  // GUI
  const gui = new GUI();
  gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
  gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
  gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
  gui.add(pointLight, 'distance', 0, 40).onChange(updateLight);
  makeXYZGUI(gui, pointLight.position, 'position', updateLight);

  gui.addColor(new ColorGUIHelper(ambientLight, 'color'), 'value').name('color');
  gui.add(ambientLight, 'intensity', 0, 5, 0.01);

  // Objects
  // Yarn balls (textured, animated sphere)
  const balls = [];

  // Array of different yarn textures
  const yarnTextures = [
    'pinkyarn.jpeg',
    'whiteyarn.webp', 
    'purpleyarn.jpeg',
  ];

  const loader = new THREE.TextureLoader();
  const yarnGeom = new THREE.SphereGeometry(0.2, 32, 32);

  for (let i = 0; i < 15; i++) {
    const texturePath = yarnTextures[i % yarnTextures.length];
    const texture = loader.load(texturePath);
    texture.colorSpace = THREE.SRGBColorSpace;
    const yarnMaterial = new THREE.MeshPhongMaterial({ map: texture });
    const ball = new THREE.Mesh(yarnGeom, yarnMaterial);

    // Position them randomly
    ball.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
    scene.add(ball);
    balls.push(ball); 
  }

  // Cat tree (cylinders & cubes) ---
  const catTree = new THREE.Group();
  const baseGeom = new THREE.BoxGeometry(2, 0.15, 2);
  const topGeom = new THREE.BoxGeometry(1.5, 0.1, 1.5);
  const top = createRectanglularPrism(baseGeom, 0x815438, -0.25);
  catTree.add(top);
  const base = createRectanglularPrism(topGeom, 0x815438, 1.25);
  catTree.add(base);

  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 1.5, 32),
    new THREE.MeshPhongMaterial({ color: 0xD2B48C })
  );
  pillar.position.y = 0.5;
  catTree.add(pillar);
  catTree.position.set(3, 0, -2);
  scene.add(catTree);

  // Water bowl
  const waterBowl = new THREE.Group();
  const bowl = makeBowl(1.2, -0.1, 1, 0xC0C0C0, 0.3, 0.2);
  waterBowl.add(bowl);
  const water = makeBowl(1.2, -0.1, 1, 0x0E87CC, 0.25, 0.15);
  water.position.y += 0.001;
  waterBowl.add(water);
  scene.add(waterBowl);
  waterBowl.position.set(2, 0, 2);

  // Cat model (loaded from OBJ file)
  const objLoader = new OBJLoader();
  const mtlLoader = new MTLLoader();
  mtlLoader.load('kitten.mtl', (mtl) => {
    mtl.preload();
    objLoader.setMaterials(mtl);
  });
  objLoader.load('kitten.obj', (root) => {
    root.rotation.y = -130 * Math.PI / 180;
    root.position.set(0, 0.25, 0);
    root.scale.set(0.75, 0.75, 0.75);
    scene.add(root);
  });

  // Butterflies (animated)
  const butterflies = [];
  const wingGeom = new THREE.BoxGeometry(0.2, 0.01, 0.1);
  const wingMat = new THREE.MeshPhongMaterial({ color: 0xFFA500, side: THREE.DoubleSide });

  for (let i = 0; i < 3; i++) {
    const bGroup = new THREE.Group();
    
    const leftWing = new THREE.Mesh(wingGeom, wingMat);
    leftWing.position.x = 0.1;
    
    const rightWing = new THREE.Mesh(wingGeom, wingMat);
    rightWing.position.x = -0.1;
    
    bGroup.add(leftWing, rightWing);
    scene.add(bGroup);
    
    // Store wings separately to animate the "flap"
    butterflies.push({
      group: bGroup,
      left: leftWing,
      right: rightWing,
      offset: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random()
    });
  }


  // Helper function to create rectangular prisms
  function createRectanglularPrism(geometry, color, y) {
    const material = new THREE.MeshPhongMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.y = y;
    return cube;
  }

  function makeBowl(x, y, z, color, top, bottom) { 
    const geometry = new THREE.CylinderGeometry(top, bottom, 0.2);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      specular: 0xffffff,
      shininess: 100,
    });
    const bowl = new THREE.Mesh(geometry, material);
    bowl.position.set(x, y, z);
    scene.add(bowl);
    return bowl;
  }

  // Animation Loop
  function render(time) {
    time *= 0.001; // convert time to seconds

    // --- ANIMATE BUTTERFLIES ---
    butterflies.forEach((b, i) => {
      // 1. The "Flap"
      const flap = Math.sin(time * 15 + b.offset) * 0.8;
      b.left.rotation.z = flap;
      b.right.rotation.z = -flap;

      // 2. The Flight Path (Circle/Figure-8 around the kitten)
      const t = time * b.speed + b.offset;
      b.group.position.x = Math.sin(t) * (3 + i);
      b.group.position.z = Math.cos(t) * (3 + i);
      b.group.position.y = 1 + Math.sin(t * 2) * 0.5;
      
      // 3. Make them point where they are flying
      b.group.rotation.y = t + Math.PI / 2;
    });

    balls.forEach((ball, ndx) => {
      const speed = 3 + ndx * .5;
      const rot = time * speed;
      ball.rotation.x = rot;
      ball.rotation.y = rot;
    });
    
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(ARButton.createButton(renderer));

const pointLight = new THREE.PointLight(0xffffff, 40);
pointLight.position.set(0, 2, -1);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 5);
pointLight2.position.set(0, -1, -1);
scene.add(pointLight2);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.69);
scene.add(ambientLight);

let mixer, currentObject, clickToStartTextMesh;
const loader = new GLTFLoader();
const fontLoader = new FontLoader();

const urlParams = new URLSearchParams(window.location.search);
const danceMoves = [];
const danceFiles = [];

const audio = new Audio('Bang-Bang-Born.mp3');
audio.loop = true;
audio.volume = 0.5;

for (let i = 0; urlParams.has(`dance_move_${i + 1}`); i++) {
    danceMoves.push(urlParams.get(`dance_move_${i + 1}`));
    danceFiles.push(urlParams.get(`dance_file_${i + 1}`));
}

let currentIndex = 0;

let danceMoveTextMesh, resetTextMesh;

fontLoader.load('Roboto_Regular.json', function (font) {
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const clickToStartGeometry = new TextGeometry('Click Start AR', {
        font: font,
        size: 0.5,
        depth: 0.1,
    });
    clickToStartTextMesh = new THREE.Mesh(clickToStartGeometry, textMaterial);
    clickToStartTextMesh.position.set(0, 0, -8);
    scene.add(clickToStartTextMesh);

    const resetTextGeometry = new TextGeometry('Dance Changes Every 30 Seconds', {
        font: font,
        size: 0.2,
        depth: 0.1,
    });
    resetTextMesh = new THREE.Mesh(resetTextGeometry, textMaterial);
    resetTextMesh.position.set(0, 1.1, -3);
    scene.add(resetTextMesh);
});

function updateDanceMoveText(text) {
    if (danceMoveTextMesh) {
        scene.remove(danceMoveTextMesh);
        danceMoveTextMesh.geometry.dispose();
        danceMoveTextMesh.material.dispose();
    }
    fontLoader.load('Roboto_Regular.json', function (font) {
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.5,
            depth: 0.1,
        });
        danceMoveTextMesh = new THREE.Mesh(textGeometry, textMaterial);
        danceMoveTextMesh.position.set(-1.5, 1.5, -3);
        scene.add(danceMoveTextMesh);
    });
}

function loadDanceMove(index) {
    if (currentObject) {
        scene.remove(currentObject);
        currentObject.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        currentObject = null;
    }

    loader.load(danceFiles[index], function (gltf) {
        currentObject = gltf.scene;

        if (currentObject) {
            currentObject.scale.set(1, 1, 1);
            currentObject.position.set(0, -1.5, -4);
            scene.add(currentObject);

            currentObject.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.color.set(0xff69b4);
                }
            });

            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(currentObject);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                mixer.timeScale = 1;
            } else {
                console.warn('No animations found in the GLTF file.');
            }
        } else {
            console.error('Failed to load the GLTF model.');
        }
    });

    updateDanceMoveText(danceMoves[index]);
}

function startExperience() {
    audio.play();
    loadDanceMove(currentIndex);
    scene.remove(clickToStartTextMesh);
}

document.body.addEventListener('click', startExperience, { once: true });

setInterval(() => {
    currentIndex = (currentIndex + 1) % danceMoves.length;
    loadDanceMove(currentIndex);

    resetTextMesh.position.set(0, 0, -5);
}, 30000);

const clock = new THREE.Clock();

renderer.setAnimationLoop(function () {
    const deltaTime = clock.getDelta();

    if (mixer) mixer.update(deltaTime);

    renderer.render(scene, camera);
});

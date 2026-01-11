// ==========================================
// HIDE & SEEK ONLINE - 3D Version
// ==========================================

// Game Configuration
const CONFIG = {
    ARENA_RADIUS: 40,
    PLAYER_RADIUS: 1.5,
    HIDER_SPEED: 0.28,
    SEEKER_SPEED: 0.35,
    BOOST_SPEED: 0.6,
    BOOST_DURATION: 1500,
    BOOST_COOLDOWN: 5000,
    SEEKER_VIEW_RANGE: 28,
    SEEKER_VIEW_ANGLE: Math.PI / 2.5,
    GAME_DURATION: 90,
    CATCH_DISTANCE: 3,
    WALL_HEIGHT: 4
};

// Board definitions
const BOARDS = [
    {
        name: "The Courtyard",
        spawns: { seeker: { x: -30, z: 0 }, hider: { x: 30, z: 0 } },
        style: { floor: 0x808080, wall: 0xcc3333 }, // Concrete gray
        walls: [
            { x: -6, z: -6, w: 12, d: 2 },
            { x: -6, z: 4, w: 12, d: 2 },
            { x: -6, z: -4, w: 2, d: 8 },
            { x: 4, z: -4, w: 2, d: 8 },
            { x: -20, z: -5, w: 8, d: 2 },
            { x: 12, z: -5, w: 8, d: 2 },
            { x: -20, z: 3, w: 8, d: 2 },
            { x: 12, z: 3, w: 8, d: 2 },
            { x: -28, z: -28, w: 6, d: 6 },
            { x: 22, z: -28, w: 6, d: 6 },
            { x: -28, z: 22, w: 6, d: 6 },
            { x: 22, z: 22, w: 6, d: 6 }
        ]
    },
    {
        name: "The Maze",
        spawns: { seeker: { x: -30, z: -28 }, hider: { x: 30, z: 28 } },
        style: { floor: 0x909090, wall: 0xcc8833 }, // Concrete gray
        walls: [
            { x: -30, z: -20, w: 15, d: 2 },
            { x: -10, z: -20, w: 20, d: 2 },
            { x: 15, z: -20, w: 15, d: 2 },
            { x: -20, z: -10, w: 12, d: 2 },
            { x: 8, z: -10, w: 12, d: 2 },
            { x: -15, z: 0, w: 30, d: 2 },
            { x: -20, z: 10, w: 12, d: 2 },
            { x: 8, z: 10, w: 12, d: 2 },
            { x: -30, z: 20, w: 15, d: 2 },
            { x: -10, z: 20, w: 20, d: 2 },
            { x: 15, z: 20, w: 15, d: 2 }
        ]
    },
    {
        name: "The Pillars",
        spawns: { seeker: { x: -20, z: -20 }, hider: { x: 20, z: 20 } },
        style: { floor: 0x888888, wall: 0x9933cc }, // Concrete gray
        walls: [
            { x: -25, z: -25, w: 4, d: 4 },
            { x: -15, z: -25, w: 4, d: 4 },
            { x: -5, z: -25, w: 4, d: 4 },
            { x: 5, z: -25, w: 4, d: 4 },
            { x: 15, z: -25, w: 4, d: 4 },
            { x: 25, z: -25, w: 4, d: 4 },
            { x: -25, z: -10, w: 4, d: 4 },
            { x: -5, z: -10, w: 4, d: 4 },
            { x: 15, z: -10, w: 4, d: 4 },
            { x: -15, z: 5, w: 4, d: 4 },
            { x: 5, z: 5, w: 4, d: 4 },
            { x: 25, z: 5, w: 4, d: 4 },
            { x: -25, z: 20, w: 4, d: 4 },
            { x: -5, z: 20, w: 4, d: 4 },
            { x: 15, z: 20, w: 4, d: 4 }
        ]
    },
    {
        name: "The Fortress",
        spawns: { seeker: { x: 0, z: 0 }, hider: { x: 0, z: -20 } },
        style: { floor: 0x787878, wall: 0x696969 }, // Concrete gray
        walls: [
            { x: -30, z: -30, w: 20, d: 2.5 },
            { x: 10, z: -30, w: 20, d: 2.5 },
            { x: -30, z: 27.5, w: 20, d: 2.5 },
            { x: 10, z: 27.5, w: 20, d: 2.5 },
            { x: -30, z: -30, w: 2.5, d: 20 },
            { x: -30, z: 10, w: 2.5, d: 20 },
            { x: 27.5, z: -30, w: 2.5, d: 20 },
            { x: 27.5, z: 10, w: 2.5, d: 20 },
            { x: -8, z: -8, w: 16, d: 2.5 },
            { x: -8, z: 5.5, w: 16, d: 2.5 },
            { x: -8, z: -8, w: 2.5, d: 16 },
            { x: 5.5, z: -8, w: 2.5, d: 16 }
        ]
    }
];

let currentBoardIndex = 0;
let currentBoard = BOARDS[0];

// ==========================================
// Game State
// ==========================================

const state = {
    screen: 'menu',
    isHost: false,
    isSoloMode: false,
    peer: null,
    conn: null,
    roomCode: '',
    role: null,
    gameStarted: false,
    gameOver: false,
    timeRemaining: CONFIG.GAME_DURATION,
    screenShake: 0,
    dangerLevel: 0,
    panicMode: false,
    player: {
        x: 0,
        z: 0,
        angle: 0,
        boosting: false,
        boostCooldown: 0
    },
    opponent: {
        x: 0,
        z: 0,
        angle: 0,
        boosting: false
    },
    keys: { up: false, down: false, left: false, right: false },
    ai: {
        targetX: 0,
        targetZ: 0,
        lastSeenPlayer: null,
        patrolAngle: 0,
        thinkTimer: 0,
        state: 'patrol' // patrol, chase, flee, hide
    }
};

// ==========================================
// Three.js Setup
// ==========================================

let scene, camera, renderer;
let playerMesh, opponentMesh;
let seekerModel, seekerAnimations;
let seekerBoostModel, seekerBoostAnimations;
let hiderModel, hiderAnimations;
let wallMeshes = [];
let floorMesh;
let playerMixer, opponentMixer;
let walkTime = 0;
let clock = new THREE.Clock();
let currentPlayerModel = null; // Track which model is active for seeker

function initThreeJS() {
    // Scene - fully lit environment, no darkness
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Light sky blue background

    // Camera - top-down angled view
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 30);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-canvas').replaceWith(renderer.domElement);
    renderer.domElement.id = 'game-canvas';

    // Bright ambient lighting - fully lit environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Strong directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(30, 80, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -60;
    directionalLight.shadow.camera.right = 60;
    directionalLight.shadow.camera.top = 60;
    directionalLight.shadow.camera.bottom = -60;
    scene.add(directionalLight);

    // Secondary fill light for even lighting
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-20, 40, -20);
    scene.add(fillLight);

    // Load all character models
    loadSeekerModel();
    loadSeekerBoostModel();
    loadHiderModel();

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

function loadSeekerModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('images/Characters/Meshy_AI_biped/Meshy_AI_Animation_Walking_withSkin.glb',
        (gltf) => {
            seekerModel = gltf.scene;
            seekerModel.scale.set(5, 5, 5);
            seekerModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (gltf.animations && gltf.animations.length > 0) {
                seekerAnimations = gltf.animations;
                console.log('Seeker animations found:', gltf.animations.length, gltf.animations.map(a => a.name));
                console.log('Animation duration:', gltf.animations[0].duration);
                console.log('Animation tracks:', gltf.animations[0].tracks.length);
            } else {
                console.log('NO ANIMATIONS FOUND IN SEEKER MODEL');
            }

            console.log('Seeker model loaded!');
        },
        (progress) => {},
        (error) => {
            console.error('Error loading seeker model:', error);
            seekerModel = null;
        }
    );
}

function loadSeekerBoostModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('images/Characters/Meshy_AI_biped/Meshy_AI_Animation_Running_withSkin.glb',
        (gltf) => {
            seekerBoostModel = gltf.scene;
            seekerBoostModel.scale.set(5, 5, 5);
            seekerBoostModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (gltf.animations && gltf.animations.length > 0) {
                seekerBoostAnimations = gltf.animations;
                console.log('Seeker boost animations found:', gltf.animations.map(a => a.name));
            }

            console.log('Seeker boost model loaded!');
        },
        (progress) => {},
        (error) => {
            console.error('Error loading seeker boost model:', error);
            seekerBoostModel = null;
        }
    );
}

function loadHiderModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('images/Characters/Meshy_AI_biped/Meshy_AI_Meshy_Merged_Animations - kid 3.glb',
        (gltf) => {
            hiderModel = gltf.scene;
            hiderModel.scale.set(5, 5, 5);
            hiderModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (gltf.animations && gltf.animations.length > 0) {
                hiderAnimations = gltf.animations;
                console.log('Hider animations found:', gltf.animations.length, gltf.animations.map(a => a.name));
                console.log('Hider animation duration:', gltf.animations[0].duration);
                console.log('Hider animation tracks:', gltf.animations[0].tracks.length);
            } else {
                console.log('NO ANIMATIONS in hider model!');
            }

            console.log('Hider model loaded!');
        },
        (progress) => {},
        (error) => {
            console.error('Error loading hider model:', error);
            hiderModel = null;
        }
    );
}

function createArena() {
    // Clear existing
    wallMeshes.forEach(w => scene.remove(w));
    wallMeshes = [];
    if (floorMesh) scene.remove(floorMesh);

    const board = BOARDS[currentBoardIndex];
    currentBoard = board;

    // Floor
    const floorGeometry = new THREE.CircleGeometry(CONFIG.ARENA_RADIUS, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: board.style.floor,
        roughness: 0.8,
        metalness: 0.2
    });
    floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Grid lines
    // Concrete floor - no grid

    // Arena boundary
    const boundaryGeometry = new THREE.RingGeometry(CONFIG.ARENA_RADIUS - 0.5, CONFIG.ARENA_RADIUS, 64);
    const boundaryMaterial = new THREE.MeshBasicMaterial({ color: 0x4facfe, side: THREE.DoubleSide });
    const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
    boundary.rotation.x = -Math.PI / 2;
    boundary.position.y = 0.02;
    scene.add(boundary);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: board.style.wall,
        roughness: 0.5,
        metalness: 0.3
    });

    board.walls.forEach(wall => {
        const geometry = new THREE.BoxGeometry(wall.w, CONFIG.WALL_HEIGHT, wall.d);
        const mesh = new THREE.Mesh(geometry, wallMaterial);
        mesh.position.set(wall.x + wall.w / 2, CONFIG.WALL_HEIGHT / 2, wall.z + wall.d / 2);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        wallMeshes.push(mesh);

        // Wall edge glow
        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edges.position.copy(mesh.position);
        scene.add(edges);
        wallMeshes.push(edges);
    });
}

function createPlayers() {
    // Remove existing
    if (playerMesh) scene.remove(playerMesh);
    if (opponentMesh) scene.remove(opponentMesh);

    // Determine which models to use based on role
    const playerIsSeeker = state.role === 'seeker';
    const myModel = playerIsSeeker ? seekerModel : hiderModel;
    const myAnimations = playerIsSeeker ? seekerAnimations : hiderAnimations;
    const oppModel = playerIsSeeker ? hiderModel : seekerModel;
    const oppAnimations = playerIsSeeker ? hiderAnimations : seekerAnimations;

    // Create player mesh
    if (myModel) {
        playerMesh = THREE.SkeletonUtils.clone(myModel);
        // Tint player based on role (gold for seeker, cyan for hider)
        const playerColor = playerIsSeeker ? 0xe5c644 : 0x4dd0e1;
        playerMesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.material.color.setHex(playerColor);
            }
        });
        playerMixer = new THREE.AnimationMixer(playerMesh);
        if (myAnimations && myAnimations.length > 0) {
            console.log('Setting up player animation:', myAnimations[0].name, 'duration:', myAnimations[0].duration);
            const action = playerMixer.clipAction(myAnimations[0]);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            action.timeScale = 1.0;
            action.play();
            action.paused = false; // Start playing immediately to test
            playerMesh.userData.walkAction = action;
            console.log('Player animation action created, playing:', action.isRunning());
        } else {
            console.log('NO ANIMATIONS for player!');
        }
        // Store boost model reference for seeker
        if (playerIsSeeker) {
            playerMesh.userData.isSeeker = true;
            currentPlayerModel = 'normal';
        }
    } else {
        // Fallback to capsule
        const geometry = new THREE.CapsuleGeometry(CONFIG.PLAYER_RADIUS * 0.7, CONFIG.PLAYER_RADIUS, 8, 16);
        const material = new THREE.MeshStandardMaterial({
            color: playerIsSeeker ? 0xff6b6b : 0x51cf66,
            roughness: 0.3,
            metalness: 0.7
        });
        playerMesh = new THREE.Mesh(geometry, material);
    }
    playerMesh.castShadow = true;
    scene.add(playerMesh);

    // Create opponent mesh
    if (oppModel) {
        opponentMesh = THREE.SkeletonUtils.clone(oppModel);
        // Tint opponent based on their role (opposite of player)
        const opponentColor = playerIsSeeker ? 0x4dd0e1 : 0xe5c644;
        opponentMesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.material.color.setHex(opponentColor);
            }
        });
        opponentMixer = new THREE.AnimationMixer(opponentMesh);
        if (oppAnimations && oppAnimations.length > 0) {
            const action = opponentMixer.clipAction(oppAnimations[0]);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            action.timeScale = 1.0;
            action.play();
            action.paused = true;
            opponentMesh.userData.walkAction = action;
        }
    } else {
        const geometry = new THREE.CapsuleGeometry(CONFIG.PLAYER_RADIUS * 0.7, CONFIG.PLAYER_RADIUS, 8, 16);
        const material = new THREE.MeshStandardMaterial({
            color: playerIsSeeker ? 0x51cf66 : 0xff6b6b,
            roughness: 0.3,
            metalness: 0.7
        });
        opponentMesh = new THREE.Mesh(geometry, material);
    }
    opponentMesh.castShadow = true;
    scene.add(opponentMesh);

}

// Swap seeker model when boosting
function swapToBoostModel() {
    if (!playerMesh.userData.isSeeker || !seekerBoostModel) return;
    if (currentPlayerModel === 'boost') return;

    const pos = playerMesh.position.clone();
    const rot = playerMesh.rotation.clone();

    scene.remove(playerMesh);
    playerMesh = THREE.SkeletonUtils.clone(seekerBoostModel);
    playerMesh.position.copy(pos);
    playerMesh.rotation.copy(rot);
    playerMesh.userData.isSeeker = true;

    // Apply gold tint to seeker
    playerMesh.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.setHex(0xe5c644);
        }
    });

    playerMixer = new THREE.AnimationMixer(playerMesh);
    if (seekerBoostAnimations && seekerBoostAnimations.length > 0) {
        const action = playerMixer.clipAction(seekerBoostAnimations[0]);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
        action.timeScale = 1.2; // Slightly faster for boost
        action.play();
        playerMesh.userData.walkAction = action;
    }

    playerMesh.castShadow = true;
    scene.add(playerMesh);
    currentPlayerModel = 'boost';
}

function swapToNormalModel() {
    if (!playerMesh.userData.isSeeker || !seekerModel) return;
    if (currentPlayerModel === 'normal') return;

    const pos = playerMesh.position.clone();
    const rot = playerMesh.rotation.clone();

    scene.remove(playerMesh);
    playerMesh = THREE.SkeletonUtils.clone(seekerModel);
    playerMesh.position.copy(pos);
    playerMesh.rotation.copy(rot);
    playerMesh.userData.isSeeker = true;

    // Apply gold tint to seeker
    playerMesh.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material = child.material.clone();
            child.material.color.setHex(0xe5c644);
        }
    });

    playerMixer = new THREE.AnimationMixer(playerMesh);
    if (seekerAnimations && seekerAnimations.length > 0) {
        const action = playerMixer.clipAction(seekerAnimations[0]);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
        action.timeScale = 1.0;
        action.play();
        action.paused = true;
        playerMesh.userData.walkAction = action;
    }

    playerMesh.castShadow = true;
    scene.add(playerMesh);
    currentPlayerModel = 'normal';
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================
// DOM Elements
// ==========================================

const screens = {
    menu: document.getElementById('menu-screen'),
    waiting: document.getElementById('waiting-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

const elements = {
    soloBtn: document.getElementById('solo-btn'),
    createBtn: document.getElementById('create-btn'),
    joinBtn: document.getElementById('join-btn'),
    joinCode: document.getElementById('join-code'),
    cancelBtn: document.getElementById('cancel-btn'),
    copyCode: document.getElementById('copy-code'),
    roomCode: document.getElementById('room-code'),
    connectionStatus: document.getElementById('connection-status'),
    roleDisplay: document.getElementById('role-display'),
    timerDisplay: document.getElementById('timer-display'),
    abilityDisplay: document.getElementById('ability-display'),
    abilityFill: document.getElementById('ability-fill'),
    abilityText: document.getElementById('ability-text'),
    resultTitle: document.getElementById('result-title'),
    resultMessage: document.getElementById('result-message'),
    playAgainBtn: document.getElementById('play-again-btn'),
    menuBtn: document.getElementById('menu-btn'),
    homeBtn: document.getElementById('home-btn')
};

// ==========================================
// Screen Management
// ==========================================

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
    state.screen = screenName;
}

function setStatus(message, type = '') {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = 'status ' + type;
}

// ==========================================
// Networking (PeerJS)
// ==========================================

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

const PEER_CONFIG = {
    debug: 2,
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    }
};

function createGame() {
    state.roomCode = generateRoomCode();
    state.isHost = true;
    setStatus('Creating game...');

    if (state.peer) state.peer.destroy();

    state.peer = new Peer('hideseek3d-' + state.roomCode, PEER_CONFIG);

    state.peer.on('open', (id) => {
        elements.roomCode.textContent = state.roomCode;
        showScreen('waiting');
    });

    state.peer.on('connection', (conn) => {
        state.conn = conn;
        if (conn.open) setupConnection();
        else conn.on('open', () => setupConnection());
    });

    state.peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            state.peer.destroy();
            setTimeout(createGame, 500);
        } else {
            setStatus('Connection error: ' + err.type, 'error');
            showScreen('menu');
        }
    });
}

function joinGame() {
    const code = elements.joinCode.value.toUpperCase().trim();
    if (code.length !== 4) {
        setStatus('Please enter a 4-character code', 'error');
        return;
    }

    state.roomCode = code;
    state.isHost = false;
    setStatus('Connecting...');

    if (state.peer) state.peer.destroy();

    state.peer = new Peer(PEER_CONFIG);

    state.peer.on('open', () => {
        state.conn = state.peer.connect('hideseek3d-' + code, { reliable: true });
        state.conn.on('open', () => setupConnection());
        state.conn.on('error', () => setStatus('Could not connect', 'error'));
    });

    state.peer.on('error', (err) => {
        setStatus('Game not found', 'error');
    });

    setTimeout(() => {
        if (!state.conn || !state.conn.open) {
            setStatus('Connection timed out', 'error');
            if (state.peer) state.peer.destroy();
        }
    }, 15000);
}

function setupConnection() {
    state.conn.on('data', handleNetworkMessage);
    state.conn.on('close', () => {
        if (state.gameStarted && !state.gameOver) {
            endGame('opponent_disconnected');
        } else {
            setStatus('Opponent disconnected', 'error');
            showScreen('menu');
        }
    });

    if (state.isHost) {
        setTimeout(() => {
            const hostIsSeeker = Math.random() < 0.5;
            state.role = hostIsSeeker ? 'seeker' : 'hider';
            state.conn.send({
                type: 'role_assign',
                guestRole: hostIsSeeker ? 'hider' : 'seeker',
                boardIndex: currentBoardIndex
            });
            startGame();
        }, 500);
    }
}

function handleNetworkMessage(data) {
    switch (data.type) {
        case 'role_assign':
            state.role = data.guestRole;
            currentBoardIndex = data.boardIndex || 0;
            startGame();
            break;
        case 'position':
            state.opponent.x = data.x;
            state.opponent.z = data.z;
            state.opponent.angle = data.angle;
            state.opponent.boosting = data.boosting || false;
            break;
        case 'catch':
            if (!state.gameOver) endGame('caught');
            break;
        case 'next_board':
            currentBoardIndex = data.boardIndex;
            state.role = data.opponentRole;
            startGame();
            break;
    }
}

function sendPosition() {
    if (state.conn && state.conn.open) {
        state.conn.send({
            type: 'position',
            x: state.player.x,
            z: state.player.z,
            angle: state.player.angle,
            boosting: state.player.boosting
        });
    }
}

// ==========================================
// Game Logic
// ==========================================

function startGame() {
    state.gameStarted = true;
    state.gameOver = false;
    state.timeRemaining = CONFIG.GAME_DURATION;
    state.player.boosting = false;
    state.player.boostCooldown = 0;
    state.keys = { up: false, down: false, left: false, right: false };
    state.screenShake = 0;
    state.dangerLevel = 0;
    state.panicMode = false;

    currentBoard = BOARDS[currentBoardIndex];
    const spawns = currentBoard.spawns;

    if (state.role === 'seeker') {
        state.player.x = spawns.seeker.x;
        state.player.z = spawns.seeker.z;
        state.opponent.x = spawns.hider.x;
        state.opponent.z = spawns.hider.z;
    } else {
        state.player.x = spawns.hider.x;
        state.player.z = spawns.hider.z;
        state.opponent.x = spawns.seeker.x;
        state.opponent.z = spawns.seeker.z;
    }
    state.player.angle = Math.atan2(state.opponent.z - state.player.z, state.opponent.x - state.player.x);

    // Setup UI
    elements.roleDisplay.textContent = state.role.toUpperCase();
    elements.roleDisplay.className = state.role;
    elements.abilityDisplay.style.display = state.role === 'seeker' ? 'block' : 'none';
    updateTimerDisplay();

    // Create 3D scene
    createArena();
    createPlayers();

    showScreen('game');
    startTimer();
    animate();
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (state.gameOver) {
            clearInterval(timerInterval);
            return;
        }
        state.timeRemaining--;
        updateTimerDisplay();
        state.panicMode = state.timeRemaining <= 10 && state.timeRemaining > 0;

        if (state.timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame('time_up');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    elements.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (state.panicMode) {
        const pulse = Math.sin(Date.now() / 150) * 0.5 + 0.5;
        elements.timerDisplay.style.transform = `scale(${1 + pulse * 0.2})`;
        elements.timerDisplay.style.color = '#ff3333';
    } else {
        elements.timerDisplay.style.transform = 'scale(1)';
        elements.timerDisplay.style.color = '';
    }
}

function endGame(reason) {
    state.gameOver = true;
    state.gameStarted = false;

    let title, message, isWinner = false;

    switch (reason) {
        case 'caught':
            if (state.role === 'seeker') {
                title = 'VICTORY!';
                message = 'You caught the hider!';
                isWinner = true;
            } else {
                title = 'CAUGHT!';
                message = 'The seeker found you!';
            }
            break;
        case 'time_up':
            if (state.role === 'hider') {
                title = 'VICTORY!';
                message = 'You survived!';
                isWinner = true;
            } else {
                title = "TIME'S UP!";
                message = 'The hider escaped!';
            }
            break;
        case 'opponent_disconnected':
            title = 'Opponent Left';
            message = 'Opponent disconnected.';
            elements.resultTitle.textContent = title;
            elements.resultMessage.textContent = message;
            showScreen('result');
            return;
    }

    showCelebration(title, message, isWinner);
}

function showCelebration(title, message, isWinner) {
    const overlay = document.createElement('div');
    overlay.id = 'celebration-overlay';
    overlay.innerHTML = `
        <div class="celebration-content ${isWinner ? 'winner' : 'loser'}">
            <h1 class="celebration-title">${title}</h1>
            <p class="celebration-message">${message}</p>
            <div class="celebration-particles"></div>
            <div class="next-board-info">
                <p>Next up:</p>
                <h2>${BOARDS[(currentBoardIndex + 1) % BOARDS.length].name}</h2>
            </div>
            <div class="countdown">Starting in <span id="countdown-num">5</span>...</div>
        </div>
    `;
    document.body.appendChild(overlay);

    if (isWinner) {
        const container = overlay.querySelector('.celebration-particles');
        const colors = ['#ffd700', '#ff6b6b', '#51cf66', '#4facfe', '#ff66ff'];
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*2}s;animation-duration:${2+Math.random()*2}s;`;
            container.appendChild(particle);
        }
    }

    let count = 5;
    const countdownEl = overlay.querySelector('#countdown-num');
    const interval = setInterval(() => {
        count--;
        countdownEl.textContent = count;
        if (count <= 0) {
            clearInterval(interval);
            overlay.remove();
            advanceToNextBoard();
        }
    }, 1000);
}

function advanceToNextBoard() {
    currentBoardIndex = (currentBoardIndex + 1) % BOARDS.length;
    const wasSeeker = state.role === 'seeker';
    state.role = wasSeeker ? 'hider' : 'seeker';

    // Reset AI state for solo mode
    if (state.isSoloMode) {
        state.ai.lastSeenPlayer = null;
        state.ai.thinkTimer = 0;
        state.ai.patrolAngle = Math.random() * Math.PI * 2;
    }

    if (state.conn && state.conn.open) {
        state.conn.send({
            type: 'next_board',
            boardIndex: currentBoardIndex,
            opponentRole: wasSeeker ? 'seeker' : 'hider'
        });
    }
    startGame();
}

function checkCatch() {
    if (state.role !== 'seeker') return;
    const dx = state.player.x - state.opponent.x;
    const dz = state.player.z - state.opponent.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < CONFIG.CATCH_DISTANCE) {
        if (state.conn && state.conn.open) {
            state.conn.send({ type: 'catch' });
        }
        endGame('caught');
    }
}

// Check if AI seeker catches the player (for solo mode)
function checkAICatch() {
    if (!state.isSoloMode || state.role !== 'hider') return;
    const dx = state.player.x - state.opponent.x;
    const dz = state.player.z - state.opponent.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < CONFIG.CATCH_DISTANCE) {
        endGame('caught');
    }
}

// ==========================================
// Movement & Physics
// ==========================================

function updatePlayer(deltaTime) {
    let dx = 0, dz = 0;

    if (state.keys.up) dz -= 1;
    if (state.keys.down) dz += 1;
    if (state.keys.left) dx -= 1;
    if (state.keys.right) dx += 1;

    if (dx !== 0 && dz !== 0) {
        const len = Math.sqrt(dx * dx + dz * dz);
        dx /= len;
        dz /= len;
    }

    if (dx !== 0 || dz !== 0) {
        state.player.angle = Math.atan2(dz, dx);
    }

    const baseSpeed = state.role === 'seeker' ? CONFIG.SEEKER_SPEED : CONFIG.HIDER_SPEED;
    const speed = state.player.boosting ? CONFIG.BOOST_SPEED : baseSpeed;
    dx *= speed;
    dz *= speed;

    let newX = state.player.x + dx;
    let newZ = state.player.z + dz;

    // Arena bounds
    const distFromCenter = Math.sqrt(newX * newX + newZ * newZ);
    if (distFromCenter > CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS) {
        const angle = Math.atan2(newZ, newX);
        newX = Math.cos(angle) * (CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS);
        newZ = Math.sin(angle) * (CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS);
    }

    // Wall collisions
    const collision = checkWallCollision(newX, newZ);
    if (!collision.x) state.player.x = newX;
    if (!collision.z) state.player.z = newZ;

    // Boost cooldown
    if (state.player.boostCooldown > 0) {
        state.player.boostCooldown -= deltaTime;
        if (state.player.boostCooldown < 0) state.player.boostCooldown = 0;
    }

    // Update ability UI
    if (state.role === 'seeker') {
        const cooldownPercent = 1 - (state.player.boostCooldown / CONFIG.BOOST_COOLDOWN);
        elements.abilityFill.style.width = (cooldownPercent * 100) + '%';
        elements.abilityText.textContent = state.player.boosting ? 'BOOSTING!' :
            state.player.boostCooldown <= 0 ? 'BOOST [SPACE]' : 'COOLDOWN...';
        elements.abilityText.className = state.player.boostCooldown <= 0 ? 'ready' : '';
    }

    // Danger level for hider
    if (state.role === 'hider') {
        const dist = Math.sqrt(
            Math.pow(state.player.x - state.opponent.x, 2) +
            Math.pow(state.player.z - state.opponent.z, 2)
        );
        state.dangerLevel = dist < 15 ? 1 - (dist / 15) : 0;
    }

    sendPosition();
    checkCatch();
}

function checkWallCollision(x, z) {
    const result = { x: false, z: false };
    const r = CONFIG.PLAYER_RADIUS;

    for (const wall of currentBoard.walls) {
        const wx = wall.x;
        const wz = wall.z;
        const ww = wall.w;
        const wd = wall.d;

        if (x + r > wx && x - r < wx + ww &&
            state.player.z + r > wz && state.player.z - r < wz + wd) {
            result.x = true;
        }
        if (state.player.x + r > wx && state.player.x - r < wx + ww &&
            z + r > wz && z - r < wz + wd) {
            result.z = true;
        }
    }
    return result;
}

function activateBoost() {
    if (state.role !== 'seeker') return;
    if (state.player.boostCooldown > 0 || state.player.boosting) return;

    state.player.boosting = true;
    state.screenShake = 5;

    setTimeout(() => {
        state.player.boosting = false;
        state.player.boostCooldown = CONFIG.BOOST_COOLDOWN;
    }, CONFIG.BOOST_DURATION);
}

// ==========================================
// Visibility (Seeker FOV)
// ==========================================

function isPointVisible(px, pz) {
    const dx = px - state.player.x;
    const dz = pz - state.player.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > CONFIG.SEEKER_VIEW_RANGE) return false;

    const angleToPoint = Math.atan2(dz, dx);
    let angleDiff = angleToPoint - state.player.angle;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    if (Math.abs(angleDiff) > CONFIG.SEEKER_VIEW_ANGLE) return false;

    // Check wall occlusion
    for (const wall of currentBoard.walls) {
        if (lineIntersectsRect(
            state.player.x, state.player.z, px, pz,
            wall.x, wall.z, wall.w, wall.d
        )) {
            return false;
        }
    }
    return true;
}

function lineIntersectsRect(x1, z1, x2, z2, rx, rz, rw, rd) {
    return lineIntersectsLine(x1, z1, x2, z2, rx, rz, rx + rw, rz) ||
           lineIntersectsLine(x1, z1, x2, z2, rx + rw, rz, rx + rw, rz + rd) ||
           lineIntersectsLine(x1, z1, x2, z2, rx, rz + rd, rx + rw, rz + rd) ||
           lineIntersectsLine(x1, z1, x2, z2, rx, rz, rx, rz + rd);
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (Math.abs(denom) < 0.0001) return false;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

// ==========================================
// AI Logic for Solo Mode
// ==========================================

function updateAI(deltaTime) {
    if (!state.isSoloMode || state.gameOver) return;

    const ai = state.ai;
    ai.thinkTimer -= deltaTime;

    // AI plays the opposite role of the player
    const aiRole = state.role === 'seeker' ? 'hider' : 'seeker';

    if (aiRole === 'seeker') {
        updateSeekerAI(deltaTime);
        checkAICatch(); // AI seeker can catch the player
    } else {
        updateHiderAI(deltaTime);
    }
}

function updateSeekerAI(deltaTime) {
    const ai = state.ai;
    const playerVisible = canAISeePoint(state.player.x, state.player.z);

    if (playerVisible) {
        // Chase the player
        ai.state = 'chase';
        ai.lastSeenPlayer = { x: state.player.x, z: state.player.z, time: Date.now() };
        ai.targetX = state.player.x;
        ai.targetZ = state.player.z;
    } else if (ai.lastSeenPlayer && Date.now() - ai.lastSeenPlayer.time < 3000) {
        // Go to last known position
        ai.targetX = ai.lastSeenPlayer.x;
        ai.targetZ = ai.lastSeenPlayer.z;
    } else {
        // Patrol
        ai.state = 'patrol';
        if (ai.thinkTimer <= 0) {
            ai.thinkTimer = 2000 + Math.random() * 2000;
            ai.patrolAngle += (Math.random() - 0.5) * Math.PI;
            const patrolDist = 15 + Math.random() * 15;
            ai.targetX = state.opponent.x + Math.cos(ai.patrolAngle) * patrolDist;
            ai.targetZ = state.opponent.z + Math.sin(ai.patrolAngle) * patrolDist;
            // Keep within arena
            const dist = Math.sqrt(ai.targetX * ai.targetX + ai.targetZ * ai.targetZ);
            if (dist > CONFIG.ARENA_RADIUS - 5) {
                const angle = Math.atan2(ai.targetZ, ai.targetX);
                ai.targetX = Math.cos(angle) * (CONFIG.ARENA_RADIUS - 10);
                ai.targetZ = Math.sin(angle) * (CONFIG.ARENA_RADIUS - 10);
            }
        }
    }

    // Move toward target
    moveAIToward(ai.targetX, ai.targetZ, CONFIG.SEEKER_SPEED, deltaTime);
}

function updateHiderAI(deltaTime) {
    const ai = state.ai;
    const distToSeeker = Math.sqrt(
        Math.pow(state.opponent.x - state.player.x, 2) +
        Math.pow(state.opponent.z - state.player.z, 2)
    );

    // Check if seeker can see us
    const seekerCanSeeUs = canSeekerSeePoint(state.opponent.x, state.opponent.z);

    if (distToSeeker < 20 || seekerCanSeeUs) {
        // Flee from seeker
        ai.state = 'flee';
        const fleeAngle = Math.atan2(
            state.opponent.z - state.player.z,
            state.opponent.x - state.player.x
        );
        ai.targetX = state.opponent.x + Math.cos(fleeAngle) * 30;
        ai.targetZ = state.opponent.z + Math.sin(fleeAngle) * 30;

        // Try to find cover
        const nearestWall = findNearestWallForCover();
        if (nearestWall) {
            ai.targetX = nearestWall.x;
            ai.targetZ = nearestWall.z;
        }
    } else {
        // Hide behind walls or stay still
        ai.state = 'hide';
        if (ai.thinkTimer <= 0) {
            ai.thinkTimer = 3000 + Math.random() * 3000;
            // Find a good hiding spot
            const hidingSpot = findHidingSpot();
            if (hidingSpot) {
                ai.targetX = hidingSpot.x;
                ai.targetZ = hidingSpot.z;
            }
        }
    }

    // Move toward target (hider is slower)
    moveAIToward(ai.targetX, ai.targetZ, CONFIG.HIDER_SPEED, deltaTime);
}

function canAISeePoint(px, pz) {
    // Check if AI (opponent) can see a point
    const dx = px - state.opponent.x;
    const dz = pz - state.opponent.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > CONFIG.SEEKER_VIEW_RANGE) return false;

    const angleToPoint = Math.atan2(dz, dx);
    let angleDiff = angleToPoint - state.opponent.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    if (Math.abs(angleDiff) > CONFIG.SEEKER_VIEW_ANGLE) return false;

    // Check wall occlusion
    return !isWallBetween(state.opponent.x, state.opponent.z, px, pz);
}

function canSeekerSeePoint(px, pz) {
    // Check if player (seeker) can see a point
    const dx = px - state.player.x;
    const dz = pz - state.player.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > CONFIG.SEEKER_VIEW_RANGE) return false;

    const angleToPoint = Math.atan2(dz, dx);
    let angleDiff = angleToPoint - state.player.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    if (Math.abs(angleDiff) > CONFIG.SEEKER_VIEW_ANGLE) return false;

    return !isWallBetween(state.player.x, state.player.z, px, pz);
}

function isWallBetween(x1, z1, x2, z2) {
    for (const wall of currentBoard.walls) {
        if (lineIntersectsRect(x1, z1, x2, z2, wall.x, wall.z, wall.w, wall.d)) {
            return true;
        }
    }
    return false;
}

function moveAIToward(targetX, targetZ, speed, deltaTime) {
    const dx = targetX - state.opponent.x;
    const dz = targetZ - state.opponent.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 1) return; // Close enough

    // Normalize direction
    const dirX = dx / dist;
    const dirZ = dz / dist;

    // Update angle to face movement direction
    state.opponent.angle = Math.atan2(dirZ, dirX);

    // Move
    let newX = state.opponent.x + dirX * speed;
    let newZ = state.opponent.z + dirZ * speed;

    // Arena bounds
    const distFromCenter = Math.sqrt(newX * newX + newZ * newZ);
    if (distFromCenter > CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS) {
        const angle = Math.atan2(newZ, newX);
        newX = Math.cos(angle) * (CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS);
        newZ = Math.sin(angle) * (CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS);
    }

    // Wall collisions for AI
    const collision = checkAIWallCollision(newX, newZ);
    if (!collision.x) state.opponent.x = newX;
    if (!collision.z) state.opponent.z = newZ;
}

function checkAIWallCollision(x, z) {
    const result = { x: false, z: false };
    const r = CONFIG.PLAYER_RADIUS;

    for (const wall of currentBoard.walls) {
        const wx = wall.x;
        const wz = wall.z;
        const ww = wall.w;
        const wd = wall.d;

        if (x + r > wx && x - r < wx + ww &&
            state.opponent.z + r > wz && state.opponent.z - r < wz + wd) {
            result.x = true;
        }
        if (state.opponent.x + r > wx && state.opponent.x - r < wx + ww &&
            z + r > wz && z - r < wz + wd) {
            result.z = true;
        }
    }
    return result;
}

function findNearestWallForCover() {
    let nearest = null;
    let nearestDist = Infinity;

    for (const wall of currentBoard.walls) {
        // Find point on opposite side of wall from seeker
        const wallCenterX = wall.x + wall.w / 2;
        const wallCenterZ = wall.z + wall.d / 2;

        const angleFromSeeker = Math.atan2(
            wallCenterZ - state.player.z,
            wallCenterX - state.player.x
        );

        // Point on far side of wall from seeker
        const coverX = wallCenterX + Math.cos(angleFromSeeker) * (wall.w / 2 + 3);
        const coverZ = wallCenterZ + Math.sin(angleFromSeeker) * (wall.d / 2 + 3);

        const dist = Math.sqrt(
            Math.pow(coverX - state.opponent.x, 2) +
            Math.pow(coverZ - state.opponent.z, 2)
        );

        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = { x: coverX, z: coverZ };
        }
    }

    return nearest;
}

function findHidingSpot() {
    // Find a spot behind a wall that the seeker can't see
    let bestSpot = null;
    let bestScore = -Infinity;

    for (const wall of currentBoard.walls) {
        const wallCenterX = wall.x + wall.w / 2;
        const wallCenterZ = wall.z + wall.d / 2;

        // Try several points around the wall
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            const testX = wallCenterX + Math.cos(angle) * (Math.max(wall.w, wall.d) / 2 + 3);
            const testZ = wallCenterZ + Math.sin(angle) * (Math.max(wall.w, wall.d) / 2 + 3);

            // Check if within arena
            if (Math.sqrt(testX * testX + testZ * testZ) > CONFIG.ARENA_RADIUS - 3) continue;

            // Score based on: distance from seeker, wall between us and seeker
            const distFromSeeker = Math.sqrt(
                Math.pow(testX - state.player.x, 2) +
                Math.pow(testZ - state.player.z, 2)
            );

            const hasWallCover = isWallBetween(state.player.x, state.player.z, testX, testZ);
            const distFromCurrent = Math.sqrt(
                Math.pow(testX - state.opponent.x, 2) +
                Math.pow(testZ - state.opponent.z, 2)
            );

            let score = distFromSeeker * 0.5;
            if (hasWallCover) score += 50;
            score -= distFromCurrent * 0.3; // Prefer closer spots

            if (score > bestScore) {
                bestScore = score;
                bestSpot = { x: testX, z: testZ };
            }
        }
    }

    return bestSpot;
}

// ==========================================
// Render Loop
// ==========================================

let lastTime = 0;

function animate(currentTime = 0) {
    if (!state.gameStarted || state.gameOver) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    updatePlayer(deltaTime);
    updateAI(deltaTime);
    updateScene();
    render();

    requestAnimationFrame(animate);
}

function updateScene() {
    // Check if player is moving
    const isMoving = state.keys.up || state.keys.down || state.keys.left || state.keys.right;
    const walkSpeed = state.player.boosting ? 18 : 12;

    // Update walk animation time
    if (isMoving) {
        walkTime += 0.016 * walkSpeed;
    }

    // Get delta time for animation
    const delta = clock.getDelta();

    // Swap seeker model when boosting
    if (state.role === 'seeker') {
        if (state.player.boosting) {
            swapToBoostModel();
        } else {
            swapToNormalModel();
        }
    }

    // Update player mesh with walking animation
    if (playerMesh) {
        playerMesh.position.set(state.player.x, 0, state.player.z);
        // Rotate to face walking direction (model faces +Z by default)
        playerMesh.rotation.y = -state.player.angle + Math.PI / 2;

        // Play/pause walking animation based on movement
        if (playerMesh.userData.walkAction) {
            if (isMoving || state.player.boosting) {
                playerMesh.userData.walkAction.paused = false;
            } else {
                playerMesh.userData.walkAction.paused = true;
            }
        }

        // Update animation mixer
        if (playerMixer) {
            playerMixer.update(delta);
        }
    }

    // Check if opponent is moving (based on position change)
    const opponentMoving = state.opponent.lastX !== undefined &&
        (Math.abs(state.opponent.x - state.opponent.lastX) > 0.01 ||
         Math.abs(state.opponent.z - state.opponent.lastZ) > 0.01);
    state.opponent.lastX = state.opponent.x;
    state.opponent.lastZ = state.opponent.z;

    // Update opponent mesh
    if (opponentMesh) {
        const visible = state.role === 'hider' ||
            isPointVisible(state.opponent.x, state.opponent.z);
        opponentMesh.visible = visible;

        opponentMesh.position.set(state.opponent.x, 0, state.opponent.z);
        // Rotate to face walking direction
        opponentMesh.rotation.y = -state.opponent.angle + Math.PI / 2;

        // Play/pause walking animation for opponent
        if (opponentMesh.userData.walkAction) {
            opponentMesh.userData.walkAction.paused = !opponentMoving;
        }

        // Update opponent animation mixer
        if (opponentMixer) {
            opponentMixer.update(delta);
        }
    }

    // Update camera to follow player
    const cameraHeight = 45;
    const cameraDistance = 25;

    // Add screen shake
    let shakeX = 0, shakeZ = 0;
    if (state.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * state.screenShake * 0.5;
        shakeZ = (Math.random() - 0.5) * state.screenShake * 0.5;
        state.screenShake *= 0.9;
    }

    camera.position.set(
        state.player.x + shakeX,
        cameraHeight,
        state.player.z + cameraDistance + shakeZ
    );
    camera.lookAt(state.player.x, 0, state.player.z);

    // Environment stays fully lit - no lighting effects for vision
    // Background is always bright sky blue
    scene.background = new THREE.Color(0x87CEEB);
}

function render() {
    renderer.render(scene, camera);
}

// ==========================================
// Input Handling
// ==========================================

function handleKeyDown(e) {
    if (state.screen !== 'game') return;

    switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': state.keys.up = true; break;
        case 's': case 'arrowdown': state.keys.down = true; break;
        case 'a': case 'arrowleft': state.keys.left = true; break;
        case 'd': case 'arrowright': state.keys.right = true; break;
        case ' ':
            e.preventDefault();
            activateBoost();
            break;
    }
}

function handleKeyUp(e) {
    switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': state.keys.up = false; break;
        case 's': case 'arrowdown': state.keys.down = false; break;
        case 'a': case 'arrowleft': state.keys.left = false; break;
        case 'd': case 'arrowright': state.keys.right = false; break;
    }
}

// Mobile controls
function initMobileControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickStick = document.getElementById('joystick-stick');
    const boostBtn = document.getElementById('boost-btn');

    if (!joystickZone) return;

    let touchActive = false;
    let startX = 0, startY = 0;

    joystickZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joystickZone.getBoundingClientRect();
        touchActive = true;
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        updateJoystick(touch.clientX, touch.clientY);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!touchActive) return;
        updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
    });

    document.addEventListener('touchend', () => {
        if (touchActive) {
            touchActive = false;
            state.keys = { up: false, down: false, left: false, right: false };
            joystickStick.style.transform = 'translate(-50%, -50%)';
        }
    });

    boostBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        activateBoost();
    }, { passive: false });

    function updateJoystick(touchX, touchY) {
        const dx = touchX - startX;
        const dy = touchY - startY;
        const maxDist = 40;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
        const angle = Math.atan2(dy, dx);

        const stickX = Math.cos(angle) * dist;
        const stickY = Math.sin(angle) * dist;
        joystickStick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

        const threshold = 15;
        state.keys.right = dx > threshold;
        state.keys.left = dx < -threshold;
        state.keys.down = dy > threshold;
        state.keys.up = dy < -threshold;
    }
}

// ==========================================
// Initialization
// ==========================================

function startSoloGame() {
    state.isSoloMode = true;
    state.isHost = true;
    state.role = Math.random() < 0.5 ? 'seeker' : 'hider';

    // Reset AI state
    state.ai = {
        targetX: 0,
        targetZ: 0,
        lastSeenPlayer: null,
        patrolAngle: Math.random() * Math.PI * 2,
        thinkTimer: 0,
        state: 'patrol'
    };

    currentBoardIndex = 0;
    startGame();
}

function init() {
    initThreeJS();

    elements.soloBtn.addEventListener('click', startSoloGame);
    elements.createBtn.addEventListener('click', createGame);
    elements.joinBtn.addEventListener('click', joinGame);
    elements.joinCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinGame();
    });

    elements.cancelBtn.addEventListener('click', () => {
        if (state.peer) state.peer.destroy();
        showScreen('menu');
    });

    elements.copyCode.addEventListener('click', () => {
        navigator.clipboard.writeText(state.roomCode);
        elements.copyCode.textContent = 'Copied!';
        setTimeout(() => elements.copyCode.textContent = 'Copy', 2000);
    });

    elements.playAgainBtn.addEventListener('click', () => {
        if (state.isSoloMode) {
            // Solo mode: advance to next board with swapped role
            currentBoardIndex = (currentBoardIndex + 1) % BOARDS.length;
            state.role = state.role === 'seeker' ? 'hider' : 'seeker';
            state.ai.lastSeenPlayer = null;
            state.ai.thinkTimer = 0;
            startGame();
        } else if (state.conn && state.conn.open && state.isHost) {
            advanceToNextBoard();
        }
    });

    elements.menuBtn.addEventListener('click', () => {
        if (state.peer) state.peer.destroy();
        state.isSoloMode = false;
        state.gameStarted = false;
        state.gameOver = false;
        showScreen('menu');
    });

    elements.homeBtn.addEventListener('click', () => {
        if (state.peer) state.peer.destroy();
        state.isSoloMode = false;
        state.gameStarted = false;
        state.gameOver = false;
        showScreen('menu');
    });

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    initMobileControls();
}

// ==========================================
// Character Preview on Homepage
// ==========================================

let previewScene, previewCamera, previewRenderer, previewMixer, previewCharacter;

function initCharacterPreview() {
    const container = document.getElementById('character-preview');
    if (!container) return;

    // Create scene
    previewScene = new THREE.Scene();
    previewScene.background = null; // Transparent background

    // Camera
    previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    previewCamera.position.set(0, 3, 6);
    previewCamera.lookAt(0, 1.5, 0);

    // Renderer
    previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    previewRenderer.setSize(200, 200);
    previewRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(previewRenderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    previewScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    previewScene.add(directionalLight);

    // Load character
    const loader = new THREE.GLTFLoader();
    loader.load('images/Characters/Meshy_AI_biped/Meshy_AI_Animation_Walking_withSkin.glb',
        (gltf) => {
            previewCharacter = gltf.scene;
            previewCharacter.scale.set(2, 2, 2);
            previewCharacter.position.set(0, 0, 0);

            // Apply gold tint
            previewCharacter.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material = child.material.clone();
                    child.material.color.setHex(0xe5c644);
                }
            });

            previewScene.add(previewCharacter);

            // Setup animation
            if (gltf.animations && gltf.animations.length > 0) {
                previewMixer = new THREE.AnimationMixer(previewCharacter);
                const action = previewMixer.clipAction(gltf.animations[0]);
                action.setLoop(THREE.LoopRepeat, Infinity);
                action.play();
            }

            animatePreview();
        }
    );
}

function animatePreview() {
    requestAnimationFrame(animatePreview);

    if (previewMixer) {
        previewMixer.update(0.016);
    }

    // Slowly rotate character
    if (previewCharacter) {
        previewCharacter.rotation.y += 0.01;
    }

    if (previewRenderer && previewScene && previewCamera) {
        previewRenderer.render(previewScene, previewCamera);
    }
}

// Initialize preview when page loads
setTimeout(initCharacterPreview, 100);

init();

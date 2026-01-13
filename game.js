// ==========================================
// HIDE & SEEK ONLINE - Main Game File
// ==========================================

// Game Configuration
const CONFIG = {
    ARENA_RADIUS: 400,
    PLAYER_RADIUS: 15,
    HIDER_SPEED: 2.8,
    SEEKER_SPEED: 3.15,
    BOOST_SPEED: 5.4,
    BOOST_DURATION: 1500,
    BOOST_COOLDOWN: 5000,
    SEEKER_VIEW_RANGE: 280,
    SEEKER_VIEW_ANGLE: Math.PI / 2.5, // 72 degrees (144 total FOV) - wider but still limited
    GAME_DURATION: 90, // seconds
    CATCH_DISTANCE: 30,
    TICK_RATE: 60
};

// Board definitions - each has walls, style, and name
const BOARDS = [
    {
        name: "The Courtyard",
        spawns: { seeker: { x: -300, y: 0 }, hider: { x: 300, y: 0 } },
        style: {
            floor: '#1a1a2e',
            floorAccent: '#16213e',
            wallColor: '#cc3333',
            wallHighlight: '#ff5555',
            gridColor: 'rgba(79, 172, 254, 0.1)'
        },
        walls: [
            // Center structure
            { x: -60, y: -60, w: 120, h: 20 },
            { x: -60, y: 40, w: 120, h: 20 },
            { x: -60, y: -40, w: 20, h: 80 },
            { x: 40, y: -40, w: 20, h: 80 },
            // Outer obstacles
            { x: -200, y: -50, w: 80, h: 20 },
            { x: 120, y: -50, w: 80, h: 20 },
            { x: -200, y: 30, w: 80, h: 20 },
            { x: 120, y: 30, w: 80, h: 20 },
            // Corner blocks
            { x: -280, y: -280, w: 60, h: 60 },
            { x: 220, y: -280, w: 60, h: 60 },
            { x: -280, y: 220, w: 60, h: 60 },
            { x: 220, y: 220, w: 60, h: 60 },
            // Side barriers
            { x: -150, y: -200, w: 20, h: 100 },
            { x: 130, y: -200, w: 20, h: 100 },
            { x: -150, y: 100, w: 20, h: 100 },
            { x: 130, y: 100, w: 20, h: 100 },
            // Additional cover
            { x: -50, y: -250, w: 100, h: 20 },
            { x: -50, y: 230, w: 100, h: 20 },
            { x: -250, y: -20, w: 20, h: 40 },
            { x: 230, y: -20, w: 20, h: 40 }
        ]
    },
    {
        name: "The Maze",
        spawns: { seeker: { x: -300, y: -280 }, hider: { x: 300, y: 280 } },
        style: {
            floor: '#1a2a1a',
            floorAccent: '#0f1f0f',
            wallColor: '#cc8833',
            wallHighlight: '#ffaa55',
            gridColor: 'rgba(100, 200, 100, 0.1)'
        },
        walls: [
            // Horizontal maze walls
            { x: -300, y: -200, w: 150, h: 20 },
            { x: -100, y: -200, w: 200, h: 20 },
            { x: 150, y: -200, w: 150, h: 20 },
            { x: -200, y: -100, w: 120, h: 20 },
            { x: 80, y: -100, w: 120, h: 20 },
            { x: -150, y: 0, w: 300, h: 20 },
            { x: -200, y: 100, w: 120, h: 20 },
            { x: 80, y: 100, w: 120, h: 20 },
            { x: -300, y: 200, w: 150, h: 20 },
            { x: -100, y: 200, w: 200, h: 20 },
            { x: 150, y: 200, w: 150, h: 20 },
            // Vertical maze walls
            { x: -200, y: -300, w: 20, h: 100 },
            { x: 180, y: -300, w: 20, h: 100 },
            { x: -100, y: -180, w: 20, h: 80 },
            { x: 80, y: -180, w: 20, h: 80 },
            { x: -250, y: -80, w: 20, h: 160 },
            { x: 230, y: -80, w: 20, h: 160 },
            { x: -100, y: 100, w: 20, h: 80 },
            { x: 80, y: 100, w: 20, h: 80 },
            { x: -200, y: 200, w: 20, h: 100 },
            { x: 180, y: 200, w: 20, h: 100 }
        ]
    },
    {
        name: "The Pillars",
        spawns: { seeker: { x: -200, y: -200 }, hider: { x: 200, y: 200 } },
        style: {
            floor: '#1a1a2e',
            floorAccent: '#2a1a3e',
            wallColor: '#9933cc',
            wallHighlight: '#cc66ff',
            gridColor: 'rgba(200, 100, 255, 0.1)'
        },
        walls: [
            // Grid of pillars
            { x: -250, y: -250, w: 40, h: 40 },
            { x: -150, y: -250, w: 40, h: 40 },
            { x: -50, y: -250, w: 40, h: 40 },
            { x: 50, y: -250, w: 40, h: 40 },
            { x: 150, y: -250, w: 40, h: 40 },
            { x: 250, y: -250, w: 40, h: 40 },
            { x: -250, y: -150, w: 40, h: 40 },
            { x: -50, y: -150, w: 40, h: 40 },
            { x: 150, y: -150, w: 40, h: 40 },
            { x: -150, y: -50, w: 40, h: 40 },
            { x: 50, y: -50, w: 40, h: 40 },
            { x: 250, y: -50, w: 40, h: 40 },
            { x: -250, y: 50, w: 40, h: 40 },
            { x: -50, y: 50, w: 40, h: 40 },
            { x: 150, y: 50, w: 40, h: 40 },
            { x: -150, y: 150, w: 40, h: 40 },
            { x: 50, y: 150, w: 40, h: 40 },
            { x: 250, y: 150, w: 40, h: 40 },
            { x: -250, y: 250, w: 40, h: 40 },
            { x: -150, y: 250, w: 40, h: 40 },
            { x: -50, y: 250, w: 40, h: 40 },
            { x: 50, y: 250, w: 40, h: 40 },
            { x: 150, y: 250, w: 40, h: 40 },
            { x: 250, y: 250, w: 40, h: 40 }
        ]
    },
    {
        name: "The Spiral",
        spawns: { seeker: { x: 0, y: -200 }, hider: { x: 0, y: 200 } },
        style: {
            floor: '#2a1a1a',
            floorAccent: '#1a0f0f',
            wallColor: '#33cccc',
            wallHighlight: '#66ffff',
            gridColor: 'rgba(100, 255, 255, 0.1)'
        },
        walls: [
            // Spiral pattern
            { x: -50, y: -300, w: 100, h: 20 },
            { x: 50, y: -280, w: 20, h: 180 },
            { x: -150, y: -100, w: 200, h: 20 },
            { x: -150, y: -100, w: 20, h: 200 },
            { x: -150, y: 100, w: 250, h: 20 },
            { x: 100, y: -50, w: 20, h: 150 },
            { x: -250, y: -200, w: 20, h: 300 },
            { x: -250, y: -200, w: 150, h: 20 },
            { x: 150, y: -200, w: 20, h: 250 },
            { x: 150, y: 50, w: 150, h: 20 },
            { x: 300, y: -150, w: 20, h: 200 },
            { x: 200, y: -150, w: 100, h: 20 },
            { x: -300, y: 150, w: 200, h: 20 },
            { x: -100, y: 150, w: 20, h: 150 },
            { x: -100, y: 300, w: 300, h: 20 },
            { x: 200, y: 150, w: 20, h: 150 }
        ]
    },
    {
        name: "The Fortress",
        spawns: { seeker: { x: 0, y: 0 }, hider: { x: 0, y: -200 } },
        style: {
            floor: '#1a1a1a',
            floorAccent: '#2a2a2a',
            wallColor: '#888888',
            wallHighlight: '#aaaaaa',
            gridColor: 'rgba(150, 150, 150, 0.1)'
        },
        walls: [
            // Outer fortress walls
            { x: -300, y: -300, w: 200, h: 25 },
            { x: 100, y: -300, w: 200, h: 25 },
            { x: -300, y: 275, w: 200, h: 25 },
            { x: 100, y: 275, w: 200, h: 25 },
            { x: -300, y: -300, w: 25, h: 200 },
            { x: -300, y: 100, w: 25, h: 200 },
            { x: 275, y: -300, w: 25, h: 200 },
            { x: 275, y: 100, w: 25, h: 200 },
            // Inner keep
            { x: -80, y: -80, w: 160, h: 25 },
            { x: -80, y: 55, w: 160, h: 25 },
            { x: -80, y: -80, w: 25, h: 160 },
            { x: 55, y: -80, w: 25, h: 160 },
            // Towers
            { x: -200, y: -200, w: 50, h: 50 },
            { x: 150, y: -200, w: 50, h: 50 },
            { x: -200, y: 150, w: 50, h: 50 },
            { x: 150, y: 150, w: 50, h: 50 }
        ]
    },
    {
        name: "The Grid",
        spawns: { seeker: { x: -300, y: 0 }, hider: { x: 300, y: 0 } },
        style: {
            floor: '#0a1a2a',
            floorAccent: '#0a0a1a',
            wallColor: '#00ff88',
            wallHighlight: '#66ffbb',
            gridColor: 'rgba(0, 255, 136, 0.15)'
        },
        walls: [
            // Perfect grid pattern
            { x: -250, y: -250, w: 20, h: 120 },
            { x: -250, y: 130, w: 20, h: 120 },
            { x: -130, y: -250, w: 20, h: 120 },
            { x: -130, y: 130, w: 20, h: 120 },
            { x: -10, y: -250, w: 20, h: 120 },
            { x: -10, y: 130, w: 20, h: 120 },
            { x: 110, y: -250, w: 20, h: 120 },
            { x: 110, y: 130, w: 20, h: 120 },
            { x: 230, y: -250, w: 20, h: 120 },
            { x: 230, y: 130, w: 20, h: 120 },
            // Horizontal
            { x: -250, y: -10, w: 120, h: 20 },
            { x: 130, y: -10, w: 120, h: 20 },
            { x: -130, y: -130, w: 120, h: 20 },
            { x: -10, y: -130, w: 120, h: 20 },
            { x: -130, y: 110, w: 120, h: 20 },
            { x: -10, y: 110, w: 120, h: 20 }
        ]
    },
    {
        name: "The Bunker",
        spawns: { seeker: { x: -280, y: -280 }, hider: { x: 280, y: 280 } },
        style: {
            floor: '#1a1a0a',
            floorAccent: '#2a2a1a',
            wallColor: '#8b7355',
            wallHighlight: '#c4a574',
            gridColor: 'rgba(139, 115, 85, 0.1)'
        },
        walls: [
            // Bunker rooms
            { x: -300, y: -150, w: 150, h: 20 },
            { x: -300, y: 130, w: 150, h: 20 },
            { x: -150, y: -300, w: 20, h: 150 },
            { x: -150, y: 150, w: 20, h: 150 },
            { x: 150, y: -150, w: 150, h: 20 },
            { x: 150, y: 130, w: 150, h: 20 },
            { x: 130, y: -300, w: 20, h: 150 },
            { x: 130, y: 150, w: 20, h: 150 },
            // Center bunker
            { x: -60, y: -200, w: 120, h: 20 },
            { x: -60, y: 180, w: 120, h: 20 },
            { x: -100, y: -60, w: 20, h: 120 },
            { x: 80, y: -60, w: 20, h: 120 },
            // Corridors
            { x: -250, y: -20, w: 100, h: 40 },
            { x: 150, y: -20, w: 100, h: 40 }
        ]
    },
    {
        name: "The Ruins",
        spawns: { seeker: { x: -320, y: 0 }, hider: { x: 320, y: 0 } },
        style: {
            floor: '#1a2020',
            floorAccent: '#0a1515',
            wallColor: '#556b6b',
            wallHighlight: '#7a9999',
            gridColor: 'rgba(85, 107, 107, 0.1)'
        },
        walls: [
            // Scattered ruins
            { x: -280, y: -220, w: 80, h: 30 },
            { x: -180, y: -280, w: 30, h: 80 },
            { x: 200, y: -250, w: 60, h: 40 },
            { x: 250, y: -180, w: 40, h: 60 },
            { x: -100, y: -150, w: 50, h: 50 },
            { x: 50, y: -180, w: 40, h: 80 },
            { x: -200, y: -50, w: 70, h: 30 },
            { x: -250, y: 50, w: 30, h: 70 },
            { x: 150, y: -80, w: 60, h: 40 },
            { x: 200, y: 20, w: 40, h: 60 },
            { x: -50, y: 100, w: 100, h: 30 },
            { x: -150, y: 180, w: 50, h: 50 },
            { x: 100, y: 150, w: 60, h: 60 },
            { x: -280, y: 250, w: 80, h: 30 },
            { x: 220, y: 230, w: 50, h: 50 },
            { x: -30, y: -30, w: 60, h: 60 }
        ]
    },
    {
        name: "The Lanes",
        spawns: { seeker: { x: -280, y: -280 }, hider: { x: 280, y: 280 } },
        style: {
            floor: '#201a2a',
            floorAccent: '#100a1a',
            wallColor: '#ff6699',
            wallHighlight: '#ff99bb',
            gridColor: 'rgba(255, 102, 153, 0.1)'
        },
        walls: [
            // Long lanes
            { x: -300, y: -200, w: 600, h: 20 },
            { x: -300, y: -80, w: 250, h: 20 },
            { x: 50, y: -80, w: 250, h: 20 },
            { x: -300, y: 60, w: 250, h: 20 },
            { x: 50, y: 60, w: 250, h: 20 },
            { x: -300, y: 180, w: 600, h: 20 },
            // Cross barriers
            { x: -200, y: -200, w: 20, h: 120 },
            { x: 0, y: -200, w: 20, h: 120 },
            { x: 180, y: -200, w: 20, h: 120 },
            { x: -100, y: 80, w: 20, h: 100 },
            { x: 80, y: 80, w: 20, h: 100 }
        ]
    }
];

// Current board index and walls reference
let currentBoardIndex = 0;
let WALLS = BOARDS[0].walls;
let currentStyle = BOARDS[0].style;

// ==========================================
// Game State
// ==========================================

const state = {
    screen: 'menu',
    isHost: false,
    peer: null,
    conn: null,
    roomCode: '',
    role: null, // 'seeker' or 'hider'
    gameStarted: false,
    gameOver: false,
    timeRemaining: CONFIG.GAME_DURATION,

    // Dopamine effects
    screenShake: 0,
    dangerLevel: 0, // 0-1 based on proximity
    panicMode: false,
    boostParticles: [],
    explosionParticles: [],
    showDangerWarning: false,

    // Local player
    player: {
        x: 0,
        y: 0,
        angle: 0,
        speed: CONFIG.PLAYER_SPEED,
        boosting: false,
        boostCooldown: 0
    },

    // Remote player
    opponent: {
        x: 0,
        y: 0,
        angle: 0,
        boosting: false
    },

    // Input
    keys: {
        up: false,
        down: false,
        left: false,
        right: false
    }
};

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
    canvas: document.getElementById('game-canvas'),
};

const ctx = elements.canvas.getContext('2d');

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

// PeerJS configuration - using public server with explicit config
const PEER_CONFIG = {
    debug: 2, // Enable debug logging
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    }
};

function createGame() {
    state.roomCode = generateRoomCode();
    state.isHost = true;

    setStatus('Creating game...');
    console.log('Creating game with code:', state.roomCode);

    // Clean up any existing peer
    if (state.peer) {
        state.peer.destroy();
    }

    state.peer = new Peer('hideseek-' + state.roomCode, PEER_CONFIG);

    state.peer.on('open', (id) => {
        console.log('Host peer opened with ID:', id);
        elements.roomCode.textContent = state.roomCode;
        showScreen('waiting');
    });

    state.peer.on('connection', (conn) => {
        console.log('Received connection from peer');
        state.conn = conn;

        // Wait for connection to be fully open
        if (conn.open) {
            setupConnection();
        } else {
            conn.on('open', () => {
                console.log('Connection opened');
                setupConnection();
            });
        }
    });

    state.peer.on('error', (err) => {
        console.error('Host peer error:', err.type, err);
        if (err.type === 'unavailable-id') {
            // Code already in use, generate new one
            state.peer.destroy();
            setTimeout(createGame, 500);
        } else if (err.type === 'network' || err.type === 'server-error') {
            setStatus('Server error. Retrying...', 'error');
            state.peer.destroy();
            setTimeout(createGame, 1000);
        } else {
            setStatus('Connection error: ' + err.type, 'error');
            showScreen('menu');
        }
    });

    state.peer.on('disconnected', () => {
        console.log('Host disconnected from server, reconnecting...');
        if (!state.gameStarted) {
            state.peer.reconnect();
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

    setStatus('Connecting to game...');
    console.log('Joining game with code:', code);

    // Clean up any existing peer
    if (state.peer) {
        state.peer.destroy();
    }

    state.peer = new Peer(PEER_CONFIG);

    state.peer.on('open', (id) => {
        console.log('Guest peer opened with ID:', id);
        setStatus('Connecting to host...');

        state.conn = state.peer.connect('hideseek-' + code, {
            reliable: true,
            serialization: 'json'
        });

        state.conn.on('open', () => {
            console.log('Connected to host!');
            setupConnection();
        });

        state.conn.on('error', (err) => {
            console.error('Connection error:', err);
            setStatus('Could not connect to game', 'error');
        });
    });

    state.peer.on('error', (err) => {
        console.error('Guest peer error:', err.type, err);
        if (err.type === 'peer-unavailable') {
            setStatus('Game not found. Check the code.', 'error');
        } else if (err.type === 'network' || err.type === 'server-error') {
            setStatus('Network error. Try again.', 'error');
        } else {
            setStatus('Connection failed: ' + err.type, 'error');
        }
    });

    // Timeout for connection
    setTimeout(() => {
        if (!state.conn || !state.conn.open) {
            console.log('Connection timed out');
            setStatus('Connection timed out. Try again.', 'error');
            if (state.peer) state.peer.destroy();
        }
    }, 15000);
}

function setupConnection() {
    console.log('Setting up connection, isHost:', state.isHost);

    state.conn.on('data', handleNetworkMessage);

    state.conn.on('close', () => {
        console.log('Connection closed');
        if (state.gameStarted && !state.gameOver) {
            endGame('opponent_disconnected');
        } else {
            setStatus('Opponent disconnected', 'error');
            showScreen('menu');
        }
    });

    state.conn.on('error', (err) => {
        console.error('Connection error in setupConnection:', err);
    });

    if (state.isHost) {
        // Small delay to ensure connection is stable
        setTimeout(() => {
            console.log('Host sending role assignment');
            // Host assigns roles
            const hostIsSeeker = Math.random() < 0.5;
            state.role = hostIsSeeker ? 'seeker' : 'hider';

            // Send role assignment to guest
            state.conn.send({
                type: 'role_assign',
                guestRole: hostIsSeeker ? 'hider' : 'seeker'
            });

            startGame();
        }, 500);
    } else {
        // Guest sends ready signal
        console.log('Guest sending ready signal');
        state.conn.send({ type: 'guest_ready' });
    }
}

function handleNetworkMessage(data) {
    console.log('Received message:', data.type);

    switch (data.type) {
        case 'guest_ready':
            console.log('Guest is ready');
            break;

        case 'role_assign':
            console.log('Received role:', data.guestRole);
            state.role = data.guestRole;
            startGame();
            break;

        case 'position':
            state.opponent.x = data.x;
            state.opponent.y = data.y;
            state.opponent.angle = data.angle;
            state.opponent.boosting = data.boosting || false;
            break;

        case 'catch':
            if (!state.gameOver) {
                // Trigger explosion for the caught player too
                triggerCatchExplosion();
                endGame('caught');
            }
            break;

        case 'play_again':
            if (state.isHost) {
                // Swap roles
                const wasSeeker = state.role === 'seeker';
                state.role = wasSeeker ? 'hider' : 'seeker';
                state.conn.send({
                    type: 'role_assign',
                    guestRole: wasSeeker ? 'seeker' : 'hider'
                });
                startGame();
            }
            break;

        case 'next_board':
            // Received from host when advancing to next board
            currentBoardIndex = data.boardIndex;
            WALLS = BOARDS[currentBoardIndex].walls;
            currentStyle = BOARDS[currentBoardIndex].style;
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
            y: state.player.y,
            angle: state.player.angle,
            boosting: state.player.boosting
        });
    }
}

// ==========================================
// Game Logic
// ==========================================

function startGame() {
    // Reset game state
    state.gameStarted = true;
    state.gameOver = false;
    state.timeRemaining = CONFIG.GAME_DURATION;
    state.player.boosting = false;
    state.player.boostCooldown = 0;
    state.player.speed = CONFIG.PLAYER_SPEED;

    // Reset keys
    state.keys = { up: false, down: false, left: false, right: false };

    // Reset dopamine effects
    state.screenShake = 0;
    state.dangerLevel = 0;
    state.panicMode = false;
    state.boostParticles = [];
    state.explosionParticles = [];
    state.showDangerWarning = false;

    // Position players using board-specific spawn points
    const currentBoard = BOARDS[currentBoardIndex];
    const spawns = currentBoard.spawns;

    if (state.role === 'seeker') {
        state.player.x = spawns.seeker.x;
        state.player.y = spawns.seeker.y;
        state.player.angle = Math.atan2(spawns.hider.y - spawns.seeker.y, spawns.hider.x - spawns.seeker.x);
        state.opponent.x = spawns.hider.x;
        state.opponent.y = spawns.hider.y;
    } else {
        state.player.x = spawns.hider.x;
        state.player.y = spawns.hider.y;
        state.player.angle = Math.atan2(spawns.seeker.y - spawns.hider.y, spawns.seeker.x - spawns.hider.x);
        state.opponent.x = spawns.seeker.x;
        state.opponent.y = spawns.seeker.y;
    }

    // Setup UI
    elements.roleDisplay.textContent = state.role.toUpperCase();
    elements.roleDisplay.className = state.role;

    if (state.role === 'seeker') {
        elements.abilityDisplay.style.display = 'block';
    } else {
        elements.abilityDisplay.style.display = 'none';
    }

    // Resize canvas
    resizeCanvas();

    // Update timer display immediately
    updateTimerDisplay();

    showScreen('game');

    // Start game loops
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);

    // Start timer
    startTimer();
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (state.gameOver) {
            clearInterval(timerInterval);
            return;
        }

        state.timeRemaining--;
        updateTimerDisplay();

        if (state.timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame('time_up');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    elements.timerDisplay.textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
                isWinner = false;
            }
            break;

        case 'time_up':
            if (state.role === 'hider') {
                title = 'VICTORY!';
                message = 'You survived until time ran out!';
                isWinner = true;
            } else {
                title = 'TIME\'S UP!';
                message = 'The hider escaped!';
                isWinner = false;
            }
            break;

        case 'opponent_disconnected':
            title = 'Opponent Left';
            message = 'Your opponent disconnected from the game.';
            elements.resultTitle.className = '';
            elements.resultTitle.textContent = title;
            elements.resultMessage.textContent = message;
            showScreen('result');
            return;
    }

    // Show celebration screen
    showCelebration(title, message, isWinner, reason);
}

function showCelebration(title, message, isWinner, reason) {
    // Create celebration overlay
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

    // Add particles for winner
    if (isWinner) {
        createCelebrationParticles(overlay.querySelector('.celebration-particles'));
    }

    // Countdown to next board
    let count = 5;
    const countdownEl = overlay.querySelector('#countdown-num');
    const countdownInterval = setInterval(() => {
        count--;
        countdownEl.textContent = count;
        if (count <= 0) {
            clearInterval(countdownInterval);
            overlay.remove();
            advanceToNextBoard();
        }
    }, 1000);
}

function createCelebrationParticles(container) {
    const colors = ['#ffd700', '#ff6b6b', '#51cf66', '#4facfe', '#ff66ff'];
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 2}s;
            animation-duration: ${2 + Math.random() * 2}s;
        `;
        container.appendChild(particle);
    }
}

function advanceToNextBoard() {
    // Move to next board
    currentBoardIndex = (currentBoardIndex + 1) % BOARDS.length;
    WALLS = BOARDS[currentBoardIndex].walls;
    currentStyle = BOARDS[currentBoardIndex].style;

    // Swap roles
    const wasSeeker = state.role === 'seeker';
    state.role = wasSeeker ? 'hider' : 'seeker';

    // Notify opponent of new board and role swap
    if (state.conn && state.conn.open) {
        state.conn.send({
            type: 'next_board',
            boardIndex: currentBoardIndex,
            opponentRole: wasSeeker ? 'seeker' : 'hider'
        });
    }

    // Start the new game
    startGame();
}

function checkCatch() {
    if (state.role !== 'seeker') return;

    const dx = state.player.x - state.opponent.x;
    const dy = state.player.y - state.opponent.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CONFIG.CATCH_DISTANCE) {
        // Trigger explosion effect
        triggerCatchExplosion();
        state.conn.send({ type: 'catch' });
        endGame('caught');
    }
}

// ==========================================
// Dopamine Effects
// ==========================================

function updateDopamineEffects() {
    // Screen shake decay
    if (state.screenShake > 0) {
        state.screenShake *= 0.9;
        if (state.screenShake < 0.5) state.screenShake = 0;
    }

    // Boost particles (seeker only)
    if (state.role === 'seeker' && state.player.boosting) {
        // Spawn particles behind player
        for (let i = 0; i < 3; i++) {
            const angle = state.player.angle + Math.PI + (Math.random() - 0.5) * 0.5;
            state.boostParticles.push({
                x: state.player.x + Math.cos(angle) * 20,
                y: state.player.y + Math.sin(angle) * 20,
                vx: Math.cos(angle) * (2 + Math.random() * 2),
                vy: Math.sin(angle) * (2 + Math.random() * 2),
                life: 1,
                size: 5 + Math.random() * 5,
                color: Math.random() > 0.5 ? '#ffa502' : '#ff6b6b'
            });
        }
        // Screen shake while boosting
        state.screenShake = 3;
    }

    // Update boost particles
    state.boostParticles = state.boostParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        p.size *= 0.95;
        return p.life > 0;
    });

    // Update explosion particles
    state.explosionParticles = state.explosionParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= 0.02;
        return p.life > 0;
    });

    // Proximity danger for hider
    if (state.role === 'hider') {
        const dx = state.player.x - state.opponent.x;
        const dy = state.player.y - state.opponent.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dangerRadius = 150;

        if (dist < dangerRadius) {
            state.dangerLevel = 1 - (dist / dangerRadius);
            state.showDangerWarning = state.dangerLevel > 0.5;
        } else {
            state.dangerLevel = Math.max(0, state.dangerLevel - 0.02);
            state.showDangerWarning = false;
        }
    }

    // Panic mode in last 10 seconds
    state.panicMode = state.timeRemaining <= 10 && state.timeRemaining > 0;
}

function triggerCatchExplosion() {
    // Create explosion at catch location
    const catchX = (state.player.x + state.opponent.x) / 2;
    const catchY = (state.player.y + state.opponent.y) / 2;

    for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40 + Math.random() * 0.3;
        const speed = 3 + Math.random() * 5;
        state.explosionParticles.push({
            x: catchX,
            y: catchY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: 8 + Math.random() * 8,
            color: ['#ffd700', '#ff6b6b', '#ff8c00', '#ffffff'][Math.floor(Math.random() * 4)]
        });
    }

    // Big screen shake
    state.screenShake = 15;
}

function drawDopamineEffects(width, height, centerX, centerY) {
    // Draw boost particles
    for (const p of state.boostParticles) {
        const screenX = centerX + (p.x - state.player.x);
        const screenY = centerY + (p.y - state.player.y) * 0.85;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Draw explosion particles
    for (const p of state.explosionParticles) {
        const screenX = centerX + (p.x - state.player.x);
        const screenY = centerY + (p.y - state.player.y) * 0.85;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Danger vignette for hider
    if (state.role === 'hider' && state.dangerLevel > 0) {
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, height * 0.3,
            width / 2, height / 2, height * 0.7
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(255, 0, 0, ${state.dangerLevel * 0.5})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Pulsing effect
        const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 0, 0, ${state.dangerLevel * pulse * 0.2})`;
        ctx.fillRect(0, 0, width, height);
    }

    // Danger warning text
    if (state.showDangerWarning) {
        const pulse = Math.sin(Date.now() / 80) * 0.5 + 0.5;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 50, 50, ${0.5 + pulse * 0.5})`;
        ctx.fillText('DANGER!', width / 2, 100);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeText('DANGER!', width / 2, 100);
    }

    // Panic mode effects (last 10 seconds)
    if (state.panicMode) {
        const pulse = Math.sin(Date.now() / 150) * 0.5 + 0.5;

        // Red border flash
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + pulse * 0.4})`;
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, width - 10, height - 10);

        // Pulsing timer
        const timerEl = document.getElementById('timer-display');
        if (timerEl) {
            timerEl.style.transform = `scale(${1 + pulse * 0.2})`;
            timerEl.style.color = '#ff3333';
            timerEl.style.textShadow = `0 0 ${10 + pulse * 10}px rgba(255, 0, 0, 0.8)`;
        }
    } else {
        const timerEl = document.getElementById('timer-display');
        if (timerEl) {
            timerEl.style.transform = 'scale(1)';
            timerEl.style.color = '';
            timerEl.style.textShadow = '';
        }
    }
}

// ==========================================
// Movement & Physics
// ==========================================

function updatePlayer(deltaTime) {
    // Calculate movement direction
    let dx = 0;
    let dy = 0;

    if (state.keys.up) dy -= 1;
    if (state.keys.down) dy += 1;
    if (state.keys.left) dx -= 1;
    if (state.keys.right) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;
    }

    // Update angle based on movement
    if (dx !== 0 || dy !== 0) {
        state.player.angle = Math.atan2(dy, dx);
    }

    // Apply speed - seeker is faster than hider
    const baseSpeed = state.role === 'seeker' ? CONFIG.SEEKER_SPEED : CONFIG.HIDER_SPEED;
    const speed = state.player.boosting ? CONFIG.BOOST_SPEED : baseSpeed;
    dx *= speed;
    dy *= speed;

    // Calculate new position
    let newX = state.player.x + dx;
    let newY = state.player.y + dy;

    // Check arena bounds (circular)
    const distFromCenter = Math.sqrt(newX * newX + newY * newY);
    if (distFromCenter > CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS) {
        const angle = Math.atan2(newY, newX);
        newX = Math.cos(angle) * (CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS);
        newY = Math.sin(angle) * (CONFIG.ARENA_RADIUS - CONFIG.PLAYER_RADIUS);
    }

    // Check wall collisions
    const collision = checkWallCollision(newX, newY);
    if (!collision.x) state.player.x = newX;
    if (!collision.y) state.player.y = newY;

    // Update boost cooldown
    if (state.player.boostCooldown > 0) {
        state.player.boostCooldown -= deltaTime;
        if (state.player.boostCooldown < 0) state.player.boostCooldown = 0;
    }

    // Update ability UI
    if (state.role === 'seeker') {
        const cooldownPercent = 1 - (state.player.boostCooldown / CONFIG.BOOST_COOLDOWN);
        elements.abilityFill.style.width = (cooldownPercent * 100) + '%';

        if (state.player.boosting) {
            elements.abilityText.textContent = 'BOOSTING!';
            elements.abilityText.className = 'ready';
        } else if (state.player.boostCooldown <= 0) {
            elements.abilityText.textContent = 'BOOST [SPACE]';
            elements.abilityText.className = 'ready';
        } else {
            elements.abilityText.textContent = 'COOLDOWN...';
            elements.abilityText.className = '';
        }
    }

    // Update mobile boost button
    updateMobileBoostButton();

    // Send position to opponent
    sendPosition();

    // Check for catch
    checkCatch();
}

function checkWallCollision(x, y) {
    const result = { x: false, y: false };
    const r = CONFIG.PLAYER_RADIUS;

    for (const wall of WALLS) {
        // Check X collision
        if (x + r > wall.x && x - r < wall.x + wall.w &&
            state.player.y + r > wall.y && state.player.y - r < wall.y + wall.h) {
            result.x = true;
        }

        // Check Y collision
        if (state.player.x + r > wall.x && state.player.x - r < wall.x + wall.w &&
            y + r > wall.y && y - r < wall.y + wall.h) {
            result.y = true;
        }
    }

    return result;
}

function activateBoost() {
    if (state.role !== 'seeker') return;
    if (state.player.boostCooldown > 0) return;
    if (state.player.boosting) return;

    state.player.boosting = true;

    setTimeout(() => {
        state.player.boosting = false;
        state.player.boostCooldown = CONFIG.BOOST_COOLDOWN;
    }, CONFIG.BOOST_DURATION);
}

// ==========================================
// Vision & Rendering
// ==========================================

function isPointVisible(px, py, viewerX, viewerY, viewerAngle) {
    // Check if point is within view range
    const dx = px - viewerX;
    const dy = py - viewerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > CONFIG.SEEKER_VIEW_RANGE) return false;

    // Check if point is within view angle
    const angleToPoint = Math.atan2(dy, dx);
    let angleDiff = angleToPoint - viewerAngle;

    // Normalize angle difference
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    if (Math.abs(angleDiff) > CONFIG.SEEKER_VIEW_ANGLE) return false;

    // Check for wall occlusion
    return !isLineBlockedByWall(viewerX, viewerY, px, py);
}

function isLineBlockedByWall(x1, y1, x2, y2) {
    for (const wall of WALLS) {
        if (lineIntersectsRect(x1, y1, x2, y2, wall.x, wall.y, wall.w, wall.h)) {
            return true;
        }
    }
    return false;
}

function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    // Check line intersection with rectangle edges
    return lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
           lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
           lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh) ||
           lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (Math.abs(denom) < 0.0001) return false;

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function render() {
    const canvas = elements.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // For seeker: use visibility masking (black = unknown)
    if (state.role === 'seeker') {
        renderSeekerView(width, height);
    } else {
        // Hider sees everything
        renderFullView(width, height);
    }
}

function renderFullView(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Apply screen shake
    if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
        ctx.translate(shakeX, shakeY);
    }

    ctx.translate(centerX, centerY);
    ctx.scale(1, 0.85);
    ctx.translate(-state.player.x, -state.player.y);

    drawArenaFloor();
    drawWalls();

    // Hider always sees the seeker
    drawPlayer(state.opponent.x, state.opponent.y, state.opponent.angle, '#ff6b6b', state.opponent.boosting);

    // Draw local player (hider)
    drawPlayer(state.player.x, state.player.y, state.player.angle, '#51cf66', false);

    ctx.restore();

    // Draw minimap for hider
    drawMinimap();

    // Draw dopamine effects (danger vignette, particles, etc.)
    drawDopamineEffects(width, height, centerX, centerY);
}

function renderSeekerView(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate shake offset
    let shakeX = 0, shakeY = 0;
    if (state.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * state.screenShake * 2;
        shakeY = (Math.random() - 0.5) * state.screenShake * 2;
    }

    // === LAYER 1: Lightly faded background (readable but muted) ===
    ctx.fillStyle = '#12121a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(shakeX, shakeY); // Apply shake
    ctx.globalAlpha = 0.5; // Lighter fade - still visible

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(1, 0.85);
    ctx.translate(-state.player.x, -state.player.y);

    drawArenaFloorFaded();
    // NO hider drawn in faded layer - completely invisible outside vision

    ctx.restore();
    ctx.restore();

    // Draw walls ALWAYS visible in solid red (on top of faded layer)
    ctx.save();
    ctx.translate(shakeX, shakeY); // Apply shake
    ctx.translate(centerX, centerY);
    ctx.scale(1, 0.85);
    ctx.translate(-state.player.x, -state.player.y);
    drawWallsRed();
    ctx.restore();

    // === LAYER 2: Clear visible area (clipped to vision cone) ===
    const visiblePolygon = calculateVisibleArea();

    ctx.save();
    ctx.translate(shakeX, shakeY); // Apply shake
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    for (const point of visiblePolygon) {
        const screenX = centerX + (point.x - state.player.x);
        const screenY = centerY + (point.y - state.player.y) * 0.85;
        ctx.lineTo(screenX, screenY);
    }
    ctx.closePath();
    ctx.clip();

    // Clear the visible area and redraw with full clarity
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(1, 0.85);
    ctx.translate(-state.player.x, -state.player.y);

    drawArenaFloor();
    drawWallsRed(); // Red walls in clear area too

    // Draw hider ONLY if within visible area
    if (isPointVisible(state.opponent.x, state.opponent.y,
                      state.player.x, state.player.y, state.player.angle)) {
        drawPlayer(state.opponent.x, state.opponent.y, state.opponent.angle, '#51cf66', false);
    }

    // Draw seeker (self) - always visible
    const isBoosting = state.player.boosting;
    drawPlayer(state.player.x, state.player.y, state.player.angle, '#ff6b6b', isBoosting);

    ctx.restore();
    ctx.restore();

    // Draw dopamine effects (boost particles, panic mode, etc.)
    drawDopamineEffects(width, height, centerX, centerY);
}

function drawArenaFloorFaded() {
    // Lightly faded floor using current style - still readable
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.ARENA_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = currentStyle.floor;
    ctx.fill();
    ctx.strokeStyle = currentStyle.floorAccent;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Faded grid for spatial awareness
    ctx.strokeStyle = currentStyle.gridColor.replace('0.1', '0.05');
    ctx.lineWidth = 1;
    for (let x = -CONFIG.ARENA_RADIUS; x <= CONFIG.ARENA_RADIUS; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, -CONFIG.ARENA_RADIUS);
        ctx.lineTo(x, CONFIG.ARENA_RADIUS);
        ctx.stroke();
    }
    for (let y = -CONFIG.ARENA_RADIUS; y <= CONFIG.ARENA_RADIUS; y += 50) {
        ctx.beginPath();
        ctx.moveTo(-CONFIG.ARENA_RADIUS, y);
        ctx.lineTo(CONFIG.ARENA_RADIUS, y);
        ctx.stroke();
    }
}

function drawWallsRed() {
    // Solid colored walls using current style - always clearly visible
    for (const wall of WALLS) {
        // Wall shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(wall.x + 4, wall.y + 4, wall.w, wall.h);

        // Main wall body - using current style color
        ctx.fillStyle = currentStyle.wallColor;
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

        // Highlight edge
        ctx.strokeStyle = currentStyle.wallHighlight;
        ctx.lineWidth = 2;
        ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    }
}

function calculateVisibleArea() {
    // Cast rays from player position to determine visible polygon
    const rays = 120; // High resolution for smooth edges
    const points = [];

    const startAngle = state.player.angle - CONFIG.SEEKER_VIEW_ANGLE;
    const endAngle = state.player.angle + CONFIG.SEEKER_VIEW_ANGLE;

    for (let i = 0; i <= rays; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / rays);
        const dist = castRay(state.player.x, state.player.y, angle, CONFIG.SEEKER_VIEW_RANGE);

        points.push({
            x: state.player.x + Math.cos(angle) * dist,
            y: state.player.y + Math.sin(angle) * dist
        });
    }

    return points;
}

function drawArenaFloor() {
    // Draw circular arena with gradient using current style
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, CONFIG.ARENA_RADIUS);
    gradient.addColorStop(0, currentStyle.floor);
    gradient.addColorStop(0.8, currentStyle.floorAccent);
    gradient.addColorStop(1, '#0f0f1a');

    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.ARENA_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw arena border
    ctx.strokeStyle = currentStyle.wallHighlight;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw grid lines for depth perception
    ctx.strokeStyle = currentStyle.gridColor;
    ctx.lineWidth = 1;

    for (let x = -CONFIG.ARENA_RADIUS; x <= CONFIG.ARENA_RADIUS; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, -CONFIG.ARENA_RADIUS);
        ctx.lineTo(x, CONFIG.ARENA_RADIUS);
        ctx.stroke();
    }

    for (let y = -CONFIG.ARENA_RADIUS; y <= CONFIG.ARENA_RADIUS; y += 50) {
        ctx.beginPath();
        ctx.moveTo(-CONFIG.ARENA_RADIUS, y);
        ctx.lineTo(CONFIG.ARENA_RADIUS, y);
        ctx.stroke();
    }
}

function drawWalls() {
    for (const wall of WALLS) {
        // Draw wall shadow (pseudo-3D effect)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(wall.x + 5, wall.y + 5, wall.w, wall.h);

        // Draw wall top
        const gradient = ctx.createLinearGradient(wall.x, wall.y, wall.x, wall.y + wall.h);
        gradient.addColorStop(0, '#3d5a80');
        gradient.addColorStop(1, '#293241');

        ctx.fillStyle = gradient;
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);

        // Draw wall edge highlight
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 2;
        ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    }
}

function drawPlayer(x, y, angle, color, isBoosting = false) {
    // Draw boost effect if boosting
    if (isBoosting) {
        ctx.beginPath();
        ctx.arc(x, y, CONFIG.PLAYER_RADIUS + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 165, 2, 0.3)';
        ctx.fill();

        // Draw speed lines behind player
        const oppositeAngle = angle + Math.PI;
        for (let i = 0; i < 3; i++) {
            const spread = (i - 1) * 0.3;
            const lineAngle = oppositeAngle + spread;
            const startDist = CONFIG.PLAYER_RADIUS + 5;
            const endDist = CONFIG.PLAYER_RADIUS + 25 + Math.random() * 10;

            ctx.beginPath();
            ctx.moveTo(x + Math.cos(lineAngle) * startDist, y + Math.sin(lineAngle) * startDist);
            ctx.lineTo(x + Math.cos(lineAngle) * endDist, y + Math.sin(lineAngle) * endDist);
            ctx.strokeStyle = 'rgba(255, 165, 2, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // Draw shadow
    ctx.beginPath();
    ctx.ellipse(x + 3, y + 5, CONFIG.PLAYER_RADIUS, CONFIG.PLAYER_RADIUS * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Draw player body
    ctx.beginPath();
    ctx.arc(x, y, CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);

    const gradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, CONFIG.PLAYER_RADIUS);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, shadeColor(color, -30));

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = isBoosting ? '#ffa502' : '#fff';
    ctx.lineWidth = isBoosting ? 3 : 2;
    ctx.stroke();

    // Draw direction indicator
    const indicatorX = x + Math.cos(angle) * (CONFIG.PLAYER_RADIUS + 8);
    const indicatorY = y + Math.sin(angle) * (CONFIG.PLAYER_RADIUS + 8);

    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
}


function castRay(startX, startY, angle, maxDist) {
    const stepSize = 2; // Smaller steps for more precision
    let dist = 0;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    while (dist < maxDist) {
        const x = startX + cosA * dist;
        const y = startY + sinA * dist;

        // Check arena bounds (circular)
        if (x * x + y * y > CONFIG.ARENA_RADIUS * CONFIG.ARENA_RADIUS) {
            return dist;
        }

        // Check wall collision with small buffer for visual accuracy
        for (const wall of WALLS) {
            if (x >= wall.x - 1 && x <= wall.x + wall.w + 1 &&
                y >= wall.y - 1 && y <= wall.y + wall.h + 1) {
                return dist;
            }
        }

        dist += stepSize;
    }

    return maxDist;
}

function drawMinimap() {
    const minimapSize = 150;
    const padding = 20;
    const scale = minimapSize / (CONFIG.ARENA_RADIUS * 2);

    ctx.save();

    // Position in bottom-right corner
    ctx.translate(
        elements.canvas.width - minimapSize - padding,
        elements.canvas.height - minimapSize - padding
    );

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(minimapSize / 2, minimapSize / 2, minimapSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Translate to center of minimap
    ctx.translate(minimapSize / 2, minimapSize / 2);
    ctx.scale(scale, scale);

    // Draw walls
    ctx.fillStyle = '#3d5a80';
    for (const wall of WALLS) {
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    }

    // Draw seeker (opponent)
    if (state.opponent.boosting) {
        // Draw boost effect on minimap
        ctx.beginPath();
        ctx.arc(state.opponent.x, state.opponent.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 165, 2, 0.5)';
        ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(state.opponent.x, state.opponent.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = state.opponent.boosting ? '#ffa502' : '#ff6b6b';
    ctx.fill();

    // Draw seeker vision cone
    ctx.beginPath();
    ctx.moveTo(state.opponent.x, state.opponent.y);
    ctx.arc(state.opponent.x, state.opponent.y, CONFIG.SEEKER_VIEW_RANGE,
           state.opponent.angle - CONFIG.SEEKER_VIEW_ANGLE,
           state.opponent.angle + CONFIG.SEEKER_VIEW_ANGLE);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
    ctx.fill();

    // Draw hider (player)
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#51cf66';
    ctx.fill();

    ctx.restore();
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

// ==========================================
// Game Loop
// ==========================================

let lastTime = 0;

function gameLoop(currentTime) {
    if (!state.gameStarted || state.gameOver) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    updatePlayer(deltaTime);
    updateDopamineEffects();
    render();

    requestAnimationFrame(gameLoop);
}

// ==========================================
// Input Handling
// ==========================================

// Touch/Mobile controls
const touch = {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    joystickId: null
};

function initMobileControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickStick = document.getElementById('joystick-stick');
    const boostBtn = document.getElementById('boost-btn');

    if (!joystickZone) return;

    // Joystick touch handlers
    joystickZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touchPoint = e.touches[0];
        const rect = joystickZone.getBoundingClientRect();

        touch.active = true;
        touch.joystickId = touchPoint.identifier;
        touch.startX = rect.left + rect.width / 2;
        touch.startY = rect.top + rect.height / 2;
        touch.currentX = touchPoint.clientX;
        touch.currentY = touchPoint.clientY;

        updateJoystick();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!touch.active) return;

        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touch.joystickId) {
                touch.currentX = e.touches[i].clientX;
                touch.currentY = e.touches[i].clientY;
                updateJoystick();
                break;
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        let joystickReleased = true;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touch.joystickId) {
                joystickReleased = false;
                break;
            }
        }

        if (joystickReleased && touch.active) {
            touch.active = false;
            touch.joystickId = null;
            state.keys.up = false;
            state.keys.down = false;
            state.keys.left = false;
            state.keys.right = false;

            // Reset joystick position
            joystickStick.style.transform = 'translate(-50%, -50%)';
        }
    });

    // Boost button
    boostBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        activateBoost();
    }, { passive: false });

    function updateJoystick() {
        const dx = touch.currentX - touch.startX;
        const dy = touch.currentY - touch.startY;
        const maxDist = 40;

        // Clamp to max distance
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);

        const stickX = Math.cos(angle) * clampedDist;
        const stickY = Math.sin(angle) * clampedDist;

        joystickStick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

        // Update movement keys based on joystick position
        const threshold = 15;
        state.keys.right = dx > threshold;
        state.keys.left = dx < -threshold;
        state.keys.down = dy > threshold;
        state.keys.up = dy < -threshold;
    }
}

function updateMobileBoostButton() {
    const boostBtn = document.getElementById('boost-btn');
    if (!boostBtn) return;

    if (state.role !== 'seeker') {
        boostBtn.style.display = 'none';
        return;
    }

    boostBtn.style.display = 'block';

    if (state.player.boostCooldown > 0) {
        boostBtn.classList.add('cooldown');
        boostBtn.textContent = Math.ceil(state.player.boostCooldown / 1000) + 's';
    } else {
        boostBtn.classList.remove('cooldown');
        boostBtn.textContent = 'BOOST';
    }
}

function handleKeyDown(e) {
    if (state.screen !== 'game') return;

    switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            state.keys.up = true;
            break;
        case 's':
        case 'arrowdown':
            state.keys.down = true;
            break;
        case 'a':
        case 'arrowleft':
            state.keys.left = true;
            break;
        case 'd':
        case 'arrowright':
            state.keys.right = true;
            break;
        case ' ':
            e.preventDefault();
            activateBoost();
            break;
    }
}

function handleKeyUp(e) {
    switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
            state.keys.up = false;
            break;
        case 's':
        case 'arrowdown':
            state.keys.down = false;
            break;
        case 'a':
        case 'arrowleft':
            state.keys.left = false;
            break;
        case 'd':
        case 'arrowright':
            state.keys.right = false;
            break;
    }
}

// ==========================================
// Canvas Resize
// ==========================================

function resizeCanvas() {
    elements.canvas.width = window.innerWidth;
    elements.canvas.height = window.innerHeight;
}

// ==========================================
// Event Listeners
// ==========================================

function init() {
    // Menu buttons
    elements.createBtn.addEventListener('click', createGame);
    elements.joinBtn.addEventListener('click', joinGame);

    elements.joinCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinGame();
    });

    // Waiting screen
    elements.cancelBtn.addEventListener('click', () => {
        if (state.peer) state.peer.destroy();
        showScreen('menu');
    });

    elements.copyCode.addEventListener('click', () => {
        navigator.clipboard.writeText(state.roomCode);
        elements.copyCode.textContent = 'Copied!';
        setTimeout(() => {
            elements.copyCode.textContent = 'Copy';
        }, 2000);
    });

    // Result screen
    elements.playAgainBtn.addEventListener('click', () => {
        if (state.conn && state.conn.open) {
            state.conn.send({ type: 'play_again' });
            if (!state.isHost) {
                // Guest waits for host to assign roles
                elements.resultMessage.textContent = 'Waiting for host...';
            }
        }
    });

    elements.menuBtn.addEventListener('click', () => {
        if (state.peer) state.peer.destroy();
        state.conn = null;
        state.peer = null;
        showScreen('menu');
    });

    // Input
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Mobile controls
    initMobileControls();

    // Canvas resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// Start the game
init();

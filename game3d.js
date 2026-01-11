// ==========================================
// HIDE & SEEK ONLINE - 3D Version
// ==========================================

// ==========================================
// Sound System (Web Audio API)
// ==========================================

const SoundManager = {
    audioContext: null,
    masterGain: null,
    enabled: true,
    volume: 0.5,
    heartbeatInterval: null,
    heartbeatGain: null,

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            console.log('Sound system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    },

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    },

    // Boost activation - whoosh sound
    playBoost() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // White noise burst for whoosh
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Filter for whoosh effect
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        filter.Q.value = 1;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.3);

        // Rising pitch for power-up feel
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.15, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
    },

    // Catch/explosion sound
    playCatch() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Impact thump
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        const gain1 = ctx.createGain();
        gain1.gain.setValueAtTime(0.6, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + 0.3);

        // Explosion noise
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.4);
    },

    // Victory fanfare
    playVictory() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Triumphant chord progression
        const notes = [
            { freq: 523.25, start: 0, duration: 0.3 },     // C5
            { freq: 659.25, start: 0.1, duration: 0.3 },   // E5
            { freq: 783.99, start: 0.2, duration: 0.4 },   // G5
            { freq: 1046.50, start: 0.35, duration: 0.5 }, // C6
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = note.freq;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now + note.start);
            gain.gain.linearRampToValueAtTime(0.2, now + note.start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.start + note.duration);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + note.start);
            osc.stop(now + note.start + note.duration);
        });
    },

    // Defeat/loss sound
    playDefeat() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Sad descending tone
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.6);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
    },

    // Countdown beep
    playCountdown(final = false) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = final ? 880 : 440;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (final ? 0.3 : 0.15));

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + (final ? 0.3 : 0.15));
    },

    // Boost ready ding
    playBoostReady() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Pleasant ding
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 880;

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 1320; // Perfect fifth above

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.3);
        osc2.stop(now + 0.3);
    },

    // Start heartbeat for danger proximity
    startHeartbeat(intensity = 0.5) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        // Clear existing heartbeat
        this.stopHeartbeat();

        const ctx = this.audioContext;
        this.heartbeatGain = ctx.createGain();
        this.heartbeatGain.connect(this.masterGain);
        this.heartbeatGain.gain.value = intensity * 0.3;

        // Calculate interval based on intensity (faster when closer)
        const interval = Math.max(300, 800 - intensity * 500);

        const playBeat = () => {
            if (!this.heartbeatGain) return;

            const now = ctx.currentTime;

            // First thump (lub)
            const osc1 = ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(80, now);
            osc1.frequency.exponentialRampToValueAtTime(40, now + 0.1);

            const gain1 = ctx.createGain();
            gain1.gain.setValueAtTime(0.5, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            osc1.connect(gain1);
            gain1.connect(this.heartbeatGain);
            osc1.start(now);
            osc1.stop(now + 0.1);

            // Second thump (dub) - slightly delayed
            setTimeout(() => {
                if (!this.heartbeatGain) return;
                const now2 = ctx.currentTime;

                const osc2 = ctx.createOscillator();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(60, now2);
                osc2.frequency.exponentialRampToValueAtTime(30, now2 + 0.08);

                const gain2 = ctx.createGain();
                gain2.gain.setValueAtTime(0.4, now2);
                gain2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.08);

                osc2.connect(gain2);
                gain2.connect(this.heartbeatGain);
                osc2.start(now2);
                osc2.stop(now2 + 0.08);
            }, 120);
        };

        playBeat();
        this.heartbeatInterval = setInterval(playBeat, interval);
    },

    updateHeartbeat(intensity) {
        if (!this.enabled || intensity <= 0) {
            this.stopHeartbeat();
            return;
        }

        if (!this.heartbeatInterval) {
            this.startHeartbeat(intensity);
        } else if (this.heartbeatGain) {
            this.heartbeatGain.gain.value = intensity * 0.3;
        }
    },

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.heartbeatGain) {
            this.heartbeatGain.disconnect();
            this.heartbeatGain = null;
        }
    },

    // Panic alarm for last 10 seconds
    playPanicTick() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 600;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
    },

    // Footstep sound
    playFootstep() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Soft thud
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.05);
    }
};

// Initialize sound on first user interaction
document.addEventListener('click', () => {
    if (!SoundManager.audioContext) {
        SoundManager.init();
    } else {
        SoundManager.resume();
    }
}, { once: false });

document.addEventListener('touchstart', () => {
    if (!SoundManager.audioContext) {
        SoundManager.init();
    } else {
        SoundManager.resume();
    }
}, { once: false });

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
    CATCH_DISTANCE: 5,
    WALL_HEIGHT: 4
};

// Board definitions with themes
const BOARDS = [
    {
        name: "The Garden",
        spawns: { seeker: { x: -30, z: 0 }, hider: { x: 30, z: 0 } },
        style: { floor: 0x3d5c3d, wall: 0x8b4513, wallHighlight: 0x228b22, sky: 0x87CEEB },
        theme: 'garden',
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
        name: "The Haunted Maze",
        spawns: { seeker: { x: -30, z: -28 }, hider: { x: 30, z: 28 } },
        style: { floor: 0x1a1a2e, wall: 0x4a4a6a, sky: 0x0a0a1a },
        theme: 'haunted',
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
        name: "Neon Grid",
        spawns: { seeker: { x: -20, z: -20 }, hider: { x: 20, z: 20 } },
        style: { floor: 0x0a0a15, wall: 0x00ffff, wallGlow: 0x00ffff, sky: 0x050510 },
        theme: 'neon',
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
        spawns: { seeker: { x: -20, z: 0 }, hider: { x: 20, z: 0 } },
        style: { floor: 0x3d3d3d, wall: 0x8b7355, wallHighlight: 0xc9a959, sky: 0x2a1a0a },
        theme: 'medieval',
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
    },
    {
        name: "The Spiral",
        spawns: { seeker: { x: -30, z: 0 }, hider: { x: 30, z: 0 } },
        style: { floor: 0x1a0a2e, wall: 0xff00ff, wallGlow: 0xff00ff, sky: 0x0f0520 },
        theme: 'psychedelic',
        walls: [
            // Spiral pattern walls
            { x: -5, z: -30, w: 10, d: 2 },
            { x: 3, z: -30, w: 2, d: 15 },
            { x: -15, z: -17, w: 20, d: 2 },
            { x: -15, z: -17, w: 2, d: 15 },
            { x: -15, z: -4, w: 15, d: 2 },
            { x: -2, z: -4, w: 2, d: 12 },
            { x: -2, z: 6, w: 12, d: 2 },
            { x: 8, z: 6, w: 2, d: 10 },
            { x: -5, z: 14, w: 15, d: 2 },
            { x: -5, z: 14, w: 2, d: 16 },
            { x: -5, z: 28, w: 25, d: 2 },
            { x: 18, z: 15, w: 2, d: 15 }
        ]
    },
    {
        name: "The Bunker",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x2a2a2a, wall: 0x4a4a4a, wallHighlight: 0x666666, sky: 0x1a1a1a },
        theme: 'bunker',
        walls: [
            // Room 1 (top-left)
            { x: -30, z: -30, w: 18, d: 2 },
            { x: -30, z: -30, w: 2, d: 18 },
            { x: -14, z: -20, w: 2, d: 10 },
            // Room 2 (top-right)
            { x: 12, z: -30, w: 18, d: 2 },
            { x: 28, z: -30, w: 2, d: 18 },
            { x: 12, z: -20, w: 2, d: 10 },
            // Central corridor
            { x: -8, z: -8, w: 16, d: 2 },
            { x: -8, z: 6, w: 16, d: 2 },
            // Room 3 (bottom-left)
            { x: -30, z: 12, w: 2, d: 18 },
            { x: -30, z: 28, w: 18, d: 2 },
            { x: -14, z: 12, w: 2, d: 10 },
            // Room 4 (bottom-right)
            { x: 28, z: 12, w: 2, d: 18 },
            { x: 12, z: 28, w: 18, d: 2 },
            { x: 12, z: 12, w: 2, d: 10 }
        ]
    },
    {
        name: "The Ruins",
        spawns: { seeker: { x: -28, z: 0 }, hider: { x: 28, z: 0 } },
        style: { floor: 0x3d4a3d, wall: 0x6b8e6b, wallHighlight: 0x90ee90, sky: 0x4a6a4a },
        theme: 'ruins',
        walls: [
            // Scattered debris/ruins pattern
            { x: -25, z: -20, w: 8, d: 3 },
            { x: -10, z: -25, w: 4, d: 6 },
            { x: 5, z: -22, w: 6, d: 4 },
            { x: 20, z: -18, w: 5, d: 5 },
            { x: -20, z: -5, w: 5, d: 4 },
            { x: -5, z: -8, w: 10, d: 3 },
            { x: 15, z: -5, w: 4, d: 8 },
            { x: -22, z: 10, w: 6, d: 4 },
            { x: -8, z: 5, w: 4, d: 6 },
            { x: 8, z: 8, w: 5, d: 5 },
            { x: 22, z: 5, w: 4, d: 7 },
            { x: -15, z: 20, w: 7, d: 3 },
            { x: 0, z: 18, w: 5, d: 5 },
            { x: 15, z: 22, w: 6, d: 4 }
        ]
    },
    {
        name: "The Arena",
        spawns: { seeker: { x: -30, z: 0 }, hider: { x: 30, z: 0 } },
        style: { floor: 0x2d5a2d, wall: 0xffffff, wallHighlight: 0xffff00, sky: 0x1a1a2e },
        theme: 'arena',
        walls: [
            // Lane dividers (horizontal corridors)
            { x: -35, z: -20, w: 25, d: 2 },
            { x: 10, z: -20, w: 25, d: 2 },
            { x: -35, z: -8, w: 30, d: 2 },
            { x: 5, z: -8, w: 30, d: 2 },
            { x: -35, z: 6, w: 30, d: 2 },
            { x: 5, z: 6, w: 30, d: 2 },
            { x: -35, z: 18, w: 25, d: 2 },
            { x: 10, z: 18, w: 25, d: 2 },
            // Center obstacles
            { x: -3, z: -15, w: 6, d: 3 },
            { x: -3, z: 12, w: 6, d: 3 }
        ]
    },
    {
        name: "The Void",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x000000, wall: 0x4400ff, wallGlow: 0x8800ff, sky: 0x000011 },
        theme: 'void',
        walls: [
            // Floating platform pattern
            { x: -20, z: -20, w: 8, d: 8 },
            { x: 12, z: -20, w: 8, d: 8 },
            { x: -4, z: -12, w: 8, d: 8 },
            { x: -25, z: -5, w: 6, d: 6 },
            { x: 19, z: -5, w: 6, d: 6 },
            { x: -12, z: 2, w: 6, d: 6 },
            { x: 6, z: 2, w: 6, d: 6 },
            { x: -4, z: 12, w: 8, d: 8 },
            { x: -20, z: 18, w: 8, d: 8 },
            { x: 12, z: 18, w: 8, d: 8 }
        ]
    },
    {
        name: "The Streets",
        spawns: { seeker: { x: -28, z: 0 }, hider: { x: 28, z: 0 } },
        style: { floor: 0x333333, wall: 0x8b4513, sky: 0x1a1a2e },
        theme: 'streets',
        walls: [
            // Dumpsters (small, good hiding spots)
            { x: -25, z: -20, w: 4, d: 3, type: 'dumpster' },
            { x: 20, z: 15, w: 4, d: 3, type: 'dumpster' },
            { x: -5, z: -25, w: 3, d: 4, type: 'dumpster' },
            // Brick walls (long walls with graffiti)
            { x: -20, z: -10, w: 15, d: 2, type: 'brick' },
            { x: 5, z: -10, w: 15, d: 2, type: 'graffiti' },
            { x: -15, z: 8, w: 12, d: 2, type: 'graffiti' },
            { x: 8, z: 8, w: 12, d: 2, type: 'brick' },
            // Crates/boxes
            { x: -28, z: 10, w: 3, d: 3, type: 'crate' },
            { x: 25, z: -15, w: 3, d: 3, type: 'crate' },
            { x: 0, z: 20, w: 4, d: 4, type: 'crate' },
            // Corner hideouts
            { x: -28, z: -28, w: 5, d: 2 },
            { x: -28, z: -26, w: 2, d: 5 },
            { x: 23, z: -28, w: 5, d: 2 },
            { x: 26, z: -26, w: 2, d: 5 }
        ]
    },
    {
        name: "The Park",
        spawns: { seeker: { x: -28, z: -28 }, hider: { x: 28, z: 28 } },
        style: { floor: 0x228b22, wall: 0x8b4513, sky: 0x87CEEB },
        theme: 'park',
        walls: [
            // Trees (circular-ish, scattered)
            { x: -20, z: -15, w: 3, d: 3, type: 'tree' },
            { x: -10, z: -22, w: 3, d: 3, type: 'tree' },
            { x: 15, z: -18, w: 3, d: 3, type: 'tree' },
            { x: 22, z: -8, w: 3, d: 3, type: 'tree' },
            { x: -22, z: 5, w: 3, d: 3, type: 'tree' },
            { x: -8, z: 12, w: 3, d: 3, type: 'tree' },
            { x: 18, z: 20, w: 3, d: 3, type: 'tree' },
            { x: 5, z: -5, w: 3, d: 3, type: 'tree' },
            // Benches (long and thin)
            { x: -15, z: 0, w: 6, d: 1.5, type: 'bench' },
            { x: 12, z: 5, w: 6, d: 1.5, type: 'bench' },
            // Bushes (smaller hiding spots)
            { x: -5, z: 22, w: 4, d: 2, type: 'bush' },
            { x: 8, z: -12, w: 2, d: 4, type: 'bush' },
            { x: -18, z: 18, w: 3, d: 3, type: 'bush' }
        ]
    },
    {
        name: "The Bathroom",
        spawns: { seeker: { x: -25, z: 0 }, hider: { x: 25, z: 0 } },
        style: { floor: 0xffffff, wall: 0xadd8e6, sky: 0xe6f3ff },
        theme: 'bathroom',
        walls: [
            // THE GIANT TOILET (center piece - hilarious hiding spot!)
            { x: -4, z: -4, w: 8, d: 10, type: 'toilet' },
            // Bathtub (great hiding spot)
            { x: -25, z: -20, w: 12, d: 6, type: 'bathtub' },
            // Sink
            { x: 18, z: -22, w: 6, d: 4, type: 'sink' },
            // Towel racks
            { x: 20, z: 0, w: 2, d: 8 },
            { x: -22, z: 10, w: 8, d: 2 },
            // Shower curtain (can hide behind!)
            { x: 15, z: 15, w: 10, d: 1, type: 'curtain' },
            // Toilet paper tower
            { x: -20, z: 20, w: 3, d: 3, type: 'tproll' },
            { x: 25, z: -8, w: 2, d: 2, type: 'tproll' }
        ]
    },
    {
        name: "The Kitchen",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0xdeb887, wall: 0xffffff, sky: 0xfff8dc },
        theme: 'kitchen',
        walls: [
            // Giant fridge
            { x: -25, z: -15, w: 8, d: 6, type: 'fridge' },
            // Counter/island
            { x: -5, z: -5, w: 14, d: 6, type: 'counter' },
            // Giant cereal box
            { x: 18, z: -20, w: 5, d: 3, type: 'cerealbox' },
            // Spilled milk puddle area (slippery!)
            { x: 8, z: 10, w: 6, d: 6, type: 'puddle' },
            // Giant coffee mug
            { x: -18, z: 15, w: 4, d: 4, type: 'mug' },
            // Toaster
            { x: 20, z: 8, w: 5, d: 4, type: 'toaster' },
            // Fruit bowl obstacles
            { x: -8, z: 20, w: 3, d: 3, type: 'fruit' },
            { x: 0, z: -20, w: 3, d: 3, type: 'fruit' },
            // Table legs (thin pillars)
            { x: -20, z: -25, w: 2, d: 2 },
            { x: -12, z: -25, w: 2, d: 2 },
            { x: -20, z: -18, w: 2, d: 2 },
            { x: -12, z: -18, w: 2, d: 2 }
        ]
    }
];

// Theme-specific particles and effects
let themeParticles = [];
let themeLights = [];
let neonPulseTime = 0;
let dustParticles = [];
let playerGlow = null;
let opponentGlow = null;

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
    },
    celebration: {
        active: false,
        startTime: 0,
        isWinner: false,
        title: '',
        message: '',
        winnerMesh: null
    },
    stats: {
        wins: 0,
        losses: 0,
        currentStreak: 0,
        bestStreak: 0,
        fastestCatch: null,   // As seeker
        longestSurvival: null, // As hider
        roundsPlayed: 0
    }
};

// ==========================================
// Three.js Setup
// ==========================================

let scene, camera, renderer;
let playerMesh, opponentMesh;
let seekerModel, seekerAnimations;
let seekerBoostModel, seekerBoostAnimations;
let seekerCelebrateModel, seekerCelebrateAnimations;
let hiderModel, hiderAnimations;
let hiderCelebrateModel, hiderCelebrateAnimations;
let wallMeshes = [];
let floorMesh;
let playerMixer, opponentMixer;
let walkTime = 0;
let clock = new THREE.Clock();
let currentPlayerModel = null; // Track which model is active for seeker

// Vision cone system for seeker
let visionConeLight = null;
let visionConeMesh = null;
let visionConeTarget = null;
let ambientLightRef = null;
let directionalLightRef = null;
let fillLightRef = null;
let isVisionConeActive = false;

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
    ambientLightRef = ambientLight;

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
    directionalLightRef = directionalLight;

    // Secondary fill light for even lighting
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-20, 40, -20);
    scene.add(fillLight);
    fillLightRef = fillLight;

    // Load all character models
    loadSeekerModel();
    loadSeekerBoostModel();
    loadSeekerCelebrateModel();
    loadHiderModel();
    loadHiderCelebrateModel();

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

// ==========================================
// Vision Cone System for Seeker
// ==========================================

function setupVisionCone() {
    // Remove existing vision cone if any
    if (visionConeLight) {
        scene.remove(visionConeLight);
        scene.remove(visionConeTarget);
    }
    if (visionConeMesh) {
        scene.remove(visionConeMesh);
    }

    // Create spotlight for vision cone illumination
    // Angle matches CONFIG.SEEKER_VIEW_ANGLE (72 degrees = Math.PI / 2.5)
    const coneAngle = CONFIG.SEEKER_VIEW_ANGLE; // ~72 degrees half-angle
    visionConeLight = new THREE.SpotLight(0xffffee, 4, CONFIG.SEEKER_VIEW_RANGE + 10, coneAngle, 0.2, 0.8);
    visionConeLight.castShadow = true;
    visionConeLight.shadow.mapSize.width = 1024;
    visionConeLight.shadow.mapSize.height = 1024;

    // Target for spotlight direction
    visionConeTarget = new THREE.Object3D();
    visionConeLight.target = visionConeTarget;

    scene.add(visionConeLight);
    scene.add(visionConeTarget);

    // Create visible cone mesh for visual feedback
    const coneLength = CONFIG.SEEKER_VIEW_RANGE;
    const coneRadius = Math.tan(coneAngle) * coneLength;
    const coneGeometry = new THREE.ConeGeometry(coneRadius, coneLength, 32, 1, true);
    const coneMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff66,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    visionConeMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    visionConeMesh.renderOrder = 999; // Render on top
    scene.add(visionConeMesh);

    // Add edge glow ring at cone base (at player position)
    const glowGeometry = new THREE.RingGeometry(0.3, 0.8, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.y = 0.1;
    visionConeMesh.userData.glowRing = glowRing;
    scene.add(glowRing);
}

function activateVisionCone() {
    if (isVisionConeActive) return;
    isVisionConeActive = true;

    setupVisionCone();

    // Dim ambient lighting significantly for seeker
    if (ambientLightRef) ambientLightRef.intensity = 0.15;
    if (directionalLightRef) directionalLightRef.intensity = 0.2;
    if (fillLightRef) fillLightRef.intensity = 0.1;

    // Darken scene background
    scene.background = new THREE.Color(0x1a1a2e);

    // Dim all wall materials outside cone (they'll be lit by spotlight when in view)
    wallMeshes.forEach(mesh => {
        if (mesh.material) {
            mesh.userData.originalEmissive = mesh.material.emissive ? mesh.material.emissive.clone() : new THREE.Color(0x000000);
            mesh.userData.originalEmissiveIntensity = mesh.material.emissiveIntensity || 0;
            // Add slight emissive so walls are visible but dim outside cone
            mesh.material.emissive = new THREE.Color(0x222233);
            mesh.material.emissiveIntensity = 0.3;
        }
    });

    // Dim floor
    if (floorMesh && floorMesh.material) {
        floorMesh.userData.originalColor = floorMesh.material.color.clone();
        floorMesh.material.emissive = new THREE.Color(0x111122);
        floorMesh.material.emissiveIntensity = 0.2;
    }
}

function deactivateVisionCone() {
    if (!isVisionConeActive) return;
    isVisionConeActive = false;

    // Remove vision cone elements
    if (visionConeLight) {
        scene.remove(visionConeLight);
        scene.remove(visionConeTarget);
        visionConeLight = null;
        visionConeTarget = null;
    }
    if (visionConeMesh) {
        // Remove glow ring
        if (visionConeMesh.userData.glowRing) {
            scene.remove(visionConeMesh.userData.glowRing);
        }
        scene.remove(visionConeMesh);
        visionConeMesh = null;
    }

    // Restore normal lighting
    if (ambientLightRef) ambientLightRef.intensity = 0.7;
    if (directionalLightRef) directionalLightRef.intensity = 1.2;
    if (fillLightRef) fillLightRef.intensity = 0.5;

    // Restore scene background
    scene.background = new THREE.Color(0x87CEEB);

    // Restore wall materials
    wallMeshes.forEach(mesh => {
        if (mesh.material && mesh.userData.originalEmissive) {
            mesh.material.emissive = mesh.userData.originalEmissive;
            mesh.material.emissiveIntensity = mesh.userData.originalEmissiveIntensity || 0;
        }
    });

    // Restore floor
    if (floorMesh && floorMesh.material && floorMesh.userData.originalColor) {
        floorMesh.material.emissive = new THREE.Color(0x000000);
        floorMesh.material.emissiveIntensity = 0;
    }
}

function updateVisionCone() {
    if (!isVisionConeActive || !visionConeLight || !visionConeMesh) return;

    const playerX = state.player.x;
    const playerZ = state.player.z;
    const playerAngle = state.player.angle;

    // Position spotlight at player's head height
    visionConeLight.position.set(playerX, 3, playerZ);

    // Point spotlight in facing direction
    const targetDistance = CONFIG.SEEKER_VIEW_RANGE;
    const targetX = playerX + Math.cos(playerAngle) * targetDistance;
    const targetZ = playerZ + Math.sin(playerAngle) * targetDistance;
    visionConeTarget.position.set(targetX, 1, targetZ);

    // Update cone mesh position and rotation
    // Cone points along -Y by default, we need to rotate it to point forward
    visionConeMesh.position.set(playerX, 2, playerZ);

    // Rotate cone to point in facing direction
    // First rotate 90 degrees on X to make it horizontal, then rotate on Y for direction
    visionConeMesh.rotation.set(0, 0, 0);
    visionConeMesh.rotation.x = Math.PI / 2; // Make horizontal
    visionConeMesh.rotation.z = -playerAngle + Math.PI; // Point in facing direction

    // Offset cone so base is at player
    const coneLength = CONFIG.SEEKER_VIEW_RANGE;
    visionConeMesh.position.x += Math.cos(playerAngle) * (coneLength / 2);
    visionConeMesh.position.z += Math.sin(playerAngle) * (coneLength / 2);

    // Update glow ring position at player feet
    if (visionConeMesh.userData.glowRing) {
        visionConeMesh.userData.glowRing.position.set(playerX, 0.1, playerZ);
    }
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

function loadSeekerCelebrateModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('images/Characters/Meshy_AI_biped/man celebrate.glb',
        (gltf) => {
            seekerCelebrateModel = gltf.scene;
            seekerCelebrateModel.scale.set(5, 5, 5);
            seekerCelebrateModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (gltf.animations && gltf.animations.length > 0) {
                seekerCelebrateAnimations = gltf.animations;
                console.log('Seeker celebrate animations found:', gltf.animations.map(a => a.name));
            }

            console.log('Seeker celebrate model loaded!');
        },
        (progress) => {},
        (error) => {
            console.error('Error loading seeker celebrate model:', error);
            seekerCelebrateModel = null;
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

function loadHiderCelebrateModel() {
    const loader = new THREE.GLTFLoader();
    const modelPath = 'images/Characters/Meshy_AI_biped/kid 3 - celebrate.glb';
    console.log('Loading hider celebrate model from:', modelPath);
    loader.load(modelPath,
        (gltf) => {
            hiderCelebrateModel = gltf.scene;
            hiderCelebrateModel.scale.set(5, 5, 5);
            hiderCelebrateModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (gltf.animations && gltf.animations.length > 0) {
                hiderCelebrateAnimations = gltf.animations;
                console.log('Hider celebrate animations found:', gltf.animations.map(a => a.name));
            } else {
                console.warn('No animations in hider celebrate model!');
            }

            console.log('Hider celebrate model loaded successfully!');
        },
        (progress) => {
            if (progress.total) {
                console.log('Loading hider celebrate:', Math.round(progress.loaded / progress.total * 100) + '%');
            }
        },
        (error) => {
            console.error('FAILED to load hider celebrate model:', error);
            hiderCelebrateModel = null;
        }
    );
}

function createArena() {
    // Clear existing
    wallMeshes.forEach(w => scene.remove(w));
    wallMeshes = [];
    if (floorMesh) scene.remove(floorMesh);

    // Clear theme particles and lights
    themeParticles.forEach(p => scene.remove(p));
    themeParticles = [];
    themeLights.forEach(l => scene.remove(l));
    themeLights = [];

    // Clear dust particles and glows
    dustParticles.forEach(p => scene.remove(p));
    dustParticles = [];
    if (playerGlow) { scene.remove(playerGlow); playerGlow = null; }
    if (opponentGlow) { scene.remove(opponentGlow); opponentGlow = null; }

    const board = BOARDS[currentBoardIndex];
    currentBoard = board;

    // Set sky color based on theme
    const skyColor = board.style.sky || 0x87CEEB;
    scene.background = new THREE.Color(skyColor);

    // Floor
    const floorGeometry = new THREE.CircleGeometry(CONFIG.ARENA_RADIUS, 64);
    let floorMaterial;

    if (board.theme === 'neon') {
        // Neon grid floor
        floorMaterial = new THREE.MeshStandardMaterial({
            color: board.style.floor,
            roughness: 0.9,
            metalness: 0.1,
            emissive: 0x001111,
            emissiveIntensity: 0.2
        });
    } else {
        floorMaterial = new THREE.MeshStandardMaterial({
            color: board.style.floor,
            roughness: 0.8,
            metalness: 0.2
        });
    }
    floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Arena boundary - theme colored
    const boundaryColor = board.theme === 'neon' ? 0x00ffff :
                         board.theme === 'haunted' ? 0x6633aa :
                         board.theme === 'medieval' ? 0xc9a959 : 0x4facfe;
    const boundaryGeometry = new THREE.RingGeometry(CONFIG.ARENA_RADIUS - 0.5, CONFIG.ARENA_RADIUS, 64);
    const boundaryMaterial = new THREE.MeshBasicMaterial({ color: boundaryColor, side: THREE.DoubleSide });
    const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
    boundary.rotation.x = -Math.PI / 2;
    boundary.position.y = 0.02;
    scene.add(boundary);
    wallMeshes.push(boundary);

    // Create walls based on theme
    createThemedWalls(board);

    // Add theme-specific effects
    switch (board.theme) {
        case 'haunted':
            createHauntedEffects();
            break;
        case 'neon':
        case 'void':
            createNeonEffects(board);
            break;
        case 'medieval':
            createMedievalEffects(board);
            break;
        case 'garden':
            createGardenEffects();
            break;
        case 'psychedelic':
            createPsychedelicEffects(board);
            break;
        case 'bunker':
            createBunkerEffects();
            break;
        case 'ruins':
            createRuinsEffects();
            break;
        case 'arena':
            createArenaEffects();
            break;
        case 'streets':
            createStreetsEffects();
            break;
        case 'park':
            createParkEffects();
            break;
        case 'bathroom':
            createBathroomEffects();
            break;
        case 'kitchen':
            createKitchenEffects();
            break;
    }
}

// Create walls with theme-specific materials
function createThemedWalls(board) {
    let wallMaterial;

    switch (board.theme) {
        case 'neon':
            // Multi-colored neon walls - will be assigned per wall below
            wallMaterial = null;
            break;
        case 'void':
            // Glowing neon walls
            wallMaterial = new THREE.MeshStandardMaterial({
                color: 0x111122,
                roughness: 0.3,
                metalness: 0.8,
                emissive: board.style.wall,
                emissiveIntensity: 0.5
            });
            break;
        case 'haunted':
            // Dark, eerie walls
            wallMaterial = new THREE.MeshStandardMaterial({
                color: board.style.wall,
                roughness: 0.9,
                metalness: 0.1
            });
            break;
        case 'medieval':
            // Stone-like walls
            wallMaterial = new THREE.MeshStandardMaterial({
                color: board.style.wall,
                roughness: 0.95,
                metalness: 0.05
            });
            break;
        case 'garden':
            // Wooden hedge-like walls
            wallMaterial = new THREE.MeshStandardMaterial({
                color: board.style.wall,
                roughness: 0.8,
                metalness: 0.0
            });
            break;
        case 'psychedelic':
            // Glowing magenta walls
            wallMaterial = new THREE.MeshStandardMaterial({
                color: 0x220033,
                roughness: 0.2,
                metalness: 0.9,
                emissive: board.style.wall,
                emissiveIntensity: 0.6
            });
            break;
        case 'bunker':
            // Industrial concrete walls
            wallMaterial = new THREE.MeshStandardMaterial({
                color: board.style.wall,
                roughness: 0.95,
                metalness: 0.2
            });
            break;
        case 'ruins':
            // Mossy stone walls
            wallMaterial = new THREE.MeshStandardMaterial({
                color: board.style.wall,
                roughness: 0.85,
                metalness: 0.0
            });
            break;
        case 'arena':
            // Clean white walls
            wallMaterial = new THREE.MeshStandardMaterial({
                color: board.style.wall,
                roughness: 0.3,
                metalness: 0.1,
                emissive: 0x222222,
                emissiveIntensity: 0.2
            });
            break;
        case 'streets':
        case 'park':
        case 'bathroom':
        case 'kitchen':
            // These themes use per-wall materials based on type
            wallMaterial = null;
            break;
        default:
            wallMaterial = new THREE.MeshStandardMaterial({
                color: board.style.wall,
                roughness: 0.5,
                metalness: 0.3
            });
    }

    // Neon colors for variety
    const neonColors = [0x00ffff, 0xff00ff, 0x00ff00, 0xffff00, 0xff6600, 0x00ffaa];

    // Special material colors for themed objects
    const specialMaterials = {
        // Streets
        dumpster: { color: 0x2d5a27, roughness: 0.9, metalness: 0.3 },
        brick: { color: 0x8b4513, roughness: 0.95, metalness: 0.0 },
        graffiti: { color: 0xff6b9d, roughness: 0.7, metalness: 0.1, emissive: 0x330022, emissiveIntensity: 0.3 },
        crate: { color: 0xdeb887, roughness: 0.9, metalness: 0.0 },
        // Park
        tree: { color: 0x228b22, roughness: 0.9, metalness: 0.0 },
        bench: { color: 0x8b4513, roughness: 0.8, metalness: 0.1 },
        bush: { color: 0x32cd32, roughness: 0.95, metalness: 0.0 },
        // Bathroom
        toilet: { color: 0xfffafa, roughness: 0.2, metalness: 0.1 },
        bathtub: { color: 0xf5f5f5, roughness: 0.15, metalness: 0.2 },
        sink: { color: 0xfafafa, roughness: 0.2, metalness: 0.3 },
        curtain: { color: 0x87ceeb, roughness: 0.8, metalness: 0.0 },
        tproll: { color: 0xffffff, roughness: 0.95, metalness: 0.0 },
        // Kitchen
        fridge: { color: 0xc0c0c0, roughness: 0.3, metalness: 0.8 },
        counter: { color: 0x696969, roughness: 0.4, metalness: 0.2 },
        cerealbox: { color: 0xff6347, roughness: 0.8, metalness: 0.0 },
        puddle: { color: 0xffffff, roughness: 0.0, metalness: 0.1 },
        mug: { color: 0xff4500, roughness: 0.3, metalness: 0.1 },
        toaster: { color: 0xc0c0c0, roughness: 0.2, metalness: 0.9 },
        fruit: { color: 0xffd700, roughness: 0.6, metalness: 0.0 }
    };

    board.walls.forEach((wall, index) => {
        // Determine wall height based on type
        let wallHeight = CONFIG.WALL_HEIGHT;
        if (wall.type === 'puddle') wallHeight = 0.1;
        else if (wall.type === 'bench') wallHeight = 1.5;
        else if (wall.type === 'bush') wallHeight = 2;
        else if (wall.type === 'tree') wallHeight = 8;
        else if (wall.type === 'toilet') wallHeight = 6;
        else if (wall.type === 'bathtub') wallHeight = 2.5;
        else if (wall.type === 'sink') wallHeight = 3;
        else if (wall.type === 'curtain') wallHeight = 6;
        else if (wall.type === 'tproll') wallHeight = 5;
        else if (wall.type === 'fridge') wallHeight = 8;
        else if (wall.type === 'cerealbox') wallHeight = 6;
        else if (wall.type === 'mug') wallHeight = 5;
        else if (wall.type === 'toaster') wallHeight = 3;
        else if (wall.type === 'dumpster') wallHeight = 3;
        else if (wall.type === 'crate') wallHeight = 3;

        const geometry = new THREE.BoxGeometry(wall.w, wallHeight, wall.d);

        // Determine material
        let meshMaterial;
        if (board.theme === 'neon') {
            const neonColor = neonColors[index % neonColors.length];
            meshMaterial = new THREE.MeshStandardMaterial({
                color: 0x111122,
                roughness: 0.3,
                metalness: 0.8,
                emissive: neonColor,
                emissiveIntensity: 0.6
            });
        } else if (wall.type && specialMaterials[wall.type]) {
            const mat = specialMaterials[wall.type];
            meshMaterial = new THREE.MeshStandardMaterial({
                color: mat.color,
                roughness: mat.roughness,
                metalness: mat.metalness,
                emissive: mat.emissive || 0x000000,
                emissiveIntensity: mat.emissiveIntensity || 0
            });
        } else if (wallMaterial) {
            meshMaterial = wallMaterial.clone();
        } else {
            meshMaterial = new THREE.MeshStandardMaterial({
                color: board.style.wall,
                roughness: 0.5,
                metalness: 0.3
            });
        }

        const mesh = new THREE.Mesh(geometry, meshMaterial);
        mesh.position.set(wall.x + wall.w / 2, wallHeight / 2, wall.z + wall.d / 2);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.wallIndex = index;
        mesh.userData.wallType = wall.type;
        mesh.userData.neonColor = board.theme === 'neon' ? neonColors[index % neonColors.length] : null;
        scene.add(mesh);
        wallMeshes.push(mesh);

        // Wall edge glow - theme colored
        let edgeColor;
        let edgeOpacity = 0.3;
        if (board.theme === 'neon') {
            edgeColor = neonColors[index % neonColors.length];
            edgeOpacity = 0.9;
        } else if (board.theme === 'void') {
            edgeColor = board.style.wall;
            edgeOpacity = 0.9;
        } else if (board.theme === 'haunted') {
            edgeColor = 0x6633aa;
        } else if (board.theme === 'medieval') {
            edgeColor = board.style.wallHighlight || 0xc9a959;
        } else if (wall.type === 'graffiti') {
            edgeColor = 0xff00ff;
            edgeOpacity = 0.6;
        } else if (wall.type === 'toilet' || wall.type === 'bathtub') {
            edgeColor = 0x87ceeb;
            edgeOpacity = 0.5;
        } else if (board.theme === 'kitchen') {
            edgeColor = 0xffd700;
            edgeOpacity = 0.4;
        } else {
            edgeColor = 0xffffff;
        }

        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor, opacity: edgeOpacity, transparent: true });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edges.position.copy(mesh.position);
        scene.add(edges);
        wallMeshes.push(edges);
    });
}

// Haunted theme - fog/mist particles
function createHauntedEffects() {
    // Add fog/mist particles
    const fogCount = 50;
    for (let i = 0; i < fogCount; i++) {
        const geometry = new THREE.SphereGeometry(1 + Math.random() * 2, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x4444aa,
            transparent: true,
            opacity: 0.15 + Math.random() * 0.1
        });
        const fog = new THREE.Mesh(geometry, material);

        // Random position within arena
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * CONFIG.ARENA_RADIUS * 0.8;
        fog.position.set(
            Math.cos(angle) * radius,
            0.5 + Math.random() * 2,
            Math.sin(angle) * radius
        );
        fog.userData.driftSpeed = 0.001 + Math.random() * 0.002;
        fog.userData.driftAngle = Math.random() * Math.PI * 2;
        fog.userData.bobSpeed = 0.5 + Math.random() * 0.5;
        fog.userData.bobOffset = Math.random() * Math.PI * 2;

        scene.add(fog);
        themeParticles.push(fog);
    }

    // Dim the ambient light for haunted effect
    scene.children.forEach(child => {
        if (child.isAmbientLight) {
            child.intensity = 0.3;
        }
        if (child.isDirectionalLight && !child.shadow) {
            child.intensity = 0.2;
        }
    });
}

// Neon theme - grid lines and electric particles
function createNeonEffects(board) {
    // Create glowing grid lines on floor
    const gridSize = 80;
    const gridDivisions = 16;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ffff, 0x004444);
    gridHelper.position.y = 0.05;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    themeParticles.push(gridHelper);

    // Add floating electric particles
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(geometry, material);

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * CONFIG.ARENA_RADIUS * 0.9;
        particle.position.set(
            Math.cos(angle) * radius,
            1 + Math.random() * 3,
            Math.sin(angle) * radius
        );
        particle.userData.speed = 0.02 + Math.random() * 0.03;
        particle.userData.orbitRadius = 0.5 + Math.random() * 1;
        particle.userData.orbitAngle = Math.random() * Math.PI * 2;
        particle.userData.baseY = particle.position.y;

        scene.add(particle);
        themeParticles.push(particle);
    }

    // Point lights for neon glow
    const neonLight = new THREE.PointLight(0x00ffff, 0.5, 50);
    neonLight.position.set(0, 10, 0);
    scene.add(neonLight);
    themeLights.push(neonLight);
}

// Medieval theme - torches with flickering light
function createMedievalEffects(board) {
    // Add torches at wall corners
    const torchPositions = [
        { x: -28, z: -28 },
        { x: 28, z: -28 },
        { x: -28, z: 28 },
        { x: 28, z: 28 },
        { x: 0, z: -28 },
        { x: 0, z: 28 },
        { x: -28, z: 0 },
        { x: 28, z: 0 }
    ];

    torchPositions.forEach((pos, index) => {
        // Torch flame (glowing sphere)
        const flameGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const flameMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.9
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.set(pos.x, 5, pos.z);
        flame.userData.flickerSpeed = 5 + Math.random() * 3;
        flame.userData.flickerOffset = Math.random() * Math.PI * 2;
        scene.add(flame);
        themeParticles.push(flame);

        // Point light for torch
        const torchLight = new THREE.PointLight(0xff6600, 0.8, 20);
        torchLight.position.set(pos.x, 5, pos.z);
        torchLight.userData.flickerSpeed = flame.userData.flickerSpeed;
        torchLight.userData.flickerOffset = flame.userData.flickerOffset;
        torchLight.userData.baseIntensity = 0.6 + Math.random() * 0.4;
        scene.add(torchLight);
        themeLights.push(torchLight);
    });

    // Warmer ambient light for medieval feel
    scene.children.forEach(child => {
        if (child.isAmbientLight) {
            child.color.setHex(0xffddaa);
            child.intensity = 0.4;
        }
    });
}

// Garden theme - floating leaves and butterflies
function createGardenEffects() {
    // Floating leaves
    const leafCount = 30;
    const leafColors = [0x228b22, 0x32cd32, 0x90ee90, 0xffd700, 0xff8c00];

    for (let i = 0; i < leafCount; i++) {
        const geometry = new THREE.PlaneGeometry(0.3 + Math.random() * 0.3, 0.2 + Math.random() * 0.2);
        const material = new THREE.MeshBasicMaterial({
            color: leafColors[Math.floor(Math.random() * leafColors.length)],
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const leaf = new THREE.Mesh(geometry, material);

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * CONFIG.ARENA_RADIUS * 0.9;
        leaf.position.set(
            Math.cos(angle) * radius,
            2 + Math.random() * 6,
            Math.sin(angle) * radius
        );
        leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        leaf.userData.fallSpeed = 0.01 + Math.random() * 0.02;
        leaf.userData.swaySpeed = 1 + Math.random() * 2;
        leaf.userData.swayOffset = Math.random() * Math.PI * 2;
        leaf.userData.rotSpeed = 0.02 + Math.random() * 0.03;

        scene.add(leaf);
        themeParticles.push(leaf);
    }

    // Bright sunny lighting
    const sunLight = new THREE.DirectionalLight(0xffffee, 1);
    sunLight.position.set(20, 30, 10);
    scene.add(sunLight);
    themeLights.push(sunLight);
}

// Psychedelic theme - color-shifting walls and spiral particles
function createPsychedelicEffects(board) {
    // Spiral particles
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(geometry, material);

        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 25;
        particle.position.set(
            Math.cos(angle) * radius,
            1 + Math.random() * 5,
            Math.sin(angle) * radius
        );
        particle.userData.orbitSpeed = 0.005 + Math.random() * 0.01;
        particle.userData.orbitRadius = radius;
        particle.userData.orbitAngle = angle;
        particle.userData.vertSpeed = 0.5 + Math.random();
        particle.userData.baseY = particle.position.y;
        particle.userData.hue = Math.random();

        scene.add(particle);
        themeParticles.push(particle);
    }

    // Purple ambient glow
    const ambientGlow = new THREE.PointLight(0xff00ff, 0.5, 60);
    ambientGlow.position.set(0, 15, 0);
    scene.add(ambientGlow);
    themeLights.push(ambientGlow);
}

// Bunker theme - sparks and industrial lighting
function createBunkerEffects() {
    // Sparking lights at corners
    const sparkPositions = [
        { x: -25, z: -25 }, { x: 25, z: -25 },
        { x: -25, z: 25 }, { x: 25, z: 25 }
    ];

    sparkPositions.forEach(pos => {
        // Flickering industrial light
        const light = new THREE.PointLight(0xffaa00, 0.6, 15);
        light.position.set(pos.x, 4, pos.z);
        light.userData.flickerSpeed = 10 + Math.random() * 10;
        light.userData.flickerOffset = Math.random() * Math.PI * 2;
        light.userData.baseIntensity = 0.4 + Math.random() * 0.3;
        scene.add(light);
        themeLights.push(light);
    });

    // Occasional spark particles
    for (let i = 0; i < 15; i++) {
        const geometry = new THREE.SphereGeometry(0.08, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0
        });
        const spark = new THREE.Mesh(geometry, material);
        spark.position.set(
            (Math.random() - 0.5) * 50,
            3 + Math.random() * 2,
            (Math.random() - 0.5) * 50
        );
        spark.userData.sparkTimer = Math.random() * 100;
        spark.userData.sparkDuration = 0;
        scene.add(spark);
        themeParticles.push(spark);
    }

    // Dim industrial lighting
    scene.children.forEach(child => {
        if (child.isAmbientLight) {
            child.intensity = 0.25;
        }
    });
}

// Ruins theme - floating vine particles and nature
function createRuinsEffects() {
    // Floating pollen/spores
    const sporeCount = 35;
    for (let i = 0; i < sporeCount; i++) {
        const geometry = new THREE.SphereGeometry(0.06, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.5 + Math.random() * 0.3
        });
        const spore = new THREE.Mesh(geometry, material);

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * CONFIG.ARENA_RADIUS * 0.9;
        spore.position.set(
            Math.cos(angle) * radius,
            0.5 + Math.random() * 4,
            Math.sin(angle) * radius
        );
        spore.userData.floatSpeed = 0.3 + Math.random() * 0.5;
        spore.userData.floatOffset = Math.random() * Math.PI * 2;
        spore.userData.driftAngle = Math.random() * Math.PI * 2;
        spore.userData.driftSpeed = 0.005 + Math.random() * 0.01;

        scene.add(spore);
        themeParticles.push(spore);
    }

    // Soft green ambient light
    scene.children.forEach(child => {
        if (child.isAmbientLight) {
            child.color.setHex(0xaaffaa);
            child.intensity = 0.5;
        }
    });
}

// Arena theme - spotlights and dramatic lighting
function createArenaEffects() {
    // Stadium spotlights
    const spotPositions = [
        { x: -30, z: -30 }, { x: 30, z: -30 },
        { x: -30, z: 30 }, { x: 30, z: 30 }
    ];

    spotPositions.forEach((pos, i) => {
        const spotlight = new THREE.SpotLight(0xffffff, 1, 80, Math.PI / 6, 0.3);
        spotlight.position.set(pos.x, 20, pos.z);
        spotlight.target.position.set(0, 0, 0);
        scene.add(spotlight);
        scene.add(spotlight.target);
        themeLights.push(spotlight);

        // Visible light cone effect
        const coneGeometry = new THREE.ConeGeometry(8, 20, 16, 1, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05,
            side: THREE.DoubleSide
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.position.set(pos.x, 10, pos.z);
        cone.rotation.x = Math.PI;
        // Point toward center
        const angleToCenter = Math.atan2(-pos.z, -pos.x);
        cone.rotation.z = Math.PI / 6;
        cone.rotation.y = angleToCenter + Math.PI / 2;
        scene.add(cone);
        themeParticles.push(cone);
    });

    // Center spotlight
    const centerSpot = new THREE.SpotLight(0xffffaa, 0.5, 50, Math.PI / 4, 0.5);
    centerSpot.position.set(0, 25, 0);
    centerSpot.target.position.set(0, 0, 0);
    scene.add(centerSpot);
    scene.add(centerSpot.target);
    themeLights.push(centerSpot);
}

// Streets theme - neon signs, flickering lights, trash floating
function createStreetsEffects() {
    // Flickering neon signs
    const neonPositions = [
        { x: -20, z: -10, color: 0xff00ff },
        { x: 15, z: -10, color: 0x00ffff },
        { x: -10, z: 8, color: 0xffff00 },
        { x: 15, z: 8, color: 0xff6600 }
    ];

    neonPositions.forEach(pos => {
        const light = new THREE.PointLight(pos.color, 0.8, 15);
        light.position.set(pos.x, 5, pos.z);
        light.userData.flickerSpeed = 3 + Math.random() * 5;
        light.userData.flickerOffset = Math.random() * Math.PI * 2;
        light.userData.baseIntensity = 0.5 + Math.random() * 0.5;
        light.userData.isNeon = true;
        scene.add(light);
        themeLights.push(light);
    });

    // Floating trash/paper particles
    for (let i = 0; i < 20; i++) {
        const geometry = new THREE.PlaneGeometry(0.3, 0.3);
        const colors = [0xcccccc, 0xffcc00, 0xff6666, 0x66ff66];
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const paper = new THREE.Mesh(geometry, material);

        paper.position.set(
            (Math.random() - 0.5) * 50,
            0.5 + Math.random() * 3,
            (Math.random() - 0.5) * 50
        );
        paper.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        paper.userData.floatSpeed = 0.5 + Math.random();
        paper.userData.driftAngle = Math.random() * Math.PI * 2;
        paper.userData.spinSpeed = 0.02 + Math.random() * 0.03;

        scene.add(paper);
        themeParticles.push(paper);
    }

    // Dark urban lighting
    scene.children.forEach(child => {
        if (child.isAmbientLight) {
            child.intensity = 0.3;
        }
    });
}

// Park theme - pond with ducks, butterflies, birds
function createParkEffects() {
    // Create the pond in the center
    const pondGeometry = new THREE.CircleGeometry(10, 32);
    const pondMaterial = new THREE.MeshStandardMaterial({
        color: 0x4169e1,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const pond = new THREE.Mesh(pondGeometry, pondMaterial);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(0, 0.05, 0);
    scene.add(pond);
    themeParticles.push(pond);

    // Pond ripple rings
    for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.RingGeometry(2 + i * 3, 2.3 + i * 3, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.06, 0);
        ring.userData.rippleIndex = i;
        ring.userData.rippleSpeed = 0.02;
        scene.add(ring);
        themeParticles.push(ring);
    }

    // Rubber ducks in the pond!
    const duckPositions = [
        { x: -3, z: 2 }, { x: 4, z: -2 }, { x: 0, z: 5 }
    ];
    duckPositions.forEach(pos => {
        const duckBody = new THREE.SphereGeometry(0.5, 8, 8);
        const duckMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const duck = new THREE.Mesh(duckBody, duckMaterial);
        duck.position.set(pos.x, 0.3, pos.z);
        duck.userData.bobSpeed = 1 + Math.random();
        duck.userData.bobOffset = Math.random() * Math.PI * 2;
        duck.userData.swimAngle = Math.random() * Math.PI * 2;
        duck.userData.swimRadius = 2 + Math.random() * 3;
        duck.userData.baseX = pos.x;
        duck.userData.baseZ = pos.z;
        scene.add(duck);
        themeParticles.push(duck);
    });

    // Butterflies
    for (let i = 0; i < 8; i++) {
        const wingGeometry = new THREE.PlaneGeometry(0.3, 0.2);
        const colors = [0xff69b4, 0x87ceeb, 0xffd700, 0xff6347, 0x9370db];
        const wingMaterial = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const butterfly = new THREE.Mesh(wingGeometry, wingMaterial);

        butterfly.position.set(
            (Math.random() - 0.5) * 40,
            2 + Math.random() * 4,
            (Math.random() - 0.5) * 40
        );
        butterfly.userData.flapSpeed = 10 + Math.random() * 5;
        butterfly.userData.flyAngle = Math.random() * Math.PI * 2;
        butterfly.userData.flySpeed = 0.03 + Math.random() * 0.02;
        butterfly.userData.baseY = butterfly.position.y;

        scene.add(butterfly);
        themeParticles.push(butterfly);
    }

    // Bright sunny day
    const sunLight = new THREE.DirectionalLight(0xffffee, 1.2);
    sunLight.position.set(30, 40, 20);
    scene.add(sunLight);
    themeLights.push(sunLight);
}

// Bathroom theme - steam, dripping water, rubber ducks
function createBathroomEffects() {
    // Steam particles rising
    for (let i = 0; i < 30; i++) {
        const geometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2 + Math.random() * 0.2
        });
        const steam = new THREE.Mesh(geometry, material);

        // Steam near bathtub area
        steam.position.set(
            -19 + Math.random() * 12,
            1 + Math.random() * 3,
            -20 + Math.random() * 6
        );
        steam.userData.riseSpeed = 0.02 + Math.random() * 0.02;
        steam.userData.driftSpeed = 0.01;
        steam.userData.maxY = 8;

        scene.add(steam);
        themeParticles.push(steam);
    }

    // Water drips
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.8
        });
        const drip = new THREE.Mesh(geometry, material);
        drip.position.set(
            20 + Math.random() * 4,
            3,
            -22 + Math.random() * 2
        );
        drip.userData.fallSpeed = 0;
        drip.userData.maxFallSpeed = 0.3;
        drip.userData.startY = 3;
        drip.userData.dripTimer = Math.random() * 100;

        scene.add(drip);
        themeParticles.push(drip);
    }

    // Rubber duck in bathtub!
    const duckBody = new THREE.SphereGeometry(0.8, 12, 12);
    const duckMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const bathDuck = new THREE.Mesh(duckBody, duckMaterial);
    bathDuck.position.set(-19, 1.5, -17);
    bathDuck.userData.bobSpeed = 2;
    bathDuck.userData.bobOffset = 0;
    scene.add(bathDuck);
    themeParticles.push(bathDuck);

    // Bright bathroom lighting
    const bathLight = new THREE.PointLight(0xffffff, 0.8, 50);
    bathLight.position.set(0, 10, 0);
    scene.add(bathLight);
    themeLights.push(bathLight);
}

// Kitchen theme - steam from toaster, flies around fruit
function createKitchenEffects() {
    // Steam from toaster
    for (let i = 0; i < 15; i++) {
        const geometry = new THREE.SphereGeometry(0.2, 6, 6);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const steam = new THREE.Mesh(geometry, material);
        steam.position.set(
            22 + Math.random() * 3,
            4 + Math.random() * 2,
            8 + Math.random() * 2
        );
        steam.userData.riseSpeed = 0.03 + Math.random() * 0.02;
        steam.userData.swaySpeed = 2 + Math.random();
        steam.userData.swayOffset = Math.random() * Math.PI * 2;
        steam.userData.maxY = 10;

        scene.add(steam);
        themeParticles.push(steam);
    }

    // Flies buzzing around fruit
    for (let i = 0; i < 6; i++) {
        const geometry = new THREE.SphereGeometry(0.08, 4, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const fly = new THREE.Mesh(geometry, material);

        const fruitPos = i < 3 ? { x: -8, z: 20 } : { x: 0, z: -20 };
        fly.position.set(fruitPos.x, 4, fruitPos.z);
        fly.userData.centerX = fruitPos.x;
        fly.userData.centerZ = fruitPos.z;
        fly.userData.buzzRadius = 2 + Math.random();
        fly.userData.buzzSpeed = 5 + Math.random() * 3;
        fly.userData.buzzAngle = Math.random() * Math.PI * 2;
        fly.userData.buzzY = 3 + Math.random() * 2;

        scene.add(fly);
        themeParticles.push(fly);
    }

    // Spilled milk ripple effect on the puddle
    const rippleGeometry = new THREE.RingGeometry(1, 1.2, 16);
    const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const milkRipple = new THREE.Mesh(rippleGeometry, rippleMaterial);
    milkRipple.rotation.x = -Math.PI / 2;
    milkRipple.position.set(11, 0.15, 13);
    milkRipple.userData.rippleGrow = true;
    scene.add(milkRipple);
    themeParticles.push(milkRipple);

    // Warm kitchen lighting
    const kitchenLight = new THREE.PointLight(0xffeecc, 0.7, 60);
    kitchenLight.position.set(0, 12, 0);
    scene.add(kitchenLight);
    themeLights.push(kitchenLight);
}

// Show board name announcement at round start
function showBoardAnnouncement(boardName, roleText) {
    const announcement = document.createElement('div');
    announcement.id = 'board-announcement';
    announcement.innerHTML = `
        <h1>${boardName}</h1>
        <p>${roleText}</p>
    `;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 2500);
}

// Create ambient dust particles floating in the arena
function createDustParticles() {
    // Clear existing dust
    dustParticles.forEach(p => scene.remove(p));
    dustParticles = [];

    const dustCount = 40;
    for (let i = 0; i < dustCount; i++) {
        const geometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.1, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3 + Math.random() * 0.2
        });
        const dust = new THREE.Mesh(geometry, material);

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * CONFIG.ARENA_RADIUS * 0.9;
        dust.position.set(
            Math.cos(angle) * radius,
            1 + Math.random() * 8,
            Math.sin(angle) * radius
        );
        dust.userData.driftSpeed = 0.005 + Math.random() * 0.01;
        dust.userData.driftAngle = Math.random() * Math.PI * 2;
        dust.userData.bobSpeed = 0.3 + Math.random() * 0.4;
        dust.userData.bobOffset = Math.random() * Math.PI * 2;
        dust.userData.baseY = dust.position.y;

        scene.add(dust);
        dustParticles.push(dust);
    }
}

// Create glow effect under characters
function createCharacterGlow() {
    // Player glow
    const glowGeometry = new THREE.CircleGeometry(2, 32);
    const playerIsSeeker = state.role === 'seeker';

    const playerGlowMaterial = new THREE.MeshBasicMaterial({
        color: playerIsSeeker ? 0xffd700 : 0x4dd0e1,
        transparent: true,
        opacity: 0.3
    });
    playerGlow = new THREE.Mesh(glowGeometry, playerGlowMaterial);
    playerGlow.rotation.x = -Math.PI / 2;
    playerGlow.position.y = 0.05;
    scene.add(playerGlow);

    // Opponent glow
    const opponentGlowMaterial = new THREE.MeshBasicMaterial({
        color: playerIsSeeker ? 0x4dd0e1 : 0xffd700,
        transparent: true,
        opacity: 0.3
    });
    opponentGlow = new THREE.Mesh(glowGeometry.clone(), opponentGlowMaterial);
    opponentGlow.rotation.x = -Math.PI / 2;
    opponentGlow.position.y = 0.05;
    scene.add(opponentGlow);
}

// Update dust particles
function updateDustParticles() {
    const time = Date.now() * 0.001;

    dustParticles.forEach(dust => {
        // Gentle drift
        dust.position.x += Math.cos(dust.userData.driftAngle) * dust.userData.driftSpeed;
        dust.position.z += Math.sin(dust.userData.driftAngle) * dust.userData.driftSpeed;
        dust.position.y = dust.userData.baseY + Math.sin(time * dust.userData.bobSpeed + dust.userData.bobOffset) * 0.5;

        // Wrap around arena
        const dist = Math.sqrt(dust.position.x ** 2 + dust.position.z ** 2);
        if (dist > CONFIG.ARENA_RADIUS) {
            dust.userData.driftAngle += Math.PI;
        }
    });
}

// Update character glows to follow players
function updateCharacterGlows() {
    if (playerGlow) {
        playerGlow.position.x = state.player.x;
        playerGlow.position.z = state.player.z;

        // Pulse effect
        const pulse = 0.25 + Math.sin(Date.now() * 0.003) * 0.1;
        playerGlow.material.opacity = pulse;
    }

    if (opponentGlow) {
        opponentGlow.position.x = state.opponent.x;
        opponentGlow.position.z = state.opponent.z;

        // Only show opponent glow if visible
        const visible = state.role === 'hider' || isPointVisible(state.opponent.x, state.opponent.z);
        opponentGlow.visible = visible;

        if (visible) {
            const pulse = 0.25 + Math.sin(Date.now() * 0.003 + Math.PI) * 0.1;
            opponentGlow.material.opacity = pulse;
        }
    }
}

// Update theme effects each frame
function updateThemeEffects() {
    const time = Date.now() * 0.001;
    const board = currentBoard;

    switch (board.theme) {
        case 'haunted':
            // Drift fog particles
            themeParticles.forEach(fog => {
                if (fog.userData.driftSpeed) {
                    fog.position.x += Math.cos(fog.userData.driftAngle) * fog.userData.driftSpeed;
                    fog.position.z += Math.sin(fog.userData.driftAngle) * fog.userData.driftSpeed;
                    fog.position.y = fog.position.y + Math.sin(time * fog.userData.bobSpeed + fog.userData.bobOffset) * 0.01;

                    const dist = Math.sqrt(fog.position.x ** 2 + fog.position.z ** 2);
                    if (dist > CONFIG.ARENA_RADIUS) {
                        fog.userData.driftAngle += Math.PI;
                    }
                }
            });
            break;

        case 'neon':
        case 'void':
            neonPulseTime += 0.02;
            themeParticles.forEach(particle => {
                if (particle.userData.speed) {
                    particle.userData.orbitAngle += particle.userData.speed;
                    particle.position.x += Math.cos(particle.userData.orbitAngle) * 0.05;
                    particle.position.z += Math.sin(particle.userData.orbitAngle) * 0.05;
                    particle.position.y = particle.userData.baseY + Math.sin(time * 2) * 0.5;
                    particle.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
                }
            });
            wallMeshes.forEach(mesh => {
                if (mesh.material && mesh.material.emissiveIntensity !== undefined) {
                    mesh.material.emissiveIntensity = 0.3 + Math.sin(neonPulseTime) * 0.2;
                }
            });
            break;

        case 'medieval':
            themeParticles.forEach(flame => {
                if (flame.userData.flickerSpeed) {
                    const flicker = Math.sin(time * flame.userData.flickerSpeed + flame.userData.flickerOffset);
                    flame.scale.setScalar(0.8 + flicker * 0.3);
                    flame.material.opacity = 0.7 + flicker * 0.3;
                }
            });
            themeLights.forEach(light => {
                if (light.userData.flickerSpeed) {
                    const flicker = Math.sin(time * light.userData.flickerSpeed + light.userData.flickerOffset);
                    light.intensity = light.userData.baseIntensity + flicker * 0.3;
                }
            });
            break;

        case 'garden':
            // Falling/swaying leaves
            themeParticles.forEach(leaf => {
                if (leaf.userData.fallSpeed) {
                    leaf.position.y -= leaf.userData.fallSpeed;
                    leaf.position.x += Math.sin(time * leaf.userData.swaySpeed + leaf.userData.swayOffset) * 0.02;
                    leaf.rotation.x += leaf.userData.rotSpeed;
                    leaf.rotation.z += leaf.userData.rotSpeed * 0.5;

                    // Reset when too low
                    if (leaf.position.y < 0) {
                        leaf.position.y = 8;
                        const angle = Math.random() * Math.PI * 2;
                        const radius = Math.random() * CONFIG.ARENA_RADIUS * 0.9;
                        leaf.position.x = Math.cos(angle) * radius;
                        leaf.position.z = Math.sin(angle) * radius;
                    }
                }
            });
            break;

        case 'psychedelic':
            neonPulseTime += 0.03;
            themeParticles.forEach(particle => {
                if (particle.userData.orbitSpeed) {
                    particle.userData.orbitAngle += particle.userData.orbitSpeed;
                    particle.position.x = Math.cos(particle.userData.orbitAngle) * particle.userData.orbitRadius;
                    particle.position.z = Math.sin(particle.userData.orbitAngle) * particle.userData.orbitRadius;
                    particle.position.y = particle.userData.baseY + Math.sin(time * particle.userData.vertSpeed) * 2;

                    // Color shift
                    particle.userData.hue = (particle.userData.hue + 0.005) % 1;
                    particle.material.color.setHSL(particle.userData.hue, 1, 0.5);
                }
            });
            // Pulse walls
            wallMeshes.forEach(mesh => {
                if (mesh.material && mesh.material.emissiveIntensity !== undefined) {
                    mesh.material.emissiveIntensity = 0.4 + Math.sin(neonPulseTime * 2) * 0.3;
                    // Color shift walls too
                    const hue = (time * 0.1) % 1;
                    mesh.material.emissive.setHSL(hue, 1, 0.5);
                }
            });
            break;

        case 'bunker':
            // Flicker industrial lights
            themeLights.forEach(light => {
                if (light.userData.flickerSpeed) {
                    const noise = Math.sin(time * light.userData.flickerSpeed + light.userData.flickerOffset);
                    const flicker = noise > 0.7 ? 0.2 : 1; // Occasional flicker
                    light.intensity = light.userData.baseIntensity * flicker;
                }
            });
            // Spark particles
            themeParticles.forEach(spark => {
                if (spark.userData.sparkTimer !== undefined) {
                    spark.userData.sparkTimer++;
                    if (spark.userData.sparkTimer > 100 + Math.random() * 200) {
                        spark.userData.sparkTimer = 0;
                        spark.userData.sparkDuration = 10;
                        spark.material.opacity = 1;
                    }
                    if (spark.userData.sparkDuration > 0) {
                        spark.userData.sparkDuration--;
                        spark.material.opacity = spark.userData.sparkDuration / 10;
                        spark.position.y -= 0.1;
                    }
                }
            });
            break;

        case 'ruins':
            // Float spores
            themeParticles.forEach(spore => {
                if (spore.userData.floatSpeed) {
                    spore.position.y += Math.sin(time * spore.userData.floatSpeed + spore.userData.floatOffset) * 0.005;
                    spore.position.x += Math.cos(spore.userData.driftAngle) * spore.userData.driftSpeed;
                    spore.position.z += Math.sin(spore.userData.driftAngle) * spore.userData.driftSpeed;

                    const dist = Math.sqrt(spore.position.x ** 2 + spore.position.z ** 2);
                    if (dist > CONFIG.ARENA_RADIUS) {
                        spore.userData.driftAngle += Math.PI;
                    }
                }
            });
            break;

        case 'arena':
            // Subtle spotlight movement
            themeLights.forEach((light, i) => {
                if (light.isSpotLight && light.target) {
                    const offset = Math.sin(time * 0.5 + i) * 3;
                    light.target.position.x = offset;
                    light.target.position.z = offset;
                }
            });
            break;

        case 'streets':
            // Flickering neon signs
            themeLights.forEach(light => {
                if (light.userData.isNeon) {
                    const flicker = Math.sin(time * light.userData.flickerSpeed + light.userData.flickerOffset);
                    // Random flickers for that urban feel
                    const randomFlicker = Math.random() > 0.98 ? 0.2 : 1;
                    light.intensity = light.userData.baseIntensity * (0.7 + flicker * 0.3) * randomFlicker;
                }
            });
            // Floating trash/paper
            themeParticles.forEach(paper => {
                if (paper.userData.floatSpeed) {
                    paper.position.y += Math.sin(time * paper.userData.floatSpeed) * 0.01;
                    paper.position.x += Math.cos(paper.userData.driftAngle) * 0.01;
                    paper.position.z += Math.sin(paper.userData.driftAngle) * 0.01;
                    paper.rotation.x += paper.userData.spinSpeed;
                    paper.rotation.z += paper.userData.spinSpeed * 0.7;

                    // Keep within bounds
                    if (Math.abs(paper.position.x) > 30 || Math.abs(paper.position.z) > 30) {
                        paper.userData.driftAngle += Math.PI;
                    }
                    // Reset if too low
                    if (paper.position.y < 0.3) {
                        paper.position.y = 3;
                    }
                }
            });
            break;

        case 'park':
            // Animate pond ripples
            themeParticles.forEach(particle => {
                // Ripple rings
                if (particle.userData.rippleIndex !== undefined) {
                    const scale = 1 + Math.sin(time * particle.userData.rippleSpeed * 50 + particle.userData.rippleIndex) * 0.2;
                    particle.scale.set(scale, scale, 1);
                    particle.material.opacity = 0.3 - Math.abs(Math.sin(time + particle.userData.rippleIndex)) * 0.15;
                }
                // Swimming rubber ducks
                else if (particle.userData.bobSpeed && particle.userData.swimAngle !== undefined) {
                    particle.userData.swimAngle += 0.01;
                    particle.position.x = particle.userData.baseX + Math.cos(particle.userData.swimAngle) * 2;
                    particle.position.z = particle.userData.baseZ + Math.sin(particle.userData.swimAngle) * 2;
                    particle.position.y = 0.3 + Math.sin(time * particle.userData.bobSpeed + particle.userData.bobOffset) * 0.1;
                    // Keep ducks in pond bounds
                    const distFromCenter = Math.sqrt(particle.position.x ** 2 + particle.position.z ** 2);
                    if (distFromCenter > 8) {
                        particle.userData.swimAngle += Math.PI;
                    }
                }
                // Butterflies
                else if (particle.userData.flapSpeed) {
                    // Wing flapping
                    particle.scale.y = 0.5 + Math.abs(Math.sin(time * particle.userData.flapSpeed)) * 0.5;
                    // Flying movement
                    particle.userData.flyAngle += particle.userData.flySpeed;
                    particle.position.x += Math.cos(particle.userData.flyAngle) * 0.05;
                    particle.position.z += Math.sin(particle.userData.flyAngle) * 0.05;
                    particle.position.y = particle.userData.baseY + Math.sin(time * 2) * 0.5;
                    // Random direction changes
                    if (Math.random() > 0.995) {
                        particle.userData.flyAngle += (Math.random() - 0.5) * Math.PI;
                    }
                    // Keep in bounds
                    const dist = Math.sqrt(particle.position.x ** 2 + particle.position.z ** 2);
                    if (dist > CONFIG.ARENA_RADIUS * 0.8) {
                        particle.userData.flyAngle += Math.PI;
                    }
                }
            });
            break;

        case 'bathroom':
            themeParticles.forEach(particle => {
                // Rising steam
                if (particle.userData.riseSpeed && particle.userData.maxY) {
                    particle.position.y += particle.userData.riseSpeed;
                    particle.position.x += Math.sin(time * 2 + particle.position.y) * particle.userData.driftSpeed;
                    particle.material.opacity = Math.max(0, particle.material.opacity - 0.001);

                    // Reset when too high or faded
                    if (particle.position.y > particle.userData.maxY || particle.material.opacity <= 0) {
                        particle.position.y = 1;
                        particle.position.x = -19 + Math.random() * 12;
                        particle.position.z = -20 + Math.random() * 6;
                        particle.material.opacity = 0.2 + Math.random() * 0.2;
                    }
                }
                // Water drips
                else if (particle.userData.fallSpeed !== undefined && particle.userData.dripTimer !== undefined) {
                    particle.userData.dripTimer++;
                    if (particle.userData.dripTimer > 60 + Math.random() * 100) {
                        // Start falling
                        particle.userData.fallSpeed = Math.min(particle.userData.fallSpeed + 0.02, particle.userData.maxFallSpeed);
                        particle.position.y -= particle.userData.fallSpeed;

                        // Reset when hit floor
                        if (particle.position.y < 0.1) {
                            particle.position.y = particle.userData.startY;
                            particle.userData.fallSpeed = 0;
                            particle.userData.dripTimer = 0;
                        }
                    }
                }
                // Bobbing rubber duck in bathtub
                else if (particle.userData.bobSpeed && !particle.userData.swimAngle) {
                    particle.position.y = 1.5 + Math.sin(time * particle.userData.bobSpeed) * 0.1;
                    particle.rotation.y += 0.005;
                }
            });
            break;

        case 'kitchen':
            themeParticles.forEach(particle => {
                // Steam from toaster
                if (particle.userData.riseSpeed && particle.userData.swaySpeed) {
                    particle.position.y += particle.userData.riseSpeed;
                    particle.position.x += Math.sin(time * particle.userData.swaySpeed + particle.userData.swayOffset) * 0.02;
                    particle.material.opacity = Math.max(0, particle.material.opacity - 0.002);

                    if (particle.position.y > particle.userData.maxY || particle.material.opacity <= 0) {
                        particle.position.y = 4 + Math.random() * 2;
                        particle.position.x = 22 + Math.random() * 3;
                        particle.position.z = 8 + Math.random() * 2;
                        particle.material.opacity = 0.3;
                    }
                }
                // Buzzing flies
                else if (particle.userData.buzzSpeed) {
                    particle.userData.buzzAngle += particle.userData.buzzSpeed * 0.05;
                    particle.position.x = particle.userData.centerX + Math.cos(particle.userData.buzzAngle) * particle.userData.buzzRadius;
                    particle.position.z = particle.userData.centerZ + Math.sin(particle.userData.buzzAngle * 1.3) * particle.userData.buzzRadius;
                    particle.position.y = particle.userData.buzzY + Math.sin(time * 10 + particle.userData.buzzAngle) * 0.3;
                }
                // Milk ripple
                else if (particle.userData.rippleGrow !== undefined) {
                    const rippleScale = 1 + Math.sin(time * 2) * 0.3;
                    particle.scale.set(rippleScale, rippleScale, 1);
                    particle.material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
                }
            });
            break;
    }
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

    // Stop any lingering sounds
    SoundManager.stopHeartbeat();

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
    createDustParticles();
    createCharacterGlow();

    // Activate vision cone for seeker, deactivate for hider
    if (state.role === 'seeker') {
        activateVisionCone();
    } else {
        deactivateVisionCone();
    }

    showScreen('game');

    // Show board announcement
    const roleText = state.role === 'seeker' ? 'You are the Seeker' : 'You are the Hider';
    showBoardAnnouncement(currentBoard.name, roleText);

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

        // Play panic tick in last 10 seconds
        if (state.panicMode) {
            SoundManager.playPanicTick();
        }

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

    // Deactivate vision cone
    deactivateVisionCone();

    // Stop heartbeat sound
    SoundManager.stopHeartbeat();

    let title, message, isWinner = false;

    switch (reason) {
        case 'caught':
            // Play catch sound
            SoundManager.playCatch();

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

    // Update stats
    state.stats.roundsPlayed++;

    if (isWinner) {
        state.stats.wins++;
        state.stats.currentStreak++;
        if (state.stats.currentStreak > state.stats.bestStreak) {
            state.stats.bestStreak = state.stats.currentStreak;
        }

        // Track best times
        if (reason === 'caught' && state.role === 'seeker') {
            const catchTime = CONFIG.GAME_DURATION - state.timeRemaining;
            if (state.stats.fastestCatch === null || catchTime < state.stats.fastestCatch) {
                state.stats.fastestCatch = catchTime;
            }
        } else if (reason === 'time_up' && state.role === 'hider') {
            state.stats.longestSurvival = CONFIG.GAME_DURATION;
        }
    } else {
        state.stats.losses++;
        state.stats.currentStreak = 0;
    }

    // Play victory or defeat sound
    if (isWinner) {
        SoundManager.playVictory();
    } else {
        SoundManager.playDefeat();
    }

    // Start 3D victory celebration animation
    startVictoryCelebration(title, message, isWinner);
}

function startVictoryCelebration(title, message, isWinner) {
    // Determine who is the winner
    const winnerIsPlayer = isWinner;
    const winnerMesh = winnerIsPlayer ? playerMesh : opponentMesh;
    const winnerX = winnerIsPlayer ? state.player.x : state.opponent.x;
    const winnerZ = winnerIsPlayer ? state.player.z : state.opponent.z;

    // Make sure opponent is visible for celebration
    if (opponentMesh) {
        opponentMesh.visible = true;
    }

    // Show winner text overlay FIRST
    const textOverlay = document.createElement('div');
    textOverlay.id = 'victory-text-overlay';
    textOverlay.innerHTML = `
        <h1 class="victory-title ${isWinner ? 'winner' : 'loser'}">${title}</h1>
        <p class="victory-message">${message}</p>
    `;
    document.body.appendChild(textOverlay);

    // Swap to celebration model if winner and we have the model
    let celebrateMesh = winnerMesh;
    let celebrateMixer = null;
    let usedCelebrateModel = false;

    // Seeker wins - use seeker celebrate model
    if (isWinner && state.role === 'seeker' && seekerCelebrateModel) {
        celebrateMesh = THREE.SkeletonUtils.clone(seekerCelebrateModel);
        celebrateMesh.position.set(winnerX, 0, winnerZ);
        // Face the camera (camera is at +Z from character)
        celebrateMesh.rotation.y = 0;
        scene.add(celebrateMesh);

        if (playerMesh) playerMesh.visible = false;

        if (seekerCelebrateAnimations && seekerCelebrateAnimations.length > 0) {
            celebrateMixer = new THREE.AnimationMixer(celebrateMesh);
            const action = celebrateMixer.clipAction(seekerCelebrateAnimations[0]);
            action.setLoop(THREE.LoopRepeat);
            action.play();
        }
        usedCelebrateModel = true;
    }
    // Hider wins - use hider celebrate model
    else if (isWinner && state.role === 'hider') {
        console.log('Hider won! hiderCelebrateModel:', hiderCelebrateModel ? 'loaded' : 'NOT loaded');
        if (hiderCelebrateModel) {
            celebrateMesh = THREE.SkeletonUtils.clone(hiderCelebrateModel);
            celebrateMesh.position.set(winnerX, 0, winnerZ);
            // Face the camera (camera is at +Z from character)
            celebrateMesh.rotation.y = 0;
            scene.add(celebrateMesh);

            if (playerMesh) playerMesh.visible = false;

            if (hiderCelebrateAnimations && hiderCelebrateAnimations.length > 0) {
                celebrateMixer = new THREE.AnimationMixer(celebrateMesh);
                const action = celebrateMixer.clipAction(hiderCelebrateAnimations[0]);
                action.setLoop(THREE.LoopRepeat);
                action.play();
            }
            usedCelebrateModel = true;
        }
    }

    // Store celebration state
    state.celebration = {
        active: true,
        startTime: performance.now(),
        isWinner: isWinner,
        title: title,
        message: message,
        winnerMesh: celebrateMesh,
        originalMesh: winnerMesh,
        celebrateMixer: celebrateMixer,
        usedCelebrateModel: usedCelebrateModel,
        startX: winnerX,
        startZ: winnerZ,
        startCamY: camera.position.y,
        startCamZ: camera.position.z,
        textOverlay: textOverlay
    };

    // Start celebration animation loop
    celebrationAnimate();
}

function celebrationAnimate() {
    if (!state.celebration.active) return;

    const elapsed = performance.now() - state.celebration.startTime;
    const duration = 4500; // 4.5 seconds of celebration
    const progress = Math.min(elapsed / duration, 1);

    const winnerMesh = state.celebration.winnerMesh;

    if (winnerMesh && state.celebration.isWinner) {
        // If using celebrate model, just play the animation
        if (state.celebration.usedCelebrateModel && state.celebration.celebrateMixer) {
            state.celebration.celebrateMixer.update(0.016);
        } else {
            // Fallback: Multiple bounces - 3 jumps, each smaller
            const bounces = 3;
            const bounceProgress = (progress * bounces) % 1;
            const currentBounce = Math.floor(progress * bounces);
            const bounceHeight = 8 * Math.pow(0.5, currentBounce);
            const jumpY = Math.sin(bounceProgress * Math.PI) * bounceHeight;
            winnerMesh.position.y = jumpY;

            // Spin around while jumping
            const spins = 2;
            winnerMesh.rotation.y = progress * Math.PI * 2 * spins;

            // Scale up effect
            const scaleBoost = 1 + Math.sin(progress * Math.PI) * 0.3;
            winnerMesh.scale.set(scaleBoost, scaleBoost, scaleBoost);
        }

        // Camera follows winner and zooms in
        const targetCamDistance = 12;
        const startCamDistance = 30;
        const camDistance = startCamDistance - (startCamDistance - targetCamDistance) * progress;

        const targetCamHeight = 8;
        const startCamHeight = 50;
        const camHeight = startCamHeight - (startCamHeight - targetCamHeight) * progress;

        camera.position.set(
            state.celebration.startX,
            camHeight,
            state.celebration.startZ + camDistance
        );
        camera.lookAt(state.celebration.startX, 4, state.celebration.startZ);
    } else if (winnerMesh) {
        // Loser view - zoom camera to the action
        camera.position.set(
            (state.player.x + state.opponent.x) / 2,
            35,
            (state.player.z + state.opponent.z) / 2 + 25
        );
        camera.lookAt(
            (state.player.x + state.opponent.x) / 2,
            0,
            (state.player.z + state.opponent.z) / 2
        );
    }

    // Update animation mixers
    const delta = 0.016;
    if (playerMixer) playerMixer.update(delta);
    if (opponentMixer) opponentMixer.update(delta);

    // Render the scene
    renderer.render(scene, camera);

    if (progress < 1) {
        requestAnimationFrame(celebrationAnimate);
    } else {
        // Celebration animation complete, show the overlay
        state.celebration.active = false;

        // Remove text overlay
        if (state.celebration.textOverlay) {
            state.celebration.textOverlay.remove();
        }

        // Clean up celebrate model if we used it
        if (state.celebration.usedCelebrateModel) {
            scene.remove(winnerMesh);
            if (state.celebration.originalMesh) {
                state.celebration.originalMesh.visible = true;
            }
        } else if (winnerMesh) {
            // Reset winner mesh position and scale
            winnerMesh.position.y = 0;
            winnerMesh.scale.set(1, 1, 1);
        }

        showCelebration(state.celebration.title, state.celebration.message, state.celebration.isWinner);
    }
}

function showCelebration(title, message, isWinner) {
    // Build stats display
    const streakText = state.stats.currentStreak > 1 ? `${state.stats.currentStreak} Win Streak!` : '';
    const statsHTML = `
        <div class="stats-display">
            <div class="stat"><span class="stat-num">${state.stats.wins}</span><span class="stat-label">Wins</span></div>
            <div class="stat"><span class="stat-num">${state.stats.losses}</span><span class="stat-label">Losses</span></div>
            <div class="stat"><span class="stat-num">${state.stats.bestStreak}</span><span class="stat-label">Best Streak</span></div>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'celebration-overlay';
    overlay.innerHTML = `
        <div class="celebration-content ${isWinner ? 'winner' : 'loser'}">
            <h1 class="celebration-title">${title}</h1>
            <p class="celebration-message">${message}</p>
            ${streakText ? `<div class="streak-banner">${streakText}</div>` : ''}
            ${statsHTML}
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

        // Play countdown beep
        if (count > 0) {
            SoundManager.playCountdown(count === 1);
        }

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
        // Trigger catch effects
        triggerCatchEffects();

        if (state.conn && state.conn.open) {
            state.conn.send({ type: 'catch' });
        }
        endGame('caught');
    }
}

// Enhanced catch effects
function triggerCatchEffects() {
    // Screen flash
    const flash = document.createElement('div');
    flash.id = 'catch-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Vignette effect for dramatic feel
    const vignette = document.createElement('div');
    vignette.id = 'slowmo-vignette';
    document.body.appendChild(vignette);
    setTimeout(() => vignette.remove(), 500);

    // Intense screen shake
    state.screenShake = 15;

    // Create explosion particles at catch point
    createCatchParticles();
}

// Create 3D particles at catch location
function createCatchParticles() {
    const catchX = (state.player.x + state.opponent.x) / 2;
    const catchZ = (state.player.z + state.opponent.z) / 2;

    const particleCount = 80;
    const colors = [0xffd700, 0xff6b6b, 0xff66ff, 0x4facfe, 0x51cf66];

    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geometry, material);

        particle.position.set(catchX, 1 + Math.random() * 2, catchZ);

        // Random velocity
        particle.userData.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * 3 + 2,
            z: (Math.random() - 0.5) * 2
        };
        particle.userData.gravity = -0.15;
        particle.userData.life = 1.0;
        particle.userData.decay = 0.02 + Math.random() * 0.02;

        scene.add(particle);

        // Animate particle
        function animateParticle() {
            if (particle.userData.life <= 0) {
                scene.remove(particle);
                geometry.dispose();
                material.dispose();
                return;
            }

            particle.position.x += particle.userData.velocity.x * 0.1;
            particle.position.y += particle.userData.velocity.y * 0.1;
            particle.position.z += particle.userData.velocity.z * 0.1;

            particle.userData.velocity.y += particle.userData.gravity;
            particle.userData.life -= particle.userData.decay;

            material.opacity = particle.userData.life;
            particle.scale.setScalar(particle.userData.life);

            requestAnimationFrame(animateParticle);
        }
        animateParticle();
    }
}

// Check if AI seeker catches the player (for solo mode)
function checkAICatch() {
    if (!state.isSoloMode || state.role !== 'hider') return;
    const dx = state.player.x - state.opponent.x;
    const dz = state.player.z - state.opponent.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < CONFIG.CATCH_DISTANCE) {
        // Trigger catch effects
        triggerCatchEffects();
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
    if (!collision.x) {
        state.player.x = newX;
    } else {
        state.player.x = newX + collision.pushX;
    }
    if (!collision.z) {
        state.player.z = newZ;
    } else {
        state.player.z = newZ + collision.pushZ;
    }

    // Safety check - push out if stuck
    pushOutOfWalls();

    // Boost cooldown
    if (state.player.boostCooldown > 0) {
        const wasOnCooldown = state.player.boostCooldown > 0;
        state.player.boostCooldown -= deltaTime;
        if (state.player.boostCooldown <= 0) {
            state.player.boostCooldown = 0;
            // Play boost ready sound when cooldown finishes
            if (wasOnCooldown && state.role === 'seeker') {
                SoundManager.playBoostReady();
            }
        }
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

        // Update heartbeat sound based on danger
        SoundManager.updateHeartbeat(state.dangerLevel);
    }

    sendPosition();
    checkCatch();
}

function checkWallCollision(x, z) {
    const result = { x: false, z: false, pushX: 0, pushZ: 0 };
    const r = CONFIG.PLAYER_RADIUS;

    for (const wall of currentBoard.walls) {
        const wx = wall.x;
        const wz = wall.z;
        const ww = wall.w;
        const wd = wall.d;

        // Check if player overlaps with wall
        if (x + r > wx && x - r < wx + ww && z + r > wz && z - r < wz + wd) {
            // Calculate push direction (shortest way out)
            const overlapLeft = (x + r) - wx;
            const overlapRight = (wx + ww) - (x - r);
            const overlapTop = (z + r) - wz;
            const overlapBottom = (wz + wd) - (z - r);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapZ = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapZ) {
                result.x = true;
                result.pushX = overlapLeft < overlapRight ? -overlapLeft : overlapRight;
            } else {
                result.z = true;
                result.pushZ = overlapTop < overlapBottom ? -overlapTop : overlapBottom;
            }
        }
    }
    return result;
}

// Push player out of any walls they're stuck in
function pushOutOfWalls() {
    const r = CONFIG.PLAYER_RADIUS;
    let pushed = true;
    let iterations = 0;

    while (pushed && iterations < 10) {
        pushed = false;
        iterations++;

        for (const wall of currentBoard.walls) {
            const wx = wall.x;
            const wz = wall.z;
            const ww = wall.w;
            const wd = wall.d;

            if (state.player.x + r > wx && state.player.x - r < wx + ww &&
                state.player.z + r > wz && state.player.z - r < wz + wd) {

                const overlapLeft = (state.player.x + r) - wx;
                const overlapRight = (wx + ww) - (state.player.x - r);
                const overlapTop = (state.player.z + r) - wz;
                const overlapBottom = (wz + wd) - (state.player.z - r);

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapLeft) state.player.x -= overlapLeft + 0.1;
                else if (minOverlap === overlapRight) state.player.x += overlapRight + 0.1;
                else if (minOverlap === overlapTop) state.player.z -= overlapTop + 0.1;
                else state.player.z += overlapBottom + 0.1;

                pushed = true;
            }
        }
    }
}

function activateBoost() {
    if (state.role !== 'seeker') return;
    if (state.player.boostCooldown > 0 || state.player.boosting) return;

    state.player.boosting = true;
    state.screenShake = 5;

    // Play boost sound
    SoundManager.playBoost();

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
    if (!collision.x) {
        state.opponent.x = newX;
    } else {
        state.opponent.x = newX + collision.pushX;
    }
    if (!collision.z) {
        state.opponent.z = newZ;
    } else {
        state.opponent.z = newZ + collision.pushZ;
    }

    // Safety check - push AI out if stuck
    pushAIOutOfWalls();
}

function checkAIWallCollision(x, z) {
    const result = { x: false, z: false, pushX: 0, pushZ: 0 };
    const r = CONFIG.PLAYER_RADIUS;

    for (const wall of currentBoard.walls) {
        const wx = wall.x;
        const wz = wall.z;
        const ww = wall.w;
        const wd = wall.d;

        if (x + r > wx && x - r < wx + ww && z + r > wz && z - r < wz + wd) {
            const overlapLeft = (x + r) - wx;
            const overlapRight = (wx + ww) - (x - r);
            const overlapTop = (z + r) - wz;
            const overlapBottom = (wz + wd) - (z - r);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapZ = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapZ) {
                result.x = true;
                result.pushX = overlapLeft < overlapRight ? -overlapLeft : overlapRight;
            } else {
                result.z = true;
                result.pushZ = overlapTop < overlapBottom ? -overlapTop : overlapBottom;
            }
        }
    }
    return result;
}

// Push AI opponent out of any walls
function pushAIOutOfWalls() {
    const r = CONFIG.PLAYER_RADIUS;
    let pushed = true;
    let iterations = 0;

    while (pushed && iterations < 10) {
        pushed = false;
        iterations++;

        for (const wall of currentBoard.walls) {
            const wx = wall.x;
            const wz = wall.z;
            const ww = wall.w;
            const wd = wall.d;

            if (state.opponent.x + r > wx && state.opponent.x - r < wx + ww &&
                state.opponent.z + r > wz && state.opponent.z - r < wz + wd) {

                const overlapLeft = (state.opponent.x + r) - wx;
                const overlapRight = (wx + ww) - (state.opponent.x - r);
                const overlapTop = (state.opponent.z + r) - wz;
                const overlapBottom = (wz + wd) - (state.opponent.z - r);

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapLeft) state.opponent.x -= overlapLeft + 0.1;
                else if (minOverlap === overlapRight) state.opponent.x += overlapRight + 0.1;
                else if (minOverlap === overlapTop) state.opponent.z -= overlapTop + 0.1;
                else state.opponent.z += overlapBottom + 0.1;

                pushed = true;
            }
        }
    }
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

    // Update theme-specific effects (particles, lights, etc.)
    updateThemeEffects();

    // Update environmental effects
    updateDustParticles();
    updateCharacterGlows();

    // Update vision cone for seeker
    updateVisionCone();

    // Set background based on theme (don't override if vision cone active or themed)
    if (!currentBoard.style.sky && !isVisionConeActive) {
        scene.background = new THREE.Color(0x87CEEB);
    }
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

    // Volume control
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            SoundManager.setVolume(e.target.value / 100);
        });
    }
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

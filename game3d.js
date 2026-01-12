// ==========================================
// HIDE & SEEK ONLINE - 3D Version
// ==========================================

// ==========================================
// CHARACTER STORE SYSTEM
// ==========================================

// Stripe Configuration
// IMPORTANT: Replace with your actual Stripe publishable key and price IDs from your Stripe Dashboard
const STRIPE_CONFIG = {
    // Use test key for development, live key for production
    publishableKey: 'pk_test_51SoWn5HYm0xuGGWyuzW20aH8tCnhud3RBnQQlsqMnLeld2OCCcLdE0DmjtaOS6gfFmzYhvz2HkANW3NqKpZ9dyHP00n24IUuj1',

    // Set to false to use real Stripe Checkout (test mode still uses test card numbers)
    testMode: false,

    // Success/Cancel URLs - update these to your actual domain
    successUrl: window.location.origin + '?payment=success&session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: window.location.origin + '?payment=cancelled'
};

// Stripe Payments Module
const StripePayments = {
    stripe: null,
    pendingPurchase: null, // Stores purchase info before redirect

    init() {
        // Initialize Stripe only if not in test mode and key is set
        if (!STRIPE_CONFIG.testMode && STRIPE_CONFIG.publishableKey !== 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX') {
            try {
                this.stripe = Stripe(STRIPE_CONFIG.publishableKey);
                console.log('Stripe initialized successfully');
            } catch (e) {
                console.error('Failed to initialize Stripe:', e);
            }
        } else {
            console.log('Stripe running in test mode - purchases will be simulated');
        }

        // Check for payment result on page load
        this.handlePaymentResult();
    },

    // Store pending purchase in localStorage before redirect
    savePendingPurchase(type, data) {
        const pending = {
            type: type, // 'coin_pack' or 'skin'
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem('pendingPurchase', JSON.stringify(pending));
    },

    // Get and clear pending purchase
    getPendingPurchase() {
        const pending = localStorage.getItem('pendingPurchase');
        if (pending) {
            localStorage.removeItem('pendingPurchase');
            try {
                const data = JSON.parse(pending);
                // Only use if less than 1 hour old
                if (Date.now() - data.timestamp < 3600000) {
                    return data;
                }
            } catch (e) {
                console.error('Failed to parse pending purchase:', e);
            }
        }
        return null;
    },

    // Redirect to Stripe Payment Link
    checkout(paymentLink, purchaseType, purchaseData) {
        // If no payment link set up, simulate the purchase for testing
        if (!paymentLink || paymentLink.includes('XXXXXXXX') || !paymentLink.startsWith('http')) {
            console.log('No payment link - simulating purchase for testing');
            return this.simulatePurchase(purchaseType, purchaseData);
        }

        // Full test mode - simulate everything
        if (STRIPE_CONFIG.testMode) {
            return this.simulatePurchase(purchaseType, purchaseData);
        }

        // Save pending purchase before redirect
        this.savePendingPurchase(purchaseType, purchaseData);

        // Redirect to Stripe Payment Link
        console.log('Redirecting to payment link:', paymentLink);
        window.location.href = paymentLink;
    },

    // Simulate purchase for test mode
    simulatePurchase(purchaseType, purchaseData) {
        const message = purchaseType === 'coin_pack'
            ? `Purchase ${purchaseData.coins} coins for $${purchaseData.price.toFixed(2)}?`
            : `Purchase ${purchaseData.name} for $${purchaseData.realMoneyPrice.toFixed(2)}?`;

        if (confirm(message + '\n\n(TEST MODE - No real payment)')) {
            if (purchaseType === 'coin_pack') {
                onCoinPackPurchaseSuccess(purchaseData);
            } else {
                onDirectPurchaseSuccess(purchaseData);
            }
        }
    },

    // Handle return from Stripe Checkout
    handlePaymentResult() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        const sessionId = urlParams.get('session_id');

        if (paymentStatus === 'success') {
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);

            // Get pending purchase
            const pending = this.getPendingPurchase();
            if (pending) {
                console.log('Payment successful, processing:', pending);

                // Process the purchase
                if (pending.type === 'coin_pack') {
                    onCoinPackPurchaseSuccess(pending.data);
                } else if (pending.type === 'skin') {
                    onDirectPurchaseSuccess(pending.data);
                }
            } else {
                // Show generic success if no pending purchase found
                showPurchaseSuccess('Payment Successful!');
            }
        } else if (paymentStatus === 'cancelled') {
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            localStorage.removeItem('pendingPurchase');
            console.log('Payment cancelled');
        }
    }
};

// Initialize Stripe on page load
document.addEventListener('DOMContentLoaded', () => {
    StripePayments.init();
});

// Coin packs available for purchase (prices in USD)
// IMPORTANT: Create these products in Stripe Dashboard and add the price IDs here
const COIN_PACKS = [
    {
        id: 'pack_small',
        coins: 100,
        price: 0.99,
        bonus: 0,
        label: 'Starter Pack',
        stripePriceId: 'price_1SoWuwHYm0xuGGWygP8C5QvI',
        paymentLink: 'https://buy.stripe.com/test_14AaEXgWZeTo4nag7M4F200'
    },
    {
        id: 'pack_medium',
        coins: 500,
        price: 3.99,
        bonus: 50,
        label: 'Popular Pack',
        popular: true,
        stripePriceId: 'price_1SoWwUHYm0xuGGWyqY61RzKX',
        paymentLink: 'https://buy.stripe.com/test_eVq6oH6ilh1w2f21cS4F201'
    },
    {
        id: 'pack_large',
        coins: 1000,
        price: 6.99,
        bonus: 150,
        label: 'Best Value',
        stripePriceId: 'price_1SoWx5HYm0xuGGWyx1dquN7Z',
        paymentLink: 'https://buy.stripe.com/test_8x2dR9ayB12yg5SaNs4F202'
    }
];

// IMPORTANT: Create these products in Stripe Dashboard and add the price IDs here
const SKINS = {
    default_seeker: {
        id: 'default_seeker',
        name: 'Default Man',
        emoji: '🏃',
        price: 0,
        realMoneyPrice: 0,
        stripePriceId: null, // Free - no Stripe product needed
        owned: true,
        path: 'images/Characters/Meshy_AI_biped/Meshy_AI_Animation_Walking_withSkin.glb',
        color: '#4a90a4',
        rotationOffset: Math.PI
    },
    default_hider: {
        id: 'default_hider',
        name: 'Default Kid',
        emoji: '🧒',
        price: 0,
        realMoneyPrice: 0,
        stripePriceId: null, // Free - no Stripe product needed
        owned: true,
        path: 'images/Characters/Meshy_AI_biped/kid 5 - run.glb',
        color: '#a44a90',
        rotationOffset: Math.PI
    },
    ghost: {
        id: 'ghost',
        name: 'Ghost',
        emoji: '👻',
        price: 50,
        realMoneyPrice: 0.99,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/ghost_running.glb',
        color: '#e8e8ff',
        scale: 8, // Bigger spooky ghost!
        rotationOffset: Math.PI
    },
    robot: {
        id: 'robot',
        name: 'Robot',
        emoji: '🤖',
        price: 100,
        realMoneyPrice: 1.99,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/robot_running.glb',
        color: '#a0a0a0',
        scale: 7, // Premium robot - nice and chunky
        rotationOffset: Math.PI
    },
    firefighter: {
        id: 'firefighter',
        name: 'Zombie Firefighter',
        emoji: '🧟',
        price: 75,
        realMoneyPrice: 1.49,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/firefighter_running.glb',
        color: '#ff6b35',
        scale: 6.5,
        rotationOffset: Math.PI
    },
    dark_warrior: {
        id: 'dark_warrior',
        name: 'Dark Warrior',
        emoji: '🗡️',
        price: 85,
        realMoneyPrice: 1.69,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/dark_warrior_running.glb',
        color: '#2a2a3a',
        scale: 6.5,
        rotationOffset: Math.PI
    },
    cyber_girl: {
        id: 'cyber_girl',
        name: 'Cyber Girl',
        emoji: '👩‍💻',
        price: 65,
        realMoneyPrice: 1.29,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/cyber_girl_running.glb',
        color: '#ff00ff',
        scale: 6,
        rotationOffset: Math.PI
    },
    cyber_warrior: {
        id: 'cyber_warrior',
        name: 'Cyber Warrior',
        emoji: '⚡',
        price: 90,
        realMoneyPrice: 1.79,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/cyber_warrior_running.glb',
        color: '#00ffff',
        scale: 7, // Premium warrior
        rotationOffset: Math.PI
    },
    penguin: {
        id: 'penguin',
        name: 'Penguin',
        emoji: '🐧',
        price: 55,
        realMoneyPrice: 0.99,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/penguin_running.glb',
        color: '#1a1a2e',
        scale: 6
    },
    mushroom_man: {
        id: 'mushroom_man',
        name: 'Mushroom Man',
        emoji: '🍄',
        price: 70,
        realMoneyPrice: 1.49,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/mushroom_man_running.glb',
        celebrationPath: 'images/Characters/Upgrade Store Characters/compressed/mushroom_man_celebration.glb',
        color: '#8b4513',
        scale: 6
    },
    cat: {
        id: 'cat',
        name: 'Cat',
        emoji: '🐱',
        price: 80,
        realMoneyPrice: 1.99,
        stripePriceId: 'price_XXXXXXXX',
        owned: false,
        path: 'images/Characters/Upgrade Store Characters/compressed/cat_running.glb',
        celebrationPath: 'images/Characters/Upgrade Store Characters/compressed/cat_celebration.glb',
        color: '#ff9966',
        scale: 6
    }
};

// Get a random skin for AI that's different from the player's selected skin
function getAISkin(playerSkinId) {
    const allSkinIds = Object.keys(SKINS);
    // Filter out the player's skin
    const availableSkins = allSkinIds.filter(id => id !== playerSkinId);
    // Pick a random one
    const randomIndex = Math.floor(Math.random() * availableSkins.length);
    return SKINS[availableSkins[randomIndex]];
}

// Store state
const StoreManager = {
    coins: 0,
    ownedSkins: ['default_seeker', 'default_hider'],
    selectedSkin: 'default_seeker',

    init() {
        // Load from localStorage
        const saved = localStorage.getItem('hideSeekStore');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.coins = data.coins || 0;
                this.ownedSkins = data.ownedSkins || ['default_seeker', 'default_hider'];
                this.selectedSkin = data.selectedSkin || 'default_seeker';
            } catch (e) {
                console.warn('Failed to load store data:', e);
            }
        }
        this.updateOwnedStatus();
    },

    save() {
        localStorage.setItem('hideSeekStore', JSON.stringify({
            coins: this.coins,
            ownedSkins: this.ownedSkins,
            selectedSkin: this.selectedSkin
        }));
    },

    updateOwnedStatus() {
        Object.keys(SKINS).forEach(id => {
            SKINS[id].owned = this.ownedSkins.includes(id);
        });
    },

    addCoins(amount) {
        this.coins += amount;
        this.save();
        this.updateCoinDisplay();
    },

    updateCoinDisplay() {
        const storeCoins = document.getElementById('store-coins');
        const gameCoins = document.getElementById('coin-display');
        if (storeCoins) storeCoins.textContent = this.coins;
        if (gameCoins) gameCoins.textContent = this.coins;
    },

    buySkin(skinId) {
        const skin = SKINS[skinId];
        if (!skin) return { success: false, message: 'Skin not found' };
        if (skin.owned) return { success: false, message: 'Already owned' };
        if (this.coins < skin.price) return { success: false, message: 'Not enough coins' };

        this.coins -= skin.price;
        this.ownedSkins.push(skinId);
        skin.owned = true;
        this.save();
        this.updateCoinDisplay();

        return { success: true, message: `Purchased ${skin.name}!` };
    },

    selectSkin(skinId) {
        const skin = SKINS[skinId];
        if (!skin) {
            console.error('Skin not found:', skinId);
            return false;
        }
        if (!skin.owned) {
            console.error('Skin not owned:', skinId);
            return false;
        }

        this.selectedSkin = skinId;
        this.save();
        console.log('Skin selected and saved:', skinId);
        return true;
    },

    getSelectedSkin() {
        const skin = SKINS[this.selectedSkin];
        if (!skin) {
            console.warn('Selected skin not found:', this.selectedSkin, '- using default');
            return SKINS.default_seeker;
        }
        return skin;
    }
};

// ========== 3D PREVIEW SYSTEM ==========
let previewScene, previewCamera, previewRenderer;
let previewModel, previewMixer, previewAnimating = false;
let currentPreviewSkinId = null;

// ========== CARD PREVIEW SYSTEM ==========
// Each card gets its own mini 3D preview
const cardPreviews = {}; // { skinId: { scene, camera, renderer, model, mixer, canvas } }
let cardPreviewsAnimating = false;
let cardPreviewClock = null;
let cardPreviewLastTime = 0;

function initCardPreview(skinId, canvas) {
    if (!canvas) return null;

    const width = canvas.clientWidth || 100;
    const height = canvas.clientHeight || 120;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Create camera - positioned to see full character
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 1.5, 0);

    // Create renderer with transparency
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    // Add very bright lights - ensure all characters are visible
    // High ambient for overall brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    // Hemisphere light for natural sky/ground lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    // Strong front spotlight
    const frontLight = new THREE.DirectionalLight(0xffffff, 2.0);
    frontLight.position.set(0, 5, 10);
    scene.add(frontLight);

    // Top light for even coverage
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    // Fill lights from both sides
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight1.position.set(5, 3, 5);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
    fillLight2.position.set(-5, 3, 5);
    scene.add(fillLight2);

    // Back rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xccddff, 0.8);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    return { scene, camera, renderer, model: null, mixer: null, canvas };
}

function loadCardModel(skinId) {
    const preview = cardPreviews[skinId];
    const skin = SKINS[skinId];
    if (!preview || !skin) return;

    // Remove old model if exists
    if (preview.model) {
        preview.scene.remove(preview.model);
        preview.model = null;
        preview.mixer = null;
    }

    const loader = new THREE.GLTFLoader();
    if (typeof dracoLoader !== 'undefined') {
        loader.setDRACOLoader(dracoLoader);
    }

    loader.load(skin.path,
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(2.2, 2.2, 2.2);

            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.x = -center.x;
            model.position.z = -center.z;
            model.position.y = 0;

            preview.scene.add(model);
            preview.model = model;

            // Set up animation
            if (gltf.animations && gltf.animations.length > 0) {
                preview.mixer = new THREE.AnimationMixer(model);
                const action = preview.mixer.clipAction(gltf.animations[0]);
                action.play();
            }

            // Hide loading indicator for this card
            const loadingEl = preview.canvas.parentElement?.querySelector('.card-loading');
            if (loadingEl) loadingEl.style.display = 'none';
        },
        undefined,
        (error) => {
            console.error(`Error loading card model for ${skinId}:`, error);
        }
    );
}

function animateCardPreviews(currentTime) {
    if (!cardPreviewsAnimating) return;
    requestAnimationFrame(animateCardPreviews);

    // Calculate proper delta time
    if (!currentTime) currentTime = performance.now();
    if (cardPreviewLastTime === 0) cardPreviewLastTime = currentTime;

    let delta = (currentTime - cardPreviewLastTime) / 1000; // Convert to seconds
    cardPreviewLastTime = currentTime;

    // Clamp delta to prevent huge jumps (e.g., when tab was inactive)
    if (delta > 0.1) delta = 0.016; // Cap at ~60fps equivalent
    if (delta <= 0) delta = 0.016;

    Object.values(cardPreviews).forEach(preview => {
        if (!preview || !preview.renderer) return;

        // Rotate model slowly (speed based on delta)
        if (preview.model) {
            preview.model.rotation.y += 0.9 * delta; // ~0.015 at 60fps
        }

        // Update animation
        if (preview.mixer) {
            preview.mixer.update(delta);
        }

        // Render
        preview.renderer.render(preview.scene, preview.camera);
    });
}

function cleanupCardPreviews() {
    cardPreviewsAnimating = false;
    cardPreviewLastTime = 0; // Reset timer
    Object.keys(cardPreviews).forEach(skinId => {
        const preview = cardPreviews[skinId];
        if (preview) {
            if (preview.renderer) preview.renderer.dispose();
            if (preview.model) {
                preview.scene.remove(preview.model);
            }
        }
        delete cardPreviews[skinId];
    });
}

function initPreviewRenderer() {
    const canvas = document.getElementById('preview-canvas');
    if (!canvas) return;

    // Create scene
    previewScene = new THREE.Scene();
    previewScene.background = new THREE.Color(0x1a2a3a);

    // Create camera
    previewCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    previewCamera.position.set(0, 3, 8);
    previewCamera.lookAt(0, 2, 0);

    // Create renderer
    previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    previewRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    previewScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    previewScene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    backLight.position.set(-5, 5, -5);
    previewScene.add(backLight);

    // Add ground circle
    const groundGeometry = new THREE.CircleGeometry(3, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2a3a4a, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    previewScene.add(ground);
}

function loadPreviewModel(skinId) {
    const skin = SKINS[skinId];
    if (!skin) return;

    currentPreviewSkinId = skinId;

    // Show loading
    const loadingEl = document.getElementById('preview-loading');
    if (loadingEl) loadingEl.classList.add('active');

    // Remove old model
    if (previewModel) {
        previewScene.remove(previewModel);
        previewModel = null;
        previewMixer = null;
    }

    // Load new model
    const loader = new THREE.GLTFLoader();
    if (typeof dracoLoader !== 'undefined') {
        loader.setDRACOLoader(dracoLoader);
    }

    loader.load(skin.path,
        (gltf) => {
            previewModel = gltf.scene;
            previewModel.scale.set(3, 3, 3);
            previewModel.position.set(0, 0, 0);

            // Center the model
            const box = new THREE.Box3().setFromObject(previewModel);
            const center = box.getCenter(new THREE.Vector3());
            previewModel.position.x = -center.x;
            previewModel.position.z = -center.z;

            previewScene.add(previewModel);

            // Set up animation if available
            if (gltf.animations && gltf.animations.length > 0) {
                previewMixer = new THREE.AnimationMixer(previewModel);
                const action = previewMixer.clipAction(gltf.animations[0]);
                action.play();
            }

            // Hide loading
            if (loadingEl) loadingEl.classList.remove('active');

            // Start animation loop if not running
            if (!previewAnimating) {
                previewAnimating = true;
                animatePreviewLoop();
            }
        },
        undefined,
        (error) => {
            console.error('Error loading preview model:', error);
            if (loadingEl) {
                loadingEl.textContent = 'Failed to load';
            }
        }
    );

    // Update preview info
    updatePreviewInfo(skin);

    // Highlight selected card
    document.querySelectorAll('.skin-card').forEach(card => {
        card.classList.remove('previewing');
    });
    const selectedCard = document.querySelector(`[data-skin-id="${skinId}"]`);
    if (selectedCard) selectedCard.classList.add('previewing');
}

function updatePreviewInfo(skin) {
    const nameEl = document.getElementById('preview-skin-name');
    const priceEl = document.getElementById('preview-skin-price');
    const actionBtn = document.getElementById('preview-action-btn');

    if (nameEl) nameEl.textContent = skin.name;

    if (priceEl) {
        if (skin.owned) {
            priceEl.innerHTML = '<span style="color: #4CAF50;">✓ OWNED</span>';
        } else if (skin.price === 0) {
            priceEl.innerHTML = '<span style="color: #4CAF50;">FREE</span>';
        } else {
            priceEl.innerHTML = `🪙 ${skin.price} coins`;
        }
    }

    if (actionBtn) {
        actionBtn.style.display = 'block';
        if (skin.id === StoreManager.selectedSkin) {
            actionBtn.textContent = '✓ EQUIPPED';
            actionBtn.disabled = true;
            actionBtn.className = 'btn secondary';
        } else if (skin.owned) {
            actionBtn.textContent = 'EQUIP';
            actionBtn.disabled = false;
            actionBtn.className = 'btn primary';
            actionBtn.onclick = () => {
                StoreManager.selectSkin(skin.id);
                renderStore();
                loadPreviewModel(skin.id);
            };
        } else {
            actionBtn.textContent = `BUY (${skin.price} 🪙)`;
            actionBtn.disabled = false; // Always enabled - will show modal if not enough coins
            actionBtn.className = 'btn store-button';
            actionBtn.onclick = () => {
                if (StoreManager.coins < skin.price) {
                    // Not enough coins - show purchase modal
                    openPurchaseModal(skin);
                } else {
                    // Has enough coins - buy directly
                    const result = StoreManager.buySkin(skin.id);
                    if (result.success) {
                        renderStore();
                        updatePreviewInfo(SKINS[skin.id]);
                    }
                }
            };
        }
    }
}

function animatePreviewLoop() {
    if (!previewAnimating) return;
    requestAnimationFrame(animatePreviewLoop);

    // Rotate model
    if (previewModel) {
        previewModel.rotation.y += 0.01;
    }

    // Update animation
    if (previewMixer) {
        previewMixer.update(0.016);
    }

    // Render
    if (previewRenderer && previewScene && previewCamera) {
        previewRenderer.render(previewScene, previewCamera);
    }
}

function stopPreviewAnimation() {
    previewAnimating = false;
}

// ==========================================
// PURCHASE MODAL SYSTEM
// ==========================================

let currentPurchaseSkin = null;

function openPurchaseModal(skin) {
    currentPurchaseSkin = skin;
    const modal = document.getElementById('purchase-modal');
    if (!modal) return;

    // Calculate coins needed
    const coinsNeeded = skin.price - StoreManager.coins;
    document.getElementById('coins-needed').textContent = coinsNeeded;

    // Populate coin packs
    const packsContainer = document.getElementById('coin-packs-container');
    packsContainer.innerHTML = '';

    COIN_PACKS.forEach(pack => {
        const packEl = document.createElement('div');
        packEl.className = 'coin-pack' + (pack.popular ? ' popular' : '');
        packEl.onclick = () => purchaseCoinPack(pack);

        packEl.innerHTML = `
            <div class="coin-pack-info">
                <span class="coin-pack-icon">🪙</span>
                <div class="coin-pack-details">
                    <span class="coin-pack-amount">${pack.coins} Coins</span>
                    ${pack.bonus > 0 ? `<span class="coin-pack-bonus">+${pack.bonus} Bonus!</span>` : ''}
                </div>
            </div>
            <div class="coin-pack-price">$${pack.price.toFixed(2)}</div>
        `;

        packsContainer.appendChild(packEl);
    });

    // Populate direct purchase
    document.getElementById('direct-skin-preview').textContent = skin.emoji;
    document.getElementById('direct-skin-name').textContent = skin.name;
    document.getElementById('direct-price').textContent = skin.realMoneyPrice.toFixed(2);

    // Show modal
    modal.style.display = 'flex';
}

function closePurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    if (modal) modal.style.display = 'none';
    currentPurchaseSkin = null;
    // Show the direct purchase section again
    const directSection = document.querySelector('.direct-purchase');
    if (directSection) directSection.style.display = 'block';
}

// Open modal just for buying coins (no skin context)
function openBuyCoinsModal() {
    currentPurchaseSkin = null;
    const modal = document.getElementById('purchase-modal');
    if (!modal) return;

    // Update header text
    document.getElementById('coins-needed-text').innerHTML = 'Choose a coin pack:';

    // Populate coin packs
    const packsContainer = document.getElementById('coin-packs-container');
    packsContainer.innerHTML = '';

    COIN_PACKS.forEach(pack => {
        const packEl = document.createElement('div');
        packEl.className = 'coin-pack' + (pack.popular ? ' popular' : '');
        packEl.onclick = () => purchaseCoinPack(pack);

        packEl.innerHTML = `
            <div class="coin-pack-info">
                <span class="coin-pack-icon">🪙</span>
                <div class="coin-pack-details">
                    <span class="coin-pack-amount">${pack.coins} Coins</span>
                    ${pack.bonus > 0 ? `<span class="coin-pack-bonus">+${pack.bonus} Bonus!</span>` : ''}
                </div>
            </div>
            <div class="coin-pack-price">$${pack.price.toFixed(2)}</div>
        `;

        packsContainer.appendChild(packEl);
    });

    // Hide the direct purchase section (no skin selected)
    const directSection = document.querySelector('.direct-purchase');
    if (directSection) directSection.style.display = 'none';

    // Show modal
    modal.style.display = 'flex';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('purchase-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePurchaseModal();
            }
        });
    }

    // Buy Coins button
    const buyCoinsBtn = document.getElementById('buy-coins-btn');
    if (buyCoinsBtn) {
        buyCoinsBtn.addEventListener('click', openBuyCoinsModal);
    }
});

// Cheat code: Type "money" to get 1000 coins
let cheatBuffer = '';
document.addEventListener('keydown', (e) => {
    cheatBuffer += e.key.toLowerCase();
    if (cheatBuffer.length > 10) cheatBuffer = cheatBuffer.slice(-10);

    if (cheatBuffer.includes('money')) {
        StoreManager.addCoins(1000);
        showPurchaseSuccess('+1000 Coins! 💰');
        cheatBuffer = '';
        console.log('Cheat activated: +1000 coins');
    }
});

// Payment functions using Stripe Payment Links
function purchaseCoinPack(pack) {
    console.log('Purchase coin pack:', pack);
    StripePayments.checkout(pack.paymentLink, 'coin_pack', pack);
}

function purchaseSkinDirect() {
    if (!currentPurchaseSkin) return;
    console.log('Direct purchase skin:', currentPurchaseSkin);
    StripePayments.checkout(currentPurchaseSkin.paymentLink, 'skin', currentPurchaseSkin);
}

// Called after successful coin pack payment
function onCoinPackPurchaseSuccess(pack) {
    const totalCoins = pack.coins + (pack.bonus || 0);
    StoreManager.addCoins(totalCoins);

    closePurchaseModal();

    // Show success feedback
    showPurchaseSuccess(`+${totalCoins} Coins Added!`);

    // Refresh the store UI
    renderStore();
    if (currentPreviewSkinId) {
        updatePreviewInfo(SKINS[currentPreviewSkinId]);
    }
}

// Called after successful direct skin purchase
function onDirectPurchaseSuccess(skin) {
    // Add skin to owned list
    StoreManager.ownedSkins.push(skin.id);
    skin.owned = true;
    StoreManager.save();

    closePurchaseModal();

    // Show success feedback
    showPurchaseSuccess(`${skin.name} Unlocked!`);

    // Refresh the store UI
    renderStore();
    updatePreviewInfo(skin);
}

function showPurchaseSuccess(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
        color: white;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 1.5rem;
        font-weight: bold;
        z-index: 10001;
        animation: successPop 0.5s ease;
        box-shadow: 0 10px 40px rgba(76, 175, 80, 0.5);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add animation keyframes if not already present
    if (!document.getElementById('success-animation-style')) {
        const style = document.createElement('style');
        style.id = 'success-animation-style';
        style.textContent = `
            @keyframes successPop {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Store UI functions
function openStore() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('store-screen').classList.add('active');

    // Initialize preview renderer if needed
    if (!previewRenderer) {
        initPreviewRenderer();
    }

    renderStore();

    // Load currently selected skin preview
    loadPreviewModel(StoreManager.selectedSkin);
}

function closeStore() {
    document.getElementById('store-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
    stopPreviewAnimation();
    cleanupCardPreviews();
    // Refresh home preview to show newly equipped skin
    refreshHomePreview();
}

function renderStore() {
    StoreManager.updateCoinDisplay();

    // Clean up existing card previews before re-rendering
    cleanupCardPreviews();

    // Render all skins
    const grid = document.getElementById('skins-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Sort skins by price (ascending) - owned/free first, then by price
    const sortedSkins = Object.values(SKINS).sort((a, b) => {
        // Owned skins first
        if (a.owned && !b.owned) return -1;
        if (!a.owned && b.owned) return 1;
        // Then by price
        return a.price - b.price;
    });

    sortedSkins.forEach(skin => {
        const card = document.createElement('div');
        card.className = 'skin-card';
        card.setAttribute('data-skin-id', skin.id);
        if (skin.owned) card.classList.add('owned');
        if (skin.id === StoreManager.selectedSkin) card.classList.add('selected');
        if (skin.id === currentPreviewSkinId) card.classList.add('previewing');

        // Click to preview in main preview panel
        card.onclick = () => loadPreviewModel(skin.id);

        // Create 3D preview container with canvas
        const preview = document.createElement('div');
        preview.className = 'skin-preview skin-preview-3d';

        const canvas = document.createElement('canvas');
        canvas.className = 'card-preview-canvas';
        canvas.setAttribute('data-skin-id', skin.id);

        const loading = document.createElement('div');
        loading.className = 'card-loading';
        loading.textContent = '...';

        preview.appendChild(canvas);
        preview.appendChild(loading);

        const name = document.createElement('div');
        name.className = 'skin-name';
        name.textContent = skin.name;

        const price = document.createElement('div');
        price.className = 'skin-price';
        if (skin.owned) {
            if (skin.id === StoreManager.selectedSkin) {
                price.innerHTML = '<span style="color: #ffd700;">✓</span>';
            } else {
                price.innerHTML = '<span style="color: #4CAF50;">✓</span>';
            }
        } else if (skin.price === 0) {
            price.classList.add('free');
            price.textContent = 'FREE';
        } else {
            price.innerHTML = `🪙 ${skin.price}`;
        }

        card.appendChild(preview);
        card.appendChild(name);
        card.appendChild(price);

        grid.appendChild(card);
    });

    // Initialize all card previews after DOM is ready
    setTimeout(() => {
        initAllCardPreviews();
    }, 50);
}

function initAllCardPreviews() {
    const canvases = document.querySelectorAll('.card-preview-canvas');

    canvases.forEach(canvas => {
        const skinId = canvas.getAttribute('data-skin-id');
        if (skinId && !cardPreviews[skinId]) {
            const previewData = initCardPreview(skinId, canvas);
            if (previewData) {
                cardPreviews[skinId] = previewData;
                loadCardModel(skinId);
            }
        }
    });

    // Start animation loop if not already running
    if (!cardPreviewsAnimating && Object.keys(cardPreviews).length > 0) {
        cardPreviewsAnimating = true;
        cardPreviewLastTime = 0; // Reset timer for smooth start
        animateCardPreviews();
    }
}

// Helper to darken/lighten a hex color
function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Initialize store on page load
document.addEventListener('DOMContentLoaded', () => {
    StoreManager.init();

    // Store button event listeners
    const storeBtn = document.getElementById('store-btn');
    const storeBackBtn = document.getElementById('store-back-btn');

    if (storeBtn) storeBtn.addEventListener('click', openStore);
    if (storeBackBtn) storeBackBtn.addEventListener('click', closeStore);
});

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
    },

    // Coin collect sound - cheerful ding
    playCoinCollect() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // High pitched coin ding
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 2400;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.2);
        osc2.stop(now + 0.15);
    },

    // Powerup collect sound - magical chime
    playPowerupCollect() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Ascending magical notes
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (octave)

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.25);
        });

        // Shimmer effect
        const shimmer = ctx.createOscillator();
        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(2000, now);
        shimmer.frequency.exponentialRampToValueAtTime(3000, now + 0.4);

        const shimmerGain = ctx.createGain();
        shimmerGain.gain.setValueAtTime(0.1, now);
        shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        shimmer.connect(shimmerGain);
        shimmerGain.connect(this.masterGain);
        shimmer.start(now);
        shimmer.stop(now + 0.4);
    },

    // Portal teleport whoosh sound
    playPortalWhoosh() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Dimensional whoosh - sweeping noise
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            // Fade in then out
            const envelope = Math.sin(t * Math.PI);
            data[i] = (Math.random() * 2 - 1) * envelope;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter that sweeps up
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 0.25);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.5);
        filter.Q.value = 2;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.linearRampToValueAtTime(0.6, now + 0.15);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.5);

        // Ethereal tone - pitch shift effect
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.2);
        osc1.frequency.exponentialRampToValueAtTime(200, now + 0.4);

        const osc1Gain = ctx.createGain();
        osc1Gain.gain.setValueAtTime(0.15, now);
        osc1Gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
        osc1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc1.connect(osc1Gain);
        osc1Gain.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + 0.4);

        // High shimmer for magic feel
        const shimmer = ctx.createOscillator();
        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(1200, now);
        shimmer.frequency.exponentialRampToValueAtTime(2400, now + 0.3);

        const shimmerGain2 = ctx.createGain();
        shimmerGain2.gain.setValueAtTime(0.08, now);
        shimmerGain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        shimmer.connect(shimmerGain2);
        shimmerGain2.connect(this.masterGain);
        shimmer.start(now);
        shimmer.stop(now + 0.3);
    },

    // Phase walk music - fast-paced electronic beat
    phaseWalkMusic: null,
    phaseWalkOscillators: [],

    playPhaseWalkMusic() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Stop any existing phase walk music
        this.stopPhaseWalkMusic();

        // Create master gain for phase walk music
        this.phaseWalkMusic = ctx.createGain();
        this.phaseWalkMusic.gain.value = 0.3;
        this.phaseWalkMusic.connect(this.masterGain);

        // Fast pulsing bass
        const createPulsingBass = () => {
            const bass = ctx.createOscillator();
            bass.type = 'sawtooth';
            bass.frequency.value = 80;

            const bassFilter = ctx.createBiquadFilter();
            bassFilter.type = 'lowpass';
            bassFilter.frequency.value = 200;

            const bassGain = ctx.createGain();
            bassGain.gain.value = 0;

            // Fast pulsing effect (150 BPM)
            const beatDuration = 0.4; // 150 BPM
            const pulseLoop = () => {
                if (!this.phaseWalkMusic) return;
                const t = ctx.currentTime;
                bassGain.gain.setValueAtTime(0.5, t);
                bassGain.gain.exponentialRampToValueAtTime(0.01, t + beatDuration * 0.8);
            };
            const bassInterval = setInterval(pulseLoop, beatDuration * 1000);
            this.phaseWalkOscillators.push({ interval: bassInterval });

            bass.connect(bassFilter);
            bassFilter.connect(bassGain);
            bassGain.connect(this.phaseWalkMusic);
            bass.start(now);
            this.phaseWalkOscillators.push({ osc: bass });
            pulseLoop();
        };

        // High ethereal synth arpeggio
        const createArpeggio = () => {
            const notes = [440, 523, 659, 880, 659, 523]; // A, C, E, A, E, C
            let noteIndex = 0;

            const arp = ctx.createOscillator();
            arp.type = 'sine';
            arp.frequency.value = notes[0];

            const arpGain = ctx.createGain();
            arpGain.gain.value = 0.15;

            // Vibrato effect
            const vibrato = ctx.createOscillator();
            vibrato.frequency.value = 6;
            const vibratoGain = ctx.createGain();
            vibratoGain.gain.value = 5;
            vibrato.connect(vibratoGain);
            vibratoGain.connect(arp.frequency);
            vibrato.start(now);
            this.phaseWalkOscillators.push({ osc: vibrato });

            const arpLoop = () => {
                if (!this.phaseWalkMusic) return;
                arp.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);
                noteIndex = (noteIndex + 1) % notes.length;
            };
            const arpInterval = setInterval(arpLoop, 100); // Fast arpeggios
            this.phaseWalkOscillators.push({ interval: arpInterval });

            arp.connect(arpGain);
            arpGain.connect(this.phaseWalkMusic);
            arp.start(now);
            this.phaseWalkOscillators.push({ osc: arp });
        };

        // Ghost-like whoosh sound
        const createGhostWhoosh = () => {
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.Q.value = 5;

            // Sweeping filter for ghostly effect
            const sweepLoop = () => {
                if (!this.phaseWalkMusic) return;
                const t = ctx.currentTime;
                filter.frequency.setValueAtTime(300, t);
                filter.frequency.linearRampToValueAtTime(800, t + 0.5);
                filter.frequency.linearRampToValueAtTime(300, t + 1.0);
            };
            const sweepInterval = setInterval(sweepLoop, 1000);
            this.phaseWalkOscillators.push({ interval: sweepInterval });

            const noiseGain = ctx.createGain();
            noiseGain.gain.value = 0.1;

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.phaseWalkMusic);
            noise.start(now);
            this.phaseWalkOscillators.push({ osc: noise });
            sweepLoop();
        };

        createPulsingBass();
        createArpeggio();
        createGhostWhoosh();
    },

    stopPhaseWalkMusic() {
        // Stop all oscillators and intervals
        for (const item of this.phaseWalkOscillators) {
            if (item.osc) {
                try {
                    item.osc.stop();
                } catch (e) {
                    // Oscillator may already be stopped
                }
            }
            if (item.interval) {
                clearInterval(item.interval);
            }
        }
        this.phaseWalkOscillators = [];

        // Disconnect master gain
        if (this.phaseWalkMusic) {
            this.phaseWalkMusic.disconnect();
            this.phaseWalkMusic = null;
        }
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
    HIDER_SPEED: 0.25,
    SEEKER_SPEED: 0.27,
    BOOST_SPEED: 0.45,
    BOOST_DURATION: 1500,
    BOOST_COOLDOWN: 5000,
    SEEKER_VIEW_RANGE: 28,
    SEEKER_VIEW_ANGLE: Math.PI / 6,  // 30 degrees each side (60 degree total cone) - matches visual cone
    GAME_DURATION: 90,
    CATCH_DISTANCE: 5,
    WALL_HEIGHT: 4,
    // Collectibles - more coins in risky spots to encourage hider movement
    COIN_COUNT: 5,
    MULTIPLIER_COUNT: 2,  // Number of 3x multiplier coins per board
    COIN_RADIUS: 0.8,
    POWERUP_SPAWN_INTERVAL: 7000,  // Spawn powerups more frequently
    BONUS_COIN_INTERVAL: 12000,   // Spawn bonus coins in center periodically
    POWERUP_RADIUS: 1.2,
    INVISIBILITY_DURATION: 3000,
    SPEED_BOOST_DURATION: 4000,
    FREEZE_DURATION: 2000,
    PHASE_WALK_DURATION: 5000,
    COLLECTIBLE_PICKUP_DISTANCE: 5
};

// Board definitions with themes
const BOARDS = [
    {
        name: "The Garden",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x3d5c3d, wall: 0x8b4513, wallHighlight: 0x228b22, sky: 0x87CEEB },
        theme: 'garden',
        cameraZoom: 1.4,
        walls: [
            // Hedge borders with wide openings
            { x: -32, z: -28, w: 16, d: 2 },
            { x: 16, z: -28, w: 16, d: 2 },
            { x: -32, z: 28, w: 16, d: 2 },
            { x: 16, z: 28, w: 16, d: 2 },
            // Side hedges with gaps
            { x: -32, z: -26, w: 2, d: 16 },
            { x: -32, z: 12, w: 2, d: 16 },
            { x: 30, z: -26, w: 2, d: 16 },
            { x: 30, z: 12, w: 2, d: 16 },
            // Inner hedge L-shapes (open design)
            { x: -20, z: -16, w: 12, d: 2 },
            { x: -20, z: -14, w: 2, d: 8 },
            { x: 8, z: -16, w: 12, d: 2 },
            { x: 18, z: -14, w: 2, d: 8 },
            // Middle row hedges
            { x: -15, z: 0, w: 10, d: 2 },
            { x: 5, z: 0, w: 10, d: 2 },
            // Bottom L-shapes
            { x: -20, z: 14, w: 12, d: 2 },
            { x: -20, z: 8, w: 2, d: 8 },
            { x: 8, z: 14, w: 12, d: 2 },
            { x: 18, z: 8, w: 2, d: 8 },
            // Small flower bed obstacles
            { x: -8, z: -8, w: 4, d: 4 },
            { x: 4, z: 6, w: 4, d: 4 }
        ]
    },
    {
        name: "The Haunted Maze",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x1a1a2e, wall: 0x4a4a6a, sky: 0x0a0a1a },
        theme: 'haunted',
        cameraZoom: 1.4,
        walls: [
            // Outer walls with wide entrances
            { x: -30, z: -30, w: 16, d: 2 },
            { x: 14, z: -30, w: 16, d: 2 },
            { x: -30, z: 28, w: 16, d: 2 },
            { x: 14, z: 28, w: 16, d: 2 },
            // Side walls with gaps
            { x: -32, z: -28, w: 2, d: 16 },
            { x: -32, z: 12, w: 2, d: 18 },
            { x: 30, z: -28, w: 2, d: 16 },
            { x: 30, z: 12, w: 2, d: 18 },
            // Inner L-shaped walls (not enclosed)
            { x: -20, z: -18, w: 12, d: 2 },
            { x: -20, z: -16, w: 2, d: 10 },
            { x: 8, z: -18, w: 12, d: 2 },
            { x: 18, z: -16, w: 2, d: 10 },
            // Middle section
            { x: -12, z: -2, w: 10, d: 2 },
            { x: 2, z: -2, w: 10, d: 2 },
            // Bottom L-shapes
            { x: -20, z: 14, w: 12, d: 2 },
            { x: -20, z: 8, w: 2, d: 8 },
            { x: 8, z: 14, w: 12, d: 2 },
            { x: 18, z: 8, w: 2, d: 8 },
            // Scattered tombstone obstacles
            { x: -8, z: -12, w: 3, d: 3 },
            { x: 6, z: 8, w: 3, d: 3 },
            { x: -15, z: 22, w: 4, d: 3 },
            { x: 12, z: -25, w: 3, d: 4 }
        ]
    },
    {
        name: "Neon Grid",
        spawns: { seeker: { x: -20, z: -20 }, hider: { x: 20, z: 20 } },
        style: { floor: 0x0a0a15, wall: 0x00ffff, wallGlow: 0x00ffff, sky: 0x050510 },
        theme: 'neon',
        cameraZoom: 1.4,
        walls: [
            // Simple grid pattern with wide corridors - no enclosed sections
            // Top horizontal bars (with gaps)
            { x: -28, z: 20, w: 18, d: 2 },
            { x: 10, z: 20, w: 18, d: 2 },
            // Middle-top horizontal bars
            { x: -20, z: 8, w: 14, d: 2 },
            { x: 6, z: 8, w: 14, d: 2 },
            // Center horizontal bar (short)
            { x: -8, z: -2, w: 16, d: 2 },
            // Middle-bottom horizontal bars
            { x: -20, z: -12, w: 14, d: 2 },
            { x: 6, z: -12, w: 14, d: 2 },
            // Bottom horizontal bars (with gaps)
            { x: -28, z: -24, w: 18, d: 2 },
            { x: 10, z: -24, w: 18, d: 2 },
            // Vertical bars - left side
            { x: -22, z: -20, w: 2, d: 12 },
            { x: -22, z: 10, w: 2, d: 12 },
            // Vertical bars - right side
            { x: 20, z: -20, w: 2, d: 12 },
            { x: 20, z: 10, w: 2, d: 12 },
            // Center vertical bars (short)
            { x: -8, z: -8, w: 2, d: 10 },
            { x: 6, z: -2, w: 2, d: 10 }
        ]
    },
    {
        name: "The Fortress",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x3d3d3d, wall: 0x8b7355, wallHighlight: 0xc9a959, sky: 0x2a1a0a },
        theme: 'medieval',
        cameraZoom: 1.4,
        walls: [
            // Outer castle walls with wide gates
            { x: -32, z: -30, w: 18, d: 3 },
            { x: 14, z: -30, w: 18, d: 3 },
            { x: -32, z: 28, w: 18, d: 3 },
            { x: 14, z: 28, w: 18, d: 3 },
            // Corner towers (no full side walls - open fortress)
            { x: -32, z: -27, w: 3, d: 10 },
            { x: -32, z: 18, w: 3, d: 12 },
            { x: 29, z: -27, w: 3, d: 10 },
            { x: 29, z: 18, w: 3, d: 12 },
            // Inner keep - L-shaped walls with gaps (not enclosed)
            { x: -12, z: -12, w: 14, d: 2 },
            { x: -12, z: 10, w: 14, d: 2 },
            { x: -12, z: -10, w: 2, d: 10 },
            { x: 10, z: 2, w: 2, d: 10 },
            // Corridor walls (short, with gaps)
            { x: -25, z: -15, w: 8, d: 2 },
            { x: 17, z: -15, w: 8, d: 2 },
            { x: -25, z: 15, w: 8, d: 2 },
            { x: 17, z: 15, w: 8, d: 2 },
            // Small pillar obstacles
            { x: -20, z: -20, w: 3, d: 3 },
            { x: 18, z: -20, w: 3, d: 3 },
            { x: -20, z: 18, w: 3, d: 3 },
            { x: 18, z: 18, w: 3, d: 3 }
        ]
    },
    {
        name: "The Spiral",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x1a0a2e, wall: 0xff00ff, wallGlow: 0xff00ff, sky: 0x0f0520 },
        theme: 'psychedelic',
        cameraZoom: 1.4,
        walls: [
            // Open spiral arms - not connected, always escapable
            // Outer arm top-left
            { x: -28, z: -28, w: 16, d: 2 },
            { x: -28, z: -26, w: 2, d: 14 },
            // Outer arm top-right
            { x: 12, z: -28, w: 16, d: 2 },
            { x: 26, z: -26, w: 2, d: 14 },
            // Middle arm left
            { x: -20, z: -8, w: 12, d: 2 },
            { x: -20, z: -6, w: 2, d: 12 },
            // Middle arm right
            { x: 8, z: -8, w: 12, d: 2 },
            { x: 18, z: -6, w: 2, d: 12 },
            // Inner spiral pieces
            { x: -10, z: 2, w: 10, d: 2 },
            { x: 2, z: 2, w: 10, d: 2 },
            // Bottom arms
            { x: -28, z: 12, w: 14, d: 2 },
            { x: -28, z: 14, w: 2, d: 14 },
            { x: 14, z: 12, w: 14, d: 2 },
            { x: 26, z: 14, w: 2, d: 14 },
            // Bottom outer
            { x: -20, z: 26, w: 14, d: 2 },
            { x: 6, z: 26, w: 14, d: 2 }
        ]
    },
    {
        name: "The Bunker",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x2a2a2a, wall: 0x4a4a4a, wallHighlight: 0x666666, sky: 0x1a1a1a },
        theme: 'bunker',
        cameraZoom: 1.4,
        walls: [
            // Outer bunker walls with wide entrances
            { x: -32, z: -30, w: 20, d: 2 },
            { x: 12, z: -30, w: 20, d: 2 },
            { x: -32, z: 28, w: 20, d: 2 },
            { x: 12, z: 28, w: 20, d: 2 },
            // Side walls with gaps
            { x: -32, z: -28, w: 2, d: 18 },
            { x: -32, z: 12, w: 2, d: 18 },
            { x: 30, z: -28, w: 2, d: 18 },
            { x: 30, z: 12, w: 2, d: 18 },
            // Interior L-shaped walls (open, not enclosed)
            { x: -22, z: -18, w: 12, d: 2 },
            { x: -22, z: -16, w: 2, d: 8 },
            { x: 10, z: -18, w: 12, d: 2 },
            { x: 20, z: -16, w: 2, d: 8 },
            // Central dividers (short)
            { x: -8, z: -5, w: 16, d: 2 },
            { x: -8, z: 5, w: 16, d: 2 },
            // Bottom L-shapes
            { x: -22, z: 16, w: 12, d: 2 },
            { x: -22, z: 10, w: 2, d: 8 },
            { x: 10, z: 16, w: 12, d: 2 },
            { x: 20, z: 10, w: 2, d: 8 },
            // Small cover obstacles
            { x: -5, z: -15, w: 4, d: 4 },
            { x: 2, z: 12, w: 4, d: 4 }
        ]
    },
    {
        name: "The Ruins",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x3d4a3d, wall: 0x6b8e6b, wallHighlight: 0x90ee90, sky: 0x4a6a4a },
        theme: 'ruins',
        cameraZoom: 1.4,
        walls: [
            // Crumbling outer walls
            { x: -30, z: -28, w: 18, d: 2 },
            { x: -5, z: -30, w: 15, d: 2 },
            { x: 18, z: -28, w: 12, d: 2 },
            { x: -28, z: 25, w: 15, d: 2 },
            { x: -5, z: 28, w: 20, d: 2 },
            { x: 20, z: 26, w: 10, d: 2 },
            { x: -30, z: -25, w: 2, d: 15 },
            { x: -32, z: 0, w: 2, d: 18 },
            { x: 28, z: -22, w: 2, d: 12 },
            { x: 30, z: 5, w: 2, d: 20 },
            // Ruined corridors
            { x: -22, z: -18, w: 12, d: 2 },
            { x: 5, z: -20, w: 15, d: 2 },
            { x: -18, z: -8, w: 15, d: 2 },
            { x: 8, z: -10, w: 12, d: 2 },
            { x: -25, z: 2, w: 10, d: 2 },
            { x: -5, z: 0, w: 18, d: 2 },
            { x: 18, z: -2, w: 10, d: 2 },
            { x: -20, z: 12, w: 12, d: 2 },
            { x: 0, z: 10, w: 15, d: 2 },
            { x: 20, z: 12, w: 8, d: 2 },
            { x: -15, z: 20, w: 10, d: 2 },
            { x: 5, z: 18, w: 12, d: 2 },
            // Vertical ruins
            { x: -20, z: -25, w: 2, d: 10 },
            { x: -8, z: -22, w: 2, d: 15 },
            { x: 10, z: -25, w: 2, d: 8 },
            { x: 22, z: -18, w: 2, d: 12 },
            { x: -25, z: -5, w: 2, d: 12 },
            { x: -12, z: 5, w: 2, d: 15 },
            { x: 5, z: -5, w: 2, d: 18 },
            { x: 25, z: 5, w: 2, d: 15 },
            { x: -18, z: 15, w: 2, d: 10 },
            { x: 12, z: 12, w: 2, d: 12 }
        ]
    },
    {
        name: "The Arena",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x2d5a2d, wall: 0xffffff, wallHighlight: 0xffff00, sky: 0x1a1a2e },
        theme: 'arena',
        cameraZoom: 1.4,
        walls: [
            // Arena outer walls with wide gates
            { x: -32, z: -28, w: 18, d: 2 },
            { x: 14, z: -28, w: 18, d: 2 },
            { x: -32, z: 26, w: 18, d: 2 },
            { x: 14, z: 26, w: 18, d: 2 },
            // Side walls with gaps
            { x: -32, z: -26, w: 2, d: 16 },
            { x: -32, z: 12, w: 2, d: 16 },
            { x: 30, z: -26, w: 2, d: 16 },
            { x: 30, z: 12, w: 2, d: 16 },
            // Horizontal barriers (short, with gaps)
            { x: -24, z: -14, w: 14, d: 2 },
            { x: 10, z: -14, w: 14, d: 2 },
            { x: -24, z: 12, w: 14, d: 2 },
            { x: 10, z: 12, w: 14, d: 2 },
            // Center obstacles (pillars)
            { x: -8, z: -4, w: 4, d: 4 },
            { x: 4, z: -4, w: 4, d: 4 },
            { x: -2, z: 6, w: 4, d: 4 },
            // Corner obstacles
            { x: -22, z: -22, w: 4, d: 4 },
            { x: 18, z: -22, w: 4, d: 4 },
            { x: -22, z: 18, w: 4, d: 4 },
            { x: 18, z: 18, w: 4, d: 4 }
        ]
    },
    {
        name: "The Void",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0x000000, wall: 0x4400ff, wallGlow: 0x8800ff, sky: 0x000011 },
        theme: 'void',
        cameraZoom: 1.4,
        walls: [
            // Floating fragments - scattered platforms in void
            { x: -28, z: -28, w: 6, d: 6 },
            { x: -15, z: -30, w: 4, d: 4 },
            { x: 5, z: -28, w: 5, d: 5 },
            { x: 20, z: -32, w: 4, d: 4 },
            { x: 30, z: -25, w: 5, d: 5 },
            // Upper left cluster
            { x: -32, z: -15, w: 5, d: 5 },
            { x: -25, z: -8, w: 6, d: 3 },
            { x: -18, z: -18, w: 4, d: 8 },
            // Central void maze
            { x: -12, z: -12, w: 8, d: 3 },
            { x: -12, z: -5, w: 3, d: 10 },
            { x: -5, z: 2, w: 10, d: 3 },
            { x: 5, z: -8, w: 3, d: 12 },
            { x: 8, z: -12, w: 8, d: 3 },
            // Right side fragments
            { x: 25, z: -12, w: 5, d: 5 },
            { x: 32, z: -5, w: 4, d: 6 },
            { x: 18, z: 0, w: 6, d: 4 },
            // Lower fragments
            { x: -30, z: 5, w: 5, d: 5 },
            { x: -20, z: 12, w: 4, d: 4 },
            { x: -28, z: 22, w: 6, d: 6 },
            { x: -12, z: 18, w: 8, d: 3 },
            { x: -5, z: 12, w: 3, d: 10 },
            // Center-right maze
            { x: 8, z: 8, w: 3, d: 10 },
            { x: 12, z: 15, w: 10, d: 3 },
            { x: 22, z: 10, w: 4, d: 4 },
            { x: 30, z: 15, w: 5, d: 5 },
            // Bottom row
            { x: -15, z: 28, w: 5, d: 4 },
            { x: 0, z: 25, w: 6, d: 6 },
            { x: 15, z: 30, w: 5, d: 4 },
            { x: 28, z: 25, w: 5, d: 5 }
        ]
    },
    {
        name: "The Streets",
        spawns: { seeker: { x: -28, z: 0 }, hider: { x: 28, z: 0 } },
        style: { floor: 0x333333, wall: 0x8b4513, sky: 0x1a1a2e },
        theme: 'streets',
        cameraZoom: 1.4,
        walls: [
            // Building walls - left side
            { x: -32, z: -30, w: 8, d: 12, type: 'brick' },
            { x: -32, z: -10, w: 6, d: 8, type: 'brick' },
            { x: -28, z: 8, w: 10, d: 14, type: 'graffiti' },
            { x: -32, z: 28, w: 8, d: 10, type: 'brick' },
            // Building walls - right side
            { x: 24, z: -32, w: 10, d: 10, type: 'brick' },
            { x: 28, z: -15, w: 8, d: 8, type: 'graffiti' },
            { x: 24, z: 5, w: 10, d: 12, type: 'brick' },
            { x: 28, z: 25, w: 8, d: 12, type: 'graffiti' },
            // Alleyway walls - horizontal
            { x: -18, z: -20, w: 14, d: 2, type: 'brick' },
            { x: 5, z: -22, w: 12, d: 2, type: 'graffiti' },
            { x: -12, z: -5, w: 16, d: 2, type: 'brick' },
            { x: 8, z: -8, w: 10, d: 2, type: 'graffiti' },
            { x: -15, z: 10, w: 12, d: 2, type: 'brick' },
            { x: 6, z: 12, w: 10, d: 2, type: 'graffiti' },
            { x: -10, z: 25, w: 14, d: 2, type: 'brick' },
            // Alleyway walls - vertical
            { x: -18, z: -30, w: 2, d: 10 },
            { x: -8, z: -28, w: 2, d: 8 },
            { x: 10, z: -32, w: 2, d: 10 },
            { x: -20, z: 20, w: 2, d: 12 },
            { x: 0, z: 18, w: 2, d: 10 },
            { x: 15, z: 22, w: 2, d: 10 },
            // Dumpsters
            { x: -25, z: -22, w: 4, d: 3, type: 'dumpster' },
            { x: 18, z: -28, w: 4, d: 3, type: 'dumpster' },
            { x: -22, z: 0, w: 4, d: 3, type: 'dumpster' },
            { x: 20, z: 18, w: 4, d: 3, type: 'dumpster' },
            // Crates and obstacles
            { x: -5, z: -15, w: 3, d: 3, type: 'crate' },
            { x: -15, z: 5, w: 3, d: 3, type: 'crate' },
            { x: 12, z: 2, w: 3, d: 3, type: 'crate' },
            { x: 5, z: 28, w: 3, d: 3, type: 'crate' }
        ]
    },
    {
        name: "The Park",
        spawns: { seeker: { x: -28, z: -28 }, hider: { x: 28, z: 28 } },
        style: { floor: 0x228b22, wall: 0x8b4513, sky: 0x87CEEB },
        theme: 'park',
        cameraZoom: 1.4,
        walls: [
            // Tree clusters - northeast
            { x: 25, z: -28, w: 4, d: 4, type: 'tree' },
            { x: 30, z: -20, w: 3, d: 3, type: 'tree' },
            { x: 20, z: -22, w: 3, d: 3, type: 'tree' },
            // Tree clusters - northwest
            { x: -28, z: -25, w: 4, d: 4, type: 'tree' },
            { x: -32, z: -18, w: 3, d: 3, type: 'tree' },
            { x: -22, z: -20, w: 3, d: 3, type: 'tree' },
            // Tree clusters - southeast
            { x: 28, z: 25, w: 4, d: 4, type: 'tree' },
            { x: 22, z: 30, w: 3, d: 3, type: 'tree' },
            { x: 32, z: 18, w: 3, d: 3, type: 'tree' },
            // Tree clusters - southwest
            { x: -25, z: 28, w: 4, d: 4, type: 'tree' },
            { x: -30, z: 22, w: 3, d: 3, type: 'tree' },
            { x: -20, z: 32, w: 3, d: 3, type: 'tree' },
            // Central grove
            { x: -5, z: -5, w: 4, d: 4, type: 'tree' },
            { x: 5, z: 5, w: 4, d: 4, type: 'tree' },
            { x: -8, z: 8, w: 3, d: 3, type: 'tree' },
            { x: 8, z: -8, w: 3, d: 3, type: 'tree' },
            // Hedge maze paths - horizontal
            { x: -18, z: -10, w: 12, d: 2, type: 'bush' },
            { x: 8, z: -12, w: 14, d: 2, type: 'bush' },
            { x: -15, z: 12, w: 10, d: 2, type: 'bush' },
            { x: 10, z: 10, w: 12, d: 2, type: 'bush' },
            // Hedge maze paths - vertical
            { x: -15, z: -20, w: 2, d: 10, type: 'bush' },
            { x: 12, z: -25, w: 2, d: 12, type: 'bush' },
            { x: -18, z: 20, w: 2, d: 12, type: 'bush' },
            { x: 15, z: 18, w: 2, d: 10, type: 'bush' },
            // Benches along paths
            { x: -25, z: 0, w: 5, d: 2, type: 'bench' },
            { x: 25, z: 0, w: 5, d: 2, type: 'bench' },
            { x: 0, z: -25, w: 5, d: 2, type: 'bench' },
            { x: 0, z: 25, w: 5, d: 2, type: 'bench' },
            // Scattered bushes
            { x: -10, z: -28, w: 3, d: 3, type: 'bush' },
            { x: 10, z: 28, w: 3, d: 3, type: 'bush' },
            { x: -32, z: 5, w: 3, d: 3, type: 'bush' },
            { x: 32, z: -5, w: 3, d: 3, type: 'bush' }
        ]
    },
    {
        name: "The Bathroom",
        spawns: { seeker: { x: -15, z: -28 }, hider: { x: 15, z: 28 } },
        style: { floor: 0xe8e8f0, wall: 0x87ceeb, sky: 0xe6f3ff },
        theme: 'bathroom',
        cameraZoom: 1.3,
        walls: [
            // === GIANT RUBBER DUCKY (center - main hiding spot!) ===
            { x: 0, z: 0, w: 12, d: 12, type: 'rubberducky' },

            // === BATHTUB with bubbles (bottom right) ===
            { x: 22, z: 22, w: 14, d: 10, type: 'bathtub' },

            // === SHOWER AREA (top right corner) ===
            { x: 28, z: -22, w: 10, d: 12, type: 'shower' },
            // Shower glass walls
            { x: 20, z: -22, w: 1, d: 12, type: 'glass' },
            { x: 28, z: -14, w: 10, d: 1, type: 'glass' },

            // === TOILET STALLS (left side) ===
            { x: -30, z: -25, w: 6, d: 6, type: 'toilet' },
            { x: -30, z: -10, w: 6, d: 6, type: 'toilet' },
            { x: -30, z: 5, w: 6, d: 6, type: 'toilet' },
            // Stall dividers
            { x: -22, z: -18, w: 2, d: 20, type: 'stalldivider' },

            // === SINKS with mirrors (top left) ===
            { x: -22, z: -32, w: 5, d: 4, type: 'sink' },
            { x: -10, z: -32, w: 5, d: 4, type: 'sink' },
            { x: 2, z: -32, w: 5, d: 4, type: 'sink' },

            // === SCATTERED FUN ELEMENTS ===
            // Soap bar obstacles
            { x: 15, z: -5, w: 3, d: 2, type: 'soap' },
            { x: -15, z: 20, w: 3, d: 2, type: 'soap' },

            // Towel racks (small obstacles)
            { x: 32, z: 0, w: 2, d: 8, type: 'towelrack' },

            // Toilet paper tower
            { x: -20, z: 25, w: 4, d: 4, type: 'tptower' },

            // Laundry basket
            { x: 10, z: 28, w: 5, d: 5, type: 'laundrybasket' },

            // Small puddles (floor hazards - very low)
            { x: -5, z: 15, w: 4, d: 4, type: 'puddle' },
            { x: 20, z: -5, w: 3, d: 3, type: 'puddle' }
        ]
    },
    {
        name: "The Kitchen",
        spawns: { seeker: { x: -25, z: -25 }, hider: { x: 25, z: 25 } },
        style: { floor: 0xdeb887, wall: 0xffffff, sky: 0xfff8dc },
        theme: 'kitchen',
        cameraZoom: 1.4,
        walls: [
            // Left counter wall with appliances
            { x: -32, z: -25, w: 6, d: 20, type: 'counter' },
            { x: -28, z: 0, w: 8, d: 8, type: 'fridge' },
            { x: -32, z: 12, w: 6, d: 10, type: 'counter' },
            // Top counter wall
            { x: -20, z: -32, w: 12, d: 6, type: 'counter' },
            { x: -5, z: -30, w: 10, d: 8, type: 'counter' },
            { x: 12, z: -32, w: 14, d: 6, type: 'counter' },
            // Right side - stove and appliances
            { x: 28, z: -22, w: 8, d: 10, type: 'counter' },
            { x: 30, z: -8, w: 6, d: 8, type: 'toaster' },
            { x: 28, z: 5, w: 8, d: 8, type: 'counter' },
            { x: 30, z: 18, w: 6, d: 12, type: 'counter' },
            // Central island
            { x: -8, z: -10, w: 12, d: 6, type: 'counter' },
            { x: 8, z: -5, w: 10, d: 6, type: 'counter' },
            // Dining table area
            { x: -15, z: 20, w: 14, d: 8, type: 'counter' },
            { x: 5, z: 25, w: 12, d: 6, type: 'counter' },
            // Table legs
            { x: -22, z: 16, w: 2, d: 2 },
            { x: -22, z: 28, w: 2, d: 2 },
            { x: -8, z: 16, w: 2, d: 2 },
            { x: -8, z: 28, w: 2, d: 2 },
            { x: 12, z: 22, w: 2, d: 2 },
            { x: 12, z: 30, w: 2, d: 2 },
            // Cereal boxes and kitchen items
            { x: 18, z: -18, w: 4, d: 3, type: 'cerealbox' },
            { x: 22, z: -25, w: 3, d: 3, type: 'cerealbox' },
            { x: -18, z: -20, w: 3, d: 3, type: 'fruit' },
            // Coffee mugs and obstacles
            { x: -20, z: 8, w: 4, d: 4, type: 'mug' },
            { x: 15, z: 12, w: 4, d: 4, type: 'mug' },
            { x: 0, z: 8, w: 5, d: 5, type: 'puddle' },
            // Small obstacles
            { x: -12, z: -22, w: 3, d: 3, type: 'fruit' },
            { x: 10, z: -20, w: 3, d: 3 },
            { x: 20, z: 28, w: 4, d: 4 }
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

// Setup DRACOLoader for compressed models
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@0.140.0/examples/js/libs/draco/');

// Track 3D model collisions
let modelColliders = [];

// Track swinging doors
let doors = [];

// Track portal pairs for teleportation
let portals = [];
let portalCooldown = 0; // Prevent instant re-teleport
let portalTransition = {
    active: false,
    phase: 'none', // 'entering', 'traveling', 'exiting'
    timer: 0,
    targetX: 0,
    targetZ: 0,
    overlay: null
};

// Create a swinging door that opens when player approaches
function createDoor(x, z, width = 3, height = 5, color = 0x8B4513, rotation = 0) {
    const door = new THREE.Group();

    // Door frame (slightly darker than door color)
    const frameColor = new THREE.Color(color).multiplyScalar(0.6);
    const frameGeometry = new THREE.BoxGeometry(width + 0.5, height + 0.3, 0.3);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.9 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = height / 2;
    door.add(frame);

    // Door panel (pivots from left edge)
    const panelGroup = new THREE.Group();
    const panelGeometry = new THREE.BoxGeometry(width, height, 0.2);
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.x = width / 2; // Offset so it pivots from edge
    panel.position.y = height / 2;
    panelGroup.add(panel);

    // Door handle
    const handleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(width - 0.3, height / 2, 0.15);
    panelGroup.add(handle);

    panelGroup.position.x = -width / 2; // Position pivot point at left edge
    door.add(panelGroup);

    door.position.set(x, 0, z);
    door.rotation.y = rotation;
    door.userData = {
        isDoor: true,
        panelGroup: panelGroup,
        angle: 0,
        targetAngle: 0,
        width: width,
        height: height,
        swingSpeed: 0.08,
        isOpen: false,
        triggerDistance: width + 2
    };

    scene.add(door);
    themeParticles.push(door);
    doors.push(door);

    return door;
}

// Update all doors (call in game loop)
function updateDoors() {
    if (!state.gameStarted) return;

    doors.forEach(door => {
        const data = door.userData;
        const doorPos = door.position;

        // Check distance to local player
        let playerNearby = false;
        const triggerDistance = data.triggerDistance || 4;

        // Check local player position
        if (state.player) {
            const dx = state.player.x - doorPos.x;
            const dz = state.player.z - doorPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < triggerDistance) {
                playerNearby = true;
            }
        }

        // Check opponent position
        if (state.opponent) {
            const dx = state.opponent.x - doorPos.x;
            const dz = state.opponent.z - doorPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < triggerDistance) {
                playerNearby = true;
            }
        }

        // Open door if player nearby, close if not
        if (playerNearby && !data.isOpen) {
            data.targetAngle = Math.PI / 2; // Open 90 degrees
            data.isOpen = true;
        } else if (!playerNearby && data.isOpen) {
            data.targetAngle = 0; // Close
            data.isOpen = false;
        }

        // Smoothly animate door
        if (Math.abs(data.angle - data.targetAngle) > 0.01) {
            data.angle += (data.targetAngle - data.angle) * data.swingSpeed;
            data.panelGroup.rotation.y = data.angle;
        }
    });
}

// Clear doors when changing boards
function clearDoors() {
    doors = [];
}

// Clear portals when changing boards
function clearPortals() {
    if (scene) {
        portals.forEach(p => {
            if (p.mesh) scene.remove(p.mesh);
        });
    }
    portals = [];
    portalCooldown = 0;
}

// Create portal pair on far left and right of arena
function createPortals(board) {
    // Portal positions at the edges of the arena
    const portalRadius = CONFIG.ARENA_RADIUS - 3;
    const leftX = -portalRadius;
    const rightX = portalRadius;
    const portalZ = 0;

    // Get theme color for portals
    const portalColor = board.style.wall || 0x00ffff;

    // Create left portal
    const leftPortal = createPortalMesh(leftX, portalZ, portalColor, 'left');
    scene.add(leftPortal);

    // Create right portal
    const rightPortal = createPortalMesh(rightX, portalZ, portalColor, 'right');
    scene.add(rightPortal);

    // Store portal data
    portals.push({
        mesh: leftPortal,
        x: leftX,
        z: portalZ,
        targetX: rightX - 5, // Spawn slightly inside from edge
        targetZ: portalZ,
        side: 'left'
    });

    portals.push({
        mesh: rightPortal,
        x: rightX,
        z: portalZ,
        targetX: leftX + 5, // Spawn slightly inside from edge
        targetZ: portalZ,
        side: 'right'
    });
}

// Create a single portal mesh
function createPortalMesh(x, z, color, side) {
    const group = new THREE.Group();

    // Portal ring (torus)
    const ringGeometry = new THREE.TorusGeometry(4, 0.5, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.y = Math.PI / 2; // Face sideways
    ring.position.y = 4;
    group.add(ring);

    // Inner swirl effect (disc)
    const swirlGeometry = new THREE.CircleGeometry(3.5, 32);
    const swirlMaterial = new THREE.MeshBasicMaterial({
        color: 0x000022,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const swirl = new THREE.Mesh(swirlGeometry, swirlMaterial);
    swirl.rotation.y = Math.PI / 2;
    swirl.position.y = 4;
    group.add(swirl);

    // Particle glow effect
    const glowGeometry = new THREE.CircleGeometry(5, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.y = Math.PI / 2;
    glow.position.y = 4;
    group.add(glow);

    // Add point light
    const light = new THREE.PointLight(color, 1.5, 20);
    light.position.y = 4;
    group.add(light);

    // Create particle system for constant light effects
    const particleCount = 30;
    const particles = [];
    const particleGroup = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Initialize particle position around portal
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 3 + Math.random() * 2;
        particle.position.set(
            (Math.random() - 0.5) * 2, // Slight X spread
            4 + Math.sin(angle) * radius,
            Math.cos(angle) * radius
        );

        particle.userData = {
            angle: angle,
            radius: radius,
            speed: 0.5 + Math.random() * 1,
            offset: Math.random() * Math.PI * 2,
            baseY: 4
        };

        particleGroup.add(particle);
        particles.push(particle);
    }

    group.add(particleGroup);

    // Add secondary glow ring
    const glowRingGeometry = new THREE.TorusGeometry(5, 0.2, 8, 32);
    const glowRingMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4
    });
    const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial);
    glowRing.rotation.y = Math.PI / 2;
    glowRing.position.y = 4;
    group.add(glowRing);

    // Add light rays emanating outward
    const rayCount = 8;
    const rayGroup = new THREE.Group();
    for (let i = 0; i < rayCount; i++) {
        const rayGeometry = new THREE.PlaneGeometry(0.3, 6);
        const rayMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ray = new THREE.Mesh(rayGeometry, rayMaterial);
        const rayAngle = (i / rayCount) * Math.PI * 2;
        ray.position.set(0, 4, 0);
        ray.rotation.y = Math.PI / 2;
        ray.rotation.x = rayAngle;
        ray.userData = { baseAngle: rayAngle };
        rayGroup.add(ray);
    }
    group.add(rayGroup);

    group.position.set(x, 0, z);
    group.userData = {
        isPortal: true,
        side: side,
        time: 0,
        particles: particles,
        particleGroup: particleGroup,
        rayGroup: rayGroup,
        color: color
    };

    return group;
}

// Animate portals (call in render loop)
function updatePortals(deltaTime) {
    portals.forEach(portal => {
        if (portal.mesh && portal.mesh.userData) {
            const userData = portal.mesh.userData;
            userData.time += deltaTime * 2;
            const t = userData.time;

            // Rotate the main ring
            const ring = portal.mesh.children[0];
            if (ring) {
                ring.rotation.z += deltaTime * 1.5;
            }

            // Pulse the glow disc
            const glow = portal.mesh.children[2];
            if (glow && glow.material) {
                glow.material.opacity = 0.2 + Math.sin(t) * 0.15;
                glow.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
            }

            // Animate particles orbiting and floating outward
            if (userData.particles) {
                userData.particles.forEach((particle, i) => {
                    const pData = particle.userData;
                    pData.angle += deltaTime * pData.speed;

                    // Orbit around portal center
                    const orbitRadius = pData.radius + Math.sin(t + pData.offset) * 0.5;
                    particle.position.y = pData.baseY + Math.sin(pData.angle) * orbitRadius;
                    particle.position.z = Math.cos(pData.angle) * orbitRadius;

                    // Float outward from portal (toward center of arena)
                    const floatOut = Math.sin(t * 0.5 + pData.offset) * 3;
                    particle.position.x = floatOut;

                    // Pulse opacity
                    particle.material.opacity = 0.4 + Math.sin(t * 2 + pData.offset) * 0.4;

                    // Scale particles
                    const scale = 0.8 + Math.sin(t * 3 + pData.offset) * 0.3;
                    particle.scale.setScalar(scale);
                });
            }

            // Rotate secondary glow ring (child index 5)
            const glowRing = portal.mesh.children[5];
            if (glowRing) {
                glowRing.rotation.z -= deltaTime * 0.8;
                glowRing.material.opacity = 0.3 + Math.sin(t * 1.5) * 0.2;
            }

            // Animate light rays (child index 6 is rayGroup)
            if (userData.rayGroup) {
                userData.rayGroup.rotation.x += deltaTime * 0.5;
                userData.rayGroup.children.forEach((ray, i) => {
                    // Pulse ray opacity
                    ray.material.opacity = 0.2 + Math.sin(t * 2 + i * 0.5) * 0.15;
                    // Scale rays in and out
                    const rayScale = 1 + Math.sin(t * 1.5 + i * 0.3) * 0.3;
                    ray.scale.y = rayScale;
                });
            }

            // Pulse the point light intensity
            const light = portal.mesh.children[3];
            if (light && light.isLight) {
                light.intensity = 1.2 + Math.sin(t * 2) * 0.5;
            }
        }
    });

    // Decrease portal cooldown
    if (portalCooldown > 0) {
        portalCooldown -= deltaTime;
    }
}

// Check if player entered a portal and teleport them
function checkPortalTeleport() {
    if (portalCooldown > 0 || portalTransition.active) return;

    const playerX = state.player.x;
    const playerZ = state.player.z;
    const teleportRadius = 4; // How close to portal center to trigger

    for (const portal of portals) {
        const dx = playerX - portal.x;
        const dz = playerZ - portal.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < teleportRadius) {
            // Start portal transition instead of instant teleport
            startPortalTransition(portal.targetX, portal.targetZ);
            break;
        }
    }
}

// Start the portal transition effect
function startPortalTransition(targetX, targetZ) {
    portalTransition.active = true;
    portalTransition.phase = 'entering';
    portalTransition.timer = 0;
    portalTransition.targetX = targetX;
    portalTransition.targetZ = targetZ;

    // Play whoosh sound
    if (SoundManager && SoundManager.playPortalWhoosh) {
        SoundManager.playPortalWhoosh();
    }

    // Create screen overlay if it doesn't exist
    if (!portalTransition.overlay) {
        const overlay = document.createElement('div');
        overlay.id = 'portal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(100,0,255,0.9) 0%, rgba(0,0,0,0.95) 100%);
            opacity: 0;
            pointer-events: none;
            z-index: 1000;
            transition: opacity 0.3s ease-in-out;
        `;
        document.body.appendChild(overlay);
        portalTransition.overlay = overlay;
    }

    // Start fade in
    setTimeout(() => {
        if (portalTransition.overlay) {
            portalTransition.overlay.style.opacity = '1';
        }
    }, 10);
}

// Update portal transition (call in game loop)
function updatePortalTransition(deltaTime) {
    if (!portalTransition.active) return;

    portalTransition.timer += deltaTime;

    const enterDuration = 0.4;  // Time to fade in
    const travelDuration = 0.3; // Time in "void"
    const exitDuration = 0.4;   // Time to fade out

    if (portalTransition.phase === 'entering') {
        // Freeze player movement during transition
        if (portalTransition.timer >= enterDuration) {
            portalTransition.phase = 'traveling';
            portalTransition.timer = 0;

            // Actually teleport the player now (while screen is black)
            state.player.x = portalTransition.targetX;
            state.player.z = portalTransition.targetZ;
        }
    } else if (portalTransition.phase === 'traveling') {
        if (portalTransition.timer >= travelDuration) {
            portalTransition.phase = 'exiting';
            portalTransition.timer = 0;

            // Start fade out
            if (portalTransition.overlay) {
                portalTransition.overlay.style.opacity = '0';
            }
        }
    } else if (portalTransition.phase === 'exiting') {
        if (portalTransition.timer >= exitDuration) {
            // Transition complete
            portalTransition.active = false;
            portalTransition.phase = 'none';
            portalTransition.timer = 0;

            // Set cooldown to prevent instant re-teleport
            portalCooldown = 0.5;
        }
    }
}

// Check if player is in portal transition (for movement blocking)
function isInPortalTransition() {
    return portalTransition.active;
}

// Clean up portal transition (call when leaving game)
function cleanupPortalTransition() {
    portalTransition.active = false;
    portalTransition.phase = 'none';
    portalTransition.timer = 0;
    if (portalTransition.overlay) {
        portalTransition.overlay.style.opacity = '0';
    }
}

// ========== HIDING PROPS SYSTEM ==========

// Create a wooden crate/box
function createCrate(x, z, size = 2, color = 0x8B4513) {
    const group = new THREE.Group();

    // Main box
    const boxGeometry = new THREE.BoxGeometry(size, size, size);
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        metalness: 0.1
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.y = size / 2;
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    // Add wooden plank details
    const plankMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.95
    });
    // Horizontal planks
    for (let i = 0; i < 3; i++) {
        const plank = new THREE.Mesh(
            new THREE.BoxGeometry(size + 0.1, 0.15, 0.1),
            plankMaterial
        );
        plank.position.set(0, size * 0.2 + i * size * 0.3, size / 2 + 0.05);
        group.add(plank);
    }

    group.position.set(x, 0, z);
    scene.add(group);
    themeParticles.push(group);

    // Add collision
    modelColliders.push({ x: x, z: z, radius: size * 0.7 });

    return group;
}

// Create a barrel
function createBarrel(x, z, radius = 1, height = 2.5, color = 0x654321) {
    const group = new THREE.Group();

    // Main barrel body
    const barrelGeometry = new THREE.CylinderGeometry(radius, radius * 0.9, height, 16);
    const barrelMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0.1
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.y = height / 2;
    barrel.castShadow = true;
    barrel.receiveShadow = true;
    group.add(barrel);

    // Metal bands
    const bandMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.6,
        roughness: 0.4
    });
    for (let i = 0; i < 3; i++) {
        const band = new THREE.Mesh(
            new THREE.TorusGeometry(radius + 0.02, 0.08, 8, 24),
            bandMaterial
        );
        band.position.y = height * 0.15 + i * height * 0.35;
        band.rotation.x = Math.PI / 2;
        group.add(band);
    }

    group.position.set(x, 0, z);
    scene.add(group);
    themeParticles.push(group);

    // Add collision
    modelColliders.push({ x: x, z: z, radius: radius + 0.3 });

    return group;
}

// Create a bush
function createBush(x, z, size = 1.5, color = 0x228B22) {
    const group = new THREE.Group();

    // Multiple spheres for bushy look
    const bushMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9
    });

    const sphereCount = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < sphereCount; i++) {
        const sphereSize = size * (0.6 + Math.random() * 0.5);
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(sphereSize, 8, 8),
            bushMaterial
        );
        sphere.position.set(
            (Math.random() - 0.5) * size,
            sphereSize * 0.8 + Math.random() * size * 0.3,
            (Math.random() - 0.5) * size
        );
        sphere.castShadow = true;
        group.add(sphere);
    }

    group.position.set(x, 0, z);
    scene.add(group);
    themeParticles.push(group);

    // Add collision
    modelColliders.push({ x: x, z: z, radius: size + 0.5 });

    return group;
}

// Create a dumpster (for streets)
function createDumpster(x, z, rotation = 0) {
    const group = new THREE.Group();

    // Main dumpster body
    const bodyGeometry = new THREE.BoxGeometry(4, 2.5, 2.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5a27,
        roughness: 0.7,
        metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.25;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Lid (slightly open)
    const lidGeometry = new THREE.BoxGeometry(4, 0.2, 2.5);
    const lid = new THREE.Mesh(lidGeometry, bodyMaterial);
    lid.position.set(0, 2.6, -0.8);
    lid.rotation.x = -0.3;
    group.add(lid);

    // Wheels
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const wheelPositions = [
        { x: -1.5, z: 1 }, { x: 1.5, z: 1 },
        { x: -1.5, z: -1 }, { x: 1.5, z: -1 }
    ];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12),
            wheelMaterial
        );
        wheel.position.set(pos.x, 0.3, pos.z);
        wheel.rotation.x = Math.PI / 2;
        group.add(wheel);
    });

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    scene.add(group);
    themeParticles.push(group);

    // Add collision
    modelColliders.push({ x: x, z: z, radius: 2.5 });

    return group;
}

// Create lockers (for bunker/bathroom)
function createLockers(x, z, count = 4, color = 0x555555) {
    const group = new THREE.Group();

    const lockerWidth = 1;
    const lockerHeight = 4;
    const lockerDepth = 1.5;

    for (let i = 0; i < count; i++) {
        const lockerGeometry = new THREE.BoxGeometry(lockerWidth, lockerHeight, lockerDepth);
        const lockerMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.5,
            roughness: 0.5
        });
        const locker = new THREE.Mesh(lockerGeometry, lockerMaterial);
        locker.position.set(i * (lockerWidth + 0.1), lockerHeight / 2, 0);
        locker.castShadow = true;
        group.add(locker);

        // Add vent slits
        const ventMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        for (let v = 0; v < 5; v++) {
            const vent = new THREE.Mesh(
                new THREE.BoxGeometry(lockerWidth * 0.6, 0.08, 0.05),
                ventMaterial
            );
            vent.position.set(i * (lockerWidth + 0.1), lockerHeight * 0.7 + v * 0.15, lockerDepth / 2 + 0.03);
            group.add(vent);
        }

        // Add handle
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 });
        const handle = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.4, 0.1),
            handleMaterial
        );
        handle.position.set(i * (lockerWidth + 0.1) + lockerWidth * 0.3, lockerHeight * 0.5, lockerDepth / 2 + 0.08);
        group.add(handle);
    }

    // Center the group
    group.position.set(x - (count * lockerWidth) / 2, 0, z);
    scene.add(group);
    themeParticles.push(group);

    // Add collision
    modelColliders.push({ x: x, z: z, radius: count * 0.8 });

    return group;
}

// Create a pile of rubble (for ruins)
function createRubble(x, z, size = 3) {
    const group = new THREE.Group();

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.95
    });

    // Random stone shapes
    for (let i = 0; i < 8 + Math.floor(Math.random() * 5); i++) {
        const stoneSize = size * (0.3 + Math.random() * 0.5);
        const stone = new THREE.Mesh(
            new THREE.DodecahedronGeometry(stoneSize, 0),
            stoneMaterial
        );
        stone.position.set(
            (Math.random() - 0.5) * size * 1.5,
            stoneSize * 0.3 + Math.random() * 0.5,
            (Math.random() - 0.5) * size * 1.5
        );
        stone.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        stone.castShadow = true;
        group.add(stone);
    }

    group.position.set(x, 0, z);
    scene.add(group);
    themeParticles.push(group);

    // Add collision
    modelColliders.push({ x: x, z: z, radius: size });

    return group;
}

// ========== DUST PARTICLE SYSTEM ==========
const DUST_CONFIG = {
    maxParticles: 30,
    spawnDistance: 5,      // How close to objects before dust spawns
    minSpeed: 2,           // Minimum player speed to trigger dust
    particleLife: 1500,    // How long dust lives (ms)
    spawnRate: 100         // ms between dust spawns
};
let lastDustSpawn = 0;

// Create a single dust particle
function createDustParticle(x, y, z, boardColor = 0xccaa88) {
    const size = 0.15 + Math.random() * 0.2;
    const geometry = new THREE.SphereGeometry(size, 6, 6);
    const material = new THREE.MeshBasicMaterial({
        color: boardColor,
        transparent: true,
        opacity: 0.6
    });
    const dust = new THREE.Mesh(geometry, material);
    dust.position.set(x, y, z);

    dust.userData = {
        velocityX: (Math.random() - 0.5) * 0.1,
        velocityY: 0.02 + Math.random() * 0.03,
        velocityZ: (Math.random() - 0.5) * 0.1,
        life: DUST_CONFIG.particleLife,
        startTime: Date.now(),
        startOpacity: 0.6
    };

    scene.add(dust);
    dustParticles.push(dust);

    return dust;
}

// Spawn dust near player when close to objects
function spawnDustNearObjects(playerX, playerZ, playerSpeed) {
    const now = Date.now();

    // Rate limiting
    if (now - lastDustSpawn < DUST_CONFIG.spawnRate) return;
    if (playerSpeed < DUST_CONFIG.minSpeed) return;
    if (dustParticles.length >= DUST_CONFIG.maxParticles) return;

    // Get board-appropriate dust color
    const dustColors = {
        0: 0x8B7355,   // Garden - brown/dirt
        1: 0x4a4a4a,   // Haunted - gray ash
        2: 0x00aaaa,   // Neon - cyan particles
        3: 0x8B7355,   // Fortress - stone dust
        4: 0x888888,   // Spiral - neutral
        5: 0x606060,   // Bunker - concrete
        6: 0x808080,   // Ruins - stone
        7: 0x555555,   // Arena - floor dust
        8: 0x333333,   // Void - dark
        9: 0x5a5a5a,   // Streets - asphalt
        10: 0x7a6a4a,  // Park - dirt
        11: 0xcccccc   // Bathroom - white tile dust
    };
    const dustColor = dustColors[state.currentBoard] || 0xccaa88;

    // Check proximity to objects (walls + model colliders)
    let nearObject = false;

    // Check model colliders (hiding props)
    for (const collider of modelColliders) {
        const dx = playerX - collider.x;
        const dz = playerZ - collider.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < collider.radius + DUST_CONFIG.spawnDistance) {
            nearObject = true;
            break;
        }
    }

    // Also check if near walls
    if (!nearObject && walls) {
        for (const wall of walls) {
            const wx = wall.position.x;
            const wz = wall.position.z;
            const dist = Math.sqrt((playerX - wx) ** 2 + (playerZ - wz) ** 2);

            if (dist < 8) {
                nearObject = true;
                break;
            }
        }
    }

    if (nearObject) {
        lastDustSpawn = now;

        // Spawn 2-4 particles
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 2;
            const offsetZ = (Math.random() - 0.5) * 2;
            createDustParticle(
                playerX + offsetX,
                0.2 + Math.random() * 0.5,
                playerZ + offsetZ,
                dustColor
            );
        }
    }
}

// Update dust particles (call in game loop)
function updateDustParticles() {
    const now = Date.now();

    for (let i = dustParticles.length - 1; i >= 0; i--) {
        const dust = dustParticles[i];
        const data = dust.userData;
        const age = now - data.startTime;

        // Remove old particles
        if (age >= data.life) {
            scene.remove(dust);
            dust.geometry.dispose();
            dust.material.dispose();
            dustParticles.splice(i, 1);
            continue;
        }

        // Update position (float upward and drift)
        dust.position.x += data.velocityX;
        dust.position.y += data.velocityY;
        dust.position.z += data.velocityZ;

        // Fade out over time
        const lifeProgress = age / data.life;
        dust.material.opacity = data.startOpacity * (1 - lifeProgress);

        // Slow down
        data.velocityX *= 0.98;
        data.velocityZ *= 0.98;
    }
}

// Clear dust particles (when changing boards)
function clearDustParticles() {
    for (const dust of dustParticles) {
        scene.remove(dust);
        dust.geometry.dispose();
        dust.material.dispose();
    }
    dustParticles = [];
}

// Helper function to load 3D models for board decorations
function loadBoardModel(path, x, z, scale = 1, rotationY = 0, collisionRadius = null, yOffset = 0) {
    const loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.position.set(x, yOffset, z);
        model.scale.set(scale, scale, scale);
        model.rotation.y = rotationY;
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(model);
        themeParticles.push(model);

        // Add collision for this model (circular collision)
        const radius = collisionRadius || scale * 1.5; // Default collision radius based on scale
        modelColliders.push({ x: x, z: z, radius: radius });

        console.log('Loaded model:', path, 'at', x, z, 'scale', scale, 'collision radius', radius);
    }, undefined, (error) => {
        console.warn('Could not load model:', path, error);
    });
}

// Clear model colliders when changing boards
function clearModelColliders() {
    modelColliders = [];
}

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
    },
    // Collectibles
    coins: 0,
    collectibles: [],       // Array of active coins/powerups in the world
    activePowerup: null,    // Current active powerup type
    powerupEndTime: 0,      // When the active powerup expires
    seekerFrozen: false,    // Is seeker frozen by freeze powerup
    hiderInvisible: false,  // Is hider invisible
    hiderSpeedBoosted: false, // Is hider speed boosted
    hiderPhaseWalk: false,  // Is hider in phase walk mode (can walk through walls)
    lastPowerupSpawn: 0     // Timestamp of last powerup spawn
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
let penguinCelebrateModel, penguinCelebrateAnimations;
let wallMeshes = [];
let collectibleMeshes = [];  // Coin and powerup 3D meshes
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

    // Camera - top-down angled view (zoomed out 15% for full board visibility)
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 58, 35);
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
    loadPenguinCelebrateModel();

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

    // No spotlight needed - the dimmed scene + visual cone mesh shows the field of view
    // Spotlight was removed because it created unwanted lighting behind the character
    visionConeLight = null;
    visionConeTarget = null;

    // Create visible cone mesh for visual feedback
    // Use fixed dimensions that look good visually and stay consistent across all boards
    const coneLength = CONFIG.SEEKER_VIEW_RANGE;
    const coneRadius = 12; // Fixed radius for consistent visual appearance
    const coneGeometry = new THREE.ConeGeometry(coneRadius, coneLength, 32, 1, true);

    // Transform geometry so apex is at origin, cone extends along -X axis
    // ConeGeometry: apex at +height/2, base at -height/2, pointing UP (+Y)
    // Step 1: Translate so apex is at origin
    coneGeometry.translate(0, -coneLength / 2, 0);
    // Step 2: Rotate -90deg around Z, cone now points along -X axis
    coneGeometry.rotateZ(-Math.PI / 2);

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

    // Dim the scene outside vision cone - noticeable but still visible
    // Spotlight will brighten the cone area by contrast
    if (ambientLightRef) ambientLightRef.intensity = 0.35;
    if (directionalLightRef) directionalLightRef.intensity = 0.4;
    if (fillLightRef) fillLightRef.intensity = 0.15;

    // Darker background for contrast
    scene.background = new THREE.Color(0x3a4a6a);

    // Dim walls outside cone (spotlight brightens them when in view)
    wallMeshes.forEach(mesh => {
        if (mesh.material && mesh.material.emissive !== undefined) {
            mesh.userData.originalEmissive = mesh.material.emissive.clone();
            mesh.userData.originalEmissiveIntensity = mesh.material.emissiveIntensity || 0;
            // Dim emissive so walls are visible but noticeably darker
            mesh.material.emissive = new THREE.Color(0x222233);
            mesh.material.emissiveIntensity = 0.2;
        }
    });

    // Dim floor
    if (floorMesh && floorMesh.material && floorMesh.material.emissive !== undefined) {
        floorMesh.userData.originalColor = floorMesh.material.color.clone();
        floorMesh.material.emissive = new THREE.Color(0x151520);
        floorMesh.material.emissiveIntensity = 0.15;
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
    if (floorMesh && floorMesh.material && floorMesh.material.emissive !== undefined && floorMesh.userData.originalColor) {
        floorMesh.material.emissive = new THREE.Color(0x000000);
        floorMesh.material.emissiveIntensity = 0;
    }
}

function updateVisionCone() {
    if (!isVisionConeActive || !visionConeMesh) return;

    // Use playerMesh position if available, fallback to state.player
    // This ensures vision cone always follows the visible character
    const playerX = playerMesh ? playerMesh.position.x : state.player.x;
    const playerZ = playerMesh ? playerMesh.position.z : state.player.z;
    const playerAngle = state.player.angle;

    // Position cone mesh at player's face (apex is at origin due to geometry translation)
    // Add small offset in facing direction to place apex at front of character
    const faceOffset = 1.5;
    const faceX = playerX + Math.sin(playerAngle) * faceOffset;
    const faceZ = playerZ + Math.cos(playerAngle) * faceOffset;
    visionConeMesh.position.set(faceX, 2, faceZ);

    // Rotate cone to point in facing direction (match character mesh rotation pattern)
    // Add rotationOffset for skin-specific correction, and +PI/2 to compensate for cone geometry pointing -X
    const selectedSkin = StoreManager.getSelectedSkin();
    const rotationOffset = selectedSkin?.rotationOffset || 0;
    visionConeMesh.rotation.set(0, playerAngle + rotationOffset + Math.PI / 2, 0);

    // Update glow ring position at player feet
    if (visionConeMesh.userData.glowRing) {
        visionConeMesh.userData.glowRing.position.set(playerX, 0.1, playerZ);
    }
}

function loadSeekerModel(usePlayerSkin = false, aiSkin = null) {
    const loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Determine which skin to use
    let modelPath = 'images/Characters/Meshy_AI_biped/Meshy_AI_Animation_Walking_withSkin.glb';
    let skinToUse = null;

    if (usePlayerSkin) {
        // Player's character - use their selected skin
        const selectedSkin = StoreManager.getSelectedSkin();
        if (selectedSkin && selectedSkin.id !== 'default_seeker' && selectedSkin.id !== 'default_hider') {
            modelPath = selectedSkin.path;
            skinToUse = selectedSkin;
        }
    } else if (aiSkin) {
        // AI character - use the provided AI skin
        modelPath = aiSkin.path;
        skinToUse = aiSkin;
    }

    console.log('Loading seeker model from:', modelPath, '(usePlayerSkin:', usePlayerSkin, ', aiSkin:', aiSkin?.name, ')');

    loader.load(modelPath,
        (gltf) => {
            seekerModel = gltf.scene;
            seekerModel.scale.set(5, 5, 5);
            seekerModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Store rotation offset for this skin on the model
            if (skinToUse) {
                seekerModel.userData.rotationOffset = skinToUse.rotationOffset || 0;
            } else {
                // Default seeker skin needs rotation offset
                seekerModel.userData.rotationOffset = Math.PI;
            }

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

function loadHiderModel(usePlayerSkin = false, aiSkin = null) {
    const loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Determine which skin to use
    let modelPath = 'images/Characters/Meshy_AI_biped/kid 5 - run.glb';
    let skinToUse = null;

    if (usePlayerSkin) {
        // Player's character - use their selected skin
        const selectedSkin = StoreManager.getSelectedSkin();
        if (selectedSkin && selectedSkin.id !== 'default_seeker' && selectedSkin.id !== 'default_hider') {
            modelPath = selectedSkin.path;
            skinToUse = selectedSkin;
        }
    } else if (aiSkin) {
        // AI character - use the provided AI skin
        modelPath = aiSkin.path;
        skinToUse = aiSkin;
    }

    console.log('Loading hider model from:', modelPath, '(usePlayerSkin:', usePlayerSkin, ', aiSkin:', aiSkin?.name, ')');

    loader.load(modelPath,
        (gltf) => {
            hiderModel = gltf.scene;
            hiderModel.scale.set(5, 5, 5);
            hiderModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Store rotation offset for this skin on the model
            if (skinToUse) {
                hiderModel.userData.rotationOffset = skinToUse.rotationOffset || 0;
            } else {
                // Default hider skin needs rotation offset
                hiderModel.userData.rotationOffset = Math.PI;
            }

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
    const modelPath = 'images/Characters/Meshy_AI_biped/kid 5 - dance.glb';
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

function loadPenguinCelebrateModel() {
    const loader = new THREE.GLTFLoader();
    if (typeof dracoLoader !== 'undefined') {
        loader.setDRACOLoader(dracoLoader);
    }
    const modelPath = 'images/Characters/Upgrade Store Characters/Penguin All/Meshy_AI_Animation_You_Groove_withSkin.glb';
    console.log('Loading penguin celebrate model from:', modelPath);
    loader.load(modelPath,
        (gltf) => {
            penguinCelebrateModel = gltf.scene;
            penguinCelebrateModel.scale.set(6, 6, 6);
            penguinCelebrateModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (gltf.animations && gltf.animations.length > 0) {
                penguinCelebrateAnimations = gltf.animations;
                console.log('Penguin celebrate animations found:', gltf.animations.map(a => a.name));
            } else {
                console.warn('No animations in penguin celebrate model!');
            }

            console.log('Penguin celebrate model loaded successfully!');
        },
        (progress) => {
            if (progress.total) {
                console.log('Loading penguin celebrate:', Math.round(progress.loaded / progress.total * 100) + '%');
            }
        },
        (error) => {
            console.error('FAILED to load penguin celebrate model:', error);
            penguinCelebrateModel = null;
        }
    );
}

// Reload player models with currently selected skin from store
// The selected skin is ALWAYS used for YOUR character, regardless of role
// Returns true if loading a custom skin (async), false if using default
function reloadPlayerModels(onComplete) {
    const selectedSkin = StoreManager.getSelectedSkin();
    console.log('Reloading player models with skin:', selectedSkin ? selectedSkin.name : 'default');
    console.log('Player role:', state.role);

    // Only reload if a non-default skin is selected
    if (selectedSkin && selectedSkin.id !== 'default_seeker' && selectedSkin.id !== 'default_hider') {
        const loader = new THREE.GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        console.log('Loading custom skin from:', selectedSkin.path);

        // Get scale for this skin (some skins need different sizes)
        const skinScale = selectedSkin.scale || 6; // Default to 6 (slightly bigger than before)

        loader.load(selectedSkin.path,
            (gltf) => {
                const newModel = gltf.scene;
                newModel.scale.set(skinScale, skinScale, skinScale);
                newModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Store animations
                const newAnimations = gltf.animations || [];

                // ALWAYS apply selected skin to the PLAYER's character
                // If player is seeker, update seekerModel
                // If player is hider, update hiderModel
                if (state.role === 'seeker') {
                    seekerModel = newModel;
                    if (newAnimations.length > 0) {
                        seekerAnimations = newAnimations;
                    }
                    console.log('Applied custom skin to SEEKER (player)');
                } else {
                    hiderModel = newModel;
                    if (newAnimations.length > 0) {
                        hiderAnimations = newAnimations;
                    }
                    console.log('Applied custom skin to HIDER (player)');
                }

                console.log('Custom skin loaded successfully! Scale:', skinScale);

                // Call completion callback if provided (for initial game start)
                if (onComplete) {
                    onComplete();
                } else if (state.gameStarted && playerMesh) {
                    // IMPORTANT: Recreate player mesh now that the model is loaded
                    // This ensures the player uses the new skin
                    const oldPosition = { x: playerMesh.position.x, y: playerMesh.position.y, z: playerMesh.position.z };
                    const oldRotation = playerMesh.rotation.y;
                    createPlayers();
                    // Restore position AND sync state.player to prevent vision cone disconnect
                    if (playerMesh) {
                        playerMesh.position.set(oldPosition.x, oldPosition.y, oldPosition.z);
                        playerMesh.rotation.y = oldRotation;
                        // CRITICAL: Sync state.player with mesh position
                        state.player.x = oldPosition.x;
                        state.player.z = oldPosition.z;
                    }
                    console.log('Player mesh recreated with new skin!');
                }
            },
            (progress) => {},
            (error) => {
                console.error('Error loading custom skin:', error);
                // Still call completion on error to not block the game
                if (onComplete) onComplete();
            }
        );
        return true; // Loading custom skin
    }
    return false; // Using default skin
}

// Reload AI model with a random skin different from the player's
// Only used in solo mode
function reloadAIModel(onComplete) {
    const playerSkin = StoreManager.getSelectedSkin();
    const aiSkin = getAISkin(playerSkin?.id || 'default_seeker');

    console.log('Loading AI skin:', aiSkin.name, '(player has:', playerSkin?.name, ')');

    const loader = new THREE.GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const skinScale = aiSkin.scale || 6;

    loader.load(aiSkin.path,
        (gltf) => {
            const newModel = gltf.scene;
            newModel.scale.set(skinScale, skinScale, skinScale);
            newModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const newAnimations = gltf.animations || [];

            // Store the rotation offset on the model for later use
            newModel.userData.rotationOffset = aiSkin.rotationOffset || 0;

            // AI plays the OPPOSITE role of the player
            // If player is seeker, AI is hider (update hiderModel)
            // If player is hider, AI is seeker (update seekerModel)
            if (state.role === 'seeker') {
                // Player is seeker, AI is hider
                hiderModel = newModel;
                if (newAnimations.length > 0) {
                    hiderAnimations = newAnimations;
                }
                console.log('Applied AI skin to HIDER (AI)');
            } else {
                // Player is hider, AI is seeker
                seekerModel = newModel;
                if (newAnimations.length > 0) {
                    seekerAnimations = newAnimations;
                }
                console.log('Applied AI skin to SEEKER (AI)');
            }

            console.log('AI skin loaded successfully!');
            if (onComplete) onComplete();
        },
        (progress) => {},
        (error) => {
            console.error('Error loading AI skin:', error);
            if (onComplete) onComplete();
        }
    );
    return true;
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
    clearModelColliders();
    clearDoors();
    clearPortals();

    // Clear dust particles and glows
    clearDustParticles();
    if (playerGlow) { scene.remove(playerGlow); playerGlow = null; }
    if (opponentGlow) { scene.remove(opponentGlow); opponentGlow = null; }

    const board = BOARDS[currentBoardIndex];

    // Filter walls to ensure portal clearance (portals at x = ±37, z = 0)
    // Only filter walls that directly block the portal entrance zone
    const portalZone = 5; // Narrow zone right at portal entrance
    const filteredWalls = board.walls.filter(wall => {
        const wallLeft = wall.x;
        const wallRight = wall.x + wall.w;
        const wallTop = wall.z;
        const wallBottom = wall.z + wall.d;

        // Check if wall blocks left portal entrance (x around -35 to -37, z near 0)
        const blocksLeftPortal = wallLeft < -33 && wallRight > -38 &&
            wallTop < portalZone && wallBottom > -portalZone;

        // Check if wall blocks right portal entrance (x around 35 to 37, z near 0)
        const blocksRightPortal = wallRight > 33 && wallLeft < 38 &&
            wallTop < portalZone && wallBottom > -portalZone;

        return !blocksLeftPortal && !blocksRightPortal;
    });

    // Create board copy with filtered walls
    currentBoard = { ...board, walls: filteredWalls };

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

    // Create portals on far left and right
    createPortals(board);

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
        rubberducky: { color: 0xffd700, roughness: 0.4, metalness: 0.1 },
        shower: { color: 0xadd8e6, roughness: 0.1, metalness: 0.3 },
        glass: { color: 0xffffff, roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.3 },
        stalldivider: { color: 0xa0a0a0, roughness: 0.5, metalness: 0.2 },
        soap: { color: 0xffc0cb, roughness: 0.3, metalness: 0.0 },
        towelrack: { color: 0xc0c0c0, roughness: 0.3, metalness: 0.7 },
        tptower: { color: 0xffffff, roughness: 0.95, metalness: 0.0 },
        laundrybasket: { color: 0x8b4513, roughness: 0.9, metalness: 0.0 },
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
        else if (wall.type === 'rubberducky') wallHeight = 10;  // BIG rubber ducky!
        else if (wall.type === 'shower') wallHeight = 0.5;      // Just floor tile
        else if (wall.type === 'glass') wallHeight = 6;         // Glass walls
        else if (wall.type === 'stalldivider') wallHeight = 5;
        else if (wall.type === 'soap') wallHeight = 1.5;
        else if (wall.type === 'towelrack') wallHeight = 5;
        else if (wall.type === 'tptower') wallHeight = 7;
        else if (wall.type === 'laundrybasket') wallHeight = 3;

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
                emissiveIntensity: mat.emissiveIntensity || 0,
                transparent: mat.transparent || false,
                opacity: mat.opacity !== undefined ? mat.opacity : 1
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

    // Add circular boundary wall around the arena
    const boundaryHeight = CONFIG.WALL_HEIGHT * 1.5;
    const boundaryRadius = CONFIG.ARENA_RADIUS;
    const wallThickness = 2;

    // Create a ring geometry (cylinder with hole)
    const boundaryGeometry = new THREE.CylinderGeometry(
        boundaryRadius + wallThickness,  // outer radius
        boundaryRadius + wallThickness,  // outer radius bottom
        boundaryHeight,                   // height
        64,                               // segments
        1,                                // height segments
        true                              // open ended
    );

    const boundaryMaterial = new THREE.MeshStandardMaterial({
        color: board.style.wall,
        roughness: 0.8,
        metalness: 0.2,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });

    const boundaryMesh = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
    boundaryMesh.position.set(0, boundaryHeight / 2, 0);
    boundaryMesh.castShadow = true;
    boundaryMesh.receiveShadow = true;
    scene.add(boundaryMesh);
    wallMeshes.push(boundaryMesh);
}

// ==========================================
// Collectibles System (Coins & Powerups)
// ==========================================

const POWERUP_TYPES = ['invisibility', 'speed', 'freeze', 'phaseWalk'];

function createCoinMesh() {
    // Create a gold spinning coin
    const geometry = new THREE.CylinderGeometry(CONFIG.COIN_RADIUS, CONFIG.COIN_RADIUS, 0.2, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xffa500,
        emissiveIntensity: 0.3
    });
    const coin = new THREE.Mesh(geometry, material);
    coin.rotation.x = Math.PI / 2;

    // Add glow ring
    const glowGeometry = new THREE.TorusGeometry(CONFIG.COIN_RADIUS + 0.2, 0.1, 8, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;

    const group = new THREE.Group();
    group.add(coin);
    group.add(glow);
    group.userData.type = 'coin';
    group.userData.rotationSpeed = 0.03 + Math.random() * 0.02;
    group.userData.bobOffset = Math.random() * Math.PI * 2;

    return group;
}

function createMultiplierMesh() {
    // Create 3 stacked coins for the multiplier
    const group = new THREE.Group();

    const coinGeometry = new THREE.CylinderGeometry(CONFIG.COIN_RADIUS, CONFIG.COIN_RADIUS, 0.2, 16);
    const coinMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xffa500,
        emissiveIntensity: 0.5
    });

    // Create 3 coins stacked with slight offset
    for (let i = 0; i < 3; i++) {
        const coin = new THREE.Mesh(coinGeometry, coinMaterial.clone());
        coin.rotation.x = Math.PI / 2;
        coin.position.y = i * 0.3;  // Stack them vertically
        coin.position.x = (i - 1) * 0.15;  // Slight horizontal offset for visual effect
        group.add(coin);
    }

    // Add bigger, more intense glow ring
    const glowGeometry = new THREE.TorusGeometry(CONFIG.COIN_RADIUS + 0.4, 0.15, 8, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.7
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    glow.position.y = 0.3;  // Center of the stack
    group.add(glow);

    // Add "x3" text indicator using a sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('x3', 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 1.5, 1);
    sprite.position.y = 1.8;  // Above the coins
    group.add(sprite);

    group.userData.type = 'multiplier';
    group.userData.rotationSpeed = 0.05 + Math.random() * 0.02;
    group.userData.bobOffset = Math.random() * Math.PI * 2;

    return group;
}

function createPowerupMesh(type) {
    const group = new THREE.Group();

    let color, emissiveColor;
    switch (type) {
        case 'invisibility':
            color = 0x8844ff;
            emissiveColor = 0x6622cc;
            break;
        case 'speed':
            color = 0x00ffff;
            emissiveColor = 0x00aaaa;
            break;
        case 'freeze':
            color = 0x88ddff;
            emissiveColor = 0x4488ff;
            break;
        case 'phaseWalk':
            color = 0x66ff99;  // Ghost green color
            emissiveColor = 0x33cc66;
            break;
    }

    // Main sphere
    const geometry = new THREE.SphereGeometry(CONFIG.POWERUP_RADIUS, 16, 16);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.3,
        emissive: emissiveColor,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // Outer glow ring
    const ringGeometry = new THREE.TorusGeometry(CONFIG.POWERUP_RADIUS + 0.4, 0.15, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Second ring at angle
    const ring2 = ring.clone();
    ring2.rotation.y = Math.PI / 3;
    group.add(ring2);

    group.userData.type = 'powerup';
    group.userData.powerupType = type;
    group.userData.rotationSpeed = 0.02;
    group.userData.bobOffset = Math.random() * Math.PI * 2;

    return group;
}

function getRandomSpawnPosition() {
    // Find a position not too close to walls or players
    let attempts = 0;
    while (attempts < 50) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * (CONFIG.ARENA_RADIUS - 10);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Check distance from players
        const playerDist = Math.sqrt(Math.pow(x - state.player.x, 2) + Math.pow(z - state.player.z, 2));
        const opponentDist = Math.sqrt(Math.pow(x - state.opponent.x, 2) + Math.pow(z - state.opponent.z, 2));

        if (playerDist > 8 && opponentDist > 8) {
            // Check not inside a wall
            let insideWall = false;
            for (const wall of currentBoard.walls) {
                if (x >= wall.x && x <= wall.x + wall.w &&
                    z >= wall.z && z <= wall.z + wall.d) {
                    insideWall = true;
                    break;
                }
            }
            if (!insideWall) {
                return { x, z };
            }
        }
        attempts++;
    }
    // Fallback to center-ish area
    return { x: (Math.random() - 0.5) * 20, z: (Math.random() - 0.5) * 20 };
}

// Spawn in risky/exposed positions - center area and open spaces to encourage hider movement
function getRiskySpawnPosition() {
    let attempts = 0;
    while (attempts < 50) {
        // Prefer center/open areas - spawn within inner 60% of arena
        const angle = Math.random() * Math.PI * 2;
        const maxRadius = CONFIG.ARENA_RADIUS * 0.6;  // Inner 60% of arena
        const radius = Math.random() * maxRadius;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Check not inside a wall
        let insideWall = false;
        for (const wall of currentBoard.walls) {
            if (x >= wall.x - 2 && x <= wall.x + wall.w + 2 &&
                z >= wall.z - 2 && z <= wall.z + wall.d + 2) {
                insideWall = true;
                break;
            }
        }

        if (!insideWall) {
            return { x, z };
        }
        attempts++;
    }
    // Fallback to exact center
    return { x: 0, z: 0 };
}

// Spawn bonus coin in the very center - high risk, high reward
function spawnBonusCoin() {
    // Remove any existing bonus coin
    for (let i = state.collectibles.length - 1; i >= 0; i--) {
        if (state.collectibles[i].type === 'bonus' && !state.collectibles[i].collected) {
            if (state.collectibles[i].mesh) {
                scene.remove(state.collectibles[i].mesh);
            }
            state.collectibles.splice(i, 1);
        }
    }

    // Spawn in center area
    const pos = { x: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 10 };
    const bonusMesh = createBonusCoinMesh();
    bonusMesh.position.set(pos.x, 2, pos.z);
    scene.add(bonusMesh);
    collectibleMeshes.push(bonusMesh);

    state.collectibles.push({
        type: 'bonus',
        x: pos.x,
        z: pos.z,
        mesh: bonusMesh,
        collected: false
    });
}

function createBonusCoinMesh() {
    const group = new THREE.Group();

    // Larger golden coin with sparkle effect
    const coinGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.3, 32);
    const coinMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xffa500,
        emissiveIntensity: 0.3
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI / 2;
    group.add(coin);

    // Outer glow ring
    const glowGeometry = new THREE.TorusGeometry(1.5, 0.2, 8, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    group.add(glow);

    group.userData.rotationSpeed = 0.04;
    group.userData.bobOffset = Math.random() * Math.PI * 2;

    return group;
}

function spawnCoins() {
    // Clear existing coins
    clearCollectibles();

    // Spawn regular coins - use risky positions to encourage hider movement
    for (let i = 0; i < CONFIG.COIN_COUNT; i++) {
        // Most coins spawn in risky/exposed areas
        const pos = getRiskySpawnPosition();
        const coinMesh = createCoinMesh();
        coinMesh.position.set(pos.x, 1.5, pos.z);
        scene.add(coinMesh);
        collectibleMeshes.push(coinMesh);

        state.collectibles.push({
            type: 'coin',
            x: pos.x,
            z: pos.z,
            mesh: coinMesh,
            collected: false
        });
    }

    // Spawn coin multipliers (3x coins) in risky center areas
    for (let i = 0; i < CONFIG.MULTIPLIER_COUNT; i++) {
        const pos = getRiskySpawnPosition();
        const multiplierMesh = createMultiplierMesh();
        multiplierMesh.position.set(pos.x, 1.5, pos.z);
        scene.add(multiplierMesh);
        collectibleMeshes.push(multiplierMesh);

        state.collectibles.push({
            type: 'multiplier',
            x: pos.x,
            z: pos.z,
            mesh: multiplierMesh,
            collected: false
        });
    }

    // Initialize bonus coin timer
    state.lastBonusCoinSpawn = Date.now();
}

function spawnPowerup() {
    // Remove any existing powerup first
    for (let i = state.collectibles.length - 1; i >= 0; i--) {
        if (state.collectibles[i].type === 'powerup' && !state.collectibles[i].collected) {
            if (state.collectibles[i].mesh) {
                scene.remove(state.collectibles[i].mesh);
            }
            state.collectibles.splice(i, 1);
        }
    }

    const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    // Spawn powerups in risky/exposed areas to encourage movement
    const pos = getRiskySpawnPosition();
    const powerupMesh = createPowerupMesh(powerupType);
    powerupMesh.position.set(pos.x, 2, pos.z);
    scene.add(powerupMesh);
    collectibleMeshes.push(powerupMesh);

    state.collectibles.push({
        type: 'powerup',
        powerupType: powerupType,
        x: pos.x,
        z: pos.z,
        mesh: powerupMesh,
        collected: false
    });

    state.lastPowerupSpawn = Date.now();
}

function clearCollectibles() {
    for (const collectible of state.collectibles) {
        if (collectible.mesh) {
            scene.remove(collectible.mesh);
        }
    }
    state.collectibles = [];
    collectibleMeshes = [];
}

function checkCollectibleCollision(playerX, playerZ, isHider) {
    const now = Date.now();

    for (let i = state.collectibles.length - 1; i >= 0; i--) {
        const collectible = state.collectibles[i];
        if (collectible.collected) continue;

        const dist = Math.sqrt(
            Math.pow(playerX - collectible.x, 2) +
            Math.pow(playerZ - collectible.z, 2)
        );

        if (dist < CONFIG.COLLECTIBLE_PICKUP_DISTANCE) {
            if (collectible.type === 'coin') {
                // Both players can collect coins
                collectCoin(collectible, i);
            } else if (collectible.type === 'multiplier') {
                // Both players can collect multipliers (gives 3 coins)
                collectMultiplier(collectible, i);
            } else if (collectible.type === 'bonus') {
                // Both players can collect bonus coins (gives 5 coins!)
                collectBonusCoin(collectible, i);
            } else if (collectible.type === 'powerup' && isHider) {
                // Only hider can collect powerups
                collectPowerup(collectible, i);
            }
        }
    }
}

function collectBonusCoin(collectible, index) {
    state.coins += 5;
    collectible.collected = true;

    // Add 5 coins to persistent store
    StoreManager.addCoins(5);

    // Play coin sound (louder/special)
    SoundManager.playCoinCollect();

    // Show bonus notification
    showBonusCoinNotification();

    // Animate bonus coin collection
    const mesh = collectible.mesh;
    if (mesh) {
        const startScale = mesh.scale.x;
        const startY = mesh.position.y;
        const duration = 500;
        const startTime = Date.now();

        const animateCollection = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            mesh.scale.setScalar(startScale * (1 + progress * 2));
            mesh.position.y = startY + progress * 5;
            mesh.rotation.y += 0.3;

            mesh.traverse(child => {
                if (child.material) {
                    child.material.opacity = 1 - progress;
                    child.material.transparent = true;
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animateCollection);
            } else {
                scene.remove(mesh);
            }
        };
        animateCollection();
    }

    updateCoinUI();
}

function showBonusCoinNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffd700, #ffaa00);
        color: #000;
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 28px;
        font-weight: bold;
        z-index: 1000;
        animation: bonusPop 0.5s ease-out;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    `;
    notification.textContent = '⭐ BONUS +5 COINS! ⭐';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

function collectCoin(collectible, index) {
    state.coins++;
    collectible.collected = true;

    // Add coins to persistent store (for purchases)
    StoreManager.addCoins(1);

    // Play coin sound
    SoundManager.playCoinCollect();

    // Animate coin collection (scale up and fade)
    const mesh = collectible.mesh;
    if (mesh) {
        const startScale = mesh.scale.x;
        const startY = mesh.position.y;
        let progress = 0;

        const animateCoinCollect = () => {
            progress += 0.05;
            if (progress < 1) {
                mesh.scale.setScalar(startScale * (1 + progress));
                mesh.position.y = startY + progress * 3;
                mesh.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = 1 - progress;
                    }
                });
                requestAnimationFrame(animateCoinCollect);
            } else {
                scene.remove(mesh);
            }
        };
        animateCoinCollect();
    }

    // Update coin UI
    updateCoinUI();
}

function collectMultiplier(collectible, index) {
    state.coins += 3;
    collectible.collected = true;

    // Add 3 coins to persistent store
    StoreManager.addCoins(3);

    // Play coin sound multiple times for effect
    SoundManager.playCoinCollect();
    setTimeout(() => SoundManager.playCoinCollect(), 100);
    setTimeout(() => SoundManager.playCoinCollect(), 200);

    // Show multiplier notification
    showMultiplierNotification();

    // Animate multiplier collection (scale up, spin faster, and fade)
    const mesh = collectible.mesh;
    if (mesh) {
        const startScale = mesh.scale.x;
        const startY = mesh.position.y;
        let progress = 0;

        const animateMultiplierCollect = () => {
            progress += 0.04;
            if (progress < 1) {
                mesh.scale.setScalar(startScale * (1 + progress * 1.5));
                mesh.position.y = startY + progress * 4;
                mesh.rotation.y += 0.3;  // Spin fast
                mesh.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = 1 - progress;
                        child.material.transparent = true;
                    }
                });
                requestAnimationFrame(animateMultiplierCollect);
            } else {
                scene.remove(mesh);
            }
        };
        animateMultiplierCollect();
    }

    // Update coin UI
    updateCoinUI();
}

function showMultiplierNotification() {
    // Remove any existing notification
    const existing = document.getElementById('multiplier-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'multiplier-notification';
    notification.innerHTML = `
        <div class="multiplier-icon">x3</div>
        <div class="multiplier-text">COIN MULTIPLIER!</div>
        <div class="multiplier-coins">+3 Coins</div>
    `;
    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => notification.remove(), 2000);
}

function collectPowerup(collectible, index) {
    const powerupType = collectible.powerupType;
    collectible.collected = true;

    // Play powerup sound
    SoundManager.playPowerupCollect();

    // Remove mesh
    if (collectible.mesh) {
        scene.remove(collectible.mesh);
    }

    // Apply powerup effect
    applyPowerup(powerupType);
}

function applyPowerup(type) {
    const now = Date.now();
    state.activePowerup = type;

    switch (type) {
        case 'invisibility':
            state.hiderInvisible = true;
            state.powerupEndTime = now + CONFIG.INVISIBILITY_DURATION;
            // Make hider semi-transparent (only visible to hider themselves)
            if (state.role === 'hider' && playerMesh) {
                playerMesh.traverse(child => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = 0.3;
                    }
                });
            }
            break;

        case 'speed':
            state.hiderSpeedBoosted = true;
            state.powerupEndTime = now + CONFIG.SPEED_BOOST_DURATION;
            break;

        case 'freeze':
            state.seekerFrozen = true;
            state.powerupEndTime = now + CONFIG.FREEZE_DURATION;
            // Visual effect on opponent if we're hider
            if (state.role === 'hider' && opponentMesh) {
                opponentMesh.traverse(child => {
                    if (child.material && child.material.emissive) {
                        child.material.emissive.setHex(0x4488ff);
                        child.material.emissiveIntensity = 0.5;
                    }
                });
            }
            break;

        case 'phaseWalk':
            state.hiderPhaseWalk = true;
            state.powerupEndTime = now + CONFIG.PHASE_WALK_DURATION;
            // Play fast phase walk music
            SoundManager.playPhaseWalkMusic();
            // Ghost visual effect - make player semi-transparent and green-tinted
            if (state.role === 'hider' && playerMesh) {
                playerMesh.traverse(child => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = 0.5;
                        if (child.material.emissive) {
                            child.material.emissive.setHex(0x66ff99);
                            child.material.emissiveIntensity = 0.6;
                        }
                    }
                });
            }
            break;
    }

    updatePowerupUI();
}

function updatePowerupEffects() {
    const now = Date.now();

    // Check if powerup expired
    if (state.activePowerup && now >= state.powerupEndTime) {
        // Reset effects
        if (state.hiderInvisible) {
            state.hiderInvisible = false;
            if (state.role === 'hider' && playerMesh) {
                playerMesh.traverse(child => {
                    if (child.material) {
                        child.material.transparent = false;
                        child.material.opacity = 1;
                    }
                });
            }
        }

        if (state.hiderSpeedBoosted) {
            state.hiderSpeedBoosted = false;
        }

        if (state.seekerFrozen) {
            state.seekerFrozen = false;
            if (state.role === 'hider' && opponentMesh) {
                opponentMesh.traverse(child => {
                    if (child.material && child.material.emissive) {
                        child.material.emissive.setHex(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                });
            }
        }

        if (state.hiderPhaseWalk) {
            state.hiderPhaseWalk = false;
            SoundManager.stopPhaseWalkMusic();
            // Reset player visual
            if (state.role === 'hider' && playerMesh) {
                playerMesh.traverse(child => {
                    if (child.material) {
                        child.material.transparent = false;
                        child.material.opacity = 1;
                        if (child.material.emissive) {
                            child.material.emissive.setHex(0x000000);
                            child.material.emissiveIntensity = 0;
                        }
                    }
                });
            }
        }

        state.activePowerup = null;
        updatePowerupUI();
    }

    // Spawn powerup periodically
    if (!state.gameOver && now - state.lastPowerupSpawn > CONFIG.POWERUP_SPAWN_INTERVAL) {
        spawnPowerup();
    }

    // Spawn bonus coin in center periodically - encourages hider to take risks
    if (!state.gameOver && state.lastBonusCoinSpawn && now - state.lastBonusCoinSpawn > CONFIG.BONUS_COIN_INTERVAL) {
        spawnBonusCoin();
        state.lastBonusCoinSpawn = now;
    }
}

function updateCollectibleAnimations() {
    const time = Date.now() * 0.001;

    for (const collectible of state.collectibles) {
        if (collectible.collected || !collectible.mesh) continue;

        const mesh = collectible.mesh;

        // Rotation
        mesh.rotation.y += mesh.userData.rotationSpeed || 0.02;

        // Bobbing
        const bobOffset = mesh.userData.bobOffset || 0;
        mesh.position.y = (collectible.type === 'coin' ? 1.5 : 2) + Math.sin(time * 2 + bobOffset) * 0.3;
    }
}

function updateCoinUI() {
    const coinDisplay = document.getElementById('coin-display');
    if (coinDisplay) {
        coinDisplay.textContent = state.coins;
    }
}

function updatePowerupUI() {
    const powerupIndicator = document.getElementById('powerup-indicator');
    if (!powerupIndicator) return;

    if (state.activePowerup) {
        powerupIndicator.style.display = 'flex';
        const remaining = Math.max(0, Math.ceil((state.powerupEndTime - Date.now()) / 1000));

        let icon, label;
        switch (state.activePowerup) {
            case 'invisibility':
                icon = '👻';
                label = 'INVISIBLE';
                break;
            case 'speed':
                icon = '⚡';
                label = 'SPEED';
                break;
            case 'freeze':
                icon = '❄️';
                label = 'FREEZE';
                break;
            case 'phaseWalk':
                icon = '🌀';
                label = 'PHASE WALK';
                break;
        }

        powerupIndicator.innerHTML = `${icon} ${label} ${remaining}s`;
    } else {
        powerupIndicator.style.display = 'none';
    }
}

// Haunted theme - fog/mist particles
function createHauntedEffects() {
    // Dim the main lighting for spooky atmosphere
    scene.children.forEach(child => {
        if (child.isAmbientLight) {
            child.intensity = 0.4;
        }
        if (child.isDirectionalLight && !child.shadow) {
            child.intensity = 0.3;
        }
    });

    // Add eerie moonlight
    const moonLight = new THREE.DirectionalLight(0x6666aa, 0.5);
    moonLight.position.set(-10, 20, 10);
    scene.add(moonLight);
    themeLights.push(moonLight);

    // ========== FLICKERING LIGHT BULB ==========
    const bulbLight = new THREE.PointLight(0xffaa44, 1.5, 25);
    bulbLight.position.set(0, 6, 0);
    bulbLight.userData.isFlickering = true;
    bulbLight.userData.flickerTimer = 0;
    bulbLight.userData.baseIntensity = 1.5;
    scene.add(bulbLight);
    themeLights.push(bulbLight);

    // Light bulb mesh
    const bulbGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd88 });
    const bulbMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulbMesh.position.set(0, 6, 0);
    scene.add(bulbMesh);
    themeParticles.push(bulbMesh);

    // Wire/cord hanging down
    const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    wire.position.set(0, 7.5, 0);
    scene.add(wire);
    themeParticles.push(wire);

    // ========== FLOATING GHOSTS ==========
    const ghostPositions = [
        { x: -20, z: 20 }, { x: 22, z: -18 }, { x: -15, z: -22 }, { x: 18, z: 15 }
    ];
    ghostPositions.forEach((pos, i) => {
        // Ghost body (sheet-like shape)
        const ghostGroup = new THREE.Group();

        // Main body - elongated sphere
        const bodyGeom = new THREE.SphereGeometry(1.2, 8, 8);
        bodyGeom.scale(1, 1.5, 0.8);
        const ghostMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
        });
        const body = new THREE.Mesh(bodyGeom, ghostMat);
        ghostGroup.add(body);

        // Eyes - black hollow circles
        const eyeGeom = new THREE.CircleGeometry(0.2, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.35, 0.4, 0.9);
        ghostGroup.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.35, 0.4, 0.9);
        ghostGroup.add(rightEye);

        // Mouth - oval
        const mouthGeom = new THREE.CircleGeometry(0.3, 8);
        mouthGeom.scale(1, 1.5, 1);
        const mouth = new THREE.Mesh(mouthGeom, eyeMat);
        mouth.position.set(0, -0.3, 0.9);
        ghostGroup.add(mouth);

        // Wavy bottom tail
        const tailGeom = new THREE.ConeGeometry(1.2, 1.5, 8);
        const tail = new THREE.Mesh(tailGeom, ghostMat);
        tail.position.y = -1.8;
        tail.rotation.x = Math.PI;
        ghostGroup.add(tail);

        ghostGroup.position.set(pos.x, 4 + Math.random() * 2, pos.z);
        ghostGroup.userData.floatSpeed = 0.8 + Math.random() * 0.4;
        ghostGroup.userData.floatOffset = Math.random() * Math.PI * 2;
        ghostGroup.userData.driftAngle = Math.random() * Math.PI * 2;
        ghostGroup.userData.isGhost = true;

        scene.add(ghostGroup);
        themeParticles.push(ghostGroup);
    });

    // ========== COBWEBS ==========
    const cobwebPositions = [
        { x: -28, z: -28, rot: 0 }, { x: 28, z: -28, rot: Math.PI / 2 },
        { x: -28, z: 28, rot: -Math.PI / 2 }, { x: 28, z: 28, rot: Math.PI },
        { x: -10, z: -15, rot: 0.3 }, { x: 15, z: 10, rot: -0.5 }
    ];
    cobwebPositions.forEach(pos => {
        const webGroup = new THREE.Group();
        const webMat = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.5 });

        // Radial threads
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI / 2;
            const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(Math.cos(angle) * 3, Math.sin(angle) * 3, 0)
            ];
            const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeom, webMat);
            webGroup.add(line);
        }

        // Spiral threads
        for (let ring = 1; ring <= 4; ring++) {
            const ringPoints = [];
            for (let i = 0; i <= 8; i++) {
                const angle = (i / 8) * Math.PI / 2;
                const r = ring * 0.7;
                ringPoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
            }
            const ringGeom = new THREE.BufferGeometry().setFromPoints(ringPoints);
            const ringLine = new THREE.Line(ringGeom, webMat);
            webGroup.add(ringLine);
        }

        webGroup.position.set(pos.x, 5, pos.z);
        webGroup.rotation.x = -Math.PI / 2;
        webGroup.rotation.z = pos.rot;
        scene.add(webGroup);
        themeParticles.push(webGroup);
    });

    // ========== BLOOD SPLATTERS ON WALLS ==========
    const bloodPositions = [
        { x: -30, z: 0, rotY: Math.PI / 2 },
        { x: 30, z: -10, rotY: -Math.PI / 2 },
        { x: 5, z: -28, rotY: 0 },
        { x: -10, z: 28, rotY: Math.PI }
    ];
    bloodPositions.forEach(pos => {
        // Main splatter
        const splatGeom = new THREE.CircleGeometry(1.5, 12);
        splatGeom.scale(1, 1.3, 1);
        const bloodMat = new THREE.MeshBasicMaterial({
            color: 0x8b0000,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const splat = new THREE.Mesh(splatGeom, bloodMat);
        splat.position.set(pos.x, 2.5, pos.z);
        splat.rotation.y = pos.rotY;
        scene.add(splat);
        themeParticles.push(splat);

        // Drips running down
        for (let d = 0; d < 3; d++) {
            const dripGeom = new THREE.CylinderGeometry(0.15, 0.08, 1.5 + Math.random(), 8);
            const drip = new THREE.Mesh(dripGeom, bloodMat);
            drip.position.set(
                pos.x + (pos.rotY === 0 || pos.rotY === Math.PI ? (Math.random() - 0.5) * 2 : 0),
                1.2 - Math.random() * 0.5,
                pos.z + (Math.abs(pos.rotY) === Math.PI / 2 ? (Math.random() - 0.5) * 2 : 0)
            );
            scene.add(drip);
            themeParticles.push(drip);
        }

        // Bloody handprint
        if (Math.random() > 0.5) {
            const handGroup = new THREE.Group();
            // Palm
            const palmGeom = new THREE.CircleGeometry(0.6, 8);
            palmGeom.scale(0.8, 1, 1);
            const palm = new THREE.Mesh(palmGeom, bloodMat);
            handGroup.add(palm);
            // Fingers
            for (let f = 0; f < 4; f++) {
                const fingerGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 6);
                const finger = new THREE.Mesh(fingerGeom, bloodMat);
                finger.position.set(-0.35 + f * 0.23, 0.8, 0);
                finger.rotation.z = (f - 1.5) * 0.1;
                handGroup.add(finger);
            }
            // Thumb
            const thumbGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.5, 6);
            const thumb = new THREE.Mesh(thumbGeom, bloodMat);
            thumb.position.set(-0.7, 0.2, 0);
            thumb.rotation.z = Math.PI / 3;
            handGroup.add(thumb);

            handGroup.position.set(
                pos.x + (pos.rotY === Math.PI / 2 ? 0.1 : pos.rotY === -Math.PI / 2 ? -0.1 : 0),
                3.5,
                pos.z + (pos.rotY === 0 ? 0.1 : pos.rotY === Math.PI ? -0.1 : 0)
            );
            handGroup.rotation.y = pos.rotY;
            handGroup.rotation.z = Math.random() * 0.5 - 0.25;
            scene.add(handGroup);
            themeParticles.push(handGroup);
        }
    });

    // ========== CRACKS ON WALLS ==========
    const crackPositions = [
        { x: -29, z: 15, rotY: Math.PI / 2 },
        { x: 29, z: 5, rotY: -Math.PI / 2 },
        { x: -5, z: -29, rotY: 0 },
        { x: 10, z: 29, rotY: Math.PI }
    ];
    crackPositions.forEach(pos => {
        const crackMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a, linewidth: 2 });

        // Main crack
        const mainCrackPoints = [
            new THREE.Vector3(0, 2, 0),
            new THREE.Vector3(0.3, 1.2, 0),
            new THREE.Vector3(-0.2, 0.5, 0),
            new THREE.Vector3(0.1, -0.5, 0),
            new THREE.Vector3(-0.3, -1.5, 0)
        ];
        const mainCrackGeom = new THREE.BufferGeometry().setFromPoints(mainCrackPoints);
        const mainCrack = new THREE.Line(mainCrackGeom, crackMat);
        mainCrack.position.set(pos.x, 2, pos.z);
        mainCrack.rotation.y = pos.rotY;
        scene.add(mainCrack);
        themeParticles.push(mainCrack);

        // Branch cracks
        const branchPoints = [
            [new THREE.Vector3(0.3, 1.2, 0), new THREE.Vector3(0.8, 1.5, 0)],
            [new THREE.Vector3(-0.2, 0.5, 0), new THREE.Vector3(-0.7, 0.3, 0)],
            [new THREE.Vector3(0.1, -0.5, 0), new THREE.Vector3(0.5, -0.8, 0)]
        ];
        branchPoints.forEach(points => {
            const branchGeom = new THREE.BufferGeometry().setFromPoints(points);
            const branch = new THREE.Line(branchGeom, crackMat);
            branch.position.set(pos.x, 2, pos.z);
            branch.rotation.y = pos.rotY;
            scene.add(branch);
            themeParticles.push(branch);
        });
    });

    // ========== HIDING PROPS ==========
    createCrate(-25, 10, 2.5, 0x3d2817);
    createCrate(-22, 12, 1.8, 0x4a3728);
    createCrate(25, -15, 2, 0x3d2817);
    createBarrel(-10, 25, 1.2, 2.5, 0x2d1f1a);
    createBarrel(15, 20, 1, 2, 0x1a1a1a);
    createBarrel(-18, -20, 1.1, 2.3, 0x2d1f1a);
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

    // ========== HIDING PROPS ==========
    // High-tech crates (dark with cyan tint)
    createCrate(-20, 5, 2.5, 0x1a3a3a);
    createCrate(22, -8, 2, 0x1a3a3a);
    createCrate(-15, -25, 2.2, 0x203535);

    // Glowing barrels
    createBarrel(10, 15, 1, 2.5, 0x004444);
    createBarrel(-25, -10, 1.2, 2.8, 0x003333);
}

// Medieval theme - torches with flickering light
function createMedievalEffects(board) {
    // ========== LOAD 3D MODELS ==========
    const modelBasePath = 'images/maze elements/compressed/';

    // Fortress structure in back (medium collision)
    loadBoardModel(modelBasePath + 'fortress.glb', 0, -32, 12, 0, 4);

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

    // ========== HIDING PROPS ==========
    // Medieval barrels and crates
    createBarrel(-15, 10, 1.3, 2.8, 0x654321);
    createBarrel(-12, 12, 1.1, 2.5, 0x5c4033);
    createBarrel(20, -5, 1.2, 2.6, 0x654321);
    createCrate(15, 15, 2.5, 0x7a5c3d);
    createCrate(-20, -15, 2, 0x6d4c2d);
}

// Garden theme - 3D props + floating leaves and butterflies
function createGardenEffects() {
    // ========== PROCEDURAL TREES ==========
    const treePositions = [
        { x: -28, z: -28 },
        { x: 28, z: -28 },
        { x: -28, z: 28 },
        { x: 28, z: 28 },
        { x: -15, z: 15 },
        { x: 15, z: -15 },
    ];

    treePositions.forEach(pos => {
        const tree = createTree(pos.x, pos.z);
        scene.add(tree);
        themeParticles.push(tree);
        // Add collision for tree trunk
        modelColliders.push({ x: pos.x, z: pos.z, radius: 2 });
    });

    // ========== BUSHES ==========
    const bushPositions = [
        { x: -10, z: -22, scale: 1.2 },
        { x: 10, z: 22, scale: 1.0 },
        { x: -22, z: 8, scale: 0.8 },
        { x: 22, z: -8, scale: 1.1 },
    ];

    bushPositions.forEach(pos => {
        const bush = createBush(pos.x, pos.z, pos.scale);
        scene.add(bush);
        themeParticles.push(bush);
        // Add collision for bush
        modelColliders.push({ x: pos.x, z: pos.z, radius: 1.5 * pos.scale });
    });

    // ========== FLOWER PATCHES ==========
    const flowerPatches = [
        { x: -15, z: -10 },
        { x: 15, z: 10 },
    ];

    flowerPatches.forEach(pos => {
        const flowers = createFlowerPatch(pos.x, pos.z);
        flowers.forEach(flower => {
            scene.add(flower);
            themeParticles.push(flower);
        });
    });

    // ========== DECORATIVE ROCKS ==========
    const rockPositions = [
        { x: -32, z: 0, scale: 1.2 },
        { x: 32, z: 0, scale: 1.0 },
    ];

    rockPositions.forEach(pos => {
        const rock = createRock(pos.x, pos.z, pos.scale);
        scene.add(rock);
        themeParticles.push(rock);
        // Add collision for rock
        modelColliders.push({ x: pos.x, z: pos.z, radius: 2 * pos.scale });
    });

    // ========== FLOATING LEAVES ==========
    const leafCount = 20;
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
            3 + Math.random() * 8,
            Math.sin(angle) * radius
        );
        leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        leaf.userData.fallSpeed = 0.01 + Math.random() * 0.02;
        leaf.userData.swaySpeed = 1 + Math.random() * 2;
        leaf.userData.swayOffset = Math.random() * Math.PI * 2;
        leaf.userData.rotSpeed = 0.02 + Math.random() * 0.03;
        leaf.userData.isLeaf = true;

        scene.add(leaf);
        themeParticles.push(leaf);
    }

    // ========== BUTTERFLIES ==========
    for (let i = 0; i < 6; i++) {
        const butterfly = createButterfly();
        scene.add(butterfly);
        themeParticles.push(butterfly);
    }

    // Bright sunny lighting
    const sunLight = new THREE.DirectionalLight(0xffffee, 1.2);
    sunLight.position.set(20, 30, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);
    themeLights.push(sunLight);

    // Warm fill light
    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.4);
    fillLight.position.set(-15, 20, -10);
    scene.add(fillLight);
    themeLights.push(fillLight);

    // ========== HIDING PROPS ==========
    // Garden bushes for hiding
    createBush(-20, 8, 2, 0x228B22);
    createBush(22, 5, 1.8, 0x2e8b57);
    createBush(-15, -18, 2.2, 0x32cd32);
    createBush(18, -20, 1.6, 0x228B22);
    createBush(-8, 25, 2, 0x3cb371);
    createBush(12, 22, 1.9, 0x2e8b57);

    // Garden crates/planters
    createCrate(25, 0, 2, 0x8B4513);
    createCrate(-25, -5, 1.8, 0x6d4c2d);
}

// Helper function: Create a 3D tree
function createTree(x, z) {
    const tree = new THREE.Group();

    // Trunk - brown cylinder with more segments for smoothness
    const trunkGeometry = new THREE.CylinderGeometry(0.6, 1.0, 7, 16);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x5d4037,
        roughness: 0.9,
        metalness: 0.0
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3.5;
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage - clustered spheres for a natural rounded canopy
    const foliageColors = [0x2e7d32, 0x388e3c, 0x43a047, 0x4caf50];

    // Main canopy cluster positions (relative to trunk top)
    const canopyPositions = [
        { x: 0, y: 9, z: 0, size: 3.5 },      // Center top
        { x: 2, y: 7.5, z: 1, size: 2.8 },    // Right front
        { x: -2, y: 7.5, z: 1, size: 2.8 },   // Left front
        { x: 1, y: 7.5, z: -2, size: 2.8 },   // Right back
        { x: -1, y: 7.5, z: -2, size: 2.8 },  // Left back
        { x: 0, y: 11, z: 0, size: 2.2 },     // Top
        { x: 1.5, y: 10, z: 0.5, size: 2 },   // Upper right
        { x: -1.5, y: 10, z: -0.5, size: 2 }, // Upper left
    ];

    canopyPositions.forEach((pos, i) => {
        const foliageGeometry = new THREE.IcosahedronGeometry(pos.size, 1);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: foliageColors[i % foliageColors.length],
            roughness: 0.8,
            metalness: 0.0,
            flatShading: false
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(pos.x, pos.y, pos.z);
        // Slight random rotation for variety
        foliage.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3);
        foliage.castShadow = true;
        tree.add(foliage);
    });

    tree.position.set(x, 0, z);
    tree.userData.isTree = true;

    return tree;
}

// Helper function: Create a bush
function createBush(x, z, scale = 1) {
    const bush = new THREE.Group();

    const bushMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
        roughness: 0.9,
        metalness: 0.0
    });

    // Multiple overlapping spheres for organic look
    const spherePositions = [
        { x: 0, y: 1.2, z: 0, r: 1.5 },
        { x: 0.8, y: 1, z: 0.5, r: 1.2 },
        { x: -0.7, y: 1, z: 0.6, r: 1.1 },
        { x: 0.3, y: 1.5, z: -0.5, r: 1.0 },
        { x: -0.4, y: 0.8, z: -0.6, r: 1.3 },
    ];

    spherePositions.forEach((pos, i) => {
        const geometry = new THREE.SphereGeometry(pos.r * scale, 8, 8);
        const mat = bushMaterial.clone();
        // Vary the green slightly
        const hueShift = (Math.random() - 0.5) * 0.1;
        mat.color.setHSL(0.33 + hueShift, 0.7, 0.3 + Math.random() * 0.1);

        const sphere = new THREE.Mesh(geometry, mat);
        sphere.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
        sphere.castShadow = true;
        bush.add(sphere);
    });

    bush.position.set(x, 0, z);
    bush.userData.isBush = true;

    return bush;
}

// Helper function: Create flower patch
function createFlowerPatch(x, z) {
    const flowers = [];
    const flowerColors = [0xff69b4, 0xff1493, 0xffd700, 0xff6347, 0xda70d6, 0xffffff];

    for (let i = 0; i < 12; i++) {
        const flower = new THREE.Group();

        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.4;
        flower.add(stem);

        // Flower head - simple sphere
        const petalGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
            roughness: 0.5
        });
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.position.y = 0.9;
        flower.add(petal);

        // Center
        const centerGeometry = new THREE.SphereGeometry(0.1, 6, 6);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.95;
        flower.add(center);

        // Random position within patch
        flower.position.set(
            x + (Math.random() - 0.5) * 4,
            0,
            z + (Math.random() - 0.5) * 4
        );
        flower.userData.isFlower = true;
        flower.userData.swayOffset = Math.random() * Math.PI * 2;

        flowers.push(flower);
    }

    return flowers;
}

// Helper function: Create fountain
function createFountain(x, z) {
    const fountain = new THREE.Group();

    // Base pool - circular
    const poolGeometry = new THREE.CylinderGeometry(3, 3.5, 1, 16);
    const poolMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.7,
        metalness: 0.2
    });
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.position.y = 0.5;
    fountain.add(pool);

    // Water surface
    const waterGeometry = new THREE.CylinderGeometry(2.8, 2.8, 0.1, 16);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a90d9,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = 0.9;
    fountain.add(water);

    // Center pillar
    const pillarGeometry = new THREE.CylinderGeometry(0.4, 0.6, 3, 8);
    const pillar = new THREE.Mesh(pillarGeometry, poolMaterial);
    pillar.position.y = 2;
    fountain.add(pillar);

    // Top dish
    const dishGeometry = new THREE.CylinderGeometry(1.2, 0.8, 0.5, 12);
    const dish = new THREE.Mesh(dishGeometry, poolMaterial);
    dish.position.y = 3.5;
    fountain.add(dish);

    fountain.position.set(x, 0, z);
    fountain.userData.isFountain = true;

    return fountain;
}

// Helper function: Create water droplet for fountain
function createWaterDroplet() {
    const geometry = new THREE.SphereGeometry(0.1, 6, 6);
    const material = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.7
    });
    const droplet = new THREE.Mesh(geometry, material);

    // Start at fountain top
    droplet.position.set(0, 4, 0);
    droplet.userData.isWaterDroplet = true;
    droplet.userData.velocity = {
        x: (Math.random() - 0.5) * 0.1,
        y: 0.15 + Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.1
    };
    droplet.userData.gravity = -0.008;

    return droplet;
}

// Helper function: Create decorative rock
function createRock(x, z, scale = 1) {
    const rock = new THREE.Group();

    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x696969,
        roughness: 0.95,
        metalness: 0.1
    });

    // Main rock body - dodecahedron for irregular look
    const mainGeometry = new THREE.DodecahedronGeometry(1.5 * scale, 0);
    const mainRock = new THREE.Mesh(mainGeometry, rockMaterial);
    mainRock.position.y = 1 * scale;
    mainRock.rotation.set(Math.random(), Math.random(), Math.random());
    mainRock.castShadow = true;
    rock.add(mainRock);

    // Smaller accent rocks
    for (let i = 0; i < 2; i++) {
        const smallGeometry = new THREE.DodecahedronGeometry(0.5 * scale, 0);
        const smallRock = new THREE.Mesh(smallGeometry, rockMaterial.clone());
        smallRock.material.color.setHex(0x5a5a5a);
        smallRock.position.set(
            (Math.random() - 0.5) * 2 * scale,
            0.4 * scale,
            (Math.random() - 0.5) * 2 * scale
        );
        smallRock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.add(smallRock);
    }

    rock.position.set(x, 0, z);
    rock.userData.isRock = true;

    return rock;
}

// Helper function: Create butterfly
function createButterfly() {
    const butterfly = new THREE.Group();

    const wingColors = [0xff69b4, 0xffa500, 0x87ceeb, 0xdda0dd, 0xffff00];
    const wingColor = wingColors[Math.floor(Math.random() * wingColors.length)];

    const wingMaterial = new THREE.MeshBasicMaterial({
        color: wingColor,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    // Wings - simple planes
    const wingGeometry = new THREE.PlaneGeometry(0.4, 0.3);

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.x = -0.15;
    leftWing.rotation.y = 0.3;
    butterfly.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.x = 0.15;
    rightWing.rotation.y = -0.3;
    butterfly.add(rightWing);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    butterfly.add(body);

    // Random starting position
    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 25;
    butterfly.position.set(
        Math.cos(angle) * radius,
        2 + Math.random() * 4,
        Math.sin(angle) * radius
    );

    butterfly.userData.isButterfly = true;
    butterfly.userData.flightAngle = angle;
    butterfly.userData.flightRadius = radius;
    butterfly.userData.flightSpeed = 0.005 + Math.random() * 0.01;
    butterfly.userData.bobOffset = Math.random() * Math.PI * 2;
    butterfly.userData.wingPhase = Math.random() * Math.PI * 2;

    return butterfly;
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

    // ========== HIDING PROPS ==========
    // Military crates
    createCrate(-18, 15, 2.5, 0x3d4f3d);    // Military green
    createCrate(-15, 18, 2, 0x4a5a4a);
    createCrate(20, -8, 2.3, 0x3d4f3d);

    // Barrels (hazardous materials look)
    createBarrel(-10, -20, 1.2, 2.8, 0x505050);
    createBarrel(15, 25, 1, 2.5, 0x444444);
    createBarrel(-30, 0, 1.3, 2.6, 0x505050);

    // Lockers against walls
    createLockers(-35, -15, 5, 0x555555);
    createLockers(35, 20, 4, 0x606060);
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

    // ========== HIDING PROPS ==========
    // Rubble piles for hiding
    createRubble(-25, 15, 3);
    createRubble(22, -18, 2.5);
    createRubble(-10, 28, 3.5);
    createRubble(30, 10, 2.8);

    // Overgrown bushes
    createBush(-18, -10, 2.5, 0x4a7c3d);    // Dark moss green
    createBush(15, 20, 2, 0x3d6633);
    createBush(-30, -25, 1.8, 0x4a7c3d);
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

    // ========== HIDING PROPS ==========
    // Equipment crates around edges
    createCrate(-28, -20, 2.5, 0x333333);
    createCrate(28, -20, 2.5, 0x333333);
    createCrate(-28, 20, 2, 0x444444);
    createCrate(28, 20, 2, 0x444444);

    // Barrels near entrances
    createBarrel(-20, -28, 1.2, 2.5, 0x222222);
    createBarrel(20, 28, 1.2, 2.5, 0x222222);
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

    // ========== HIDING PROPS ==========
    // Dumpsters in alleys
    createDumpster(-25, 5, Math.PI / 4);
    createDumpster(25, -10, -Math.PI / 4);

    // Urban crates/boxes
    createCrate(-18, -28, 2, 0x4a4a4a);
    createCrate(-15, -25, 1.5, 0x3d3d3d);
    createCrate(20, 25, 2.2, 0x4a4a4a);

    // Trash barrels
    createBarrel(-8, 18, 1, 2, 0x333333);
    createBarrel(12, -15, 0.9, 1.8, 0x2d2d2d);
    createBarrel(-22, -15, 1.1, 2.2, 0x333333);
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

    // ========== HIDING PROPS ==========
    // Park bushes
    createBush(-25, -28, 2.5, 0x228B22);
    createBush(25, -28, 2, 0x2e8b57);
    createBush(-28, 25, 2.2, 0x32cd32);
    createBush(28, 25, 1.8, 0x3cb371);
    createBush(-10, -30, 1.5, 0x228B22);
    createBush(10, 30, 1.5, 0x2e8b57);

    // Wooden crates (park storage)
    createCrate(-32, 0, 2, 0x8B4513);
    createCrate(32, 5, 1.8, 0x6d4c2d);
}

// Bathroom theme - steam, dripping water, rubber ducks, FUN!
function createBathroomEffects() {
    const modelBasePath = 'images/maze elements/compressed/';

    // ========== GIANT RUBBER DUCKY (Center - Main Feature!) ==========
    createGiantRubberDucky(0, 0);

    // ========== BATHTUB WITH BUBBLES (Bottom right) ==========
    createBathtubWithBubbles(22, 22);

    // ========== SHOWER AREA (Top right) ==========
    createShowerArea(28, -22);

    // ========== TOILET MODELS ==========
    loadBoardModel(modelBasePath + 'toilet.glb', -30, -25, 8, Math.PI / 2, 2);
    loadBoardModel(modelBasePath + 'toilet.glb', -30, -10, 8, Math.PI / 2, 2);
    loadBoardModel(modelBasePath + 'toilet.glb', -30, 5, 8, Math.PI / 2, 2);

    // ========== SINK MODELS ==========
    loadBoardModel(modelBasePath + 'sink.glb', -22, -35, 6, 0, 1.8);
    loadBoardModel(modelBasePath + 'sink.glb', -10, -35, 6, 0, 1.8);
    loadBoardModel(modelBasePath + 'sink.glb', 2, -35, 6, 0, 1.8);

    // ========== FLOATING BUBBLES (everywhere!) ==========
    for (let i = 0; i < 50; i++) {
        const size = 0.2 + Math.random() * 0.6;
        const geometry = new THREE.SphereGeometry(size, 12, 12);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.3,
            roughness: 0.0,
            metalness: 0.1
        });
        const bubble = new THREE.Mesh(geometry, material);

        bubble.position.set(
            -30 + Math.random() * 60,
            1 + Math.random() * 8,
            -30 + Math.random() * 60
        );
        bubble.userData.floatSpeed = 0.01 + Math.random() * 0.02;
        bubble.userData.wobbleSpeed = 2 + Math.random() * 3;
        bubble.userData.wobbleAmount = 0.5 + Math.random();
        bubble.userData.startX = bubble.position.x;
        bubble.userData.startZ = bubble.position.z;
        bubble.userData.isBubble = true;

        scene.add(bubble);
        themeParticles.push(bubble);
    }

    // ========== STEAM from shower ==========
    for (let i = 0; i < 25; i++) {
        const geometry = new THREE.SphereGeometry(0.4 + Math.random() * 0.6, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15 + Math.random() * 0.15
        });
        const steam = new THREE.Mesh(geometry, material);

        steam.position.set(
            25 + Math.random() * 8,
            1 + Math.random() * 4,
            -25 + Math.random() * 8
        );
        steam.userData.riseSpeed = 0.015 + Math.random() * 0.02;
        steam.userData.driftSpeed = 0.01;
        steam.userData.maxY = 10;
        steam.userData.isSteam = true;

        scene.add(steam);
        themeParticles.push(steam);
    }

    // ========== WATER DRIPS from sinks ==========
    for (let i = 0; i < 8; i++) {
        const geometry = new THREE.SphereGeometry(0.12, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.85
        });
        const drip = new THREE.Mesh(geometry, material);
        drip.position.set(
            -22 + (i % 3) * 12,
            4,
            -32
        );
        drip.userData.fallSpeed = 0;
        drip.userData.maxFallSpeed = 0.35;
        drip.userData.startY = 4;
        drip.userData.dripTimer = Math.random() * 120;

        scene.add(drip);
        themeParticles.push(drip);
    }

    // ========== BRIGHT BATHROOM LIGHTING ==========
    const mainLight = new THREE.PointLight(0xffffff, 1.0, 80);
    mainLight.position.set(0, 15, 0);
    mainLight.castShadow = true;
    scene.add(mainLight);
    themeLights.push(mainLight);

    const showerLight = new THREE.PointLight(0xadd8e6, 0.6, 30);
    showerLight.position.set(28, 10, -22);
    scene.add(showerLight);
    themeLights.push(showerLight);

    const tubLight = new THREE.PointLight(0xffe4b5, 0.5, 25);
    tubLight.position.set(22, 8, 22);
    scene.add(tubLight);
    themeLights.push(tubLight);

    // ========== STALL DOORS ==========
    createDoor(-26, -25, 2.5, 5, 0x808080);
    createDoor(-26, -10, 2.5, 5, 0x808080);
    createDoor(-26, 5, 2.5, 5, 0x808080);

    // ========== MIRRORS above sinks ==========
    createMirror(-22, -30, 4, 3);
    createMirror(-10, -30, 4, 3);
    createMirror(2, -30, 4, 3);

    // ========== SMALL RUBBER DUCKS in bathtub ==========
    createSmallDuck(25, 20);
    createSmallDuck(19, 24);
    createSmallDuck(24, 26);
}


// Create GIANT rubber ducky - the star of the bathroom!
function createGiantRubberDucky(x, z) {
    const duckGroup = new THREE.Group();
    const duckMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.3,
        metalness: 0.1
    });

    // Body (large sphere)
    const bodyGeom = new THREE.SphereGeometry(5, 24, 24);
    bodyGeom.scale(1, 0.85, 1.1);
    const body = new THREE.Mesh(bodyGeom, duckMaterial);
    body.position.y = 4;
    body.castShadow = true;
    duckGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(2.5, 20, 20), duckMaterial);
    head.position.set(0, 8, 3.5);
    head.castShadow = true;
    duckGroup.add(head);

    // Beak (orange)
    const beakGeom = new THREE.ConeGeometry(1, 2.5, 8);
    beakGeom.rotateX(Math.PI / 2);
    const beak = new THREE.Mesh(beakGeom, new THREE.MeshStandardMaterial({ color: 0xff8c00 }));
    beak.position.set(0, 7.5, 6);
    duckGroup.add(beak);

    // Eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), eyeMat);
    leftEye.position.set(-1.2, 9, 5);
    duckGroup.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), eyeMat);
    rightEye.position.set(1.2, 9, 5);
    duckGroup.add(rightEye);

    // Wings
    const wingGeom = new THREE.SphereGeometry(2, 12, 12);
    wingGeom.scale(0.3, 0.8, 1);
    const leftWing = new THREE.Mesh(wingGeom, duckMaterial);
    leftWing.position.set(-4.5, 4, 0);
    leftWing.rotation.z = 0.3;
    duckGroup.add(leftWing);
    const rightWing = new THREE.Mesh(wingGeom.clone(), duckMaterial);
    rightWing.position.set(4.5, 4, 0);
    rightWing.rotation.z = -0.3;
    duckGroup.add(rightWing);

    duckGroup.position.set(x, 0, z);
    duckGroup.userData.isGiantDuck = true;
    scene.add(duckGroup);
    themeParticles.push(duckGroup);
}

// Create bathtub with bubbles
function createBathtubWithBubbles(x, z) {
    const tubGroup = new THREE.Group();
    const tubMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.15, metalness: 0.3 });

    // Tub shell
    const outer = new THREE.Mesh(new THREE.BoxGeometry(12, 3, 8), tubMat);
    outer.position.y = 1.5;
    outer.castShadow = true;
    tubGroup.add(outer);

    // Water
    const water = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 })
    );
    water.position.y = 2.5;
    tubGroup.add(water);

    // Bubble foam
    const foamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 20; i++) {
        const foam = new THREE.Mesh(new THREE.SphereGeometry(0.4 + Math.random() * 0.8, 8, 8), foamMat);
        foam.position.set(-4 + Math.random() * 8, 2.8 + Math.random() * 0.5, -2 + Math.random() * 4);
        tubGroup.add(foam);
    }

    // Faucet
    const faucetMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9 });
    const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.5, 12), faucetMat);
    faucetBase.position.set(5, 3.5, 0);
    tubGroup.add(faucetBase);

    tubGroup.position.set(x, 0, z);
    scene.add(tubGroup);
    themeParticles.push(tubGroup);  // Use themeParticles for cleanup (not themeLights)
}

// Create shower area
function createShowerArea(x, z) {
    const showerGroup = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9 });

    // Shower head
    const head = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1, 0.5, 16), metalMat);
    head.position.set(0, 8, 0);
    showerGroup.add(head);

    // Pipe
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3, 8), metalMat);
    pipe.position.set(0, 9.5, 2);
    showerGroup.add(pipe);

    // Water streams
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 8; i++) {
        const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 7, 6), waterMat);
        const angle = (i / 8) * Math.PI * 2;
        stream.position.set(Math.cos(angle) * 0.8, 4, Math.sin(angle) * 0.8);
        showerGroup.add(stream);
    }

    // Floor tile
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.3, 10),
        new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })
    );
    floor.position.y = 0.15;
    showerGroup.add(floor);

    showerGroup.position.set(x, 0, z);
    scene.add(showerGroup);
    themeParticles.push(showerGroup);  // Use themeParticles for cleanup
}

// Create mirror
function createMirror(x, z, width, height) {
    const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xaaccff, metalness: 0.9 })
    );
    mirror.position.set(x, 5, z);
    scene.add(mirror);
    themeParticles.push(mirror);  // Use themeParticles for cleanup

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.4, height + 0.4, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x808080 })
    );
    frame.position.set(x, 5, z - 0.1);
    scene.add(frame);
    themeParticles.push(frame);  // Use themeParticles for cleanup
}

// Create small decorative rubber duck
function createSmallDuck(x, z) {
    const duckGroup = new THREE.Group();
    const duckMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), duckMat);
    body.scale.set(1, 0.8, 1);
    body.position.y = 3.2;
    duckGroup.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), duckMat);
    head.position.set(0, 3.7, 0.4);
    duckGroup.add(head);

    const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.4, 6),
        new THREE.MeshStandardMaterial({ color: 0xff8c00 })
    );
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 3.6, 0.75);
    duckGroup.add(beak);

    duckGroup.position.set(x, 0, z);
    duckGroup.userData.isSmallDuck = true;
    scene.add(duckGroup);
    themeParticles.push(duckGroup);
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
            // Animate ghosts and fog
            themeParticles.forEach(particle => {
                // Floating ghosts
                if (particle.userData.isGhost) {
                    // Bobbing up and down
                    particle.position.y = 4 + Math.sin(time * particle.userData.floatSpeed + particle.userData.floatOffset) * 1.5;
                    // Slow drift movement
                    particle.position.x += Math.cos(particle.userData.driftAngle) * 0.01;
                    particle.position.z += Math.sin(particle.userData.driftAngle) * 0.01;
                    // Slowly rotate to face different directions
                    particle.rotation.y = Math.sin(time * 0.3 + particle.userData.floatOffset) * Math.PI * 0.5;
                    // Pulsing opacity for eerie effect
                    particle.children.forEach(child => {
                        if (child.material && child.material.opacity !== undefined) {
                            const baseOpacity = child.material.color.getHex() === 0x000000 ? 1 : 0.4;
                            child.material.opacity = baseOpacity + Math.sin(time * 2) * 0.15;
                        }
                    });
                    // Keep within bounds
                    const dist = Math.sqrt(particle.position.x ** 2 + particle.position.z ** 2);
                    if (dist > CONFIG.ARENA_RADIUS * 0.8) {
                        particle.userData.driftAngle += Math.PI;
                    }
                }
                // Drift fog particles
                else if (particle.userData.driftSpeed) {
                    particle.position.x += Math.cos(particle.userData.driftAngle) * particle.userData.driftSpeed;
                    particle.position.z += Math.sin(particle.userData.driftAngle) * particle.userData.driftSpeed;
                    const dist = Math.sqrt(particle.position.x ** 2 + particle.position.z ** 2);
                    if (dist > CONFIG.ARENA_RADIUS) {
                        particle.userData.driftAngle += Math.PI;
                    }
                }
            });
            // Flickering light bulb
            themeLights.forEach(light => {
                if (light.userData.isFlickering) {
                    light.userData.flickerTimer += 1;
                    // Random flicker pattern
                    const flicker = Math.sin(time * 15) * Math.sin(time * 23) * Math.sin(time * 31);
                    if (flicker > 0.7 || (light.userData.flickerTimer % 120 < 5)) {
                        light.intensity = light.userData.baseIntensity * 0.2; // Dim flicker
                    } else if (flicker > 0.3) {
                        light.intensity = light.userData.baseIntensity * 0.7;
                    } else {
                        light.intensity = light.userData.baseIntensity;
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
                // Floating bubbles
                if (particle.userData.isBubble) {
                    particle.position.y += particle.userData.floatSpeed;
                    particle.position.x = particle.userData.startX + Math.sin(time * particle.userData.wobbleSpeed) * particle.userData.wobbleAmount;
                    particle.position.z = particle.userData.startZ + Math.cos(time * particle.userData.wobbleSpeed * 0.7) * particle.userData.wobbleAmount;

                    // Reset when too high
                    if (particle.position.y > 12) {
                        particle.position.y = 0.5;
                        particle.userData.startX = -30 + Math.random() * 60;
                        particle.userData.startZ = -30 + Math.random() * 60;
                    }
                }
                // Giant rubber ducky - gentle bob
                else if (particle.userData.isGiantDuck) {
                    particle.position.y = particle.userData.baseY + Math.sin(time * 1.5) * 0.3;
                    particle.rotation.y += 0.002;
                }
                // Small rubber ducks - faster bob
                else if (particle.userData.isSmallDuck) {
                    particle.position.y = particle.userData.baseY + Math.sin(time * particle.userData.bobSpeed) * particle.userData.bobAmount;
                    particle.rotation.y += 0.01;
                }
                // Rising steam
                else if (particle.userData.riseSpeed && particle.userData.maxY) {
                    particle.position.y += particle.userData.riseSpeed;
                    particle.position.x += Math.sin(time * 2 + particle.position.y) * particle.userData.driftSpeed;
                    if (particle.material) {
                        particle.material.opacity = Math.max(0, particle.material.opacity - 0.001);
                    }

                    // Reset when too high or faded
                    if (particle.position.y > particle.userData.maxY || (particle.material && particle.material.opacity <= 0)) {
                        particle.position.y = 1 + Math.random() * 4;
                        particle.position.x = 25 + Math.random() * 8;
                        particle.position.z = -25 + Math.random() * 8;
                        if (particle.material) particle.material.opacity = 0.15 + Math.random() * 0.15;
                    }
                }
                // Water drips
                else if (particle.userData.fallSpeed !== undefined && particle.userData.dripTimer !== undefined) {
                    particle.userData.dripTimer++;
                    if (particle.userData.dripTimer > 60 + Math.random() * 100) {
                        particle.userData.fallSpeed = Math.min(particle.userData.fallSpeed + 0.02, particle.userData.maxFallSpeed);
                        particle.position.y -= particle.userData.fallSpeed;

                        if (particle.position.y < 0.1) {
                            particle.position.y = particle.userData.startY;
                            particle.userData.fallSpeed = 0;
                            particle.userData.dripTimer = 0;
                        }
                    }
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
            // Clone the animation clip to ensure it binds correctly to the cloned mesh
            const clonedClip = myAnimations[0].clone();
            const action = playerMixer.clipAction(clonedClip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            action.timeScale = 1.5; // Slightly faster animation
            action.play();
            action.paused = false;
            playerMesh.userData.walkAction = action;
            playerMesh.userData.mixer = playerMixer; // Store reference
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
        // Copy rotation offset from source model, default to Math.PI for default skins
        opponentMesh.userData.rotationOffset = oppModel.userData?.rotationOffset !== undefined
            ? oppModel.userData.rotationOffset
            : Math.PI;
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
            // Clone the animation clip to ensure it binds correctly to the cloned mesh
            const clonedClip = oppAnimations[0].clone();
            const action = opponentMixer.clipAction(clonedClip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            action.timeScale = 1.5; // Slightly faster animation
            action.play();
            action.paused = true;
            opponentMesh.userData.walkAction = action;
            opponentMesh.userData.mixer = opponentMixer; // Store reference
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

let elements = null;

function initElements() {
    elements = {
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
    console.log('Elements initialized:', elements.createBtn ? 'OK' : 'FAILED');
}

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

// Try multiple PeerJS servers - put most reliable first
const PEER_SERVERS = [
    null, // Use default PeerJS cloud (no explicit config)
    { host: '0.peerjs.com', port: 443, secure: true, path: '/' }
];
let currentServerIndex = 0;

function getPeerConfig(serverInfo) {
    const config = {
        debug: 0,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    };
    if (serverInfo) {
        Object.assign(config, serverInfo);
    }
    return config;
}

const PEER_CONFIG = getPeerConfig(PEER_SERVERS[0]);

let createGameRetries = 0;
const MAX_RETRIES = 2;

function createGame() {
    state.roomCode = generateRoomCode();
    state.isHost = true;

    const serverInfo = PEER_SERVERS[currentServerIndex];
    const serverName = serverInfo ? serverInfo.host : 'PeerJS Cloud';
    setStatus('Connecting to ' + serverName + '...');

    if (state.peer) {
        try { state.peer.destroy(); } catch(e) {}
    }

    console.log('Creating peer with ID: hideseek3d-' + state.roomCode + ' on server: ' + serverName);

    const peerConfig = getPeerConfig(serverInfo);

    try {
        state.peer = new Peer('hideseek3d-' + state.roomCode, peerConfig);
    } catch (e) {
        console.error('Failed to create Peer:', e);
        tryNextServer();
        return;
    }

    // Timeout if connection takes too long
    const connectionTimeout = setTimeout(() => {
        console.log('Connection timeout, trying next server...');
        if (state.peer) state.peer.destroy();
        tryNextServer();
    }, 3000);

    state.peer.on('open', (id) => {
        clearTimeout(connectionTimeout);
        console.log('Peer connected with ID:', id);
        createGameRetries = 0;
        currentServerIndex = 0;
        elements.roomCode.textContent = state.roomCode;
        showScreen('waiting');
        setStatus('Waiting for opponent... Code: ' + state.roomCode);
    });

    state.peer.on('connection', (conn) => {
        clearTimeout(connectionTimeout);
        console.log('Incoming connection');
        state.conn = conn;
        if (conn.open) setupConnection();
        else conn.on('open', () => setupConnection());
    });

    state.peer.on('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('Peer error:', err.type, err);
        if (err.type === 'unavailable-id') {
            state.peer.destroy();
            setTimeout(createGame, 500);
        } else {
            tryNextServer();
        }
    });

    state.peer.on('disconnected', () => {
        console.log('Peer disconnected, attempting reconnect...');
        if (state.peer && !state.peer.destroyed) {
            state.peer.reconnect();
        }
    });
}

function tryNextServer() {
    createGameRetries++;
    if (createGameRetries >= MAX_RETRIES) {
        // Try next server
        currentServerIndex = (currentServerIndex + 1) % PEER_SERVERS.length;
        createGameRetries = 0;

        if (currentServerIndex === 0) {
            // We've tried all servers
            setStatus('All servers unavailable. Try again later.', 'error');
            showScreen('menu');
            return;
        }
    }
    setStatus('Retrying... (' + (createGameRetries + 1) + '/' + MAX_RETRIES + ')');
    setTimeout(createGame, 1500);
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

    state.peer = new Peer(getPeerConfig(PEER_SERVERS[currentServerIndex]));

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

    // Clear any stuck portal transition from previous round
    cleanupPortalTransition();

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

    // Also hide mobile boost button if not seeker
    const mobileBoostBtn = document.getElementById('boost-btn');
    if (mobileBoostBtn) {
        mobileBoostBtn.style.display = state.role === 'seeker' ? 'block' : 'none';
    }

    updateTimerDisplay();

    // Create 3D scene (arena first, players after skin loads)
    createArena();

    // Function to finish setup after skins are ready
    const finishPlayerSetup = () => {
        createPlayers();
        createDustParticles();
        createCharacterGlow();
    };

    // Track loading state for both player and AI skins
    let playerSkinLoaded = false;
    let aiSkinLoaded = false;
    const needsAISkin = state.isSoloMode;

    const checkAllSkinsLoaded = () => {
        if (playerSkinLoaded && (aiSkinLoaded || !needsAISkin)) {
            finishPlayerSetup();
        }
    };

    // Reload player models with selected skin
    const isLoadingPlayerSkin = reloadPlayerModels(() => {
        playerSkinLoaded = true;
        checkAllSkinsLoaded();
    });

    // In solo mode, also load a different skin for the AI
    if (needsAISkin) {
        reloadAIModel(() => {
            aiSkinLoaded = true;
            checkAllSkinsLoaded();
        });
    } else {
        aiSkinLoaded = true; // Not needed, mark as done
    }

    // If not loading custom player skin, mark as done immediately
    if (!isLoadingPlayerSkin) {
        playerSkinLoaded = true;
        checkAllSkinsLoaded();
    }

    // Initialize collectibles
    state.collectibles = [];
    state.activePowerup = null;
    state.powerupEndTime = 0;
    state.seekerFrozen = false;
    state.hiderInvisible = false;
    state.hiderSpeedBoosted = false;
    state.lastPowerupSpawn = Date.now();
    spawnCoins();
    updateCoinUI();

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

    // Stop all walking animations immediately
    if (playerMixer) {
        playerMixer.stopAllAction();
    }
    if (opponentMixer) {
        opponentMixer.stopAllAction();
    }

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

    // Check if player has a custom skin equipped
    const selectedSkin = StoreManager.getSelectedSkin();
    const hasCustomSkin = selectedSkin && selectedSkin.id !== 'default_seeker' && selectedSkin.id !== 'default_hider';

    // Penguin wins - use special penguin celebration dance!
    if (isWinner && selectedSkin && selectedSkin.id === 'penguin' && penguinCelebrateModel) {
        console.log('Penguin wins! Using penguin celebrate animation');
        celebrateMesh = THREE.SkeletonUtils.clone(penguinCelebrateModel);
        celebrateMesh.position.set(winnerX, 0, winnerZ);
        celebrateMesh.rotation.y = -Math.PI / 2;
        scene.add(celebrateMesh);

        if (playerMesh) playerMesh.visible = false;

        if (penguinCelebrateAnimations && penguinCelebrateAnimations.length > 0) {
            celebrateMixer = new THREE.AnimationMixer(celebrateMesh);
            const action = celebrateMixer.clipAction(penguinCelebrateAnimations[0]);
            action.setLoop(THREE.LoopRepeat);
            action.play();
        }
        usedCelebrateModel = true;
    }
    // Custom skins with celebration animation - load and use their special celebration
    else if (isWinner && hasCustomSkin && selectedSkin.celebrationPath) {
        console.log('Loading custom celebration for:', selectedSkin.name);
        if (playerMesh) playerMesh.visible = false;

        // Load celebration model dynamically
        const loader = new THREE.GLTFLoader();
        if (typeof dracoLoader !== 'undefined') {
            loader.setDRACOLoader(dracoLoader);
        }

        loader.load(selectedSkin.celebrationPath,
            (gltf) => {
                const celebModel = gltf.scene;
                celebModel.scale.set(selectedSkin.scale || 6, selectedSkin.scale || 6, selectedSkin.scale || 6);
                celebModel.position.set(winnerX, 0, winnerZ);
                celebModel.rotation.y = -Math.PI / 2;
                scene.add(celebModel);

                // Store reference for cleanup
                state.celebration.customCelebrateMesh = celebModel;

                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(celebModel);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.setLoop(THREE.LoopRepeat);
                    action.play();
                    state.celebration.celebrateMixer = mixer;
                }
                console.log('Custom celebration loaded for:', selectedSkin.name);
            },
            null,
            (error) => {
                console.error('Failed to load celebration:', error);
                // Fallback to regular mesh
                if (playerMesh) playerMesh.visible = true;
            }
        );
        usedCelebrateModel = true;
    }
    // Other custom skins without celebration - use their current mesh
    else if (isWinner && hasCustomSkin && playerMesh) {
        console.log('Using custom skin for celebration:', selectedSkin.name);
        celebrateMesh = playerMesh;
        celebrateMesh.visible = true;
        // Face the camera
        celebrateMesh.rotation.y = -Math.PI / 2;
        // Keep any existing animation mixer from the player mesh
        usedCelebrateModel = false; // Don't mark as celebrate model so it doesn't get removed
    }
    // Seeker wins - use seeker celebrate model (only if no custom skin)
    else if (isWinner && state.role === 'seeker' && seekerCelebrateModel) {
        celebrateMesh = THREE.SkeletonUtils.clone(seekerCelebrateModel);
        celebrateMesh.position.set(winnerX, 0, winnerZ);
        // Face the camera (rotate -90 degrees to face front toward camera)
        celebrateMesh.rotation.y = -Math.PI / 2;
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
            // Face the camera (rotate -90 degrees to face front toward camera)
            celebrateMesh.rotation.y = -Math.PI / 2;
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

    // Hide the loser's mesh during celebration
    const loserMesh = isWinner ? opponentMesh : playerMesh;
    if (loserMesh && loserMesh !== celebrateMesh) {
        loserMesh.visible = false;
    }

    // Store original scale for the bounce animation
    const originalScale = celebrateMesh ? celebrateMesh.scale.clone() : new THREE.Vector3(1, 1, 1);

    // Store celebration state
    state.celebration = {
        active: true,
        startTime: performance.now(),
        isWinner: isWinner,
        title: title,
        message: message,
        winnerMesh: celebrateMesh,
        originalMesh: winnerMesh,
        originalScale: originalScale,
        loserMesh: loserMesh,
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

            // Scale up effect - preserve original scale
            const scaleBoost = 1 + Math.sin(progress * Math.PI) * 0.3;
            const origScale = state.celebration.originalScale;
            winnerMesh.scale.set(
                origScale.x * scaleBoost,
                origScale.y * scaleBoost,
                origScale.z * scaleBoost
            );
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

    // Only update the celebration mixer (player/opponent mixers are stopped)
    // The celebrateMixer is already updated above when usedCelebrateModel is true

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

        // Clean up custom celebration mesh if used
        if (state.celebration.customCelebrateMesh) {
            scene.remove(state.celebration.customCelebrateMesh);
            state.celebration.customCelebrateMesh = null;
            if (playerMesh) playerMesh.visible = true;
        }

        // Restore loser mesh visibility
        if (state.celebration.loserMesh) {
            state.celebration.loserMesh.visible = true;
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

    // Can't catch while in portal transition
    if (isInPortalTransition()) return;

    // Can't catch invisible hider
    if (state.hiderInvisible) return;

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

    // Can't catch while in portal transition
    if (isInPortalTransition()) return;

    // Can't catch invisible hider
    if (state.hiderInvisible) return;

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
    // Freeze movement during portal transition
    if (isInPortalTransition()) {
        sendPosition(); // Still send position updates
        return;
    }

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
        state.player.angle = Math.atan2(dx, dz);
    }

    let baseSpeed = state.role === 'seeker' ? CONFIG.SEEKER_SPEED : CONFIG.HIDER_SPEED;

    // Speed powerup for hider
    if (state.role === 'hider' && state.hiderSpeedBoosted) {
        baseSpeed *= 1.5;
    }

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

    // Check portal teleportation
    checkPortalTeleport();

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

    // Skip wall collision if hider is in phase walk mode
    if (state.hiderPhaseWalk && state.role === 'hider') {
        return result;
    }

    const r = CONFIG.PLAYER_RADIUS;

    // Check collision with 3D model colliders (circular)
    for (const collider of modelColliders) {
        const dx = x - collider.x;
        const dz = z - collider.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const minDist = r + collider.radius;

        if (dist < minDist) {
            // Push player away from model center
            const pushDist = minDist - dist;
            const angle = Math.atan2(dz, dx);
            result.x = true;
            result.z = true;
            result.pushX = Math.cos(angle) * pushDist;
            result.pushZ = Math.sin(angle) * pushDist;
            return result;
        }
    }

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
    // Skip if hider is in phase walk mode
    if (state.hiderPhaseWalk && state.role === 'hider') {
        return;
    }

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

    const angleToPoint = Math.atan2(dx, dz);  // Match player angle coordinate system
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
    // Check if seeker is frozen by powerup
    if (state.seekerFrozen) {
        return; // Don't move while frozen
    }

    const ai = state.ai;

    // Initialize AI navigation state if needed
    if (!ai.lastPosition) {
        ai.lastPosition = { x: state.opponent.x, z: state.opponent.z };
        ai.stuckTimer = 0;
        ai.waypoint = null;
        ai.waypointTime = 0;
        ai.failedDirections = [];
        ai.lastDirectAngle = null;
        ai.portalCooldown = 0;
        ai.totalStuckTime = 0;
        ai.positionHistory = [];
        ai.oscillationCount = 0;
        ai.explorationTarget = null;
    }

    const aiX = state.opponent.x;
    const aiZ = state.opponent.z;
    const playerX = state.player.x;
    const playerZ = state.player.z;

    // Track position history for oscillation detection
    ai.positionHistory = ai.positionHistory || [];
    ai.positionHistory.push({ x: aiX, z: aiZ });
    if (ai.positionHistory.length > 30) ai.positionHistory.shift();

    // Detect oscillation (back and forth movement)
    if (ai.positionHistory.length >= 15) {
        let backtrackCount = 0;
        const recent = ai.positionHistory.slice(-15);
        for (let i = 5; i < recent.length; i++) {
            for (let j = 0; j < i - 3; j++) {
                const d = Math.sqrt(Math.pow(recent[i].x - recent[j].x, 2) + Math.pow(recent[i].z - recent[j].z, 2));
                if (d < 5) backtrackCount++;
            }
        }
        ai.oscillationCount = ai.oscillationCount || 0;
        ai.oscillationCount = backtrackCount > 10 ? ai.oscillationCount + 1 : Math.max(0, ai.oscillationCount - 1);
    }

    // Decrease AI portal cooldown
    if (ai.portalCooldown > 0) {
        ai.portalCooldown -= deltaTime;
    }

    // Check if AI is stuck (hasn't moved much recently)
    const movedDist = Math.sqrt(
        Math.pow(state.opponent.x - ai.lastPosition.x, 2) +
        Math.pow(state.opponent.z - ai.lastPosition.z, 2)
    );

    if (movedDist < 0.5) {
        ai.stuckTimer += deltaTime;
        ai.totalStuckTime += deltaTime;
    } else {
        ai.stuckTimer = 0;
        ai.totalStuckTime = 0;
        ai.lastPosition = { x: state.opponent.x, z: state.opponent.z };
        if (movedDist > 2) {
            ai.failedDirections = [];
        }
    }

    const distToPlayer = Math.sqrt(Math.pow(playerX - aiX, 2) + Math.pow(playerZ - aiZ, 2));
    const angleToPlayer = Math.atan2(playerZ - aiZ, playerX - aiX);
    const wallBlocking = isWallBlockingPath(aiX, aiZ, playerX, playerZ);

    // SMART PORTAL: Proactively use portal if player is on opposite side and path blocked
    if (ai.portalCooldown <= 0 && portals.length >= 2 && wallBlocking && distToPlayer > 40) {
        const aiSide = aiX < 0 ? 'left' : 'right';
        const playerSide = playerX < 0 ? 'left' : 'right';

        if (aiSide !== playerSide) {
            let bestPortal = null;
            let bestBenefit = 0;

            for (const portal of portals) {
                const distToPortal = Math.sqrt(Math.pow(aiX - portal.x, 2) + Math.pow(aiZ - portal.z, 2));
                const exitDistToPlayer = Math.sqrt(Math.pow(portal.targetX - playerX, 2) + Math.pow(portal.targetZ - playerZ, 2));
                const benefit = (distToPlayer - exitDistToPlayer) - (distToPortal * 0.3);
                if (benefit > bestBenefit) {
                    bestBenefit = benefit;
                    bestPortal = portal;
                }
            }

            if (bestPortal && bestBenefit > 15) {
                const distToPortal = Math.sqrt(Math.pow(aiX - bestPortal.x, 2) + Math.pow(aiZ - bestPortal.z, 2));
                if (distToPortal < 5) {
                    // Teleport through portal
                    state.opponent.x = bestPortal.targetX;
                    state.opponent.z = bestPortal.targetZ;
                    if (opponentMesh) {
                        opponentMesh.position.x = bestPortal.targetX;
                        opponentMesh.position.z = bestPortal.targetZ;
                    }
                    ai.portalCooldown = 5000;
                    ai.waypoint = null;
                    ai.failedDirections = [];
                    ai.oscillationCount = 0;
                    ai.explorationTarget = null;
                    console.log('AI used portal strategically!');
                    return;
                } else {
                    // Navigate to portal (AI seeker 20% slower)
                    moveAIToward(bestPortal.x, bestPortal.z, CONFIG.SEEKER_SPEED * 0.8, deltaTime);
                    return;
                }
            }
        }
    }

    // If oscillating or stuck too long, enter exploration mode
    if ((ai.oscillationCount || 0) > 4 || ai.totalStuckTime > 500) {
        const angleToPlayer = Math.atan2(playerZ - aiZ, playerX - aiX);
        ai.explorationTarget = null;

        // Try portal areas first - they're guaranteed clear
        for (const portal of portals) {
            const d = Math.sqrt(Math.pow(aiX - portal.x, 2) + Math.pow(aiZ - portal.z, 2));
            if (d > 15 && !isWallBlockingPath(aiX, aiZ, portal.x, portal.z)) {
                ai.explorationTarget = { x: portal.x, z: portal.z };
                break;
            }
        }

        // Try perpendicular and opposite directions
        if (!ai.explorationTarget) {
            const angles = [angleToPlayer + Math.PI/2, angleToPlayer - Math.PI/2, angleToPlayer + Math.PI];
            for (const angle of angles) {
                for (const dist of [50, 70, 90]) {
                    const tx = aiX + Math.cos(angle) * dist;
                    const tz = aiZ + Math.sin(angle) * dist;
                    if (Math.sqrt(tx*tx + tz*tz) < CONFIG.ARENA_RADIUS - 10 &&
                        isPositionClear(tx, tz) && !isWallBlockingPath(aiX, aiZ, tx, tz)) {
                        ai.explorationTarget = { x: tx, z: tz };
                        break;
                    }
                }
                if (ai.explorationTarget) break;
            }
        }

        ai.oscillationCount = 0;
        ai.totalStuckTime = 0;
        ai.failedDirections = [];
    }

    // Exploration mode - move to new area to find path
    if (ai.explorationTarget) {
        const d = Math.sqrt(Math.pow(ai.explorationTarget.x - aiX, 2) + Math.pow(ai.explorationTarget.z - aiZ, 2));
        if (d < 8 || !wallBlocking) {
            ai.explorationTarget = null;
        } else {
            moveAIToward(ai.explorationTarget.x, ai.explorationTarget.z, CONFIG.SEEKER_SPEED * 0.8, deltaTime);
            return;
        }
    }

    // If stuck briefly, find a new waypoint
    if (ai.stuckTimer > 100) {
        if (ai.lastDirectAngle !== null) {
            ai.failedDirections.push(ai.lastDirectAngle);
            if (ai.failedDirections.length > 8) ai.failedDirections.shift();
        }
        ai.waypoint = findBestWaypoint(aiX, aiZ, playerX, playerZ, ai.failedDirections);
        ai.waypointTime = 0;
        ai.stuckTimer = 0;
    }

    // If we have a waypoint, navigate to it
    if (ai.waypoint) {
        ai.waypointTime += deltaTime;

        const toWaypointX = ai.waypoint.x - aiX;
        const toWaypointZ = ai.waypoint.z - aiZ;
        const distToWaypoint = Math.sqrt(toWaypointX * toWaypointX + toWaypointZ * toWaypointZ);

        // Check if we reached the waypoint or have clear line to player
        if (distToWaypoint < 5 || ai.waypointTime > 1500 ||
            !isWallBlockingPath(aiX, aiZ, playerX, playerZ)) {
            ai.waypoint = null;
            ai.waypointTime = 0;
        } else {
            ai.lastDirectAngle = Math.atan2(toWaypointZ, toWaypointX);
            // AI seeker 20% slower when navigating
            moveAIToward(ai.waypoint.x, ai.waypoint.z, CONFIG.SEEKER_SPEED * 0.76, deltaTime);
            return;
        }
    }

    // If wall is blocking and no waypoint, find one
    if (wallBlocking) {
        ai.waypoint = findBestWaypoint(aiX, aiZ, playerX, playerZ, ai.failedDirections);
        if (ai.waypoint) {
            ai.waypointTime = 0;
            const toWaypointX = ai.waypoint.x - aiX;
            const toWaypointZ = ai.waypoint.z - aiZ;
            ai.lastDirectAngle = Math.atan2(toWaypointZ, toWaypointX);
            // AI seeker 20% slower when navigating
            moveAIToward(ai.waypoint.x, ai.waypoint.z, CONFIG.SEEKER_SPEED * 0.76, deltaTime);
            return;
        }
    }

    // Direct chase mode - clear path to player
    ai.state = 'chase';
    ai.lastDirectAngle = angleToPlayer;

    // Add slight prediction - aim slightly ahead of player movement
    const playerVelX = state.player.velocityX || 0;
    const playerVelZ = state.player.velocityZ || 0;
    const predictionTime = 0.3;

    ai.targetX = playerX + playerVelX * predictionTime;
    ai.targetZ = playerZ + playerVelZ * predictionTime;

    // AI seeker 20% slower when chasing
    moveAIToward(ai.targetX, ai.targetZ, CONFIG.SEEKER_SPEED * 0.8, deltaTime);
}

// Try to use a portal to get unstuck - returns true if teleported
function tryAIPortal() {
    if (portals.length < 2) return false;

    const aiX = state.opponent.x;
    const aiZ = state.opponent.z;
    const playerX = state.player.x;
    const playerZ = state.player.z;

    // Find the nearest portal to the AI
    let nearestPortal = null;
    let nearestDist = Infinity;

    for (const portal of portals) {
        const dx = aiX - portal.x;
        const dz = aiZ - portal.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestPortal = portal;
        }
    }

    if (!nearestPortal || nearestDist > 100) return false; // Too far from any portal

    // Calculate distance from AI to player currently
    const currentDistToPlayer = Math.sqrt(
        Math.pow(aiX - playerX, 2) + Math.pow(aiZ - playerZ, 2)
    );

    // Calculate distance from portal exit to player
    const exitDistToPlayer = Math.sqrt(
        Math.pow(nearestPortal.targetX - playerX, 2) +
        Math.pow(nearestPortal.targetZ - playerZ, 2)
    );

    // Only use portal if it gets us closer to the player
    if (exitDistToPlayer < currentDistToPlayer - 20) {
        // Move AI toward the portal first if not close enough
        if (nearestDist > 5) {
            // Navigate toward portal
            state.ai.waypoint = { x: nearestPortal.x, z: nearestPortal.z };
            return false;
        }

        // Teleport AI to the other portal
        state.opponent.x = nearestPortal.targetX;
        state.opponent.z = nearestPortal.targetZ;

        // Update the opponent mesh position
        if (opponentMesh) {
            opponentMesh.position.x = nearestPortal.targetX;
            opponentMesh.position.z = nearestPortal.targetZ;
        }

        console.log('AI used portal to teleport!');
        return true;
    }

    return false;
}

// Check if a wall is blocking the path between two points
function isWallBlockingPath(x1, z1, x2, z2) {
    const steps = 10;
    const dx = (x2 - x1) / steps;
    const dz = (z2 - z1) / steps;

    for (let i = 1; i < steps; i++) {
        const checkX = x1 + dx * i;
        const checkZ = z1 + dz * i;

        for (const wall of currentBoard.walls) {
            if (checkX >= wall.x && checkX <= wall.x + wall.w &&
                checkZ >= wall.z && checkZ <= wall.z + wall.d) {
                return true;
            }
        }
    }
    return false;
}

// Find the best waypoint to navigate around walls to reach the player
function findBestWaypoint(aiX, aiZ, playerX, playerZ, failedDirections) {
    const angleToPlayer = Math.atan2(playerZ - aiZ, playerX - aiX);

    // Try multiple distances and angles to find a clear path
    const distances = [15, 25, 40, 60];
    const angleOffsets = [
        Math.PI / 4, -Math.PI / 4,      // 45 degrees
        Math.PI / 2, -Math.PI / 2,      // 90 degrees
        Math.PI * 3/4, -Math.PI * 3/4,  // 135 degrees
        Math.PI / 6, -Math.PI / 6,      // 30 degrees
        Math.PI * 2/3, -Math.PI * 2/3   // 120 degrees
    ];

    let bestWaypoint = null;
    let bestScore = -Infinity;

    for (const dist of distances) {
        for (const offset of angleOffsets) {
            const angle = angleToPlayer + offset;

            // Skip if this direction recently failed
            let isFailed = false;
            for (const failedAngle of failedDirections) {
                if (Math.abs(normalizeAngle(angle - failedAngle)) < Math.PI / 6) {
                    isFailed = true;
                    break;
                }
            }
            if (isFailed) continue;

            const waypointX = aiX + Math.cos(angle) * dist;
            const waypointZ = aiZ + Math.sin(angle) * dist;

            // Check if waypoint position is clear
            if (!isPositionClear(waypointX, waypointZ)) continue;

            // Check if we can reach the waypoint
            if (isWallBlockingPath(aiX, aiZ, waypointX, waypointZ)) continue;

            // Check if waypoint has better line of sight to player
            const canSeePlayer = !isWallBlockingPath(waypointX, waypointZ, playerX, playerZ);

            // Score the waypoint
            const distFromWaypointToPlayer = Math.sqrt(
                Math.pow(playerX - waypointX, 2) + Math.pow(playerZ - waypointZ, 2)
            );

            let score = 0;
            if (canSeePlayer) score += 100; // Big bonus for clear sight
            score -= distFromWaypointToPlayer * 0.5; // Prefer closer to player
            score -= Math.abs(offset) * 10; // Slight preference for smaller angle changes
            score += dist * 0.2; // Slight preference for farther waypoints

            if (score > bestScore) {
                bestScore = score;
                bestWaypoint = { x: waypointX, z: waypointZ };
            }
        }
    }

    // If no good waypoint found, try a random clear direction
    if (!bestWaypoint) {
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const waypointX = aiX + Math.cos(angle) * 20;
            const waypointZ = aiZ + Math.sin(angle) * 20;

            if (isPositionClear(waypointX, waypointZ) &&
                !isWallBlockingPath(aiX, aiZ, waypointX, waypointZ)) {
                bestWaypoint = { x: waypointX, z: waypointZ };
                break;
            }
        }
    }

    return bestWaypoint;
}

// Check if a position is clear of walls and within bounds
function isPositionClear(x, z) {
    const r = CONFIG.PLAYER_RADIUS + 2;

    // Check arena bounds
    const distFromCenter = Math.sqrt(x * x + z * z);
    if (distFromCenter > CONFIG.ARENA_RADIUS - r) return false;

    // Check walls
    for (const wall of currentBoard.walls) {
        if (x + r > wall.x && x - r < wall.x + wall.w &&
            z + r > wall.z && z - r < wall.z + wall.d) {
            return false;
        }
    }

    return true;
}

// Normalize angle to -PI to PI
function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
}

function updateHiderAI(deltaTime) {
    const ai = state.ai;

    // Initialize hider AI state
    if (!ai.hiderLastPosition) {
        ai.hiderLastPosition = { x: state.opponent.x, z: state.opponent.z };
        ai.hiderStuckTimer = 0;
        ai.hiderUnstuckAngle = 0;
        ai.hiderUnstuckTime = 0;
        ai.pauseTimer = 0; // Occasional pause to make catchable
    }

    // Check if hider is stuck
    const movedDist = Math.sqrt(
        Math.pow(state.opponent.x - ai.hiderLastPosition.x, 2) +
        Math.pow(state.opponent.z - ai.hiderLastPosition.z, 2)
    );

    if (movedDist < 0.5) {
        ai.hiderStuckTimer += deltaTime;
    } else {
        ai.hiderStuckTimer = 0;
        ai.hiderLastPosition = { x: state.opponent.x, z: state.opponent.z };
    }

    // If stuck, escape in random direction
    if (ai.hiderStuckTimer > 400) {
        ai.hiderUnstuckAngle = Math.random() * Math.PI * 2;
        ai.hiderUnstuckTime = 600;
        ai.hiderStuckTimer = 0;
    }

    // Unstuck mode
    if (ai.hiderUnstuckTime > 0) {
        ai.hiderUnstuckTime -= deltaTime;
        ai.targetX = state.opponent.x + Math.cos(ai.hiderUnstuckAngle) * 15;
        ai.targetZ = state.opponent.z + Math.sin(ai.hiderUnstuckAngle) * 15;
        moveAIToward(ai.targetX, ai.targetZ, CONFIG.HIDER_SPEED * 0.75, deltaTime);
        return;
    }

    // Occasional pause to make the hider catchable (small chance to pause for 500-1000ms)
    if (ai.pauseTimer > 0) {
        ai.pauseTimer -= deltaTime;
        return; // Don't move during pause
    }
    if (Math.random() < 0.003) { // Small chance to pause
        ai.pauseTimer = 500 + Math.random() * 500;
        return;
    }

    // ALWAYS flee from the seeker
    ai.state = 'flee';

    const distToSeeker = Math.sqrt(
        Math.pow(state.opponent.x - state.player.x, 2) +
        Math.pow(state.opponent.z - state.player.z, 2)
    );

    // Calculate flee direction (away from seeker)
    let fleeAngle = Math.atan2(
        state.opponent.z - state.player.z,
        state.opponent.x - state.player.x
    );

    // Add randomness to flee direction (makes it less perfect, easier to catch)
    // More random when seeker is far, more direct when close
    const randomness = distToSeeker > 25 ? 0.8 : 0.3;
    fleeAngle += (Math.random() - 0.5) * randomness;

    // Set target position away from seeker
    const fleeDist = 20 + Math.random() * 10;
    ai.targetX = state.opponent.x + Math.cos(fleeAngle) * fleeDist;
    ai.targetZ = state.opponent.z + Math.sin(fleeAngle) * fleeDist;

    // Keep within arena bounds
    const targetDist = Math.sqrt(ai.targetX * ai.targetX + ai.targetZ * ai.targetZ);
    if (targetDist > CONFIG.ARENA_RADIUS - 10) {
        // If hitting arena edge, run along the edge instead
        const edgeAngle = Math.atan2(ai.targetZ, ai.targetX);
        const tangentAngle = edgeAngle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
        ai.targetX = state.opponent.x + Math.cos(tangentAngle) * fleeDist;
        ai.targetZ = state.opponent.z + Math.sin(tangentAngle) * fleeDist;
    }

    // Move toward target - noticeably slower than seeker so player can catch up
    moveAIToward(ai.targetX, ai.targetZ, CONFIG.HIDER_SPEED * 0.75, deltaTime);
}

function canAISeePoint(px, pz) {
    // Check if AI (opponent) can see a point
    // If AI is seeker and player (hider) is invisible, can't see them
    if (state.role === 'hider' && state.hiderInvisible) {
        return false;
    }

    const dx = px - state.opponent.x;
    const dz = pz - state.opponent.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > CONFIG.SEEKER_VIEW_RANGE) return false;

    const angleToPoint = Math.atan2(dx, dz);  // Match player angle coordinate system
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

    const angleToPoint = Math.atan2(dx, dz);  // Match player angle coordinate system
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
    state.opponent.angle = Math.atan2(dirX, dirZ);

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

    // Update collectibles
    updateCollectibleAnimations();
    updatePowerupEffects();
    checkCollectibleCollision(state.player.x, state.player.z, state.role === 'hider');

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

    // Speed up animation when boosting (no model swap to avoid freeze)
    if (state.role === 'seeker' && playerMesh && playerMesh.userData.walkAction) {
        if (state.player.boosting) {
            playerMesh.userData.walkAction.timeScale = 2.0; // Faster animation when boosting
        } else {
            playerMesh.userData.walkAction.timeScale = 1.5; // Normal speed
        }
    }

    // Update player mesh with walking animation
    if (playerMesh) {
        playerMesh.position.set(state.player.x, 0, state.player.z);
        // Rotate to face walking direction
        // Apply skin-specific rotation offset if defined (for models that face backwards)
        const selectedSkin = StoreManager.getSelectedSkin();
        const rotationOffset = selectedSkin?.rotationOffset || 0;
        playerMesh.rotation.y = state.player.angle + rotationOffset;

        // Play/pause walking animation based on movement
        if (playerMesh.userData.walkAction) {
            if (isMoving || state.player.boosting) {
                playerMesh.userData.walkAction.paused = false;
                playerMesh.userData.walkAction.enabled = true;
            } else {
                playerMesh.userData.walkAction.paused = true;
            }
        }

        // Update animation mixer - use stored mixer or global
        const mixer = playerMesh.userData.mixer || playerMixer;
        if (mixer) {
            // Ensure delta is reasonable (cap at 0.1 to prevent jumps)
            const safeDelta = Math.min(delta, 0.1);
            mixer.update(safeDelta > 0 ? safeDelta : 0.016);
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
        // Visibility: hider can always see seeker, but seeker can't see invisible hider
        let visible = state.role === 'hider' ||
            isPointVisible(state.opponent.x, state.opponent.z);

        // If playing as seeker and opponent (hider) is invisible, hide them
        if (state.role === 'seeker' && state.hiderInvisible) {
            visible = false;
        }

        opponentMesh.visible = visible;

        opponentMesh.position.set(state.opponent.x, 0, state.opponent.z);
        // Rotate to face walking direction
        opponentMesh.rotation.y = state.opponent.angle;

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
    // Check for board-specific camera zoom (zoomed out 15% for full board visibility)
    const board = BOARDS[state.boardIndex] || BOARDS[0];
    const zoom = board.cameraZoom || 1;
    const cameraHeight = 52 * zoom;
    const cameraDistance = 29 * zoom;

    // Add screen shake
    let shakeX = 0, shakeZ = 0;
    if (state.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * state.screenShake * 0.5;
        shakeZ = (Math.random() - 0.5) * state.screenShake * 0.5;
        state.screenShake *= 0.9;
    }

    // Camera always centered on arena (0,0) for consistent view
    camera.position.set(
        0 + shakeX,
        cameraHeight,
        0 + cameraDistance + shakeZ
    );
    camera.lookAt(0, 0, 0);

    // Update theme-specific effects (particles, lights, etc.)
    updateThemeEffects();
    updateDoors();
    updatePortals(0.016); // ~60fps delta time
    updatePortalTransition(0.016); // Update portal transition effect

    // Update environmental effects
    updateDustParticles();

    // Spawn dust when player moves near objects
    if (isMoving) {
        const playerSpeed = state.player.boosting ? CONFIG.BOOST_SPEED :
            (state.role === 'seeker' ? CONFIG.SEEKER_SPEED : CONFIG.HIDER_SPEED);
        spawnDustNearObjects(state.player.x, state.player.z, playerSpeed);
    }

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

    // Get selected board from dropdown
    const boardSelect = document.getElementById('board-select');
    currentBoardIndex = boardSelect ? parseInt(boardSelect.value) : 0;
    startGame();
}

function init() {
    initElements();
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
        cleanupPortalTransition();
        showScreen('menu');
    });

    elements.homeBtn.addEventListener('click', () => {
        if (state.peer) state.peer.destroy();
        state.isSoloMode = false;
        state.gameStarted = false;
        state.gameOver = false;
        cleanupPortalTransition();
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

let homePreviewScene, homePreviewCamera, homePreviewRenderer, homePreviewMixer, homePreviewCharacter;

function initCharacterPreview() {
    const container = document.getElementById('character-preview');
    if (!container) return;

    // Create scene
    homePreviewScene = new THREE.Scene();
    homePreviewScene.background = null; // Transparent background

    // Camera
    homePreviewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    homePreviewCamera.position.set(0, 3, 6);
    homePreviewCamera.lookAt(0, 1.5, 0);

    // Renderer
    homePreviewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    homePreviewRenderer.setSize(200, 200);
    homePreviewRenderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(homePreviewRenderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    homePreviewScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    homePreviewScene.add(directionalLight);

    // Load character based on selected skin
    const selectedSkin = StoreManager.getSelectedSkin();
    const loader = new THREE.GLTFLoader();
    if (typeof dracoLoader !== 'undefined') {
        loader.setDRACOLoader(dracoLoader);
    }

    // Use skin's scale for preview (scaled down for home preview)
    const previewScale = (selectedSkin.scale || 6) / 3;

    loader.load(selectedSkin.path,
        (gltf) => {
            homePreviewCharacter = gltf.scene;
            homePreviewCharacter.scale.set(previewScale, previewScale, previewScale);
            homePreviewCharacter.position.set(0, 0, 0);

            homePreviewScene.add(homePreviewCharacter);

            // Setup animation
            if (gltf.animations && gltf.animations.length > 0) {
                homePreviewMixer = new THREE.AnimationMixer(homePreviewCharacter);
                const action = homePreviewMixer.clipAction(gltf.animations[0]);
                action.setLoop(THREE.LoopRepeat, Infinity);
                // Slow down all animations on home page (40% slower)
                action.timeScale = selectedSkin.id === 'firefighter' ? 0.72 : 0.9;
                action.play();
            }

            animateHomePreview();
        }
    );
}

function animateHomePreview() {
    requestAnimationFrame(animateHomePreview);

    if (homePreviewMixer) {
        homePreviewMixer.update(0.016);
    }

    // Slowly rotate character
    if (homePreviewCharacter) {
        homePreviewCharacter.rotation.y += 0.01;
    }

    if (homePreviewRenderer && homePreviewScene && homePreviewCamera) {
        homePreviewRenderer.render(homePreviewScene, homePreviewCamera);
    }
}

function refreshHomePreview() {
    // Make sure scene is initialized
    if (!homePreviewScene) {
        console.log('Home preview scene not ready, initializing...');
        initCharacterPreview();
        return;
    }

    // Remove ALL non-light objects from scene (comprehensive cleanup)
    const toRemove = [];
    homePreviewScene.children.forEach((child) => {
        if (child.type !== 'AmbientLight' && child.type !== 'DirectionalLight') {
            toRemove.push(child);
        }
    });
    toRemove.forEach(obj => homePreviewScene.remove(obj));
    homePreviewCharacter = null;
    homePreviewMixer = null;

    // Load the currently selected skin
    const selectedSkin = StoreManager.getSelectedSkin();
    console.log('Refreshing home preview with skin:', selectedSkin.name, selectedSkin.path);

    const loader = new THREE.GLTFLoader();
    if (typeof dracoLoader !== 'undefined') {
        loader.setDRACOLoader(dracoLoader);
    }

    // Use skin's scale for preview (scaled down for home preview)
    const previewScale = (selectedSkin.scale || 6) / 3; // Divide by 3 for home preview size

    loader.load(selectedSkin.path,
        (gltf) => {
            homePreviewCharacter = gltf.scene;
            homePreviewCharacter.scale.set(previewScale, previewScale, previewScale);
            homePreviewCharacter.position.set(0, 0, 0);

            homePreviewScene.add(homePreviewCharacter);

            // Setup animation
            if (gltf.animations && gltf.animations.length > 0) {
                homePreviewMixer = new THREE.AnimationMixer(homePreviewCharacter);
                const action = homePreviewMixer.clipAction(gltf.animations[0]);
                action.setLoop(THREE.LoopRepeat, Infinity);
                // Slow down all animations on home page (40% slower)
                action.timeScale = selectedSkin.id === 'firefighter' ? 0.72 : 0.9;
                action.play();
            }
            console.log('Home preview updated to:', selectedSkin.name);
        },
        null,
        (error) => {
            console.error('Failed to load home preview skin:', error);
        }
    );
}

// Initialize preview when page loads
setTimeout(initCharacterPreview, 100);

init();

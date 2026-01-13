# Hide & Seek Online

A two-player online hide and seek game with real-time multiplayer, multiple boards, and asymmetric gameplay.

## Quick Start

```bash
cd ~/hide-and-seek-game
npx serve . -p 3000
```

Then open `http://localhost:3000` in browser.

For mobile/second player on same network: `http://<your-ip>:3000`

---

## Known Issues & Development Notes

### Character Rotation System (COMPLEX - Handle with Care)

The rotation system involves multiple interconnected parts. Changes can easily break things.

#### How It Works:
1. **Angle Calculation**: `Math.atan2(-dx, -dz)` - Note the NEGATION of both parameters
2. **Player Mesh Rotation**: `playerMesh.rotation.y = state.player.angle + rotationOffset`
3. **Vision Cone Rotation**: `meshRotation + Math.PI/2` (compensates for cone geometry pointing +X)
4. **Visibility Check**: Uses `playerMesh.rotation.y` directly

#### Key Variables:
- `state.player.angle` - Movement direction (radians)
- `rotationOffset` - Per-skin correction (most skins use `Math.PI`, some use `0`)
- `playerMesh.rotation.y` - Actual 3D mesh rotation

#### SKINS rotationOffset:
- **With `rotationOffset: Math.PI`**: default_seeker, default_hider, ghost, robot, firefighter, dark_warrior, cyber_girl, cyber_warrior
- **Without rotationOffset (0)**: penguin, mushroom_man, cat

#### What Breaks Easily:
- Changing angle formula without updating ALL places that use it
- Vision cone and visibility check getting out of sync
- Forgetting to copy rotationOffset when cloning meshes

### AI Hider Movement (PROBLEMATIC)

The AI hider system has been extensively rewritten due to freezing/stuck issues.

#### Current Implementation (game3d.js `updateHiderAI`):
- **Direct position updates** - Does NOT use `moveAIToward()` function
- **Simple wall push** - If inside wall, pushes to nearest edge (doesn't block)
- **Always runs away** - Calculates direction away from seeker every frame
- **Edge sliding** - At arena edge, slides along it

#### Issues Encountered & Solutions Tried:

| Issue | Cause | What Didn't Work | What Worked |
|-------|-------|------------------|-------------|
| AI spinning in circles | `moveAIToward` updating angle every frame even when blocked | Complex pathfinding, stuck detection | Only update angle when actually moved > 0.1 units |
| AI frozen/not moving | `checkAIWallCollision` blocking all movement | Target-based movement, retarget timers | Bypass collision system entirely, direct position updates |
| AI running toward seeker | Random angles included toward-seeker directions | Complex angle scoring | Always use `awayAngle = atan2(aiZ - playerZ, aiX - playerX)` |
| AI glitching back/forth | Stuck detection triggering too often, changing direction every frame | 45-degree rotation every 5 frames | Remove stuck detection, just move directly |

#### DO NOT:
- Use `moveAIToward()` for hider - the wall collision blocks movement
- Use complex pathfinding - it fails when all paths seem blocked
- Add "stuck detection" that changes direction frequently - causes spinning
- Use random angles - they can point toward the seeker

#### DO:
- Update position directly: `state.opponent.x = newX`
- Use simple wall push (push out, don't block)
- Always calculate direction away from seeker
- Keep it simple - complex logic has failed repeatedly

### Vision Cone System

#### Components:
1. **Visual Cone** (`visionConeMesh`) - What the player sees
2. **Visibility Check** (`isPointVisible()`) - Determines if opponent is visible
3. **CONFIG.SEEKER_VIEW_ANGLE** - Currently `Math.PI / 4.5` (~40 degrees each side)

#### Cone Geometry:
- Created as `ConeGeometry` pointing +Y
- Rotated with `rotateZ(-Math.PI / 2)` to point +X
- Mesh rotation: `meshRotation + Math.PI/2` to align with player facing

#### Visibility Check Must Match Cone:
```javascript
// In isPointVisible():
const facingAngle = playerMesh.rotation.y;  // Use mesh rotation directly
const angleToPoint = Math.atan2(dx, dz);    // Standard atan2 (NOT negated)
```

### Wall Collision Functions

| Function | Purpose | Notes |
|----------|---------|-------|
| `checkAIWallCollision(x, z)` | Check if AI position collides with walls | Returns push direction, can block movement |
| `isWallBlockingPath(x1, z1, x2, z2)` | Check if path between two points is blocked | Samples 10 points along path |
| `pushAIOutOfWalls()` | Emergency function to push AI out if stuck inside wall | Called after movement |

**WARNING**: These functions can cause AI to freeze if they block all possible movements.

---

## Game Overview

### Core Concept
- Online multiplayer for exactly 2 players
- Players connect using a shared 4-character room code
- PeerJS for peer-to-peer WebRTC connections
- Roles randomly assigned: Seeker vs Hider

### Win Conditions
- **Seeker wins**: Catches the hider (touch/collision)
- **Hider wins**: Survives for 90 seconds

## Gameplay Mechanics

### Movement
| Role | Base Speed | Boost Speed |
|------|------------|-------------|
| Seeker | 3.5 | 6.0 |
| Hider | 2.8 | N/A |

- WASD or Arrow Keys to move
- Mobile: Virtual joystick (bottom-left)

### Seeker Abilities
- **Speed Boost**: Press SPACE (or BOOST button on mobile)
  - Duration: 1.5 seconds
  - Cooldown: 5 seconds

### Vision System

**Seeker Vision:**
- Limited field of view: 144 degrees (72 each side)
- View range: 280 units
- Walls block line of sight
- Areas outside vision are faded (50% opacity)
- Walls always visible in current board's color
- Hider is COMPLETELY INVISIBLE outside vision cone

**Hider Vision:**
- Full map visibility
- Minimap showing seeker position and vision cone
- Can see seeker at all times

## Boards (10 Total)

| # | Name | Wall Color | Theme |
|---|------|------------|-------|
| 1 | The Courtyard | Red | Center structure with corners |
| 2 | The Maze | Orange | Corridor maze pattern |
| 3 | The Pillars | Purple | Grid of square pillars |
| 4 | The Spiral | Cyan | Spiral wall pattern |
| 5 | The Fortress | Gray | Castle with inner keep |
| 6 | The Grid | Green | Neon grid pattern |
| 7 | The Bunker | Brown | Underground bunker rooms |
| 8 | The Ruins | Teal | Scattered debris |
| 9 | The Lanes | Pink | Long horizontal corridors |

## Game Flow

1. Player 1 creates game, gets 4-char code
2. Player 2 enters code to join
3. Roles randomly assigned
4. 90-second round begins
5. Round ends (catch or timeout)
6. Victory celebration screen (5 sec)
7. Advance to next board
8. Roles swap
9. Repeat

## Technical Details

### Files
- `index.html` - Main HTML structure
- `styles.css` - All styling and animations
- `game.js` - Game logic, rendering, networking

### Configuration (game.js)
```javascript
const CONFIG = {
    ARENA_RADIUS: 400,
    PLAYER_RADIUS: 15,
    HIDER_SPEED: 2.8,
    SEEKER_SPEED: 3.5,
    BOOST_SPEED: 6,
    BOOST_DURATION: 1500,
    BOOST_COOLDOWN: 5000,
    SEEKER_VIEW_RANGE: 280,
    SEEKER_VIEW_ANGLE: Math.PI / 2.5, // 72 degrees
    GAME_DURATION: 90,
    CATCH_DISTANCE: 30
};
```

### Networking
- PeerJS for WebRTC peer-to-peer connections
- Room codes: 4 alphanumeric characters
- Messages: position updates, role assignment, catch events, board transitions

### Rendering
- HTML5 Canvas
- Pseudo-3D top-down view (0.85 Y-scale)
- 60 FPS game loop
- Raycasting for seeker vision (120 rays)

## Mobile Support

- Touch controls auto-detected
- Virtual joystick for movement
- Boost button for seeker
- Viewport locked to prevent zoom/scroll

## Adding New Boards

Add to `BOARDS` array in game.js:

```javascript
{
    name: "Board Name",
    style: {
        floor: '#1a1a2e',        // Floor color
        floorAccent: '#16213e',  // Floor gradient
        wallColor: '#cc3333',    // Wall fill
        wallHighlight: '#ff5555', // Wall border
        gridColor: 'rgba(79, 172, 254, 0.1)' // Grid lines
    },
    walls: [
        { x: -100, y: -50, w: 200, h: 20 },
        // ... more walls
    ]
}
```

Wall coordinates: Center is (0,0), arena radius is 400.

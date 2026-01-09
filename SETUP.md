# Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Add your assets:**
   - Place scene backgrounds in `public/assets/scenes/`
   - Place interactive object images in `public/assets/objects/`
   - Place sound files in `public/assets/sounds/`

4. **Edit scene content:**
   - Modify `data/scenes.json` to customize scenes, objects, and text
   - All text content is editable from JSON - no hardcoded strings

## Project Structure

```
TheCocoon/
├── src/
│   ├── main.js                 # Entry point
│   ├── core/                   # Core game systems
│   │   ├── Game.js            # Main game controller
│   │   ├── SceneManager.js    # Scene loading & transitions
│   │   ├── InteractionSystem.js # Click/hover handling
│   │   └── SoundManager.js    # Audio management
│   ├── scenes/                 # Scene implementations
│   │   ├── BaseScene.js       # Base scene class
│   │   └── [SceneName]Scene.js # Individual scenes
│   └── utils/                  # Utility classes
│       ├── AssetLoader.js     # Asset preloading
│       ├── Responsive.js      # Responsive scaling
│       └── MobileOrientation.js # Mobile orientation lock
├── data/
│   └── scenes.json            # Scene definitions (CMS-like)
├── public/
│   └── assets/                # Images, sounds, etc.
└── index.html                 # HTML entry point
```

## Adding a New Scene

1. **Create scene class** in `src/scenes/YourScene.js`:
   ```javascript
   import { BaseScene } from './BaseScene.js';
   
   export class YourScene extends BaseScene {
       // Override methods for custom behavior
   }
   ```

2. **Register in SceneManager** (`src/core/SceneManager.js`):
   ```javascript
   import { YourScene } from '../scenes/YourScene.js';
   
   const SCENE_CLASSES = {
       // ... existing scenes
       yourscene: YourScene
   };
   ```

3. **Add scene data** in `data/scenes.json`:
   ```json
   {
     "id": "yourscene",
     "name": "Your Scene",
     "background": "/assets/scenes/your-scene-bg.jpg",
     "ambientSound": {
       "src": "/assets/sounds/ambient-yourscene.mp3",
       "volume": 0.5
     },
     "interactiveObjects": [
       {
         "id": "object-1",
         "image": "/assets/objects/object.png",
         "x": 960,
         "y": 540,
         "travelTo": "otherscene"
       }
     ]
   }
   ```

## Interactive Object Properties

In `scenes.json`, each interactive object supports:

- `id`: Unique identifier
- `image`: Normal state image path
- `hoverImage`: Hover state image (optional)
- `x`, `y`: Position on screen
- `scale`: Scale factor (optional)
- `cursor`: Cursor type (default: "pointer")
- `hoverAnimation`: Enable hover scale animation
- `hoverScale`: Scale on hover (default: 1.05)
- `clickSound`: Sound file path for click
- `hoverSound`: Sound file path for hover
- `travelTo`: Scene ID to travel to on click
- `transition`: Transition type ("fade" or "slide")
- `stateChange`: Object state changes after interaction

## State Management

Objects can remember their state after interaction:

```json
{
  "stateChange": {
    "default": {
      "state": "used",
      "image": "/assets/objects/bell-used.png"
    }
  }
}
```

## Mobile Support

- Automatically detects mobile devices
- Locks to horizontal orientation
- Touch events work the same as clicks
- Responsive scaling maintains composition
- No vertical scrolling

## Performance Tips

- Images are preloaded on startup
- Scenes are lazy-loaded (only when needed)
- Sounds load on demand
- Transitions use hardware acceleration (GSAP)
- Asset loading shows progress bar

## Customization

### Change Starting Scene
Edit `src/core/Game.js`:
```javascript
await this.sceneManager.loadScene('your-scene-id');
```

### Add Custom Transitions
Edit `src/core/SceneManager.js` and add new transition types in `transitionOut()` and `transitionIn()` methods.

### Modify Interaction Behavior
Override `onObjectInteract()` in your scene class:
```javascript
onObjectInteract(objData, currentState) {
    // Custom behavior
    super.onObjectInteract(objData, currentState);
}
```

## Building for Production

```bash
npm run build
```

Output will be in `dist/` directory, ready to deploy.


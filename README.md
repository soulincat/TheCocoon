# The Cocoon Hotel - Interactive Experience

A browser-based point-and-click exploration game that tells a story while introducing the hotel.

## Features

- **Scene-based navigation**: Travel between illustrated scenes (intro, exterior, lobby, room, spa, restaurant, surroundings)
- **World-based navigation**: Click doors, paths, windows, and environmental elements to travel
- **Interactive objects**: Hover animations, cursor changes, click reactions, sound effects
- **State memory**: Objects remember their interaction state
- **Mobile support**: Horizontal orientation only, same experience as desktop
- **Responsive design**: Maintains composition while adapting to different screen sizes
- **Storytelling**: Ambient sound, animations, and minimal text guide the experience

## Tech Stack

- **PixiJS**: 2D rendering engine
- **GSAP**: Smooth transitions and animations
- **Howler.js**: Sound management and layering
- **Vite**: Build tool and dev server

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
  ├── main.js              # Entry point
  ├── core/
  │   ├── Game.js          # Main game controller
  │   ├── SceneManager.js  # Scene loading and transitions
  │   ├── InteractionSystem.js # Click/hover handling
  │   └── SoundManager.js  # Audio management
  ├── scenes/
  │   ├── BaseScene.js     # Base scene class
  │   └── [scene files]    # Individual scene implementations
  └── utils/
      ├── AssetLoader.js   # Asset preloading
      └── Responsive.js    # Responsive scaling
data/
  └── scenes.json          # Scene definitions and content
public/
  └── assets/              # Images, sounds, etc.
```

## Content Management

All text content is managed through JSON files in the `data/` directory. Edit `data/scenes.json` to modify scene content, interactive objects, and text.

## Design Principles

- **No scroll**: Full-screen scenes only
- **No menus**: Navigation is embedded in the world
- **No forced interactions**: Story is optional
- **Mobile equals desktop**: Same experience, different input method


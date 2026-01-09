# Assets Directory Structure

Place your assets in the following structure:

```
public/assets/
  ├── scenes/
  │   ├── intro-bg.jpg
  │   ├── exterior-bg.jpg
  │   ├── lobby-bg.jpg
  │   ├── room-bg.jpg
  │   ├── spa-bg.jpg
  │   ├── restaurant-bg.jpg
  │   └── surroundings-bg.jpg
  ├── objects/
  │   ├── door-main.png
  │   ├── door-main-hover.png
  │   ├── door-spa.png
  │   ├── door-spa-hover.png
  │   ├── door-restaurant.png
  │   ├── door-restaurant-hover.png
  │   ├── door-exit.png
  │   ├── door-exit-hover.png
  │   ├── elevator.png
  │   ├── elevator-hover.png
  │   ├── bell.png
  │   ├── bell-hover.png
  │   ├── bell-used.png
  │   ├── window.png
  │   ├── window-hover.png
  │   ├── path-nature.png
  │   └── path-nature-hover.png
  └── sounds/
      ├── ambient-intro.mp3
      ├── ambient-exterior.mp3
      ├── ambient-lobby.mp3
      ├── ambient-room.mp3
      ├── ambient-spa.mp3
      ├── ambient-restaurant.mp3
      ├── ambient-nature.mp3
      ├── door-open.mp3
      ├── bell-ring.mp3
      ├── elevator-ding.mp3
      ├── window-open.mp3
      └── footsteps.mp3
```

## Asset Requirements

### Scene Backgrounds
- Recommended size: 1920x1080px or higher
- Format: JPG or PNG
- Should be high quality, atmospheric illustrations

### Interactive Objects
- Recommended format: PNG with transparency
- Should have normal and hover states
- Size should be appropriate for the scene scale

### Sounds
- Format: MP3 or OGG
- Ambient sounds should loop seamlessly
- Effect sounds should be short and crisp

## Placeholder Assets

For development, you can use placeholder images and sounds. The game will work without assets, but you'll see console warnings for missing files.


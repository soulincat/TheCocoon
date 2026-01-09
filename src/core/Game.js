import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';
import { SceneManager } from './SceneManager.js';
import { SoundManager } from './SoundManager.js';
import { AssetLoader } from '../utils/AssetLoader.js';
import { Responsive } from '../utils/Responsive.js';
import { MobileOrientation } from '../utils/MobileOrientation.js';
import { SoundToggle } from './SoundToggle.js';

export class Game {
    constructor() {
        this.app = null;
        this.sceneManager = null;
        this.soundManager = null;
        this.assetLoader = null;
        this.responsive = null;
        this.soundToggle = null;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.state = {
            visitedScenes: new Set(),
            objectStates: new Map()
        };
    }

    async init() {
        // Create PixiJS application
        // In PixiJS v7.4, pass options directly to constructor
        // Ensure we get actual screen dimensions
        const screenWidth = window.innerWidth || 1920;
        const screenHeight = window.innerHeight || 1080;
        
        const appOptions = {
            width: screenWidth,
            height: screenHeight,
            backgroundColor: 0x000000,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            resizeTo: window
        };
        
        console.log('Initializing canvas with size:', screenWidth, 'x', screenHeight);

        try {
            // Try passing options directly to constructor (works in v7.4)
            this.app = new Application(appOptions);
            
            // Wait a moment for async initialization if needed
            if (!this.app.canvas) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.log('PixiJS Application initialized successfully');
        } catch (error) {
            console.error('PixiJS initialization error:', error);
            // Fallback: try with PIXI namespace
            try {
                this.app = new PIXI.Application(appOptions);
                console.log('PixiJS Application initialized with namespace import');
            } catch (fallbackError) {
                console.error('All initialization methods failed:', fallbackError);
                throw fallbackError;
            }
        }

        // Add canvas to DOM
        // In v7.4, canvas might be accessed as .canvas or .view
        const canvasElement = this.app.canvas || this.app.view;
        if (canvasElement) {
            document.getElementById('app').appendChild(canvasElement);
        } else {
            console.warn('Canvas element not found, waiting...');
            await new Promise(resolve => setTimeout(resolve, 200));
            const canvasElement2 = this.app.canvas || this.app.view;
            if (canvasElement2) {
                document.getElementById('app').appendChild(canvasElement2);
            } else {
                throw new Error('Could not find canvas element');
            }
        }

        // Store canvas reference for later use
        this.canvasElement = this.app.canvas || this.app.view;

        // Initialize systems
        this.responsive = new Responsive(this.app);
        this.soundManager = new SoundManager();
        this.assetLoader = new AssetLoader();
        this.sceneManager = new SceneManager(this.app, this.soundManager, this.state);
        
        // Initialize sound toggle button
        this.soundToggle = new SoundToggle(this.app, this.soundManager);
        this.soundToggle.addToStage(this.app.stage);
        // Pass sound toggle reference to scene manager
        this.sceneManager.setSoundToggle(this.soundToggle);
        
        // Initialize mobile orientation lock
        if (this.isMobile) {
            new MobileOrientation();
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        });

        // Prevent default touch behaviors (only if canvas exists)
        if (this.canvasElement) {
            this.canvasElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
            }, { passive: false });
            this.canvasElement.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        } else {
            console.warn('Canvas element not available for event listeners');
        }

        // Load assets and start
        await this.loadAssets();
        
        // Start background music (plays continuously across all scenes)
        this.startBackgroundMusic();
        
        await this.start();
    }

    startBackgroundMusic() {
        // Try to start background music
        const music = this.soundManager.playBackgroundMusic('/assets/thecocoon.m4a', { volume: 0.6 });
        
        // Handle browser autoplay restrictions - start on first user interaction if needed
        // Check if music failed to play (browser blocked autoplay)
        music.on('playerror', () => {
            // If autoplay was blocked, start on first user interaction
            const startOnInteraction = () => {
                music.play();
                document.removeEventListener('click', startOnInteraction);
                document.removeEventListener('touchstart', startOnInteraction);
            };
            
            document.addEventListener('click', startOnInteraction, { once: true });
            document.addEventListener('touchstart', startOnInteraction, { once: true });
        });
    }

    async loadAssets() {
        const loadingEl = document.getElementById('loading');
        const progressEl = document.getElementById('loading-progress');

        try {
            console.log('Loading scene data...');
            // Load scene data
            const response = await fetch('/data/scenes.json');
            if (!response.ok) {
                throw new Error(`Failed to load scenes.json: ${response.status}`);
            }
            const scenesData = await response.json();
            console.log('Scene data loaded:', scenesData);

        // Calculate total image assets (not sounds)
        const imageAssets = [];
        const soundAssets = [];
        
        scenesData.scenes.forEach(scene => {
            if (scene.background) imageAssets.push(scene.background);
            if (scene.ambientSound?.src) soundAssets.push(scene.ambientSound.src);
            scene.interactiveObjects?.forEach(obj => {
                if (obj.image) imageAssets.push(obj.image);
                if (obj.hoverImage) imageAssets.push(obj.hoverImage);
                if (obj.clickSound) soundAssets.push(obj.clickSound);
            });
        });

            // Load image assets with timeout
            let loaded = 0;
            const totalAssets = Math.max(imageAssets.length, 1); // Ensure at least 1 to avoid division by zero
            
            console.log(`Loading ${imageAssets.length} image assets...`);
            
            if (imageAssets.length === 0) {
                // No assets to load, set progress to 100%
                if (progressEl) {
                    progressEl.style.width = '100%';
                }
                console.log('No image assets to load');
            } else {
                // Load assets with timeout to prevent hanging
                const loadWithTimeout = (asset, timeout = 10000) => {
                    return Promise.race([
                        this.assetLoader.load(asset),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error(`Timeout loading ${asset}`)), timeout)
                        )
                    ]);
                };

                for (const asset of imageAssets) {
                    try {
                        console.log(`Loading asset: ${asset}`);
                        await loadWithTimeout(asset);
                        console.log(`Loaded: ${asset}`);
                    } catch (error) {
                        console.warn(`Failed to load image: ${asset}`, error);
                        // Continue loading other assets even if one fails
                    }
                    loaded++;
                    const progress = (loaded / imageAssets.length) * 100;
                    if (progressEl) {
                        progressEl.style.width = `${progress}%`;
                    }
                }
            }
            
            console.log('Asset loading complete');

            // Preload sounds (non-blocking, will load on demand)
            soundAssets.forEach(sound => {
                this.soundManager.loadSound(sound, sound, { preload: false });
            });
        } catch (error) {
            console.error('Error loading assets:', error);
            // Show error message
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div style="color: #ff6b6b;">Error loading assets</div>
                    <div style="font-size: 14px; margin-top: 10px; opacity: 0.7;">${error.message}</div>
                    <div style="font-size: 12px; margin-top: 20px; opacity: 0.5;">Check console for details</div>
                `;
            }
            throw error;
        }

        // Hide loading screen
        if (loadingEl) {
            loadingEl.style.opacity = '0';
            setTimeout(() => {
                loadingEl.style.display = 'none';
            }, 300);
        }
    }

    async start() {
        try {
            console.log('Starting game...');
            // Initialize scene manager with loaded data
            const response = await fetch('/data/scenes.json');
            if (!response.ok) {
                throw new Error(`Failed to load scenes.json: ${response.status}`);
            }
            const scenesData = await response.json();
            
            await this.sceneManager.init(scenesData);
            console.log('Scene manager initialized');
            
            // Start with intro scene
            console.log('Loading intro scene...');
            await this.sceneManager.loadScene('intro');
            console.log('Intro scene loaded');
        } catch (error) {
            console.error('Error starting game:', error);
            // Ensure loading screen is hidden even on error
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.innerHTML = `
                    <div style="color: #ff6b6b;">Error starting game</div>
                    <div style="font-size: 14px; margin-top: 10px; opacity: 0.7;">${error.message}</div>
                    <div style="font-size: 12px; margin-top: 20px; opacity: 0.5;">Check console for details</div>
                `;
            }
            throw error;
        }
    }

    handleResize() {
        if (this.app && this.responsive) {
            this.responsive.update();
            if (this.sceneManager) {
                this.sceneManager.handleResize();
            }
            if (this.soundToggle) {
                this.soundToggle.updatePosition();
            }
        }
    }
}


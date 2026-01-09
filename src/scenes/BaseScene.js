import * as PIXI from 'pixi.js';
import { InteractionSystem } from '../core/InteractionSystem.js';

export class BaseScene {
    constructor(app, sceneData, soundManager, gameState, sceneManager) {
        this.app = app;
        this.sceneData = sceneData;
        this.soundManager = soundManager;
        this.gameState = gameState;
        this.sceneManager = sceneManager;
        this.container = new PIXI.Container();
        this.background = null;
        this.interactiveObjects = [];
        this.interactionSystem = new InteractionSystem(app, soundManager, gameState);
        this.id = sceneData.id;
    }

    async load() {
        // Load background
        if (this.sceneData.background) {
            const bgTexture = await PIXI.Assets.load(this.sceneData.background).catch(() => {
                // Create placeholder background if image not found
                return this.createPlaceholderTexture(this.app.screen.width, this.app.screen.height, 0x222222);
            });
            
            this.background = new PIXI.Sprite(bgTexture);
            
            // Scale background to cover screen (cover mode for better mobile experience)
            const scale = Math.max(
                this.app.screen.width / this.background.width,
                this.app.screen.height / this.background.height
            );
            this.background.scale.set(scale);
            // Center the background
            this.background.anchor.set(0.5);
            this.background.x = this.app.screen.width / 2;
            this.background.y = this.app.screen.height / 2;
            
            this.container.addChild(this.background);
        } else {
            // Create default black background
            const bg = new PIXI.Graphics();
            bg.beginFill(0x000000);
            bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
            bg.endFill();
            this.background = bg;
            this.container.addChild(this.background);
        }

        // Load interactive objects
        if (this.sceneData.interactiveObjects) {
            for (const objData of this.sceneData.interactiveObjects) {
                await this.createInteractiveObject(objData);
            }
        }

        // Start ambient sound
        if (this.sceneData.ambientSound) {
            this.soundManager.playAmbient(
                this.id,
                this.sceneData.ambientSound.src,
                { volume: this.sceneData.ambientSound.volume || 0.5 }
            );
        }

        // Add container to stage
        this.app.stage.addChild(this.container);
    }

    async createInteractiveObject(objData) {
        // Load textures
        let normalTexture = await PIXI.Assets.load(objData.image).catch(() => null);
        if (!normalTexture) {
            // Create placeholder if image not found
            normalTexture = this.createPlaceholderTexture(100, 100, 0x888888);
        }
        
        let hoverTexture = normalTexture;
        if (objData.hoverImage) {
            hoverTexture = await PIXI.Assets.load(objData.hoverImage).catch(() => normalTexture);
        }

        // Create sprite
        const sprite = new PIXI.Sprite(normalTexture);
        sprite.normalTexture = normalTexture;
        sprite.hoverTexture = hoverTexture;
        
        // Position - support relative positioning (0-1) or absolute pixels
        if (objData.positionRelative) {
            // Relative positioning (0.5 = center)
            sprite.x = (objData.x || 0.5) * this.app.screen.width;
            sprite.y = (objData.y || 0.5) * this.app.screen.height;
        } else {
            // Absolute positioning - scale for mobile
            const scaleFactor = Math.min(this.app.screen.width / 1920, this.app.screen.height / 1080);
            sprite.x = (objData.x || 0) * scaleFactor;
            sprite.y = (objData.y || 0) * scaleFactor;
        }
        sprite.anchor.set(0.5);

        // Scale if needed - adjust for mobile
        if (objData.scale) {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const mobileScale = isMobile ? objData.scale * 0.8 : objData.scale; // Smaller on mobile
            sprite.scale.set(mobileScale);
        }

        // Setup interaction
        this.interactionSystem.setupObject(sprite, objData, (data, state) => {
            this.onObjectInteract(data, state);
        });

        this.container.addChild(sprite);
        this.interactiveObjects.push(sprite);

        return sprite;
    }

    createPlaceholderTexture(width, height, color) {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(color);
        graphics.moveTo(0, 0);
        graphics.lineTo(width, 0);
        graphics.lineTo(width, height);
        graphics.lineTo(0, height);
        graphics.closePath();
        graphics.endFill();
        return this.app.renderer.generateTexture(graphics);
    }

    onObjectInteract(objData, currentState) {
        // Handle travel to other scenes (only if travelTo is specified)
        // For intro scene cocoon, we don't want it to travel yet
        if (objData.travelTo && this.id !== 'intro') {
            this.sceneManager.travelToScene(objData.travelTo, objData.transition || 'fade');
        }

        // Override in subclasses for custom behavior
    }

    handleResize() {
        if (this.background) {
            // Only resize if it's a sprite with texture
            if (this.background.texture) {
                const scale = Math.max(
                    this.app.screen.width / this.background.texture.width,
                    this.app.screen.height / this.background.texture.height
                );
                this.background.scale.set(scale);
                // Center the background
                this.background.anchor.set(0.5);
                this.background.x = this.app.screen.width / 2;
                this.background.y = this.app.screen.height / 2;
            } else if (this.background.clear) {
                // It's a Graphics object, resize it
                this.background.clear();
                this.background.beginFill(0x000000);
                this.background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
                this.background.endFill();
            }
        }
        
        // Update interactive object positions if they use relative positioning
        this.interactiveObjects.forEach((sprite, index) => {
            const objData = this.sceneData.interactiveObjects?.[index];
            if (objData && objData.positionRelative) {
                sprite.x = (objData.x || 0.5) * this.app.screen.width;
                sprite.y = (objData.y || 0.5) * this.app.screen.height;
            } else if (objData) {
                // Scale absolute positions
                const scaleFactor = Math.min(this.app.screen.width / 1920, this.app.screen.height / 1080);
                sprite.x = (objData.x || 0) * scaleFactor;
                sprite.y = (objData.y || 0) * scaleFactor;
            }
        });
    }

    destroy() {
        // Stop ambient sound
        if (this.sceneData.ambientSound) {
            this.soundManager.fadeOutAmbient(this.id, 1000);
        }

        // Remove from stage
        this.app.stage.removeChild(this.container);
        
        // Clear references
        this.interactiveObjects = [];
        this.background = null;
    }
}


import * as PIXI from 'pixi.js';
import gsap from 'gsap';

export class InteractionSystem {
    constructor(app, soundManager, gameState) {
        this.app = app;
        this.soundManager = soundManager;
        this.gameState = gameState;
        this.hoveredObject = null;
    }

    setupObject(obj, objectData, onInteract) {
        // Set cursor
        obj.cursor = objectData.cursor || 'pointer';
        
        // Set interactive
        obj.eventMode = 'static';
        obj.cursor = objectData.cursor || 'pointer';

        // Hover state
        obj.on('pointerenter', () => {
            this.handleHoverEnter(obj, objectData);
        });

        obj.on('pointerleave', () => {
            this.handleHoverLeave(obj, objectData);
        });

        // Click state
        obj.on('pointerdown', () => {
            this.handleClick(obj, objectData, onInteract);
        });

        // Touch support
        obj.on('touchstart', (e) => {
            e.preventDefault();
            this.handleClick(obj, objectData, onInteract);
        });
    }

    handleHoverEnter(obj, objectData) {
        this.hoveredObject = obj;
        
        // Change cursor
        this.app.canvas.style.cursor = objectData.cursor || 'pointer';

        // Hover animation
        if (objectData.hoverAnimation) {
            gsap.to(obj, {
                scale: objectData.hoverScale || 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        }

        // Hover image swap
        if (objectData.hoverImage && obj.hoverTexture) {
            obj.texture = obj.hoverTexture;
        }

        // Hover sound
        if (objectData.hoverSound) {
            this.soundManager.playSound(objectData.hoverSound, { volume: 0.3 });
        }
    }

    handleHoverLeave(obj, objectData) {
        this.hoveredObject = null;
        this.app.canvas.style.cursor = 'default';

        // Reset animation
        if (objectData.hoverAnimation) {
            gsap.to(obj, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        }

        // Reset image
        if (objectData.hoverImage && obj.normalTexture) {
            obj.texture = obj.normalTexture;
        }
    }

    handleClick(obj, objectData, onInteract) {
        const objectId = objectData.id;
        const currentState = this.gameState.objectStates.get(objectId) || 'default';

        // Click animation
        gsap.to(obj, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });

        // Click sound
        if (objectData.clickSound) {
            this.soundManager.playSound(objectData.clickSound);
        }

        // Update state
        if (objectData.stateChange) {
            const newState = objectData.stateChange[currentState] || objectData.stateChange.default;
            if (newState) {
                this.gameState.objectStates.set(objectId, newState.state || newState);
                
                // Update visual state (async load if needed)
                if (newState.image) {
                    PIXI.Assets.load(newState.image).then(texture => {
                        if (texture && obj) {
                            obj.texture = texture;
                        }
                    }).catch(() => {
                        console.warn(`Failed to load state image: ${newState.image}`);
                    });
                }
            }
        }

        // Call interaction callback
        if (onInteract) {
            onInteract(objectData, currentState);
        }
    }
}


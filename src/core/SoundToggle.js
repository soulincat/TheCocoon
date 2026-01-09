import * as PIXI from 'pixi.js';
import gsap from 'gsap';

export class SoundToggle {
    constructor(app, soundManager) {
        this.app = app;
        this.soundManager = soundManager;
        this.container = new PIXI.Container();
        this.isMuted = false;
        this.icon = null;
        this.init();
    }

    init() {
        // Create sound icon using graphics (speaker shape)
        this.createIcon();
        
        // Position in left bottom corner
        this.updatePosition();
        
        // Handle window resize
        window.addEventListener('resize', () => this.updatePosition());
    }

    createIcon() {
        // Create speaker icon using graphics
        const iconSize = 40;
        const padding = 20;
        
        // Create container for icon
        const iconContainer = new PIXI.Container();
        
        // Draw speaker icon (simplified speaker shape)
        const speaker = new PIXI.Graphics();
        
        // Speaker body (rectangle) - PixiJS v7 API
        const rectX = iconSize * 0.1;
        const rectY = iconSize * 0.2;
        const rectW = iconSize * 0.4;
        const rectH = iconSize * 0.6;
        
        speaker.beginFill(0x888888); // Grey color
        speaker.moveTo(rectX, rectY);
        speaker.lineTo(rectX + rectW, rectY);
        speaker.lineTo(rectX + rectW, rectY + rectH);
        speaker.lineTo(rectX, rectY + rectH);
        speaker.closePath();
        speaker.endFill();
        
        // Speaker cone (triangle)
        speaker.beginFill(0x888888);
        speaker.moveTo(iconSize * 0.5, iconSize * 0.2);
        speaker.lineTo(iconSize * 0.9, iconSize * 0.05);
        speaker.lineTo(iconSize * 0.9, iconSize * 0.95);
        speaker.lineTo(iconSize * 0.5, iconSize * 0.8);
        speaker.closePath();
        speaker.endFill();
        
        // Sound waves (when not muted)
        const waves = new PIXI.Graphics();
        waves.lineStyle(2, 0x888888); // Set line style: width, color
        waves.moveTo(iconSize * 0.9, iconSize * 0.3);
        waves.lineTo(iconSize * 1.1, iconSize * 0.2);
        waves.moveTo(iconSize * 0.9, iconSize * 0.5);
        waves.lineTo(iconSize * 1.15, iconSize * 0.5);
        waves.moveTo(iconSize * 0.9, iconSize * 0.7);
        waves.lineTo(iconSize * 1.1, iconSize * 0.8);
        
        iconContainer.addChild(speaker);
        iconContainer.addChild(waves);
        
        // Make it interactive
        iconContainer.eventMode = 'static';
        iconContainer.cursor = 'pointer';
        iconContainer.hitArea = new PIXI.Rectangle(0, 0, iconSize * 1.2, iconSize);
        
        // Click handler
        iconContainer.on('pointerdown', () => this.toggle());
        iconContainer.on('touchstart', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        // Hover effect
        iconContainer.on('pointerenter', () => {
            this.app.canvas.style.cursor = 'pointer';
            gsap.to(iconContainer, { alpha: 0.7, duration: 0.2 });
        });
        
        iconContainer.on('pointerleave', () => {
            this.app.canvas.style.cursor = 'default';
            gsap.to(iconContainer, { alpha: 1, duration: 0.2 });
        });
        
        this.icon = iconContainer;
        this.container.addChild(iconContainer);
    }

    toggle() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Mute music
            if (this.soundManager.backgroundMusic) {
                this.soundManager.backgroundMusic.volume(0);
            }
            // Show muted icon (X over speaker)
            this.showMutedIcon();
        } else {
            // Unmute music
            if (this.soundManager.backgroundMusic) {
                this.soundManager.backgroundMusic.volume(this.soundManager.backgroundMusicBaseVolume * this.soundManager.masterVolume);
            }
            // Show normal icon
            this.showNormalIcon();
        }
    }

    showMutedIcon() {
        // Remove existing icon
        this.container.removeChild(this.icon);
        
        // Create muted icon (speaker with X)
        const iconSize = 40;
        const iconContainer = new PIXI.Container();
        
        // Draw speaker (same as before but lighter) - PixiJS v7 API
        const speaker = new PIXI.Graphics();
        const rectX = iconSize * 0.1;
        const rectY = iconSize * 0.2;
        const rectW = iconSize * 0.4;
        const rectH = iconSize * 0.6;
        
        speaker.beginFill(0x666666); // Darker grey when muted
        speaker.moveTo(rectX, rectY);
        speaker.lineTo(rectX + rectW, rectY);
        speaker.lineTo(rectX + rectW, rectY + rectH);
        speaker.lineTo(rectX, rectY + rectH);
        speaker.closePath();
        speaker.endFill();
        
        speaker.beginFill(0x666666);
        speaker.moveTo(iconSize * 0.5, iconSize * 0.2);
        speaker.lineTo(iconSize * 0.9, iconSize * 0.05);
        speaker.lineTo(iconSize * 0.9, iconSize * 0.95);
        speaker.lineTo(iconSize * 0.5, iconSize * 0.8);
        speaker.closePath();
        speaker.endFill();
        
        // Draw X over speaker
        const xMark = new PIXI.Graphics();
        xMark.lineStyle(3, 0x888888); // Set line style: width, color
        xMark.moveTo(iconSize * 0.1, iconSize * 0.1);
        xMark.lineTo(iconSize * 1.1, iconSize * 0.9);
        xMark.moveTo(iconSize * 1.1, iconSize * 0.1);
        xMark.lineTo(iconSize * 0.1, iconSize * 0.9);
        
        iconContainer.addChild(speaker);
        iconContainer.addChild(xMark);
        
        // Make it interactive
        iconContainer.eventMode = 'static';
        iconContainer.cursor = 'pointer';
        iconContainer.hitArea = new PIXI.Rectangle(0, 0, iconSize * 1.2, iconSize);
        
        iconContainer.on('pointerdown', () => this.toggle());
        iconContainer.on('touchstart', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        iconContainer.on('pointerenter', () => {
            this.app.canvas.style.cursor = 'pointer';
            gsap.to(iconContainer, { alpha: 0.7, duration: 0.2 });
        });
        
        iconContainer.on('pointerleave', () => {
            this.app.canvas.style.cursor = 'default';
            gsap.to(iconContainer, { alpha: 1, duration: 0.2 });
        });
        
        this.icon = iconContainer;
        this.container.addChild(iconContainer);
    }

    showNormalIcon() {
        // Remove existing icon
        this.container.removeChild(this.icon);
        
        // Recreate normal icon
        this.createIcon();
    }

    updatePosition() {
        // Position in left bottom corner - scale for mobile
        const scaleFactor = Math.min(this.app.screen.width / 1920, this.app.screen.height / 1080);
        const padding = 20 * scaleFactor;
        const iconHeight = 60 * scaleFactor;
        this.container.x = padding;
        this.container.y = this.app.screen.height - iconHeight;
    }

    addToStage(stage) {
        // Add to stage and ensure it stays on top
        stage.addChild(this.container);
        // Set a high z-index by moving to end of children array
        stage.setChildIndex(this.container, stage.children.length - 1);
    }

    removeFromStage(stage) {
        // Don't remove - sound toggle should persist across scenes
        // stage.removeChild(this.container);
    }
    
    bringToFront(stage) {
        // Ensure sound toggle stays on top
        if (this.container.parent === stage) {
            stage.setChildIndex(this.container, stage.children.length - 1);
        }
    }
}

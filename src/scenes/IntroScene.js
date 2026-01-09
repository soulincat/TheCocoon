import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import gsap from 'gsap';

export class IntroScene extends BaseScene {
    async load() {
        await super.load();
        
        // Intro scene specific: minimal UI, atmospheric
        // Description text removed for now

        // Find and setup cocoon hero object
        const cocoonObject = this.interactiveObjects.find(obj => {
            // Find the cocoon object
            return obj;
        });
        
        if (cocoonObject) {
            // Store cocoon reference
            this.cocoonObject = cocoonObject;
            
            // Create title below cocoon
            this.createTitle(cocoonObject);
            
            // Subtle floating animation
            const floatAnimation = gsap.to(cocoonObject, {
                y: cocoonObject.y - 10,
                duration: 3,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1
            });
            
            // Sync title position with cocoon animation
            this.floatAnimation = floatAnimation;
        }

        // Auto-transition disabled - scene stays until user interacts
        // User must click the cocoon to proceed
    }

    onObjectInteract(objData, currentState) {
        // Cancel auto-transition if user clicks cocoon
        if (this.autoTransitionTimeout) {
            clearTimeout(this.autoTransitionTimeout);
            this.autoTransitionTimeout = null;
        }
        
        // Call parent to handle travel
        super.onObjectInteract(objData, currentState);
    }

    createTitle(cocoonObject) {
        // Wait for font to load, then create title
        document.fonts.ready.then(() => {
            // Calculate position below cocoon - middle area
            const cocoonHeight = cocoonObject.height * cocoonObject.scale.y;
            const spacing = 50 * (this.app.screen.height / 1080); // Responsive spacing
            const baseTitleY = cocoonObject.y + (cocoonHeight / 2) + spacing;
            
            // Calculate responsive font size - make it bigger
            const fontSize = Math.max(36, Math.min(56, 48 * (this.app.screen.width / 1920)));
            
            // Cocoon color: off-white/cream/beige - using a warm beige color
            // RGB: approximately (245, 240, 230) or #F5F0E6
            const cocoonColor = 0xF5F0E6; // Warm off-white/beige color matching the cocoon
            
            // Create title text with Dokdo font
            const textStyle = new PIXI.TextStyle({
                fontFamily: '"Dokdo", "Arial", sans-serif',
                fontSize: fontSize,
                fill: cocoonColor,
                align: 'center',
                letterSpacing: 2,
                wordWrap: false
            });
            
            const title = new PIXI.Text('the Cocoon', textStyle);
            
            // Force text update to get accurate bounds
            title.updateText(true);
            
            // Get actual text bounds for proper positioning
            const textBounds = title.getLocalBounds();
            
            // Create container with proper bounds to prevent clipping
            const textContainer = new PIXI.Container();
            
            // Position title in container - use center anchor for proper alignment
            title.anchor.set(0.5, 0.5); // Center anchor
            title.x = 0; // Centered in container
            title.y = 0; // Centered in container (we'll position container instead)
            
            textContainer.addChild(title);
            
            // Position container to center with cocoon
            // Both cocoon and text use center anchor (0.5, 0.5), so x positions should match exactly
            const cocoonCenterX = cocoonObject.x; // Cocoon's center X (already centered due to anchor 0.5)
            
            textContainer.x = cocoonCenterX - 20; // Match cocoon's center X, then move 20px left
            textContainer.y = baseTitleY - 120; // Position below cocoon, then move 120px up (50px + 70px)
            textContainer.alpha = 0;
            
            this.container.addChild(textContainer);
            this.titleText = textContainer;
            this.titleTextElement = title;
            
            // Title is fixed - no floating animation sync
            
            // Fade in title
            gsap.to(textContainer, {
                alpha: 1,
                duration: 1.5,
                delay: 0.5,
                ease: 'power2.out'
            });

            // Title stays visible - no auto fade out
        });
    }
    
    destroy() {
        // Call parent destroy
        super.destroy();
    }
}


import { BaseScene } from '../scenes/BaseScene.js';
import { IntroScene } from '../scenes/IntroScene.js';
import { ExteriorScene } from '../scenes/ExteriorScene.js';
import { LobbyScene } from '../scenes/LobbyScene.js';
import { RoomScene } from '../scenes/RoomScene.js';
import { SpaScene } from '../scenes/SpaScene.js';
import { RestaurantScene } from '../scenes/RestaurantScene.js';
import { SurroundingsScene } from '../scenes/SurroundingsScene.js';
import gsap from 'gsap';

const SCENE_CLASSES = {
    intro: IntroScene,
    exterior: ExteriorScene,
    lobby: LobbyScene,
    room: RoomScene,
    spa: SpaScene,
    restaurant: RestaurantScene,
    surroundings: SurroundingsScene
};

export class SceneManager {
    constructor(app, soundManager, gameState) {
        this.app = app;
        this.soundManager = soundManager;
        this.gameState = gameState;
        this.scenesData = null;
        this.currentScene = null;
        this.sceneInstances = new Map();
        this.isTransitioning = false;
        this.soundToggle = null; // Will be set by Game
    }
    
    setSoundToggle(soundToggle) {
        this.soundToggle = soundToggle;
    }

    async init(scenesData) {
        this.scenesData = scenesData;
    }

    async loadScene(sceneId, transitionType = 'fade') {
        if (this.isTransitioning) return;
        if (this.currentScene?.id === sceneId) return;

        this.isTransitioning = true;

        // Get scene data
        const sceneData = this.scenesData.scenes.find(s => s.id === sceneId);
        if (!sceneData) {
            console.error(`Scene ${sceneId} not found`);
            this.isTransitioning = false;
            return;
        }

        // Transition out current scene
        if (this.currentScene) {
            await this.transitionOut(this.currentScene, transitionType);
            this.currentScene.destroy();
        }

        // Create or get scene instance
        let scene = this.sceneInstances.get(sceneId);
        if (!scene) {
            const SceneClass = SCENE_CLASSES[sceneId] || BaseScene;
            scene = new SceneClass(this.app, sceneData, this.soundManager, this.gameState, this);
            this.sceneInstances.set(sceneId, scene);
        }

        // Load and transition in
        await scene.load();
        await this.transitionIn(scene, transitionType);

        this.currentScene = scene;
        this.gameState.visitedScenes.add(sceneId);
        this.isTransitioning = false;
        
        // Ensure sound toggle stays on top after scene load
        if (this.soundToggle) {
            this.soundToggle.bringToFront(this.app.stage);
        }
    }

    async transitionOut(scene, type) {
        return new Promise((resolve) => {
            switch (type) {
                case 'fade':
                    gsap.to(scene.container, {
                        alpha: 0,
                        duration: 0.8,
                        ease: 'power2.inOut',
                        onComplete: resolve
                    });
                    break;
                case 'slide':
                    gsap.to(scene.container, {
                        x: -this.app.screen.width,
                        duration: 1,
                        ease: 'power2.inOut',
                        onComplete: resolve
                    });
                    break;
                default:
                    resolve();
            }
        });
    }

    async transitionIn(scene, type) {
        return new Promise((resolve) => {
            switch (type) {
                case 'fade':
                    scene.container.alpha = 0;
                    gsap.to(scene.container, {
                        alpha: 1,
                        duration: 0.8,
                        ease: 'power2.inOut',
                        onComplete: resolve
                    });
                    break;
                case 'slide':
                    scene.container.x = this.app.screen.width;
                    gsap.to(scene.container, {
                        x: 0,
                        duration: 1,
                        ease: 'power2.inOut',
                        onComplete: resolve
                    });
                    break;
                default:
                    resolve();
            }
        });
    }

    handleResize() {
        if (this.currentScene) {
            this.currentScene.handleResize();
        }
    }

    travelToScene(sceneId, transitionType = 'fade') {
        this.loadScene(sceneId, transitionType);
    }
}


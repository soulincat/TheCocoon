import * as PIXI from 'pixi.js';

export class AssetLoader {
    constructor() {
        this.loadedAssets = new Set();
    }

    async load(src) {
        if (this.loadedAssets.has(src)) {
            return PIXI.Assets.get(src);
        }

        try {
            const texture = await PIXI.Assets.load(src);
            this.loadedAssets.add(src);
            return texture;
        } catch (error) {
            console.warn(`Failed to load asset: ${src}`, error);
            return null;
        }
    }

    async loadBatch(assets) {
        const results = {};
        for (const key in assets) {
            results[key] = await this.load(assets[key]);
        }
        return results;
    }

    get(src) {
        return PIXI.Assets.get(src);
    }

    has(src) {
        return this.loadedAssets.has(src);
    }
}


export class Responsive {
    constructor(app) {
        this.app = app;
        this.baseWidth = 1920;
        this.baseHeight = 1080;
        this.update();
    }

    update() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate scale to fit while maintaining aspect ratio
        const scaleX = windowWidth / this.baseWidth;
        const scaleY = windowHeight / this.baseHeight;
        const scale = Math.min(scaleX, scaleY);

        // Center the content
        const scaledWidth = this.baseWidth * scale;
        const scaledHeight = this.baseHeight * scale;
        const offsetX = (windowWidth - scaledWidth) / 2;
        const offsetY = (windowHeight - scaledHeight) / 2;

        // Store for use in scenes
        this.scale = scale;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.scaledWidth = scaledWidth;
        this.scaledHeight = scaledHeight;
    }

    getScale() {
        return this.scale;
    }

    getOffset() {
        return { x: this.offsetX, y: this.offsetY };
    }

    getScaledDimensions() {
        return {
            width: this.scaledWidth,
            height: this.scaledHeight
        };
    }
}


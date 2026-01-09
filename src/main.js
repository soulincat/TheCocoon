import { Game } from './core/Game.js';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init().catch(error => {
        console.error('Failed to initialize game:', error);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div style="color: #ff6b6b;">Failed to initialize</div>
                <div style="font-size: 14px; margin-top: 10px; opacity: 0.7;">${error.message}</div>
                <div style="font-size: 12px; margin-top: 20px; opacity: 0.5;">Please check the console and ensure the dev server is running</div>
            `;
        }
    });
});


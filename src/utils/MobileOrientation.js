/**
 * Mobile orientation lock helper
 * Ensures horizontal orientation for mobile devices
 */
export class MobileOrientation {
    constructor() {
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.init();
    }

    init() {
        if (!this.isMobile) return;

        // Lock orientation to landscape (if supported)
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                // Lock failed, show message
                this.showOrientationMessage();
            });
        } else {
            // Fallback: show message
            this.showOrientationMessage();
        }

        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.checkOrientation(), 100);
        });
    }

    checkOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) {
            this.showOrientationMessage();
        } else {
            this.hideOrientationMessage();
        }
    }

    showOrientationMessage() {
        let message = document.getElementById('orientation-message');
        if (!message) {
            message = document.createElement('div');
            message.id = 'orientation-message';
            message.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                text-align: center;
                z-index: 10000;
                padding: 20px;
            `;
            message.innerHTML = `
                <div>
                    <p>Please rotate your device to landscape mode</p>
                    <p style="font-size: 16px; margin-top: 20px; opacity: 0.7;">This experience is designed for horizontal viewing</p>
                </div>
            `;
            document.body.appendChild(message);
        }
        message.style.display = 'flex';
    }

    hideOrientationMessage() {
        const message = document.getElementById('orientation-message');
        if (message) {
            message.style.display = 'none';
        }
    }
}


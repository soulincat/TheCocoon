import { Howl, Howler } from 'howler';

export class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.ambientSounds = new Map();
        this.backgroundMusic = null;
        this.masterVolume = 1.0;
    }

    loadSound(key, src, options = {}) {
        const sound = new Howl({
            src: [src],
            volume: options.volume || 1.0,
            loop: options.loop || false,
            preload: options.preload !== false
        });

        this.sounds.set(key, sound);
        return sound;
    }

    playSound(key, options = {}) {
        const sound = this.sounds.get(key);
        if (!sound) {
            // Try to load on demand
            this.loadSound(key, key, options);
            const newSound = this.sounds.get(key);
            if (newSound) {
                newSound.volume(options.volume || 1.0);
                newSound.play();
            }
            return;
        }

        const volume = options.volume !== undefined ? options.volume : sound.volume();
        sound.volume(volume * this.masterVolume);
        sound.play();
    }

    playAmbient(key, src, options = {}) {
        // Stop previous ambient if different
        if (this.currentAmbient && this.currentAmbient !== key) {
            this.stopAmbient(this.currentAmbient);
        }

        let sound = this.ambientSounds.get(key);
        if (!sound) {
            sound = new Howl({
                src: [src],
                volume: options.volume || 0.5,
                loop: true,
                preload: true
            });
            this.ambientSounds.set(key, sound);
        }

        sound.volume((options.volume || 0.5) * this.masterVolume);
        sound.play();
        this.currentAmbient = key;
    }

    stopAmbient(key) {
        const sound = this.ambientSounds.get(key);
        if (sound) {
            sound.stop();
        }
        if (this.currentAmbient === key) {
            this.currentAmbient = null;
        }
    }

    fadeInAmbient(key, duration = 2000) {
        const sound = this.ambientSounds.get(key);
        if (sound) {
            sound.volume(0);
            sound.play();
            sound.fade(0, (sound._volume || 0.5) * this.masterVolume, duration);
        }
    }

    fadeOutAmbient(key, duration = 2000) {
        const sound = this.ambientSounds.get(key);
        if (sound) {
            const currentVolume = sound.volume();
            sound.fade(currentVolume, 0, duration);
            setTimeout(() => {
                sound.stop();
            }, duration);
        }
    }

    playBackgroundMusic(src, options = {}) {
        // Stop existing background music if playing
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }

        // Store base volume for background music
        this.backgroundMusicBaseVolume = options.volume || 0.6;

        // Create and play background music
        this.backgroundMusic = new Howl({
            src: [src],
            volume: this.backgroundMusicBaseVolume * this.masterVolume,
            loop: true,
            preload: true
        });

        // Play the music
        this.backgroundMusic.play();

        return this.backgroundMusic;
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }

    setBackgroundMusicVolume(volume) {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume(volume * this.masterVolume);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        Howler.volume(this.masterVolume);
        
        // Update background music volume
        if (this.backgroundMusic && this.backgroundMusicBaseVolume !== undefined) {
            this.backgroundMusic.volume(this.backgroundMusicBaseVolume * this.masterVolume);
        }
    }
}


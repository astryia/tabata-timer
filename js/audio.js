/**
 * Audio Management Module
 * Handles audio playback, mixing, and cue timing
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioCache = new Map();
        this.currentBackgroundSource = null;
        this.currentBackgroundGain = null;
        this.currentOverlaySource = null;
        this.currentOverlayGain = null;
        this.backgroundSong = null;
        this.isInitialized = false;
        this.originalBackgroundVolume = 0.7; // Store original volume
        this.backgroundVolumeLowered = false;
    }

    /**
     * Initialize AudioContext (must be called after user interaction)
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
            throw error;
        }
    }

    /**
     * Load and cache an audio file
     */
    async loadAudioFile(path) {
        if (this.audioCache.has(path)) {
            return this.audioCache.get(path);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load audio: ${path}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.audioCache.set(path, audioBuffer);
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading audio file ${path}:`, error);
            throw error;
        }
    }

    /**
     * Play a single audio file
     */
    async playAudio(path, options = {}) {
        const {
            loop = false,
            volume = 1.0,
            onEnded = null
        } = options;

        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const audioBuffer = await this.loadAudioFile(path);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = audioBuffer;
            source.loop = loop;
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            if (onEnded) {
                source.onended = onEnded;
            }

            // Start from the beginning (offset 0)
            const startTime = this.audioContext.currentTime;
            source.start(startTime, 0);
            return { source, gainNode };
        } catch (error) {
            console.error(`Error playing audio ${path}:`, error);
            throw error;
        }
    }

    /**
     * Start background song (loops continuously)
     */
    async startBackgroundSong(path) {
        if (!path) return;

        // Stop existing background song if playing
        this.stopBackgroundSong();

        try {
            const audioBuffer = await this.loadAudioFile(path);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = audioBuffer;
            source.loop = true;
            this.originalBackgroundVolume = 0.7; // Store original volume
            gainNode.gain.value = this.originalBackgroundVolume; // Slightly lower volume for background

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Start from the beginning (offset 0)
            const startTime = this.audioContext.currentTime;
            source.start(startTime, 0);

            this.currentBackgroundSource = source;
            this.currentBackgroundGain = gainNode;
            this.backgroundSong = path;
        } catch (error) {
            console.error(`Error starting background song ${path}:`, error);
            throw error;
        }
    }

    /**
     * Stop background song
     */
    stopBackgroundSong() {
        if (this.currentBackgroundSource) {
            try {
                this.currentBackgroundSource.stop();
            } catch (e) {
                // Already stopped
            }
            this.currentBackgroundSource = null;
            this.currentBackgroundGain = null;
            this.backgroundSong = null;
        }
    }

    /**
     * Play overlay cue on top of background song
     */
    async playOverlayCue(path, options = {}) {
        const {
            volume = 1.0,
            onEnded = null
        } = options;

        // Stop existing overlay if playing
        this.stopOverlayCue();

        // Lower background music volume by 50% (to 50% of original)
        this.lowerBackgroundVolume();

        try {
            const audioBuffer = await this.loadAudioFile(path);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = audioBuffer;
            source.loop = false;
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Restore background volume when overlay ends
            const originalOnEnded = onEnded;
            source.onended = () => {
                this.restoreBackgroundVolume();
                if (originalOnEnded) {
                    originalOnEnded();
                }
            };

            // Start from the beginning (offset 0)
            const startTime = this.audioContext.currentTime;
            source.start(startTime, 0);

            this.currentOverlaySource = source;
            this.currentOverlayGain = gainNode;
        } catch (error) {
            console.error(`Error playing overlay cue ${path}:`, error);
            this.restoreBackgroundVolume();
            throw error;
        }
    }

    /**
     * Stop overlay cue
     */
    stopOverlayCue() {
        if (this.currentOverlaySource) {
            try {
                this.currentOverlaySource.stop();
            } catch (e) {
                // Already stopped
            }
            this.currentOverlaySource = null;
            this.currentOverlayGain = null;
        }
        // Restore background volume when overlay stops
        this.restoreBackgroundVolume();
    }

    /**
     * Lower background music volume by 50% (to 50% of original)
     */
    lowerBackgroundVolume() {
        if (this.currentBackgroundGain && !this.backgroundVolumeLowered) {
            const currentTime = this.audioContext.currentTime;
            const newVolume = this.originalBackgroundVolume * 0.5; // 50% of original (50% reduction)
            this.currentBackgroundGain.gain.setValueAtTime(this.currentBackgroundGain.gain.value, currentTime);
            this.currentBackgroundGain.gain.linearRampToValueAtTime(newVolume, currentTime + 0.1);
            this.backgroundVolumeLowered = true;
        }
    }

    /**
     * Restore background music volume to original
     */
    restoreBackgroundVolume() {
        if (this.currentBackgroundGain && this.backgroundVolumeLowered) {
            const currentTime = this.audioContext.currentTime;
            this.currentBackgroundGain.gain.setValueAtTime(this.currentBackgroundGain.gain.value, currentTime);
            this.currentBackgroundGain.gain.linearRampToValueAtTime(this.originalBackgroundVolume, currentTime + 0.1);
            this.backgroundVolumeLowered = false;
        }
    }

    /**
     * Play sequential audio cues one after another
     */
    async playSequence(paths, onComplete = null) {
        if (!paths || paths.length === 0) {
            if (onComplete) onComplete();
            return;
        }

        const playNext = async (index) => {
            if (index >= paths.length) {
                if (onComplete) onComplete();
                return;
            }

            const path = paths[index];
            const audioBuffer = await this.loadAudioFile(path);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = audioBuffer;
            source.loop = false;
            gainNode.gain.value = 1.0;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.onended = () => {
                playNext(index + 1);
            };

            // Start from the beginning (offset 0)
            const startTime = this.audioContext.currentTime;
            source.start(startTime, 0);
        };

        await playNext(0);
    }

    /**
     * Stop all audio
     */
    stopAllAudio() {
        this.stopBackgroundSong();
        this.stopOverlayCue();
    }

    /**
     * Fade out audio smoothly
     */
    fadeOut(gainNode, duration = 500) {
        if (!gainNode) return;

        const startTime = this.audioContext.currentTime;
        const startGain = gainNode.gain.value;

        gainNode.gain.setValueAtTime(startGain, startTime);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration / 1000);

        setTimeout(() => {
            if (gainNode === this.currentBackgroundGain) {
                this.stopBackgroundSong();
            } else if (gainNode === this.currentOverlayGain) {
                this.stopOverlayCue();
            }
        }, duration);
    }

    /**
     * Preload audio files
     */
    async preloadAudioFiles(paths) {
        const promises = paths.map(path => this.loadAudioFile(path).catch(err => {
            console.warn(`Failed to preload ${path}:`, err);
        }));
        await Promise.all(promises);
    }
}

// Export singleton instance
const audioManager = new AudioManager();

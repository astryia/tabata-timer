/**
 * Timer Logic Module
 * Manages workout state, timing, and coordinates with audio cues
 */

class TabataTimer {
    constructor() {
        this.state = {
            phase: 'idle', // 'idle' | 'intro' | 'round' | 'rest' | 'completed' | 'paused'
            currentRound: 0,
            totalRounds: 4,
            roundDuration: 20,
            restDuration: 10,
            backgroundSong: null,
            
            // Timing
            startTime: null,
            workoutStartTime: null, // When actual workout starts (after intro)
            pauseStartTime: null,
            pausedDuration: 0,
            elapsedTime: 0,
            workoutElapsedTime: 0, // Elapsed time since workout started (for outer circle)
            roundStartTime: null,
            roundElapsed: 0,
            restStartTime: null,
            restElapsed: 0,
            phaseBeforePause: null,
            
            // Audio cue flags
            introPlayed: false,
            backgroundStarted: false,
            roundStopCuePlayed: false,
            restRoundCuePlayed: false,
            restGoCuePlayed: false,
        };

        this.intervalId = null;
        this.updateCallback = null;
        this.onCompleteCallback = null;
    }

    /**
     * Set update callback (called every tick)
     */
    setUpdateCallback(callback) {
        this.updateCallback = callback;
    }

    /**
     * Set completion callback
     */
    setOnCompleteCallback(callback) {
        this.onCompleteCallback = callback;
    }

    /**
     * Initialize timer with settings
     */
    initialize(settings) {
        this.state.totalRounds = Math.min(settings.numRounds, 8);
        this.state.roundDuration = settings.roundDuration;
        this.state.restDuration = settings.restDuration;
        this.state.backgroundSong = settings.backgroundSong;
        this.reset();
    }

    /**
     * Reset timer to initial state
     */
    reset() {
        this.state.phase = 'idle';
        this.state.currentRound = 0;
        this.state.startTime = null;
        this.state.workoutStartTime = null;
        this.state.pauseStartTime = null;
        this.state.pausedDuration = 0;
        this.state.elapsedTime = 0;
        this.state.workoutElapsedTime = 0;
        this.state.roundStartTime = null;
        this.state.roundElapsed = 0;
        this.state.restStartTime = null;
        this.state.restElapsed = 0;
        this.state.phaseBeforePause = null;
        this.state.introPlayed = false;
        this.state.backgroundStarted = false;
        this.state.roundStopCuePlayed = false;
        this.state.restRoundCuePlayed = false;
        this.state.restGoCuePlayed = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Start the workout
     */
    async start() {
        if (this.state.phase !== 'idle') {
            return;
        }

        // Initialize audio context
        await audioManager.init();

        this.state.phase = 'intro';
        this.state.startTime = Date.now();
        this.state.currentRound = 1;

        // Start background song immediately if selected
        if (this.state.backgroundSong) {
            audioManager.startBackgroundSong(this.state.backgroundSong);
            this.state.backgroundStarted = true;
        }

        // Play intro sequence
        const introSequence = [
            'Resources/are_you_ready.mp3',
            `Resources/round_1.mp3`,
            'Resources/5_4_3_2_1_go.mp3'
        ];

        await audioManager.playSequence(introSequence, () => {
            this.state.introPlayed = true;
            this.startRound();
        });

        // Start update loop
        this.intervalId = setInterval(() => this.update(), 100);
    }

    /**
     * Start a round
     */
    startRound() {
        const now = Date.now();
        
        // If this is the first round (coming from intro), set workout start time
        if (this.state.phase === 'intro' || this.state.workoutStartTime === null) {
            this.state.workoutStartTime = now;
            this.state.workoutElapsedTime = 0;
        }
        
        this.state.phase = 'round';
        this.state.roundStartTime = now;
        this.state.roundElapsed = 0;
        this.state.roundStopCuePlayed = false;

        // Start background song if not already started
        if (!this.state.backgroundStarted && this.state.backgroundSong) {
            audioManager.startBackgroundSong(this.state.backgroundSong);
            this.state.backgroundStarted = true;
        }
    }

    /**
     * Start rest period
     */
    startRest() {
        this.state.phase = 'rest';
        this.state.restStartTime = Date.now();
        this.state.restElapsed = 0;
        this.state.restRoundCuePlayed = false;
        this.state.restGoCuePlayed = false;
    }

    /**
     * Pause the timer
     */
    pause() {
        if (this.state.phase === 'paused' || this.state.phase === 'idle' || this.state.phase === 'completed') {
            return;
        }

        // Store the current phase before pausing
        this.state.phaseBeforePause = this.state.phase;
        this.state.pauseStartTime = Date.now();
        this.state.phase = 'paused';
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Resume the timer
     */
    resume() {
        if (this.state.phase !== 'paused') {
            return;
        }

        // Calculate pause duration
        const pauseDuration = Date.now() - this.state.pauseStartTime;
        this.state.pausedDuration += pauseDuration;
        
        // Adjust start times to account for pause
        if (this.state.startTime) {
            this.state.startTime += pauseDuration;
        }
        if (this.state.workoutStartTime) {
            this.state.workoutStartTime += pauseDuration;
        }
        if (this.state.roundStartTime) {
            this.state.roundStartTime += pauseDuration;
        }
        if (this.state.restStartTime) {
            this.state.restStartTime += pauseDuration;
        }

        // Restore the phase we were in before pausing
        if (this.state.phaseBeforePause) {
            this.state.phase = this.state.phaseBeforePause;
        } else {
            // Fallback: determine phase from current state
            this.state.phase = this.state.restStartTime ? 'rest' : (this.state.roundStartTime ? 'round' : 'intro');
        }
        
        this.state.pauseStartTime = null;
        this.state.phaseBeforePause = null;

        // Resume update loop
        this.intervalId = setInterval(() => this.update(), 100);
    }

    /**
     * Stop the timer
     */
    stop() {
        audioManager.stopAllAudio();
        this.reset();
    }

    /**
     * Main update loop
     */
    update() {
        if (this.state.phase === 'idle' || this.state.phase === 'paused' || this.state.phase === 'completed') {
            return;
        }

        const now = Date.now();

        // Calculate elapsed time
        if (this.state.startTime) {
            this.state.elapsedTime = Math.floor((now - this.state.startTime) / 1000);
        }

        if (this.state.phase === 'round') {
            this.updateRound(now);
        } else if (this.state.phase === 'rest') {
            this.updateRest(now);
        }

        // Call update callback
        if (this.updateCallback) {
            this.updateCallback(this.getState());
        }
    }

    /**
     * Update round phase
     */
    updateRound(now) {
        if (!this.state.roundStartTime) return;

        // Use precise timing (milliseconds) for smooth, linear progress
        const elapsedMs = now - this.state.roundStartTime;
        const elapsedSeconds = elapsedMs / 1000;
        this.state.roundElapsed = elapsedSeconds; // Keep precise, don't floor
        
        const remainingMs = (this.state.roundDuration * 1000) - elapsedMs;
        const remaining = this.state.roundDuration - this.state.roundElapsed;

        // Update workout elapsed time for outer circle
        if (this.state.workoutStartTime) {
            this.state.workoutElapsedTime = (now - this.state.workoutStartTime) / 1000;
        }

        // Play stop cue 3 seconds before round ends
        // If audio finishes 1 second early, delay start by 1 second: trigger at 2 seconds remaining
        if (remainingMs <= 2100 && remainingMs >= 1900 && !this.state.roundStopCuePlayed) {
            audioManager.playOverlayCue('Resources/3_2_1_stop.mp3');
            this.state.roundStopCuePlayed = true;
        }

        // Round ended
        if (remaining <= 0) {
            this.state.roundElapsed = this.state.roundDuration;
            
            // Check if this was the last round
            if (this.state.currentRound >= this.state.totalRounds) {
                this.complete();
            } else {
                // Start rest period
                if (this.state.restDuration > 0) {
                    this.startRest();
                } else {
                    // No rest, go to next round
                    this.state.currentRound++;
                    this.startRound();
                }
            }
        }
    }

    /**
     * Update rest phase
     */
    updateRest(now) {
        if (!this.state.restStartTime) return;

        // Use precise timing (milliseconds) for smooth, linear progress
        const elapsedMs = now - this.state.restStartTime;
        const elapsedSeconds = elapsedMs / 1000;
        this.state.restElapsed = elapsedSeconds; // Keep precise, don't floor
        
        const remainingMs = (this.state.restDuration * 1000) - elapsedMs;
        const remaining = this.state.restDuration - this.state.restElapsed;
        
        // Update workout elapsed time for outer circle
        if (this.state.workoutStartTime) {
            this.state.workoutElapsedTime = (now - this.state.workoutStartTime) / 1000;
        }

        // Play round cue 8 seconds before rest ends (changed from 10 seconds)
        // Check for range 8000-8100ms to account for 100ms update interval
        if (remainingMs <= 8100 && remainingMs > 7900 && !this.state.restRoundCuePlayed) {
            const nextRound = this.state.currentRound + 1;
            if (nextRound <= 8) {
                audioManager.playOverlayCue(`Resources/round_${nextRound}.mp3`);
                this.state.restRoundCuePlayed = true;
            }
        }

        // Play go cue exactly 5 seconds before rest ends
        // If audio finishes 1 second early, it means it started 1 second too early
        // So we need to delay the start by 1 second: trigger at 4 seconds remaining instead of 5
        // This way: start at 4s remaining + 5s audio = finishes at -1s, but accounting for early finish = finishes at 0s
        if (remainingMs <= 4100 && remainingMs >= 3900 && !this.state.restGoCuePlayed) {
            audioManager.playOverlayCue('Resources/5_4_3_2_1_go.mp3');
            this.state.restGoCuePlayed = true;
        }

        // Rest ended
        if (remaining <= 0) {
            this.state.restElapsed = this.state.restDuration;
            this.state.currentRound++;
            this.startRound();
        }
    }

    /**
     * Complete the workout
     */
    complete() {
        this.state.phase = 'completed';
        audioManager.stopAllAudio();
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }

    /**
     * Get current timer state
     */
    getState() {
        // Calculate total duration: rounds + rest periods (but no rest after last round)
        // Formula: roundDuration * totalRounds + restDuration * (totalRounds - 1)
        const totalDuration = (this.state.roundDuration * this.state.totalRounds) + 
                              (this.state.restDuration * (this.state.totalRounds - 1));
        
        // Use workoutElapsedTime for outer circle (starts after intro)
        // Fall back to elapsedTime if workout hasn't started yet
        const workoutTime = this.state.workoutElapsedTime || 0;
        const remaining = Math.max(0, Math.floor(totalDuration - workoutTime)); // Round down to whole seconds

        let innerProgress = 0;
        let innerRemaining = 0;
        let innerPhase = 'round';

        if (this.state.phase === 'round') {
            // Use precise elapsed time for linear progress
            innerProgress = (this.state.roundElapsed / this.state.roundDuration) * 100;
            innerRemaining = Math.max(0, this.state.roundDuration - this.state.roundElapsed);
            innerPhase = 'round';
        } else if (this.state.phase === 'rest') {
            // Use precise elapsed time for linear progress
            innerProgress = (this.state.restElapsed / this.state.restDuration) * 100;
            innerRemaining = Math.max(0, this.state.restDuration - this.state.restElapsed);
            innerPhase = 'rest';
        }

        // Outer circle progress only starts after workout begins (after intro)
        const outerProgress = this.state.workoutStartTime ? (workoutTime / totalDuration) * 100 : 0;

        return {
            phase: this.state.phase,
            currentRound: this.state.currentRound,
            totalRounds: this.state.totalRounds,
            elapsedTime: this.state.elapsedTime,
            remainingTime: remaining,
            innerProgress: Math.min(100, Math.max(0, innerProgress)),
            innerRemaining: Math.max(0, Math.ceil(innerRemaining)), // Round up for display
            outerProgress: Math.min(100, Math.max(0, outerProgress)),
            innerPhase: innerPhase
        };
    }

    /**
     * Format seconds as MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

// Export singleton instance
const tabataTimer = new TabataTimer();

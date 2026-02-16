/**
 * UI Updates Module
 * Handles circular progress rendering and UI updates
 */

class UIManager {
    constructor() {
        this.elements = {
            settingsPanel: null,
            timerDisplay: null,
            countdownNumber: null,
            roundIndicator: null,
            cyclesIndicator: null,
            remainingTime: null,
            elapsedTime: null,
            outerCircleProgress: null,
            innerCircleProgress: null,
            pauseBtn: null,
            resumeBtn: null,
            stopBtn: null
        };

        this.outerCircleCircumference = 2 * Math.PI * 180; // r = 180
        this.innerCircleCircumference = 2 * Math.PI * 140; // r = 140
    }

    /**
     * Initialize UI elements
     */
    init() {
        this.elements.settingsPanel = document.getElementById('settings-panel');
        this.elements.timerDisplay = document.getElementById('timer-display');
        this.elements.countdownNumber = document.getElementById('countdown-number');
        this.elements.roundIndicator = document.getElementById('round-indicator');
        this.elements.cyclesIndicator = document.getElementById('cycles-indicator');
        this.elements.remainingTime = document.getElementById('remaining-time');
        this.elements.elapsedTime = document.getElementById('elapsed-time');
        this.elements.outerCircleProgress = document.querySelector('.outer-circle-progress');
        this.elements.innerCircleProgressRound = document.querySelector('.inner-circle-progress.round-time');
        this.elements.innerCircleProgressRest = document.querySelector('.inner-circle-progress.rest-time');
        this.elements.pauseResumeBtn = document.getElementById('pause-resume-btn');
        this.elements.stopBtn = document.getElementById('stop-btn');
    }

    /**
     * Show settings panel, hide timer
     */
    showSettings() {
        this.elements.settingsPanel.classList.remove('hidden');
        this.elements.timerDisplay.classList.add('hidden');
    }

    /**
     * Show timer, hide settings panel
     */
    showTimer() {
        this.elements.settingsPanel.classList.add('hidden');
        this.elements.timerDisplay.classList.remove('hidden');
    }

    /**
     * Update circular progress indicators
     */
    updateCircularProgress(outerProgress, innerProgress, innerPhase) {
        // Update outer circle
        const outerOffset = this.outerCircleCircumference - (outerProgress / 100) * this.outerCircleCircumference;
        this.elements.outerCircleProgress.style.strokeDashoffset = outerOffset;

        // Update inner circle based on phase
        const innerOffset = this.innerCircleCircumference - (innerProgress / 100) * this.innerCircleCircumference;
        
        // Only show inner circle if there's actual progress (not at 0%)
        const hasProgress = innerProgress > 0;
        
        if (innerPhase === 'round' && hasProgress) {
            // Show round circle (orange), hide rest circle
            this.elements.innerCircleProgressRound.classList.remove('hidden');
            this.elements.innerCircleProgressRest.classList.add('hidden');
            
            // Update round circle progress
            this.elements.innerCircleProgressRound.style.strokeDashoffset = innerOffset;
        } else if (innerPhase === 'rest' && hasProgress) {
            // Show rest circle (green), hide round circle
            this.elements.innerCircleProgressRound.classList.add('hidden');
            this.elements.innerCircleProgressRest.classList.remove('hidden');
            
            // Update rest circle progress
            this.elements.innerCircleProgressRest.style.strokeDashoffset = innerOffset;
        } else {
            // Hide both circles if no progress
            this.elements.innerCircleProgressRound.classList.add('hidden');
            this.elements.innerCircleProgressRest.classList.add('hidden');
        }
    }

    /**
     * Update countdown number
     */
    updateCountdown(number) {
        // Display the countdown number (already rounded/ceiled from timer)
        this.elements.countdownNumber.textContent = Math.ceil(number);
    }

    /**
     * Update round indicator
     */
    updateRoundIndicator(current, total) {
        this.elements.roundIndicator.textContent = `${current}/${total}`;
    }

    /**
     * Update cycles indicator (always 1/1 for now)
     */
    updateCyclesIndicator() {
        this.elements.cyclesIndicator.textContent = '1/1';
    }

    /**
     * Update time displays
     */
    updateTimeDisplays(elapsed, remaining) {
        // Round to whole seconds for display
        this.elements.elapsedTime.textContent = this.formatTime(Math.floor(elapsed));
        this.elements.remainingTime.textContent = this.formatTime(Math.floor(remaining));
    }

    /**
     * Format seconds as MM:SS
     */
    formatTime(seconds) {
        // Ensure we're working with whole seconds
        const wholeSeconds = Math.floor(seconds);
        const mins = Math.floor(wholeSeconds / 60);
        const secs = wholeSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    /**
     * Show pause button
     */
    showPauseButton() {
        if (this.elements.pauseResumeBtn) {
            this.elements.pauseResumeBtn.classList.remove('hidden');
            this.elements.pauseResumeBtn.textContent = 'Pause';
        }
    }

    /**
     * Show resume button
     */
    showResumeButton() {
        if (this.elements.pauseResumeBtn) {
            this.elements.pauseResumeBtn.classList.remove('hidden');
            this.elements.pauseResumeBtn.textContent = 'Resume';
        }
    }

    /**
     * Update UI based on timer state
     */
    update(state) {
        // Update circular progress
        this.updateCircularProgress(state.outerProgress, state.innerProgress, state.innerPhase);

        // Update countdown
        this.updateCountdown(state.innerRemaining);

        // Update round indicator
        this.updateRoundIndicator(state.currentRound, state.totalRounds);

        // Update time displays
        this.updateTimeDisplays(state.elapsedTime, state.remainingTime);

        // Update button visibility and text based on phase
        if (state.phase === 'paused') {
            this.showResumeButton();
        } else if (state.phase === 'round' || state.phase === 'rest' || state.phase === 'intro') {
            this.showPauseButton();
        } else if (state.phase === 'idle' || state.phase === 'completed') {
            // Hide button when idle or completed
            if (this.elements.pauseResumeBtn) {
                this.elements.pauseResumeBtn.classList.add('hidden');
            }
        }
    }

    /**
     * Show completion message
     */
    showCompletion() {
        // Could show a completion message or animation
        // For now, just keep the timer display showing final state
    }
}

// Export singleton instance
const uiManager = new UIManager();

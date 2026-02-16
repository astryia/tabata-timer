/**
 * Main Application Entry Point
 * Integrates all modules and handles user interactions
 */

// Available songs (auto-generated from Resources/Songs folder)
// Run scripts/generate-songs-list.js to update this list

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Initialize the application
 */
async function initApp() {
    // Initialize notification manager
    notificationManager.init();

    // Initialize UI manager
    uiManager.init();

    // Populate song selector
    populateSongSelector();

    // Set up event handlers
    setupEventHandlers();

    // Set up timer callbacks
    tabataTimer.setUpdateCallback((state) => {
        uiManager.update(state);
    });

    tabataTimer.setOnCompleteCallback(async () => {
        uiManager.showCompletion();
        // Show completion notification
        setTimeout(async () => {
            await notificationManager.alert('Workout complete!');
            resetToSettings();
        }, 1000);
    });

    // Try to prevent screen sleep during workout
    initWakeLock();
}

/**
 * Populate background song selector dropdown
 */
function populateSongSelector() {
    const songSelect = document.getElementById('background-song');
    
    // Clear existing options except "No song"
    while (songSelect.children.length > 1) {
        songSelect.removeChild(songSelect.lastChild);
    }

    // Add available songs
    AVAILABLE_SONGS.forEach(song => {
        const option = document.createElement('option');
        option.value = song.path;
        option.textContent = song.name;
        songSelect.appendChild(option);
    });
}

/**
 * Set up all event handlers
 */
function setupEventHandlers() {
    // Settings form submission
    const settingsForm = document.getElementById('settings-form');
    settingsForm.addEventListener('submit', handleStart);

    // Timer control buttons
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const stopBtn = document.getElementById('stop-btn');

    pauseResumeBtn.addEventListener('click', handlePauseResume);
    stopBtn.addEventListener('click', handleStop);

    // +/- buttons for number inputs
    setupNumberButtons();
}

/**
 * Set up +/- buttons for number inputs
 */
function setupNumberButtons() {
    const minusButtons = document.querySelectorAll('.btn-minus');
    const plusButtons = document.querySelectorAll('.btn-plus');

    minusButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            adjustNumberInput(btn.dataset.target, parseInt(btn.dataset.step));
        });
    });

    plusButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            adjustNumberInput(btn.dataset.target, parseInt(btn.dataset.step));
        });
    });
}

/**
 * Adjust number input value by step amount, respecting min/max
 */
function adjustNumberInput(inputId, step) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const currentValue = parseInt(input.value) || 0;
    const min = parseInt(input.min) || 0;
    const max = parseInt(input.max) || Infinity;
    const newValue = Math.max(min, Math.min(max, currentValue + step));

    input.value = newValue;
    
    // Trigger input event to ensure validation
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Handle start button click
 */
async function handleStart(e) {
    e.preventDefault();

    // Get form values
    const roundDuration = parseInt(document.getElementById('round-duration').value);
    const numRounds = parseInt(document.getElementById('num-rounds').value);
    const restDuration = parseInt(document.getElementById('rest-duration').value);
    const backgroundSong = document.getElementById('background-song').value;

    // Validate inputs
    if (roundDuration < 1 || roundDuration > 300) {
        await notificationManager.alert('Round duration must be between 1 and 300 seconds');
        return;
    }

    if (numRounds < 1 || numRounds > 8) {
        await notificationManager.alert('Number of rounds must be between 1 and 8');
        return;
    }

    if (restDuration < 0 || restDuration > 300) {
        await notificationManager.alert('Rest duration must be between 0 and 300 seconds');
        return;
    }

    // Initialize timer with settings
    tabataTimer.initialize({
        roundDuration,
        numRounds,
        restDuration,
        backgroundSong: backgroundSong || null
    });

    // Show timer display
    uiManager.showTimer();

    // Start the timer
    try {
        await tabataTimer.start();
    } catch (error) {
        console.error('Error starting timer:', error);
        await notificationManager.alert('Failed to start timer. Please try again.');
        resetToSettings();
    }
}

/**
 * Handle pause/resume button click
 */
function handlePauseResume() {
    const state = tabataTimer.getState();
    if (state.phase === 'paused') {
        // Update button text immediately before resuming
        uiManager.showPauseButton();
        tabataTimer.resume();
    } else {
        // Update button text immediately before pausing
        uiManager.showResumeButton();
        tabataTimer.pause();
    }
}

/**
 * Handle stop button click
 */
async function handleStop() {
    const state = tabataTimer.getState();
    
    // Pause timer immediately when stop is pressed (in case user meant to press pause)
    let wasPaused = false;
    if (state.phase !== 'idle' && state.phase !== 'paused' && state.phase !== 'completed') {
        tabataTimer.pause();
        wasPaused = true;
    }
    
    const confirmed = await notificationManager.confirm('Are you sure you want to stop the workout?');
    
    if (confirmed) {
        // User confirmed - stop and reset
        tabataTimer.stop();
        resetToSettings();
    } else {
        // User cancelled - resume if we paused it
        if (wasPaused) {
            tabataTimer.resume();
        }
    }
}

/**
 * Reset to settings panel
 */
function resetToSettings() {
    tabataTimer.stop();
    uiManager.showSettings();
}

/**
 * Initialize Wake Lock API to prevent screen sleep
 */
async function initWakeLock() {
    if ('wakeLock' in navigator) {
        let wakeLock = null;

        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock released');
                });
            } catch (err) {
                console.log('Wake Lock not available:', err);
            }
        };

        // Request wake lock when timer starts
        const originalStart = tabataTimer.start.bind(tabataTimer);
        tabataTimer.start = async function() {
            await requestWakeLock();
            return originalStart();
        };

        // Release wake lock when timer stops
        const originalStop = tabataTimer.stop.bind(tabataTimer);
        tabataTimer.stop = function() {
            if (wakeLock) {
                wakeLock.release();
                wakeLock = null;
            }
            return originalStop();
        };
    }
}

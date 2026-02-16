# Tabata Timer

A mobile-first web application for Tabata interval training workouts with synchronized audio cues and visual progress indicators.

## Features

- **Configurable Workouts**: Set round duration, number of rounds (max 8), and rest time
- **Background Music**: Choose from available songs or workout without music
- **Audio Cues**: Automatic voice prompts for round transitions and countdowns
- **Visual Progress**: Dual circular progress indicators showing overall and current interval progress
- **Pause/Resume**: Full control over workout timing
- **Mobile-First Design**: Optimized for mobile devices with responsive layout

## Project Structure

```
TabataTimer/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Mobile-first responsive styles
├── js/
│   ├── audio.js            # Audio playback and mixing logic
│   ├── timer.js            # Core timer logic and state management
│   ├── ui.js               # UI updates and circular progress rendering
│   └── main.js             # Application entry point and integration
├── Resources/              # Audio resources
│   ├── Songs/              # Background songs
│   ├── are_you_ready.mp3
│   ├── round_1.mp3 - round_8.mp3
│   ├── 5_4_3_2_1_go.mp3
│   └── 3_2_1_stop.mp3
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD for Pages
└── README.md
```

## Local Testing

### Option 1: Using Python HTTP Server

1. Navigate to the project directory:
   ```bash
   cd TabataTimer
   ```

2. Start a local HTTP server:

   **Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Option 2: Using Node.js http-server

1. Install http-server globally (if not already installed):
   ```bash
   npm install -g http-server
   ```

2. Navigate to the project directory:
   ```bash
   cd TabataTimer
   ```

3. Start the server:
   ```bash
   http-server -p 8000
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Option 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage

1. **Configure Workout**:
   - Set round duration (1-300 seconds)
   - Set number of rounds (1-8)
   - Set rest time duration (0-300 seconds)
   - Select background song (optional)

2. **Start Workout**:
   - Click "Start" button
   - Audio sequence plays: "Are you ready?" → "Round 1" → "5, 4, 3, 2, 1, Go!"
   - Background song starts (if selected)
   - Timer begins counting down

3. **During Workout**:
   - Outer circle shows total workout progress
   - Inner circle shows current round/rest progress
   - 3 seconds before round ends: "3, 2, 1, Stop!" plays
   - Rest period begins with light green inner circle
   - 10 seconds before rest ends: Next round number plays
   - 5 seconds before rest ends: "5, 4, 3, 2, 1, Go!" plays
   - Process repeats for all rounds

4. **Controls**:
   - **Pause**: Pause the workout timer
   - **Resume**: Resume from pause
   - **Stop**: Stop workout and return to settings

## Audio Cues

The app uses the following audio files for workout guidance:

- `are_you_ready.mp3` - Initial prompt
- `round_X.mp3` - Round number announcements (X = 1-8)
- `5_4_3_2_1_go.mp3` - Countdown before round starts
- `3_2_1_stop.mp3` - Countdown before round ends
- Background songs from `Resources/Songs/` folder

## Adding Background Songs

1. Add MP3 files to the `Resources/Songs/` folder
2. Run the song list generator script:

```bash
node scripts/generate-songs-list.js
```

This will automatically scan the `Resources/Songs/` folder and generate `js/songs-list.js` with all available songs. The song list will be automatically populated in the app.

**Note:** The `js/songs-list.js` file is auto-generated - do not edit it manually. Always run the script after adding new songs.

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The workflow in `.github/workflows/deploy.yml` will automatically deploy on push to `main` branch

### Manual Deployment

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Under "Source", select the branch containing your code (usually `main`)
4. Select `/ (root)` as the folder
5. Click Save

## Browser Compatibility

- Modern browsers with Web Audio API support
- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11+)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technical Details

- **Audio Mixing**: Uses Web Audio API for precise audio control and mixing
- **Progress Rendering**: SVG for outer circle, Canvas for inner circle gradient
- **Timer Precision**: 100ms update interval for smooth progress
- **Wake Lock**: Prevents screen sleep during workout (supported browsers)

## License

This project is open source and available for personal use.

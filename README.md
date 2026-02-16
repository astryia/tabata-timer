# Tabata Timer

A mobile-first web application for Tabata interval training workouts with synchronized audio cues and visual progress indicators.

**🌐 Live App:** [https://astryia.github.io/tabata-timer/](https://astryia.github.io/tabata-timer/)

## What is Tabata Timer?

Tabata Timer is a web-based workout timer designed specifically for Tabata interval training. It provides visual and audio guidance throughout your workout, making it easy to follow along without constantly checking the timer. The app features dual circular progress indicators, synchronized audio cues, and optional background music to keep you motivated during your training sessions.

## Features

- **Customizable Workouts**: Configure round duration (1-300 seconds), number of rounds (up to 8), and rest time (0-300 seconds)
- **Background Music**: Choose from available songs or workout in silence
- **Smart Audio Cues**: Automatic voice prompts guide you through each round:
  - "Are you ready?" → "Round X" → "5, 4, 3, 2, 1, Go!" at the start
  - "3, 2, 1, Stop!" 3 seconds before each round ends
  - Round number announcement 8 seconds before rest ends
  - "5, 4, 3, 2, 1, Go!" 5 seconds before rest ends
- **Visual Progress Tracking**: 
  - Outer circle shows total workout progress
  - Inner circle shows current round/rest progress with color coding (orange for rounds, green for rest)
- **Full Control**: Pause, resume, or stop your workout at any time
- **Mobile-Optimized**: Designed for mobile devices with a responsive layout that works on all screen sizes
- **Background Music Mixing**: Background music automatically lowers by 50% when audio cues play, ensuring you never miss important instructions

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
   - Outer circle shows total workout progress (starts after intro sequence)
   - Inner circle shows current round/rest progress with color coding
   - Orange inner circle during workout rounds
   - Green inner circle during rest periods
   - 3 seconds before round ends: "3, 2, 1, Stop!" plays (background music lowers)
   - Rest period begins automatically
   - 8 seconds before rest ends: Next round number plays (background music lowers)
   - 5 seconds before rest ends: "5, 4, 3, 2, 1, Go!" plays (background music lowers)
   - Process repeats for all configured rounds

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

## How It Works

The app uses modern web technologies to provide a smooth, responsive experience:

- **Web Audio API**: Handles all audio playback and mixing, allowing background music and voice cues to play simultaneously
- **SVG Progress Circles**: Smooth, animated circular progress indicators that update in real-time
- **Precise Timing**: 100ms update interval ensures accurate timing and smooth visual updates
- **Wake Lock API**: Prevents your device screen from sleeping during workouts (on supported browsers)
- **Mobile-First Design**: Responsive layout that adapts to any screen size, optimized for touch interactions

## License

This project is open source and available for personal use.

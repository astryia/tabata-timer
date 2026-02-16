# Tabata Timer

A mobile-first web application for Tabata interval training workouts with synchronized audio cues and visual progress indicators.

**🌐 Live App:** [https://astryia.github.io/tabata-timer/](https://astryia.github.io/tabata-timer/)

## What is Tabata Timer?

Tabata Timer is a web-based workout timer designed specifically for Tabata interval training. It provides visual and audio guidance throughout your workout, making it easy to follow along without constantly checking the timer. The app features dual circular progress indicators, synchronized audio cues, and optional background music to keep you motivated during your training sessions.

## Features

- **Customizable Workouts**: Configure round duration (1-300 seconds), number of rounds (up to 8), and rest time (0-300 seconds)
- **Background Music**
- **Smart Audio Cues**
- **Visual Progress Tracking**
- **Full Control**
- **Mobile-Optimized**

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

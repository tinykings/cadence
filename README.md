## What is Cadence?

Cadence is a lightweight, offline-capable Progressive Web App (PWA) designed to help you track your time throughout the year. It provides a clean, calendar-based interface for logging hours and credit hours on a daily basis, with visual progress tracking toward your annual goal.


## Features

- 📅 **Calendar View** - Visual calendar interface showing hours logged per day
- 🎯 **Goal Tracking** - Set and track progress toward an annual hour goal with a progress ring
- 📊 **Statistics Dashboard** - View total hours, monthly averages needed, and weekly targets
- 🎨 **Multiple Themes** - Choose from 8 beautiful color themes (Amber, Blue, Emerald, Violet, Rose, Cyan, Orange, Lime)
- 📱 **Progressive Web App** - Install on your device for a native app-like experience
- 💾 **Offline Support** - Works completely offline with service worker caching
- 📤 **Data Export/Import** - Backup and restore your data as JSON files
- 🔄 **Academic Year System** - Automatically organizes time by academic year (September–August)
- 📈 **Historical Data** - View previous months and years with expandable sections

## How It Works

### Core Functionality

1. **Time Entry**
   - Click the `+` button or tap any day on the calendar to add/edit hours
   - Enter both regular hours and credit hours separately
   - Hours are stored per day in the format: `YYYY-MM-DD`

2. **Academic Year System**
   - The app uses an academic year calendar (September to August)
   - The current academic year is displayed in the header (e.g., "2024–25")
   - All calculations and displays are organized by this academic year period

3. **Progress Tracking**
   - **Total Hours**: Shows your cumulative hours for the current academic year
   - **Goal Hours**: Configurable annual goal (default: 600 hours)
   - **Progress Ring**: Visual circular progress indicator
   - **Monthly Average Needed**: Calculates how many hours per month you need to meet your goal
   - **Weekly Hours Needed**: Shows remaining hours needed for the current week

4. **Data Storage**
   - All data is stored locally in your browser using `localStorage`
   - No server or cloud sync required
   - Data persists across browser sessions
   - Export/import functionality for backups

5. **Calendar Display**
   - Current month shows a full calendar grid
   - Days with logged hours are highlighted
   - Today's date is marked with a border
   - Click any day to add or edit hours for that date

6. **Historical View**
   - Previous months in the current academic year are collapsible
   - Previous academic years are shown in a separate section
   - Each month/year can be expanded to view detailed calendars and totals

### Technical Architecture

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **PWA Features**:
  - Service Worker for offline functionality and caching
  - Web App Manifest for installation
  - Responsive design optimized for mobile and desktop
- **Data Structure**:
  ```javascript
  {
    goal: 600,
    hours: {
      "2024-09-15": { hours: 3.5, credit: 1 },
      "2024-09-16": { hours: 2, credit: 0 }
    }
  }
  ```
- **Theming**: CSS custom properties (variables) for dynamic theme switching
- **Storage**: Browser `localStorage` API

## Installation & Usage

### As a Web App

1. Open the app in any modern web browser
2. Navigate to the app URL
3. The app will work immediately - no installation required

### As a PWA (Progressive Web App)

1. **On Desktop (Chrome/Edge)**:
   - Look for the install banner that appears after a few seconds
   - Click "Add to Home Screen" or use the browser's install prompt
   - The app will be installed and accessible from your desktop

2. **On Mobile (iOS)**:
   - Open the app in Safari
   - Tap the Share button
   - Select "Add to Home Screen"

3. **On Mobile (Android)**:
   - Open the app in Chrome
   - Tap the menu (three dots)
   - Select "Add to Home Screen" or "Install App"

### Getting Started

1. **Set Your Goal**: 
   - Tap the Settings button (gear icon at the bottom)
   - Enter your annual hour goal (default: 600)
   - Save your settings

2. **Add Hours**:
   - Tap the `+` button in the current month section
   - Or tap any day on the calendar
   - Enter hours and/or credit hours
   - Select the day from the calendar picker
   - Tap "Save"

3. **View Progress**:
   - Check the stats bar at the top for your total hours and progress
   - See how many hours per month you need to average
   - Track weekly progress

4. **Customize**:
   - Go to Settings
   - Choose from 8 different color themes
   - Your preference is saved automatically

5. **Backup Your Data**:
   - Go to Settings
   - Tap "Export" to download a JSON backup file
   - Use "Import" to restore from a backup

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (iOS and macOS)
- ✅ Any modern browser with ES6+ support

## File Structure

```
cadence/
├── index.html          # Main HTML structure
├── app.js              # Application logic and data management
├── styles.css          # Styling and themes
├── service-worker.js   # PWA service worker for offline support
├── manifest.json       # PWA manifest configuration
├── icons/
│   └── icon.png        # App icon (512x512)
└── README.md           # This file
```

## Privacy

- **100% Local Storage**: All data is stored locally in your browser
- **No Tracking**: No analytics, no external services, no data collection
- **No Internet Required**: Works completely offline after initial load
- **Your Data, Your Control**: Export/import functionality gives you full control

## Keyboard Shortcuts

- `Esc` - Close any open modal

## Development

This is a vanilla JavaScript application with no build process required. Simply open `index.html` in a browser or serve it with any static file server.

### Local Development

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## License

This project is open source and available for personal use.

---

**Made with ❤️ for tracking your time and staying on cadence with your goals.**

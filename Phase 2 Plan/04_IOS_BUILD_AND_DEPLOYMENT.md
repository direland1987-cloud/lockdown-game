# LOCKDOWN — iOS Build & Deployment

> iOS-first deployment using Capacitor to wrap the existing HTML game.

---

## §1 — Architecture

LOCKDOWN is a single-file HTML app (React 18 + Tailwind, ~1MB). The deployment strategy:

1. **Web app** (current): `index.html` deployed to Vercel. Works now.
2. **iOS app** (target): Same `index.html` wrapped in a Capacitor native shell, deployed to App Store.
3. **Android** (future): Same Capacitor project, different build target.

Capacitor loads the web app in a native WKWebView on iOS, giving access to native APIs (AdMob, StoreKit, haptics, push notifications) via JavaScript bridges.

---

## §2 — Project Setup

### 2.1 Prerequisites

- macOS with Xcode 15+ installed
- Apple Developer account ($99/year)
- Node.js 18+
- CocoaPods

### 2.2 Initialize Capacitor

```bash
# In the lockdown-deploy directory
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Initialize Capacitor
npx cap init "LOCKDOWN" "com.lockdownbjj.app" --web-dir .

# Add iOS platform
npx cap add ios
```

### 2.3 Capacitor Config

Create/edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lockdownbjj.app',
  appName: 'LOCKDOWN',
  webDir: '.',  // index.html is in the root
  server: {
    // For production, load from local files (no server needed)
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    backgroundColor: '#000000',
    preferredContentMode: 'mobile',
  },
  plugins: {
    AdMob: {
      // Will be configured after AdMob account setup
    }
  }
};

export default config;
```

### 2.4 Install Plugins

```bash
# Ads
npm install @capacitor-community/admob

# In-app purchases
npm install capacitor-purchases  # RevenueCat wrapper — simpler than raw StoreKit

# Haptics (for minigame feedback)
npm install @capacitor/haptics

# Status bar control
npm install @capacitor/status-bar

# Splash screen
npm install @capacitor/splash-screen
```

### 2.5 Sync & Open

```bash
npx cap sync ios
npx cap open ios  # Opens Xcode project
```

---

## §3 — iOS-Specific Adjustments

### 3.1 Safe Areas

iPhones with notches/Dynamic Island need safe area handling. Add to the HTML `<head>`:

```html
<meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

And in CSS:
```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 3.2 Audio

The current game uses Howler.js for MP3 playback. On iOS WKWebView:
- Audio works but requires user interaction to start (already handled — game starts on tap)
- Background audio pauses when app is backgrounded (expected behavior for a game)
- Verify all 9 MP3 files load correctly from the local bundle (not CDN)

### 3.3 Performance

The game is ~1MB HTML + ~3.4MB embedded base64 artwork. Total ~4.5MB. This loads instantly from local storage on iOS (no network needed). The main performance concern is:
- React 18 rendering with many DOM elements during fights
- CSS animations (arena effects, impact effects)
- Base64 image decoding

Test on an iPhone 12 or newer as the minimum target device.

### 3.4 Touch Handling

The game already uses touch events via React's `onClick`. Verify:
- No 300ms tap delay (Capacitor's WKWebView doesn't have this)
- Minigame tap targets are large enough (minimum 44×44pt per Apple HIG)
- Swipe gestures for side-scrollers don't conflict with iOS back swipe

---

## §4 — App Store Submission

### 4.1 Required Assets

| Asset | Spec |
|-------|------|
| App icon | 1024×1024px, no transparency, no rounded corners (Apple applies them) |
| Screenshots (iPhone) | 6.7" (1290×2796), 6.5" (1284×2778), 5.5" (1242×2208) |
| Screenshots (iPad) | 2048×2732 (if supporting iPad) |
| App Preview video | Optional, 15–30 seconds, shows gameplay |
| Privacy policy URL | Required (host on Vercel or similar) |
| Support URL | Required |

### 4.2 App Store Metadata

```
Name: LOCKDOWN - BJJ Fighting Game
Subtitle: Turn-based grappling with pixel art style
Category: Games > Fighting
Age Rating: 12+ (infrequent mild cartoon violence)
Price: Free

Description:
LOCKDOWN is a Brazilian Jiu-Jitsu fighting game with CPS2 arcade pixel art 
aesthetics. Master submissions, manage your stamina, and fight your way 
through the ranks in campaign mode.

• Turn-based BJJ combat with real grappling positions
• Hand-drawn CPS2 pixel art sprites
• 10 positions, 100+ moves, 9 submissions
• Campaign mode with progressive difficulty
• Daily challenges and mini-games
• Authentic BJJ mechanics validated by practitioners

Keywords: bjj, jiu jitsu, fighting game, pixel art, grappling, submission, 
martial arts, arcade, retro, combat
```

### 4.3 App Review Considerations

- **No real money gambling** — all IAP is for convenience/ad removal
- **No violent content beyond cartoon fighting** — pixel art style keeps it mild
- **Ad SDK must respect ATT** — show the tracking prompt before loading ads
- **Restore Purchases** button required for the "Remove Ads" non-consumable
- **No external links to payment** — all purchases through Apple IAP

### 4.4 TestFlight

Before App Store submission, distribute via TestFlight for beta testing:
1. Archive build in Xcode
2. Upload to App Store Connect
3. Add internal testers (immediate) or external testers (requires brief review)
4. Test on multiple iPhone models (SE, 14, 15, 16)

---

## §5 — Build Pipeline

### 5.1 Development Workflow

```
Edit index.html (web)
    ↓
Test in browser (fast iteration)
    ↓
npx cap sync ios (copies web files to Xcode project)
    ↓
Test on iOS simulator / device
    ↓
Fix iOS-specific issues
    ↓
Archive & upload to TestFlight
```

### 5.2 Continuous Deployment

For ongoing updates after App Store launch:
- Web updates: Deploy to Vercel (instant, no review)
- iOS updates: Sync Capacitor → archive → submit to App Store (1–3 day review)

Consider using Capacitor's live update feature (Appflow or Capawesome) to push web-layer updates without going through App Store review. This covers bug fixes and content updates but NOT native plugin changes.

---

## §6 — File Structure (Post-Capacitor)

```
lockdown-deploy/
├── index.html              # The game (web + Capacitor web layer)
├── *.mp3                   # Audio files
├── package.json            # Node deps (Capacitor, AdMob, etc.)
├── capacitor.config.ts     # Capacitor configuration
├── node_modules/
├── ios/                    # Generated Xcode project
│   └── App/
│       ├── App/
│       │   ├── Info.plist
│       │   └── ...
│       └── Podfile
├── .vercel/                # Vercel deployment config
└── LOCKDOWN_*.md           # Planning docs (not deployed)
```

---

*This doc is ready for Claude Code to set up the Capacitor project and configure the iOS build.*

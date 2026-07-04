# 🦉 Get Night OWL on Your Mobile

There are **3 ways** to install Night OWL on your phone. Pick whichever fits your goal.

---

## 🚀 Option 1: Install as a PWA (Instant — 5 minutes)

The easiest way. Night OWL is already a Progressive Web App — it installs like a real app on any phone.

### Steps:

1. **Deploy the site** (pick one, all free):
   - **Vercel**: `npm i -g vercel && vercel` → get a URL like `https://nightowl.vercel.app`
   - **Netlify**: drag-and-drop the `dist/` folder at [app.netlify.com/drop](https://app.netlify.com/drop)
   - **GitHub Pages**: push to GitHub, enable Pages in settings
   - **Cloudflare Pages**: connect your repo, it auto-deploys

2. **Open the URL** on your phone's browser (Safari on iPhone, Chrome on Android)

3. **Add to Home Screen**:
   - **iPhone (Safari)**: Tap Share → "Add to Home Screen" → Add
   - **Android (Chrome)**: Tap ⋮ menu → "Install app" / "Add to Home Screen"

✅ Night OWL now looks and feels like a native app on your home screen!

**Pros**: Free, works today, no app store needed, auto-updates
**Cons**: No push notifications on iOS Safari, no App Store listing

---

## 📱 Option 2: Build a Real Native App with Capacitor (30 minutes)

Wraps the web app into a real Android APK / iOS app that you can install directly or submit to app stores.

### Prerequisites

**For Android:**
- [Node.js 18+](https://nodejs.org)
- [Android Studio](https://developer.android.com/studio)
- Java JDK 17

**For iOS (requires Mac):**
- [Xcode](https://apps.apple.com/app/xcode/id497799835) from App Store
- Capacitor (already installed!)

### Build the APK / App

```bash
# 1. Build the web app
npm run build

# 2. Add native platforms (only need to do this once)
npx cap add android
npx cap add ios   # Mac only

# 3. Sync web code into native projects
npx cap sync

# 4a. Open in Android Studio & run
npx cap open android
# Click ▶️ Run (builds debug APK, installs on connected phone/emulator)

# 4b. Open in Xcode & run (Mac only)
npx cap open ios
# Click ▶️ Run (installs on connected iPhone/Simulator)
```

### Share the APK with friends (Android)

1. Build a release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
2. Find the APK at `android/app/build/outputs/apk/release/app-release-unsigned.apk`
3. Share the file directly (Telegram, email, Google Drive)
4. Friends tap to install (enable "Install from unknown sources" in Settings)

### Submit to App Stores

**Google Play Store:**
- Pay $25 one-time fee at [play.google.com/console](https://play.google.com/console)
- Sign your APK with a keystore: `keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias nightowl`
- Upload signed bundle

**Apple App Store:**
- $99/year Apple Developer account
- Sign with your developer certificate via Xcode
- Submit through [App Store Connect](https://appstoreconnect.apple.com)

---

## 🔧 Option 3: Full Production Build (Real Backend)

The current app is a **UI prototype** — chats are simulated locally. To make it a real messaging app like WhatsApp, you'll need to replace these with real services:

### What needs a real backend:

| Feature | Current (Demo) | Production Replacement |
|---|---|---|
| **Auth (phone/OTP)** | Fake 6-digit code | [Firebase Auth](https://firebase.google.com/products/auth) (free tier: 10k SMS/month) or [Twilio Verify](https://www.twilio.com/verify) |
| **Real-time chat** | LocalStorage + fake bot replies | [Firebase Realtime DB](https://firebase.google.com/products/realtime-database), [Supabase](https://supabase.com), or [Socket.IO](https://socket.io) server |
| **Video/Audio calls** | Fake UI | [LiveKit](https://livekit.io) (free tier), [Agora](https://agora.io), or [Daily.co](https://daily.co) |
| **Push notifications** | None | Firebase Cloud Messaging (FCM) + Apple Push Notification service (APNs) |
| **End-to-end encryption** | UI-only (lock icons) | [Signal Protocol](https://github.com/signalapp/libsignal) or [Matrix OLM](https://gitlab.matrix.org/matrix-org/olm) |
| **Media uploads** | None | AWS S3 / Cloudflare R2 + CDN |
| **Contacts** | Hardcoded 6 friends | Sync from phone address book via Capacitor Contacts plugin |

### Quickest real stack (recommended for MVP):

```
Frontend:   Capacitor + React (this app)
Backend:    Firebase (Auth + Firestore + Storage + FCM)
Calls:      LiveKit (WebRTC as a service)
Hosting:    Firebase Hosting
```

Estimated cost: **$0/month** until you hit Firebase's free tier limits.

---

## 📋 Quick Reference

### Commands you'll use most:

```bash
npm run build           # Build web version
npx cap sync            # Sync web → native
npx cap open android    # Open Android Studio
npx cap open ios        # Open Xcode
npx cap run android     # Build & install on Android
npx cap run ios         # Build & install on iOS
```

### Project structure:

```
night-owl/
├── dist/                  ← Built web app (PWA)
├── android/               ← Native Android project (after `cap add android`)
├── ios/                   ← Native iOS project (after `cap add ios`)
├── src/                   ← Source code
├── capacitor.config.ts    ← Capacitor config
└── package.json
```

### Customizing the app icon:

Replace the SVG in `index.html` and `public/manifest.webmanifest` with your own icon, then for native:
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor "#0b0f2a"
```

---

## 🐛 Troubleshooting

**"npx cap command not found"**
→ Run `npm install` in the project folder first

**Android build fails with Java error**
→ Install JDK 17: `brew install openjdk@17` (Mac) or download from [Oracle](https://www.oracle.com/java/technologies/downloads/)

**iOS "No signing certificate"**
→ Open Xcode → Preferences → Accounts → Add your Apple ID → Select your team in project settings

**Phone can't install APK**
→ Enable "Install from unknown sources" in Android Settings → Security

---

**Which path should you take?**

- 🎯 Just want to show friends? → **Option 1 (PWA)**
- 🎯 Want a real app icon and store listing? → **Option 2 (Capacitor)**
- 🎯 Building a real WhatsApp competitor? → **Option 3 (full backend)**

Hoot hoot! 🦉

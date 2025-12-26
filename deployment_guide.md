---
description: Guide to deploying Freewrite Mobile to App Store and Play Store
---

# Freewrite Mobile Deployment Guide

Prerequisites:
- [x] Expo Account created
- [x] Apple Developer Account connected
- [x] Google Play Console Account connected
- [x] `app.json` configured with Bundle ID: `com.farseen.freewrite`

## 🚀 Fast Deployment

### 1. Instant Code Push (`npm run push`)
**Use this for:** JS code, Styles, Assets. (Updates instantly, no review).
```bash
npm run push
```

---

## 🏗️ Native Builds (App Store / Play Store)

### Option A: Cloud Build (Easiest)
Runs on Expo servers. Free plan has limits/queues.
```bash
npm run deploy
```

### Option B: Local Build (Unlimited)
Runs on your Mac. Requires Xcode (iOS) and Android Studio (Android).
**Prerequisites:**
- **iOS:** install Xcode + Command Line Tools.
- **Android:** install Android Studio + NDK/SDK.

**Step 1: Build Locally**
```bash
npm run deploy:local
```
This generates `.ipa` and `.aab` files on your computer.

**Step 2: Submit to Stores**
After the files are built:
```bash
# Submit iOS
eas submit -p ios --path path/to/your.ipa

# Submit Android
eas submit -p android --path path/to/your.aab
```

---

## Technical Details

### EAS Update
Your app is configured with `expo-updates`. Changes are pushed to the `production` branch.

### Versioning
Remember to increment `version` in `app.json` before a new Store Release.

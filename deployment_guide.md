---
description: Guide to deploying Freewrite Mobile to App Store and Play Store
---

# Freewrite Mobile Deployment Guide

Prerequisites:
- [x] Expo Account created
- [x] Apple Developer Account connected
- [x] Google Play Console Account connected
- [x] `app.json` configured with Bundle ID: `com.farseen.freewrite`

## 🚀 Fast Deployment (Better DX)

We've set up two shortcuts depending on what you changed:

### 1. Instant Code Push (`npm run push`)
**Use this when:** You only changed JavaScript/TypeScript code, Styles, or Assets.
**What it does:** Instantly updates the app on user devices (and TestFlight/Internal) without a full rebuild.
**Time:** ~1 minute.

```bash
npm run push
```

### 2. Full Native Release (`npm run deploy`)
**Use this when:** You added new native packages (runs `npm install`), changed `app.json`, or want a fresh Store release.
**What it does:** Builds new binaries (.ipa/.aab) and submits them to stores.
**Time:** ~20 minutes.

```bash
npm run deploy
```

---

## Technical Details

### EAS Update
Your app is configured with `expo-updates`. Changes are pushed to the `production` branch and downloaded by apps running a compatible runtime version.

### Build & Submit
The `deploy` command runs:
`eas build --platform all --profile production --auto-submit`
This handles versioning automatically via `autoIncrement` settings.

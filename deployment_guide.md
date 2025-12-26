---
description: Guide to deploying Freewrite Mobile to App Store and Play Store
---

# Freewrite Mobile Deployment Guide

Prerequisites:
- [x] Expo Account created
- [x] Apple Developer Account connected
- [x] Google Play Console Account connected
- [x] `app.json` configured with Bundle ID: `com.farseen.freewrite`

## 1. Install EAS CLI
If you haven't already:
```bash
npm install -g eas-cli
```

## 2. Login to EAS
```bash
eas login
```

## 3. configure Project
Initialize the project with your Expo account:
```bash
eas build:configure
```
*(Select 'All' when asked for platforms)*

## 4. Build for Production

### iOS (App Store)
```bash
eas build --platform ios --profile production
```
- This will prompt you to log in to your Apple Developer account.
- It will automatically generate Distribution Certificates and Provisioning Profiles.

### Android (Play Store)
```bash
eas build --platform android --profile production
```
- This will generate an AAB (Android App Bundle) file.
- It will create a Keystore for you automatically on the first run.

## 5. Submit to Stores

### iOS
Once the build is complete:
```bash
eas submit -p ios
```
- You'll need to create an app entry on **App Store Connect** first with the Bundle ID `com.farseen.freewrite`.

### Android
Once the build is complete:
```bash
eas submit -p android
```
- You'll need to create an app entry on **Google Play Console** first and manually upload the **first** AAB manually to establish the signing key. Subsequent updates can be done via CLI.

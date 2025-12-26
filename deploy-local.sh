#!/bin/bash
set -e

echo "🚀 Starting Local Deployment..."

# -----------------
# iOS Build & Submit
# -----------------
echo "🍎 [1/2] Building iOS (Local)..."
eas build --platform ios --profile production --local --output ios-build.ipa

echo "📤 Submitting iOS to App Store Connect..."
eas submit --platform ios --path ios-build.ipa

echo "🧹 Cleaning up iOS build..."
rm ios-build.ipa

# -----------------
# Android Build & Submit
# -----------------
echo "🤖 [2/2] Building Android (Local)..."
eas build --platform android --profile production --local --output android-build.aab

echo "📤 Submitting Android to Google Play..."
eas submit --platform android --path android-build.aab

echo "🧹 Cleaning up Android build..."
rm android-build.aab

echo "✨ All done! Builds submitted and artifacts removed."
